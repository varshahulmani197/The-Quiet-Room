import { SoundscapeType } from '../types';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private currentSoundscape: SoundscapeType = 'none';
  private isPlaying: boolean = false;
  private volume: number = 0.35;
  private listeners: Set<(state: { isPlaying: boolean; soundscape: SoundscapeType; volume: number }) => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (state: { isPlaying: boolean; soundscape: SoundscapeType; volume: number }) => void) {
    this.listeners.add(cb);
    cb({ isPlaying: this.isPlaying, soundscape: this.currentSoundscape, volume: this.volume });
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    for (const cb of this.listeners) {
      cb({ isPlaying: this.isPlaying, soundscape: this.currentSoundscape, volume: this.volume });
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getSoundscape(): SoundscapeType {
    return this.currentSoundscape;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    if (!this.isPlaying) return;
    this.stopActiveSoundscape();
    this.isPlaying = false;
    this.notify();
  }

  public play(soundscape?: SoundscapeType) {
    this.initContext();
    if (soundscape) {
      this.currentSoundscape = soundscape;
    }
    if (this.currentSoundscape === 'none') {
      this.currentSoundscape = 'night';
    }

    this.stopActiveSoundscape();
    this.startSoundscape(this.currentSoundscape);
    this.isPlaying = true;
    this.notify();
  }

  public toggle(soundscape?: SoundscapeType) {
    if (this.isPlaying) {
      if (soundscape && soundscape !== this.currentSoundscape) {
        this.play(soundscape);
      } else {
        this.stop();
      }
    } else {
      this.play(soundscape || this.currentSoundscape);
    }
  }

  private stopActiveSoundscape() {
    for (const node of this.activeNodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore cleanup errors
      }
    }
    this.activeNodes = [];
  }

  // Generative Synthesizers for each soundscape
  private startSoundscape(type: SoundscapeType) {
    if (!this.ctx || !this.masterGain) return;

    switch (type) {
      case 'rain':
        this.createRainGenerator();
        break;
      case 'night':
        this.createNightGenerator();
        break;
      case 'forest':
        this.createForestGenerator();
        break;
      case 'fireplace':
        this.createFireplaceGenerator();
        break;
      case 'lofi':
        this.createLofiGenerator();
        break;
      case 'ambient':
        this.createAmbientGenerator();
        break;
      default:
        break;
    }
  }

  // RAIN: Pink noise filtered + random droplet resonant taps
  private createRainGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Buffer for pink noise
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain against window/leaves
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();

    // Occasional gentle water drops (resonant impulse)
    let dropInterval: number | null = null;
    const scheduleDrop = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const freq = 600 + Math.random() * 900;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.12);

      dropGain.gain.setValueAtTime(0.04, ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain!);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      const nextDelay = 300 + Math.random() * 900;
      dropInterval = window.setTimeout(scheduleDrop, nextDelay);
    };

    scheduleDrop();

    this.activeNodes.push({
      stop: () => {
        whiteNoise.stop();
        if (dropInterval) clearTimeout(dropInterval);
      },
      disconnect: () => {
        whiteNoise.disconnect();
        filter.disconnect();
        rainGain.disconnect();
      },
    });
  }

  // NIGHT: Deep warm sub-drone + gentle cicada/cricket shimmer
  private createNightGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Deep nocturnal sub oscillator
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.4, ctx.currentTime); // E2 note

    droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    // Subtle cricket harmonic pulse
    const cricketOsc = ctx.createOscillator();
    const cricketFilter = ctx.createBiquadFilter();
    const cricketGain = ctx.createGain();

    cricketOsc.type = 'sawtooth';
    cricketOsc.frequency.setValueAtTime(4500, ctx.currentTime);

    cricketFilter.type = 'bandpass';
    cricketFilter.frequency.setValueAtTime(4800, ctx.currentTime);
    cricketFilter.Q.setValueAtTime(8, ctx.currentTime);

    cricketGain.gain.setValueAtTime(0.015, ctx.currentTime);

    // LFO for cricket pulsing
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(2.5, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.012, ctx.currentTime);
    lfo.connect(cricketGain.gain);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.masterGain);

    cricketOsc.connect(cricketFilter);
    cricketFilter.connect(cricketGain);
    cricketGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    cricketOsc.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        osc1.stop();
        osc2.stop();
        cricketOsc.stop();
        lfo.stop();
      },
      disconnect: () => {
        osc1.disconnect();
        osc2.disconnect();
        droneGain.disconnect();
        cricketOsc.disconnect();
        cricketFilter.disconnect();
        cricketGain.disconnect();
        lfo.disconnect();
      },
    });
  }

  // FOREST: Whispering wind murmur with modulated lowpass filter
  private createForestGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to slowly sweep wind frequency
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.35, ctx.currentTime);

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        noise.stop();
        lfo.stop();
      },
      disconnect: () => {
        noise.disconnect();
        windFilter.disconnect();
        windGain.disconnect();
        lfo.disconnect();
      },
    });
  }

  // FIREPLACE: Low warm rumble + gentle crackles & pops
  private createFireplaceGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Low rumble
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, ctx.currentTime);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    rumble.start();

    // Sporadic crackle / wood snap impulses
    let crackleTimer: number | null = null;
    const scheduleCrackle = () => {
      if (!this.isPlaying) return;
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      const popFreq = 300 + Math.random() * 800;

      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(popFreq, ctx.currentTime);

      popGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain!);

      popOsc.start();
      popOsc.stop(ctx.currentTime + 0.07);

      const delay = 150 + Math.random() * 700;
      crackleTimer = window.setTimeout(scheduleCrackle, delay);
    };

    scheduleCrackle();

    this.activeNodes.push({
      stop: () => {
        rumble.stop();
        if (crackleTimer) clearTimeout(crackleTimer);
      },
      disconnect: () => {
        rumble.disconnect();
        rumbleFilter.disconnect();
        rumbleGain.disconnect();
      },
    });
  }

  // LO-FI: Soft vinyl texture + serene warm Rhodes chords
  private createLofiGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Warm chords (F maj7 / C maj9 tones: F3, A3, C4, E4)
    const freqs = [174.61, 220.0, 261.63, 329.63];
    const oscs: OscillatorNode[] = [];
    const chordGain = ctx.createGain();
    chordGain.gain.setValueAtTime(0.07, ctx.currentTime);

    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.connect(chordGain);
      osc.start();
      oscs.push(osc);
    }

    // Gentle vinyl hiss
    const bufferSize = ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    const hiss = ctx.createBufferSource();
    hiss.buffer = noiseBuf;
    hiss.loop = true;

    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.setValueAtTime(3200, ctx.currentTime);
    hissFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.06, ctx.currentTime);

    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(this.masterGain);
    chordGain.connect(this.masterGain);

    hiss.start();

    this.activeNodes.push({
      stop: () => {
        for (const o of oscs) o.stop();
        hiss.stop();
      },
      disconnect: () => {
        for (const o of oscs) o.disconnect();
        chordGain.disconnect();
        hiss.disconnect();
        hissFilter.disconnect();
        hissGain.disconnect();
      },
    });
  }

  // AMBIENT: Shimmering meditative drone with gentle filter movement
  private createAmbientGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const notes = [130.81, 196.0, 261.63, 392.0]; // C3, G3, C4, G4
    const oscs: OscillatorNode[] = [];
    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.09, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    // LFO for filter breathing
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);
    lfo.connect(filter.frequency);

    for (const freq of notes) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(filter);
      osc.start();
      oscs.push(osc);
    }

    filter.connect(ambientGain);
    ambientGain.connect(this.masterGain);
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        for (const o of oscs) o.stop();
        lfo.stop();
      },
      disconnect: () => {
        for (const o of oscs) o.disconnect();
        filter.disconnect();
        ambientGain.disconnect();
        lfo.disconnect();
      },
    });
  }
}

export const audioEngine = new SoundscapeEngine();
