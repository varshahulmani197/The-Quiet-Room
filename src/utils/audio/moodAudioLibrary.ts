export type CanonicalMusicMood = 'happy' | 'sad' | 'romantic' | 'zeal';

export interface SoundscapeTrackInstance {
  mood: CanonicalMusicMood;
  gainNode: GainNode;
  stop: () => void;
  dispose: () => void;
}

/**
 * MoodAudioLibrary provides procedural, multi-layered cinematic instrumental soundscapes
 * for the four canonical writing moods: Happy, Sad, Romantic, Zeal.
 *
 * Each soundscape is designed specifically for distraction-free writing:
 * - Happy: Gentle uplifting piano, warm delicate acoustic textures, soft shimmering ambient pads
 * - Sad: Slow expressive piano, soft rain-like ambient textures, deep gentle atmospheric pads
 * - Romantic: Intimate piano, gentle strings, warm ambient textures, delicate melodic phrases
 * - Zeal: Motivating cinematic instrumental textures, rhythmic pulsing ambient layers, rising musical energy
 */
export class MoodAudioLibrary {
  /**
   * Helper to create a warm felt-piano note with acoustic resonance and harmonic overtones
   */
  private static schedulePianoNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    velocity: number = 0.5
  ) {
    // Fundamental + harmonics for rich felt piano sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, time);

    // Warm velocity-sensitive lowpass filter simulating piano felt hammer
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = 900 + velocity * 1400;
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.4), time + duration);

    // Exponential decay envelope
    const noteGain = ctx.createGain();
    const peakGain = 0.18 * velocity;
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(peakGain, time + 0.025); // Soft hammer attack
    noteGain.gain.exponentialRampToValueAtTime(peakGain * 0.45, time + 0.4); // Piano body decay
    noteGain.gain.exponentialRampToValueAtTime(0.00001, time + duration); // Damper release

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc3.start(time);

    osc1.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
    osc3.stop(time + duration + 0.05);
  }

  /**
   * HAPPY SOUNDSCAPE
   * Gentle uplifting piano in F major / C major, warm delicate acoustic textures,
   * shimmering ambient pads, hopeful positive atmosphere.
   */
  public static createHappySoundscape(ctx: AudioContext, masterOutput: AudioNode): SoundscapeTrackInstance {
    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(0, ctx.currentTime);
    trackGain.connect(masterOutput);

    // 1. Shimmering Ambient Pad (Fmaj9 / Cmaj7 chords with slow filter breath)
    const padNotes = [174.61, 220.0, 261.63, 329.63, 392.0]; // F3, A3, C4, E4, G4
    const padOscs: OscillatorNode[] = [];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.07, ctx.currentTime);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(800, ctx.currentTime);

    // Slow LFO for filter shimmer
    const padLfo = ctx.createOscillator();
    padLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const padLfoGain = ctx.createGain();
    padLfoGain.gain.setValueAtTime(350, ctx.currentTime);
    padLfo.connect(padFilter.frequency);
    padLfo.start();

    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(padFilter);
      osc.start();
      padOscs.push(osc);
    }
    padFilter.connect(padGain);
    padGain.connect(trackGain);

    // 2. Gentle Uplifting Piano Motif Loop
    // F - C - Dm - Bb major uplifting progression with peaceful spacing
    const motifNotes = [
      { f: 261.63, d: 2.4, v: 0.5 }, // C4
      { f: 329.63, d: 2.2, v: 0.55 }, // E4
      { f: 349.23, d: 2.8, v: 0.6 }, // F4
      { f: 392.00, d: 2.5, v: 0.5 }, // G4
      { f: 440.00, d: 3.2, v: 0.65 }, // A4
      { f: 523.25, d: 2.8, v: 0.5 }, // C5
      { f: 392.00, d: 2.5, v: 0.45 }, // G4
      { f: 349.23, d: 3.5, v: 0.55 }, // F4
    ];

    let isRunning = true;
    let timeoutId: number | null = null;
    let noteIdx = 0;

    const scheduleNextPianoPhrase = () => {
      if (!isRunning || ctx.state === 'closed') return;
      const note = motifNotes[noteIdx % motifNotes.length];
      noteIdx++;

      const now = ctx.currentTime;
      MoodAudioLibrary.schedulePianoNote(ctx, trackGain, note.f, now + 0.05, note.d, note.v);

      // Occasionally add a soft lower harmony root note
      if (noteIdx % 3 === 0) {
        const root = note.f > 350 ? 174.61 : 130.81; // F3 or C3
        MoodAudioLibrary.schedulePianoNote(ctx, trackGain, root, now + 0.08, 3.5, 0.4);
      }

      const nextDelay = 1800 + Math.random() * 1200;
      timeoutId = window.setTimeout(scheduleNextPianoPhrase, nextDelay);
    };

    scheduleNextPianoPhrase();

    return {
      mood: 'happy',
      gainNode: trackGain,
      stop: () => {
        isRunning = false;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          padLfo.stop();
          for (const o of padOscs) o.stop();
        } catch {
          // ignore
        }
      },
      dispose: () => {
        try {
          trackGain.disconnect();
          padFilter.disconnect();
          padGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  /**
   * SAD SOUNDSCAPE
   * Slow expressive minor piano in D minor / A minor, soft rain-like ambient textures,
   * deep gentle atmospheric pads, reflective melancholic atmosphere.
   */
  public static createSadSoundscape(ctx: AudioContext, masterOutput: AudioNode): SoundscapeTrackInstance {
    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(0, ctx.currentTime);
    trackGain.connect(masterOutput);

    // 1. Deep Gentle Atmospheric Pad (Dm9 / Am7 warm, low-frequency embrace)
    const padNotes = [146.83, 174.61, 220.0, 261.63]; // D3, F3, A3, C4
    const padOscs: OscillatorNode[] = [];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.08, ctx.currentTime);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(450, ctx.currentTime);

    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(padFilter);
      osc.start();
      padOscs.push(osc);
    }
    padFilter.connect(padGain);
    padGain.connect(trackGain);

    // 2. Soft Rain Ambient Texture (Filtered pink noise with low gentle murmurs)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.035;
    }
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = noiseBuffer;
    rainNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1100, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.12, ctx.currentTime);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(trackGain);
    rainNoise.start();

    // 3. Slow, Expressive Minor Piano Phrasing
    // Dm9, Am, Bbmaj7 melancholic phrases with long decays
    const sadPhrases = [
      { f: 220.00, d: 3.6, v: 0.4 }, // A3
      { f: 261.63, d: 3.8, v: 0.45 }, // C4
      { f: 293.66, d: 4.2, v: 0.5 }, // D4
      { f: 349.23, d: 4.0, v: 0.42 }, // F4
      { f: 329.63, d: 3.8, v: 0.38 }, // E4
      { f: 261.63, d: 4.5, v: 0.4 }, // C4
      { f: 220.00, d: 5.0, v: 0.35 }, // A3
      { f: 174.61, d: 4.8, v: 0.38 }, // F3
    ];

    let isRunning = true;
    let timeoutId: number | null = null;
    let phraseIdx = 0;

    const scheduleSadPiano = () => {
      if (!isRunning || ctx.state === 'closed') return;
      const note = sadPhrases[phraseIdx % sadPhrases.length];
      phraseIdx++;

      const now = ctx.currentTime;
      MoodAudioLibrary.schedulePianoNote(ctx, trackGain, note.f, now + 0.05, note.d, note.v);

      // Low bass anchor note on every 4th phrase
      if (phraseIdx % 4 === 0) {
        MoodAudioLibrary.schedulePianoNote(ctx, trackGain, 73.42, now + 0.1, 5.5, 0.35); // D2 low resonance
      }

      const delay = 2600 + Math.random() * 1800; // Slow, contemplative spacing
      timeoutId = window.setTimeout(scheduleSadPiano, delay);
    };

    scheduleSadPiano();

    return {
      mood: 'sad',
      gainNode: trackGain,
      stop: () => {
        isRunning = false;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          rainNoise.stop();
          for (const o of padOscs) o.stop();
        } catch {
          // ignore
        }
      },
      dispose: () => {
        try {
          trackGain.disconnect();
          padFilter.disconnect();
          padGain.disconnect();
          rainFilter.disconnect();
          rainGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  /**
   * ROMANTIC SOUNDSCAPE
   * Intimate piano, gentle strings, warm ambient textures, delicate melodic phrases,
   * dreamy, intimate, emotionally rich atmosphere.
   */
  public static createRomanticSoundscape(ctx: AudioContext, masterOutput: AudioNode): SoundscapeTrackInstance {
    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(0, ctx.currentTime);
    trackGain.connect(masterOutput);

    // 1. Gentle String Ensemble Pad (Warm strings with gentle vibrato in Ebmaj9 / Gm)
    const stringFreqs = [155.56, 196.0, 233.08, 293.66, 349.23]; // Eb3, G3, Bb3, D4, F4
    const stringOscs: OscillatorNode[] = [];
    const stringGain = ctx.createGain();
    stringGain.gain.setValueAtTime(0.08, ctx.currentTime);

    const stringFilter = ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    stringFilter.frequency.setValueAtTime(650, ctx.currentTime);

    // Subtle slow vibrato LFO
    const vibratoLfo = ctx.createOscillator();
    vibratoLfo.frequency.setValueAtTime(4.5, ctx.currentTime); // 4.5Hz gentle natural vibrato
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(1.8, ctx.currentTime); // Very soft pitch depth
    vibratoLfo.connect(vibratoGain);
    vibratoLfo.start();

    for (const freq of stringFreqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      vibratoGain.connect(osc.frequency);
      osc.connect(stringFilter);
      osc.start();
      stringOscs.push(osc);
    }
    stringFilter.connect(stringGain);
    stringGain.connect(trackGain);

    // 2. Intimate Romantic Piano Phrases (Close intervals, tender touch)
    const romanticNotes = [
      { f: 311.13, d: 3.2, v: 0.45 }, // Eb4
      { f: 349.23, d: 3.0, v: 0.42 }, // F4
      { f: 392.00, d: 3.6, v: 0.5 }, // G4
      { f: 466.16, d: 3.4, v: 0.48 }, // Bb4
      { f: 392.00, d: 3.2, v: 0.42 }, // G4
      { f: 349.23, d: 3.8, v: 0.45 }, // F4
      { f: 293.66, d: 4.0, v: 0.4 }, // D4
      { f: 233.08, d: 4.5, v: 0.45 }, // Bb3
    ];

    let isRunning = true;
    let timeoutId: number | null = null;
    let noteIdx = 0;

    const scheduleRomanticPiano = () => {
      if (!isRunning || ctx.state === 'closed') return;
      const note = romanticNotes[noteIdx % romanticNotes.length];
      noteIdx++;

      const now = ctx.currentTime;
      MoodAudioLibrary.schedulePianoNote(ctx, trackGain, note.f, now + 0.05, note.d, note.v);

      // Add a tender interval harmony every other phrase
      if (noteIdx % 2 === 0) {
        const harmony = note.f * 1.25; // Major third above
        MoodAudioLibrary.schedulePianoNote(ctx, trackGain, harmony, now + 0.08, note.d * 0.9, note.v * 0.7);
      }

      const nextDelay = 2200 + Math.random() * 1400;
      timeoutId = window.setTimeout(scheduleRomanticPiano, nextDelay);
    };

    scheduleRomanticPiano();

    return {
      mood: 'romantic',
      gainNode: trackGain,
      stop: () => {
        isRunning = false;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          vibratoLfo.stop();
          for (const o of stringOscs) o.stop();
        } catch {
          // ignore
        }
      },
      dispose: () => {
        try {
          trackGain.disconnect();
          stringFilter.disconnect();
          stringGain.disconnect();
          vibratoGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  /**
   * ZEAL SOUNDSCAPE
   * Motivating cinematic instrumental textures, rhythmic pulsing ambient layers,
   * gradually rising musical energy, inspiring piano chords, focused powerful determined atmosphere.
   */
  public static createZealSoundscape(ctx: AudioContext, masterOutput: AudioNode): SoundscapeTrackInstance {
    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(0, ctx.currentTime);
    trackGain.connect(masterOutput);

    // 1. Rhythmic Pulsing Ambient Sub-Bass Layer (Steady determined cinematic pulse)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 low pulse

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, ctx.currentTime);

    // Rhythmic LFO pulse at 84 BPM (~1.4Hz)
    const pulseLfo = ctx.createOscillator();
    pulseLfo.frequency.setValueAtTime(1.4, ctx.currentTime);
    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(0.06, ctx.currentTime);
    pulseLfo.connect(pulseGain);
    pulseGain.connect(subGain.gain);

    subOsc.connect(subGain);
    subGain.connect(trackGain);
    subOsc.start();
    pulseLfo.start();

    // 2. Inspiring Cinematic Synth Pad (Rising C minor / G minor cinematic drive)
    const padNotes = [130.81, 196.0, 261.63, 311.13, 392.0]; // C3, G3, C4, Eb4, G4
    const padOscs: OscillatorNode[] = [];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.07, ctx.currentTime);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(750, ctx.currentTime);

    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(padFilter);
      osc.start();
      padOscs.push(osc);
    }
    padFilter.connect(padGain);
    padGain.connect(trackGain);

    // 3. Motivating Piano Arpeggios & Focused Momentum
    // Dynamic rising patterns: C - G - Eb - G - Bb - C
    const zealArpeggios = [
      { f: 261.63, d: 1.8, v: 0.6 }, // C4
      { f: 311.13, d: 1.8, v: 0.65 }, // Eb4
      { f: 392.00, d: 2.0, v: 0.7 }, // G4
      { f: 466.16, d: 2.2, v: 0.75 }, // Bb4
      { f: 523.25, d: 2.6, v: 0.8 }, // C5
      { f: 392.00, d: 1.8, v: 0.65 }, // G4
      { f: 466.16, d: 2.2, v: 0.7 }, // Bb4
      { f: 311.13, d: 2.5, v: 0.65 }, // Eb4
    ];

    let isRunning = true;
    let timeoutId: number | null = null;
    let arpIdx = 0;

    const scheduleZealPiano = () => {
      if (!isRunning || ctx.state === 'closed') return;
      const note = zealArpeggios[arpIdx % zealArpeggios.length];
      arpIdx++;

      const now = ctx.currentTime;
      MoodAudioLibrary.schedulePianoNote(ctx, trackGain, note.f, now + 0.04, note.d, note.v);

      // Low power accent note on measure starts
      if (arpIdx % 4 === 0) {
        MoodAudioLibrary.schedulePianoNote(ctx, trackGain, 130.81, now + 0.05, 3.2, 0.65); // C3 chord foundation
      }

      // Driving focused cadence (approx 1.2s - 1.6s steady rhythm)
      const nextDelay = 1200 + (arpIdx % 2 === 0 ? 300 : 0);
      timeoutId = window.setTimeout(scheduleZealPiano, nextDelay);
    };

    scheduleZealPiano();

    return {
      mood: 'zeal',
      gainNode: trackGain,
      stop: () => {
        isRunning = false;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          subOsc.stop();
          pulseLfo.stop();
          for (const o of padOscs) o.stop();
        } catch {
          // ignore
        }
      },
      dispose: () => {
        try {
          trackGain.disconnect();
          subGain.disconnect();
          pulseGain.disconnect();
          padFilter.disconnect();
          padGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  /**
   * Factory dispatcher for canonical moods
   */
  public static createTrack(
    ctx: AudioContext,
    masterOutput: AudioNode,
    mood: CanonicalMusicMood
  ): SoundscapeTrackInstance {
    switch (mood) {
      case 'happy':
        return this.createHappySoundscape(ctx, masterOutput);
      case 'sad':
        return this.createSadSoundscape(ctx, masterOutput);
      case 'romantic':
        return this.createRomanticSoundscape(ctx, masterOutput);
      case 'zeal':
        return this.createZealSoundscape(ctx, masterOutput);
      default:
        return this.createHappySoundscape(ctx, masterOutput);
    }
  }
}
