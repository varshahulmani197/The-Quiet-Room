import { CanonicalMusicMood } from './moodAudioLibrary';
import { moodAudioController } from './moodAudioController';

export interface MoodTransitionConfig {
  cooldownMs: number; // Time in ms before another ordinary transition can trigger
  minConfidence: number; // Minimum confidence to accept a mood shift
  consecutiveRequirement: number; // Consecutive votes required for lower confidence shifts
}

export class MoodTransitionHandler {
  private lastTransitionTime: number = 0;
  private lastDetectedMood: CanonicalMusicMood = 'happy';
  private consecutiveCount: number = 0;
  private pendingCandidateMood: CanonicalMusicMood | null = null;
  private audioController = moodAudioController;

  private config: MoodTransitionConfig = {
    cooldownMs: 5000, // 5 second cooldown between ordinary transitions
    minConfidence: 0.45,
    consecutiveRequirement: 2,
  };

  constructor(customConfig?: Partial<MoodTransitionConfig>, customController?: typeof moodAudioController) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    if (customController) {
      this.audioController = customController;
    }
  }

  /**
   * Main entry point when existing sentiment / mood analysis produces a result
   */
  public handleMoodDetected(
    rawMood: string | undefined | null,
    confidence: number = 0.7
  ): boolean {
    if (!rawMood) return false;

    const canonical = this.audioController.normalizeMood(rawMood);
    const now = Date.now();

    // 1. If same as active audio mood, reset pending candidates and exit
    if (canonical === this.audioController.getState().currentMood) {
      this.pendingCandidateMood = null;
      this.consecutiveCount = 0;
      return false;
    }

    // 2. Confidence filter
    if (confidence < this.config.minConfidence) {
      return false;
    }

    // 3. Track consecutive detections to ensure emotional shift is real and sustained
    if (this.pendingCandidateMood === canonical) {
      this.consecutiveCount++;
    } else {
      this.pendingCandidateMood = canonical;
      this.consecutiveCount = 1;
    }

    const timeSinceLast = now - this.lastTransitionTime;
    const isStrongSustainedShift = confidence >= 0.82 || this.consecutiveCount >= this.config.consecutiveRequirement;

    // 4. Cooldown check: if within cooldown, only allow strong sustained shifts
    if (timeSinceLast < this.config.cooldownMs && !isStrongSustainedShift) {
      return false;
    }

    // 5. Execute crossfade transition
    this.lastTransitionTime = now;
    this.lastDetectedMood = canonical;
    this.pendingCandidateMood = null;
    this.consecutiveCount = 0;

    return this.audioController.transitionTo(canonical);
  }

  public getLastMood(): CanonicalMusicMood {
    return this.lastDetectedMood;
  }
}

export const moodTransitionHandler = new MoodTransitionHandler();
