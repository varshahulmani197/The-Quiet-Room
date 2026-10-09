import {
  CanonicalMusicMood,
  MoodAudioLibrary,
  SoundscapeTrackInstance,
} from './moodAudioLibrary';

export interface MoodAudioState {
  currentMood: CanonicalMusicMood;
  isPlaying: boolean;
  isCrossfading: boolean;
  volume: number;
  isAutoplayBlocked: boolean;
  currentTrackLabel: string;
}

export class MoodAudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private currentTrack: SoundscapeTrackInstance | null = null;
  private fadingTracks: { track: SoundscapeTrackInstance; timeoutId: number }[] = [];

  private currentMood: CanonicalMusicMood = 'happy';
  private isPlaying: boolean = false;
  private isCrossfading: boolean = false;
  private volume: number = 0.35;
  private isAutoplayBlocked: boolean = false;
  private crossfadeDuration: number = 3.5; // 3.5 seconds smooth cinematic crossfade

  private listeners: Set<(state: MoodAudioState) => void> = new Set();

  constructor() {
    // Volume preference from localStorage if available
    try {
      const savedVol = localStorage.getItem('the_quiet_room_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }
    } catch {
      // ignore
    }
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public subscribe(cb: (state: MoodAudioState) => void): () => void {
    this.listeners.add(cb);
    cb(this.getState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const state = this.getState();
    for (const cb of this.listeners) {
      try {
        cb(state);
      } catch {
        // ignore listener exceptions
      }
    }
  }

  public getState(): MoodAudioState {
    return {
      currentMood: this.currentMood,
      isPlaying: this.isPlaying,
      isCrossfading: this.isCrossfading,
      volume: this.volume,
      isAutoplayBlocked: this.isAutoplayBlocked,
      currentTrackLabel: this.getTrackDescription(this.currentMood),
    };
  }

  public getTrackDescription(mood: CanonicalMusicMood): string {
    switch (mood) {
      case 'happy':
        return 'Uplifting Ambient Piano & Warm Textures';
      case 'sad':
        return 'Reflective Melancholic Piano & Rain';
      case 'romantic':
        return 'Intimate Piano & Gentle Strings';
      case 'zeal':
        return 'Cinematic Inspiring Pulse & Momentum';
      default:
        return 'Ambient Sanctuary';
    }
  }

  /**
   * Normalizes raw emotion / mood string to one of the four canonical categories
   */
  public normalizeMood(rawMood: string | undefined | null): CanonicalMusicMood {
    if (!rawMood) return this.currentMood || 'happy';
    const m = rawMood.toLowerCase().trim();

    if (
      m === 'happy' ||
      m === 'joyful' ||
      m === 'joy' ||
      m === 'peaceful' ||
      m === 'hopeful' ||
      m === 'cheerful' ||
      m === 'sunrise' ||
      m === 'delight'
    ) {
      return 'happy';
    }

    if (
      m === 'sad' ||
      m === 'melancholic' ||
      m === 'melancholy' ||
      m === 'lonely' ||
      m === 'sorrow' ||
      m === 'grief' ||
      m === 'rain'
    ) {
      return 'sad';
    }

    if (
      m === 'romantic' ||
      m === 'love' ||
      m === 'dreamy' ||
      m === 'tender' ||
      m === 'intimate' ||
      m === 'affection'
    ) {
      return 'romantic';
    }

    if (
      m === 'zeal' ||
      m === 'energetic' ||
      m === 'energy' ||
      m === 'angry' ||
      m === 'rage' ||
      m === 'motivated' ||
      m === 'ambitious' ||
      m === 'bold' ||
      m === 'determination' ||
      m === 'passion' ||
      m === 'fireplace'
    ) {
      return 'zeal';
    }

    // Reflective / nostalgic: gentle contemplative mood
    if (m === 'nostalgic' || m === 'reflective') {
      return 'sad';
    }

    return this.currentMood || 'happy';
  }

  /**
   * Start playback of current or specified mood.
   * Handles autoplay policy gracefully.
   */
  public async play(mood?: CanonicalMusicMood | string): Promise<boolean> {
    const ctx = this.initContext();

    if (mood) {
      this.currentMood = this.normalizeMood(mood);
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isAutoplayBlocked = false;
      } catch (err) {
        this.isAutoplayBlocked = true;
        this.notify();
        return false;
      }
    }

    this.isPlaying = true;

    // If no track currently playing or track mood differs, start fresh
    if (!this.currentTrack || this.currentTrack.mood !== this.currentMood) {
      this.cleanupAllTracks();
      const newTrack = MoodAudioLibrary.createTrack(ctx, this.masterGain!, this.currentMood);
      this.currentTrack = newTrack;

      // Smooth initial fade-in (1.2s)
      const now = ctx.currentTime;
      newTrack.gainNode.gain.setValueAtTime(0.0001, now);
      newTrack.gainNode.gain.linearRampToValueAtTime(1.0, now + 1.2);
    }

    this.notify();
    return true;
  }

  /**
   * Stop or gracefully fade out playback
   */
  public stop(fadeDuration: number = 1.0) {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.ctx && this.currentTrack) {
      const now = this.ctx.currentTime;
      const trackToStop = this.currentTrack;
      this.currentTrack = null;

      try {
        trackToStop.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
        window.setTimeout(() => {
          trackToStop.stop();
          trackToStop.dispose();
        }, fadeDuration * 1000 + 100);
      } catch {
        trackToStop.stop();
        trackToStop.dispose();
      }
    }

    this.cleanupFadingTracks();
    this.isCrossfading = false;
    this.notify();
  }

  /**
   * Toggle play/pause
   */
  public toggle(mood?: CanonicalMusicMood | string) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(mood);
    }
  }

  /**
   * Adjust master volume smoothly
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('the_quiet_room_volume', this.volume.toString());
    } catch {
      // ignore
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Core Requirement: Seamless Crossfade between current and incoming mood track.
   * Target duration 3–5 seconds without clicks, pops, or orphaned audio instances.
   */
  public transitionTo(targetMoodRaw: string, customDuration?: number): boolean {
    const targetMood = this.normalizeMood(targetMoodRaw);

    // If target mood is already the active mood and playing, no transition needed
    if (this.currentMood === targetMood && this.isPlaying && this.currentTrack) {
      return false;
    }

    this.currentMood = targetMood;
    const duration = customDuration ?? this.crossfadeDuration;

    // If audio is currently muted/stopped, update state without starting playback
    if (!this.isPlaying) {
      this.notify();
      return true;
    }

    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        this.isAutoplayBlocked = true;
      });
    }

    this.isCrossfading = true;
    const now = ctx.currentTime;

    // 1. Prepare outgoing track to fade out
    if (this.currentTrack) {
      const outgoing = this.currentTrack;
      try {
        // Cancel scheduled future values and ramp down to 0
        outgoing.gainNode.gain.cancelScheduledValues(now);
        outgoing.gainNode.gain.setValueAtTime(outgoing.gainNode.gain.value, now);
        outgoing.gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

        const timeoutId = window.setTimeout(() => {
          outgoing.stop();
          outgoing.dispose();
          this.fadingTracks = this.fadingTracks.filter((f) => f.track !== outgoing);
          if (this.fadingTracks.length === 0) {
            this.isCrossfading = false;
            this.notify();
          }
        }, duration * 1000 + 150);

        this.fadingTracks.push({ track: outgoing, timeoutId });
      } catch (err) {
        outgoing.stop();
        outgoing.dispose();
      }
    }

    // 2. Spawn and fade in new track
    try {
      const incoming = MoodAudioLibrary.createTrack(ctx, this.masterGain!, targetMood);
      incoming.gainNode.gain.setValueAtTime(0.0001, now);
      incoming.gainNode.gain.linearRampToValueAtTime(1.0, now + duration);
      this.currentTrack = incoming;
    } catch (err) {
      console.warn('Failed to start incoming mood track:', err);
      this.isCrossfading = false;
      return false;
    }

    this.notify();
    return true;
  }

  private cleanupFadingTracks() {
    for (const f of this.fadingTracks) {
      clearTimeout(f.timeoutId);
      try {
        f.track.stop();
        f.track.dispose();
      } catch {
        // ignore
      }
    }
    this.fadingTracks = [];
  }

  private cleanupAllTracks() {
    this.cleanupFadingTracks();
    if (this.currentTrack) {
      try {
        this.currentTrack.stop();
        this.currentTrack.dispose();
      } catch {
        // ignore
      }
      this.currentTrack = null;
    }
  }
}

export const moodAudioController = new MoodAudioController();
