export type Mood =
  | 'joyful'
  | 'peaceful'
  | 'reflective'
  | 'nostalgic'
  | 'melancholic'
  | 'romantic'
  | 'energetic'
  | 'angry'
  | 'lonely'
  | 'hopeful'
  | 'dreamy'
  | 'neutral';

export type AtmosphereType =
  | 'auto'
  | 'rain'
  | 'night'
  | 'forest'
  | 'sunrise'
  | 'fireplace'
  | 'minimal';

export type WeatherType =
  | 'rain'
  | 'snow'
  | 'sunbeams'
  | 'petals'
  | 'embers'
  | 'fireflies'
  | 'zeal-sparks'
  | 'clear';

export type LightingMood =
  | 'cool-overcast'
  | 'golden-dawn'
  | 'silvery-moonlight'
  | 'emerald-canopy'
  | 'warm-amber'
  | 'rose-twilight'
  | 'vivid-electric'
  | 'neutral-diffuse';

export interface WeatherOverlaySettings {
  mode: 'auto' | WeatherType;
  particleIntensity: 'off' | 'subtle' | 'balanced' | 'rich';
  lightingIntensity: 'off' | 'soft' | 'moderate' | 'vivid';
  ambientLightPulse: boolean;
}

export type SoundscapeType =
  | 'rain'
  | 'forest'
  | 'night'
  | 'lofi'
  | 'fireplace'
  | 'ambient'
  | 'none';

export type FontFamilyOption =
  | 'cormorant'
  | 'playfair'
  | 'lora'
  | 'jakarta'
  | 'jetbrains';

export type CanvasWidthOption = 'narrow' | 'normal' | 'wide';
export type TextContrastOption = 'soft' | 'balanced' | 'crisp';
export type TextAlignOption = 'left' | 'center';

export interface TypographySettings {
  fontFamily: FontFamilyOption;
  fontSize: number; // 18 to 32
  lineHeight: number; // 1.5 to 2.4
  letterSpacing: number; // -0.02 to 0.08
  width: CanvasWidthOption;
  alignment: TextAlignOption;
  contrast: TextContrastOption;
}

export interface MoodHistoryEntry {
  timestamp: number;
  mood: Mood;
  secondaryMood?: Mood | null;
  wordCount: number;
}

export interface Moment {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  characterCount: number;
  dominantMood: Mood;
  secondaryMood?: Mood | null;
  atmosphere: AtmosphereType;
  soundscape: SoundscapeType;
  typographySettings: TypographySettings;
  moodHistory: MoodHistoryEntry[];
  poeticResonance?: string;
  emotionalTags?: string[];
  weatherType?: WeatherType;
}

export interface AppSettings {
  unwrittenPromptEnabled: boolean;
  unwrittenDelaySeconds: number; // default 24
  audioEnabled: boolean;
  audioVolume: number; // 0 to 1
  defaultSoundscape: SoundscapeType;
  atmosphereIntensity: 'subtle' | 'normal' | 'rich';
  highContrast: boolean;
  reducedMotion: boolean;
  autoSaveIntervalMs: number;
}
