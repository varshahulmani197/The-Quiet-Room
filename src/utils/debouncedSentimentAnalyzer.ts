import { Mood, AtmosphereType, SoundscapeType, WeatherType, LightingMood } from '../types';

export interface SentimentAnalysisResult {
  dominantMood: Mood;
  secondaryMood: Mood | null;
  recommendedAtmosphere: AtmosphereType;
  recommendedSoundscape: SoundscapeType;
  poeticResonance: string;
  confidence: number;
  valence: number; // -1 (deep sorrow/negative) to +1 (radiant joy/positive)
  arousal: number; // 0 (stillness/quiet) to 1 (high energy/intensity)
  wordCount: number;
  emotionalTags: string[];
  weatherType: WeatherType;
  lightingMood: LightingMood;
  weatherDescription: string;
}

// Valence and Arousal Lexicon
const SENTIMENT_WEIGHTS: Record<string, { valence: number; arousal: number; mood: Mood }> = {
  // Melancholic / Grief / Rainy
  rain: { valence: -0.4, arousal: 0.2, mood: 'melancholic' },
  rainy: { valence: -0.4, arousal: 0.2, mood: 'melancholic' },
  tears: { valence: -0.8, arousal: 0.4, mood: 'melancholic' },
  crying: { valence: -0.8, arousal: 0.5, mood: 'melancholic' },
  sorrow: { valence: -0.85, arousal: 0.3, mood: 'melancholic' },
  grief: { valence: -0.9, arousal: 0.4, mood: 'melancholic' },
  sad: { valence: -0.7, arousal: 0.3, mood: 'melancholic' },
  sadness: { valence: -0.7, arousal: 0.3, mood: 'melancholic' },
  ache: { valence: -0.6, arousal: 0.3, mood: 'melancholic' },
  aching: { valence: -0.6, arousal: 0.3, mood: 'melancholic' },
  lost: { valence: -0.5, arousal: 0.3, mood: 'melancholic' },
  hollow: { valence: -0.6, arousal: 0.2, mood: 'melancholic' },
  wept: { valence: -0.8, arousal: 0.4, mood: 'melancholic' },
  broken: { valence: -0.75, arousal: 0.5, mood: 'melancholic' },
  mourn: { valence: -0.8, arousal: 0.3, mood: 'melancholic' },
  cold: { valence: -0.4, arousal: 0.2, mood: 'melancholic' },
  grey: { valence: -0.3, arousal: 0.15, mood: 'melancholic' },
  gray: { valence: -0.3, arousal: 0.15, mood: 'melancholic' },

  // Peaceful / Serene / Forest
  calm: { valence: 0.6, arousal: 0.1, mood: 'peaceful' },
  serene: { valence: 0.7, arousal: 0.1, mood: 'peaceful' },
  tranquil: { valence: 0.75, arousal: 0.1, mood: 'peaceful' },
  gentle: { valence: 0.6, arousal: 0.15, mood: 'peaceful' },
  peace: { valence: 0.8, arousal: 0.1, mood: 'peaceful' },
  peaceful: { valence: 0.8, arousal: 0.1, mood: 'peaceful' },
  breeze: { valence: 0.5, arousal: 0.2, mood: 'peaceful' },
  forest: { valence: 0.5, arousal: 0.2, mood: 'peaceful' },
  leaves: { valence: 0.4, arousal: 0.2, mood: 'peaceful' },
  moss: { valence: 0.4, arousal: 0.1, mood: 'peaceful' },
  stream: { valence: 0.5, arousal: 0.25, mood: 'peaceful' },
  soft: { valence: 0.5, arousal: 0.15, mood: 'peaceful' },
  breathe: { valence: 0.5, arousal: 0.15, mood: 'peaceful' },
  breath: { valence: 0.4, arousal: 0.15, mood: 'peaceful' },
  rest: { valence: 0.5, arousal: 0.1, mood: 'peaceful' },
  resting: { valence: 0.5, arousal: 0.1, mood: 'peaceful' },
  stillness: { valence: 0.5, arousal: 0.05, mood: 'peaceful' },
  sanctuary: { valence: 0.7, arousal: 0.1, mood: 'peaceful' },

  // Joyful / Radiant / Morning Light
  laugh: { valence: 0.85, arousal: 0.7, mood: 'joyful' },
  laughter: { valence: 0.85, arousal: 0.7, mood: 'joyful' },
  smile: { valence: 0.7, arousal: 0.5, mood: 'joyful' },
  bright: { valence: 0.65, arousal: 0.6, mood: 'joyful' },
  sun: { valence: 0.6, arousal: 0.5, mood: 'joyful' },
  sunlight: { valence: 0.7, arousal: 0.5, mood: 'joyful' },
  warm: { valence: 0.6, arousal: 0.4, mood: 'joyful' },
  warmth: { valence: 0.65, arousal: 0.4, mood: 'joyful' },
  delight: { valence: 0.85, arousal: 0.65, mood: 'joyful' },
  dance: { valence: 0.75, arousal: 0.75, mood: 'joyful' },
  dancing: { valence: 0.75, arousal: 0.75, mood: 'joyful' },
  alive: { valence: 0.7, arousal: 0.65, mood: 'joyful' },
  radiant: { valence: 0.8, arousal: 0.6, mood: 'joyful' },
  glow: { valence: 0.65, arousal: 0.45, mood: 'joyful' },
  celebrate: { valence: 0.85, arousal: 0.8, mood: 'joyful' },
  joy: { valence: 0.9, arousal: 0.7, mood: 'joyful' },
  happiness: { valence: 0.85, arousal: 0.6, mood: 'joyful' },

  // Reflective / Night / Stars
  remember: { valence: 0.1, arousal: 0.25, mood: 'reflective' },
  memory: { valence: 0.15, arousal: 0.25, mood: 'reflective' },
  thought: { valence: 0.1, arousal: 0.2, mood: 'reflective' },
  thinking: { valence: 0.1, arousal: 0.2, mood: 'reflective' },
  perhaps: { valence: 0.05, arousal: 0.2, mood: 'reflective' },
  wonder: { valence: 0.3, arousal: 0.35, mood: 'reflective' },
  wondering: { valence: 0.3, arousal: 0.35, mood: 'reflective' },
  why: { valence: 0.0, arousal: 0.3, mood: 'reflective' },
  night: { valence: 0.1, arousal: 0.2, mood: 'reflective' },
  stars: { valence: 0.45, arousal: 0.3, mood: 'reflective' },
  quiet: { valence: 0.4, arousal: 0.1, mood: 'reflective' },
  midnight: { valence: 0.1, arousal: 0.2, mood: 'reflective' },
  window: { valence: 0.1, arousal: 0.2, mood: 'reflective' },
  silence: { valence: 0.2, arousal: 0.1, mood: 'reflective' },
  solitude: { valence: -0.1, arousal: 0.2, mood: 'reflective' },

  // Nostalgic / Embers / Hearth
  childhood: { valence: 0.4, arousal: 0.3, mood: 'nostalgic' },
  photograph: { valence: 0.3, arousal: 0.3, mood: 'nostalgic' },
  summer: { valence: 0.6, arousal: 0.5, mood: 'nostalgic' },
  yesterday: { valence: 0.0, arousal: 0.3, mood: 'nostalgic' },
  scent: { valence: 0.35, arousal: 0.3, mood: 'nostalgic' },
  porch: { valence: 0.4, arousal: 0.25, mood: 'nostalgic' },
  reminisce: { valence: 0.3, arousal: 0.3, mood: 'nostalgic' },
  sepia: { valence: 0.1, arousal: 0.2, mood: 'nostalgic' },
  fireplace: { valence: 0.55, arousal: 0.3, mood: 'nostalgic' },
  hearth: { valence: 0.55, arousal: 0.25, mood: 'nostalgic' },
  embers: { valence: 0.3, arousal: 0.35, mood: 'nostalgic' },

  // Romantic
  love: { valence: 0.9, arousal: 0.6, mood: 'romantic' },
  kiss: { valence: 0.8, arousal: 0.7, mood: 'romantic' },
  embrace: { valence: 0.75, arousal: 0.5, mood: 'romantic' },
  darling: { valence: 0.75, arousal: 0.45, mood: 'romantic' },
  beloved: { valence: 0.8, arousal: 0.45, mood: 'romantic' },
  tender: { valence: 0.7, arousal: 0.3, mood: 'romantic' },
  whisper: { valence: 0.45, arousal: 0.25, mood: 'romantic' },
  touch: { valence: 0.6, arousal: 0.5, mood: 'romantic' },

  // Hopeful
  tomorrow: { valence: 0.5, arousal: 0.4, mood: 'hopeful' },
  dawn: { valence: 0.65, arousal: 0.45, mood: 'hopeful' },
  horizon: { valence: 0.4, arousal: 0.35, mood: 'hopeful' },
  rise: { valence: 0.5, arousal: 0.55, mood: 'hopeful' },
  promise: { valence: 0.6, arousal: 0.4, mood: 'hopeful' },
  renew: { valence: 0.65, arousal: 0.45, mood: 'hopeful' },
  bloom: { valence: 0.7, arousal: 0.5, mood: 'hopeful' },

  // Dreamy
  cloud: { valence: 0.3, arousal: 0.2, mood: 'dreamy' },
  clouds: { valence: 0.3, arousal: 0.2, mood: 'dreamy' },
  drift: { valence: 0.2, arousal: 0.15, mood: 'dreamy' },
  floating: { valence: 0.4, arousal: 0.2, mood: 'dreamy' },
  waves: { valence: 0.35, arousal: 0.3, mood: 'dreamy' },
  mist: { valence: 0.15, arousal: 0.2, mood: 'dreamy' },
  ethereal: { valence: 0.5, arousal: 0.3, mood: 'dreamy' },

  // Lonely
  alone: { valence: -0.5, arousal: 0.25, mood: 'lonely' },
  isolated: { valence: -0.65, arousal: 0.3, mood: 'lonely' },
  empty: { valence: -0.5, arousal: 0.2, mood: 'lonely' },
  distance: { valence: -0.3, arousal: 0.2, mood: 'lonely' },

  // Energetic & Zeal (Ambition, excitement, determination)
  fast: { valence: 0.2, arousal: 0.85, mood: 'energetic' },
  racing: { valence: 0.1, arousal: 0.9, mood: 'energetic' },
  fire: { valence: 0.2, arousal: 0.85, mood: 'energetic' },
  wild: { valence: 0.3, arousal: 0.85, mood: 'energetic' },
  pulse: { valence: 0.3, arousal: 0.7, mood: 'energetic' },
  rush: { valence: 0.1, arousal: 0.85, mood: 'energetic' },
  zeal: { valence: 0.6, arousal: 0.85, mood: 'energetic' },
  ambition: { valence: 0.5, arousal: 0.8, mood: 'energetic' },
  ambitious: { valence: 0.5, arousal: 0.8, mood: 'energetic' },
  determined: { valence: 0.5, arousal: 0.85, mood: 'energetic' },
  determination: { valence: 0.5, arousal: 0.85, mood: 'energetic' },
  excitement: { valence: 0.7, arousal: 0.9, mood: 'energetic' },
  excited: { valence: 0.7, arousal: 0.9, mood: 'energetic' },
  conquer: { valence: 0.6, arousal: 0.85, mood: 'energetic' },
  relentless: { valence: 0.4, arousal: 0.9, mood: 'energetic' },
  victory: { valence: 0.8, arousal: 0.85, mood: 'energetic' },
  triumph: { valence: 0.85, arousal: 0.85, mood: 'energetic' },
  power: { valence: 0.5, arousal: 0.8, mood: 'energetic' },
  bold: { valence: 0.5, arousal: 0.75, mood: 'energetic' },

  // Direct canonical words
  happy: { valence: 0.85, arousal: 0.6, mood: 'joyful' },
  loss: { valence: -0.8, arousal: 0.35, mood: 'melancholic' },
  romance: { valence: 0.85, arousal: 0.55, mood: 'romantic' },

  // Angry
  rage: { valence: -0.85, arousal: 0.95, mood: 'angry' },
  furious: { valence: -0.85, arousal: 0.9, mood: 'angry' },
  burn: { valence: -0.5, arousal: 0.8, mood: 'angry' },
  shatter: { valence: -0.7, arousal: 0.85, mood: 'angry' },
  bitter: { valence: -0.6, arousal: 0.6, mood: 'angry' },
};

const MOOD_TO_ATMOSPHERE_CONFIG: Record<
  Mood,
  { atmosphere: AtmosphereType; soundscape: SoundscapeType; resonance: string }
> = {
  melancholic: {
    atmosphere: 'rain',
    soundscape: 'rain',
    resonance: 'Soft raindrops blurring the glass.',
  },
  reflective: {
    atmosphere: 'night',
    soundscape: 'night',
    resonance: 'Deep midnight, quiet and expansive.',
  },
  peaceful: {
    atmosphere: 'forest',
    soundscape: 'forest',
    resonance: 'A gentle breeze rustling through leaves.',
  },
  joyful: {
    atmosphere: 'sunrise',
    soundscape: 'ambient',
    resonance: 'Golden morning light resting on the desk.',
  },
  nostalgic: {
    atmosphere: 'fireplace',
    soundscape: 'fireplace',
    resonance: 'The warm embers of remembering.',
  },
  romantic: {
    atmosphere: 'night',
    soundscape: 'ambient',
    resonance: 'Velvet dusk and quiet closeness.',
  },
  hopeful: {
    atmosphere: 'sunrise',
    soundscape: 'ambient',
    resonance: 'A subtle dawn breaking on the horizon.',
  },
  dreamy: {
    atmosphere: 'night',
    soundscape: 'lofi',
    resonance: 'Floating between memory and waking.',
  },
  lonely: {
    atmosphere: 'night',
    soundscape: 'night',
    resonance: 'A solitary window in the quiet darkness.',
  },
  energetic: {
    atmosphere: 'fireplace',
    soundscape: 'ambient',
    resonance: 'Sparks of thought leaping upward.',
  },
  angry: {
    atmosphere: 'fireplace',
    soundscape: 'night',
    resonance: 'Low ember warmth waiting to settle.',
  },
  neutral: {
    atmosphere: 'minimal',
    soundscape: 'night',
    resonance: 'A calm, unhurried sanctuary.',
  },
};

/**
 * Derives weather overlay mode, dynamic lighting mood, and emotional tags
 */
export function deriveWeatherAndLighting(
  dominantMood: Mood,
  text: string
): {
  weatherType: WeatherType;
  lightingMood: LightingMood;
  emotionalTags: string[];
  weatherDescription: string;
} {
  const lower = text.toLowerCase();

  // Keyword-specific overrides
  if (/\b(snow|snowing|snowflake|blizzard|frost|ice|icy|wintry|winter|solitude|isolated)\b/.test(lower)) {
    return {
      weatherType: 'snow',
      lightingMood: 'silvery-moonlight',
      emotionalTags: ['quiet-snowfall', 'wintry-solitude', 'pale-stillness'],
      weatherDescription: 'Quiet crystalline snow drifting in solitary stillness',
    };
  }

  if (/\b(rain|raining|raindrop|rainy|drizzle|storm|tears|wept|crying|ache|grief|sorrow)\b/.test(lower)) {
    return {
      weatherType: 'rain',
      lightingMood: 'cool-overcast',
      emotionalTags: ['rain-mist', 'melancholy', 'overcast-sky'],
      weatherDescription: 'Gentle raindrops blurring the sanctuary window',
    };
  }

  if (/\b(sun|sunlight|sunbeam|sunbeams|dawn|morning|radiant|radiance|bright|delight|golden)\b/.test(lower)) {
    return {
      weatherType: 'sunbeams',
      lightingMood: 'golden-dawn',
      emotionalTags: ['golden-sunbeams', 'warm-radiance', 'morning-dawn'],
      weatherDescription: 'Warm sunbeams and drifting golden motes',
    };
  }

  if (/\b(petals|leaves|forest|moss|stream|breeze|woods|woodland|serene|tranquil)\b/.test(lower)) {
    return {
      weatherType: 'petals',
      lightingMood: 'emerald-canopy',
      emotionalTags: ['drifting-petals', 'forest-breeze', 'serene-shade'],
      weatherDescription: 'Soft petals and spores carried on a woodland breeze',
    };
  }

  if (/\b(embers|ember|hearth|fireplace|flame|sepia|nostalgia|childhood|summer|old\s+days|remember)\b/.test(lower)) {
    return {
      weatherType: 'embers',
      lightingMood: 'warm-amber',
      emotionalTags: ['hearth-embers', 'nostalgia', 'sepia-glow'],
      weatherDescription: 'Warm glowing embers rising from the hearth',
    };
  }

  if (/\b(stars|starlight|fireflies|firefly|twilight|night|darling|beloved|kiss|embrace|whisper|romance)\b/.test(lower)) {
    return {
      weatherType: 'fireflies',
      lightingMood: 'rose-twilight',
      emotionalTags: ['starlight-fireflies', 'twilight-intimacy', 'velvet-dusk'],
      weatherDescription: 'Pulsing twilight stardust and gentle luminescences',
    };
  }

  if (/\b(zeal|ambition|fire|wild|rush|pulse|conquer|triumph|victory|bold|power|relentless)\b/.test(lower)) {
    return {
      weatherType: 'zeal-sparks',
      lightingMood: 'vivid-electric',
      emotionalTags: ['zeal-sparks', 'inner-momentum', 'dynamic-crest'],
      weatherDescription: 'Spirited sparks rising with focused determination',
    };
  }

  // Mood-based fallback
  switch (dominantMood) {
    case 'melancholic':
      return {
        weatherType: 'rain',
        lightingMood: 'cool-overcast',
        emotionalTags: ['rain-mist', 'melancholy', 'soft-sorrow'],
        weatherDescription: 'Gentle raindrops blurring the sanctuary window',
      };
    case 'lonely':
      return {
        weatherType: 'snow',
        lightingMood: 'silvery-moonlight',
        emotionalTags: ['quiet-snowfall', 'solitude', 'pale-stillness'],
        weatherDescription: 'Quiet crystalline snow drifting in solitary stillness',
      };
    case 'joyful':
    case 'hopeful':
      return {
        weatherType: 'sunbeams',
        lightingMood: 'golden-dawn',
        emotionalTags: ['golden-sunbeams', 'warm-radiance', 'morning-dawn'],
        weatherDescription: 'Warm sunbeams and drifting golden motes',
      };
    case 'peaceful':
      return {
        weatherType: 'petals',
        lightingMood: 'emerald-canopy',
        emotionalTags: ['drifting-petals', 'forest-breeze', 'serene-shade'],
        weatherDescription: 'Soft petals and spores carried on a woodland breeze',
      };
    case 'nostalgic':
      return {
        weatherType: 'embers',
        lightingMood: 'warm-amber',
        emotionalTags: ['hearth-embers', 'nostalgia', 'sepia-glow'],
        weatherDescription: 'Warm glowing embers rising from the hearth',
      };
    case 'romantic':
    case 'dreamy':
      return {
        weatherType: 'fireflies',
        lightingMood: 'rose-twilight',
        emotionalTags: ['starlight-fireflies', 'twilight-intimacy', 'velvet-dusk'],
        weatherDescription: 'Pulsing twilight stardust and gentle luminescences',
      };
    case 'energetic':
    case 'angry':
      return {
        weatherType: 'zeal-sparks',
        lightingMood: 'vivid-electric',
        emotionalTags: ['zeal-sparks', 'inner-momentum', 'dynamic-crest'],
        weatherDescription: 'Spirited sparks rising with focused determination',
      };
    case 'reflective':
    case 'neutral':
    default:
      return {
        weatherType: 'clear',
        lightingMood: 'neutral-diffuse',
        emotionalTags: ['still-sanctuary', 'diffuse-calm', 'quiet-focus'],
        weatherDescription: 'Tranquil stillness with subtle floating motes',
      };
  }
}

/**
 * Pure sentiment analysis calculation on text
 */
export function analyzeSentiment(text: string): SentimentAnalysisResult {
  const clean = text.toLowerCase();
  const words = clean.match(/[a-z']+/g) || [];
  const wordCount = words.length;

  if (wordCount < 3) {
    const neutralConfig = MOOD_TO_ATMOSPHERE_CONFIG.neutral;
    const weatherInfo = deriveWeatherAndLighting('neutral', text);
    return {
      dominantMood: 'neutral',
      secondaryMood: null,
      recommendedAtmosphere: neutralConfig.atmosphere,
      recommendedSoundscape: neutralConfig.soundscape,
      poeticResonance: neutralConfig.resonance,
      confidence: 0.5,
      valence: 0,
      arousal: 0.2,
      wordCount,
      emotionalTags: weatherInfo.emotionalTags,
      weatherType: weatherInfo.weatherType,
      lightingMood: weatherInfo.lightingMood,
      weatherDescription: weatherInfo.weatherDescription,
    };
  }

  const moodScores: Record<Mood, number> = {
    joyful: 0,
    peaceful: 0,
    reflective: 0,
    nostalgic: 0,
    melancholic: 0,
    romantic: 0,
    energetic: 0,
    angry: 0,
    lonely: 0,
    hopeful: 0,
    dreamy: 0,
    neutral: 0.3,
  };

  let totalValence = 0;
  let totalArousal = 0;
  let matchedTokens = 0;

  for (const word of words) {
    const entry = SENTIMENT_WEIGHTS[word];
    if (entry) {
      moodScores[entry.mood] += 1.5;
      totalValence += entry.valence;
      totalArousal += entry.arousal;
      matchedTokens++;
    }
  }

  // Punctuation and structure analysis
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.{3}|…/g) || []).length;

  if (exclamations > 0) {
    moodScores.energetic += exclamations * 0.8;
    moodScores.joyful += exclamations * 0.4;
    totalArousal += exclamations * 0.2;
  }
  if (questions > 0) {
    moodScores.reflective += questions * 0.9;
  }
  if (ellipses > 0) {
    moodScores.melancholic += ellipses * 0.8;
    moodScores.reflective += ellipses * 0.5;
  }

  // Sort moods by weight
  const sortedMoods = (Object.keys(moodScores) as Mood[])
    .filter((m) => m !== 'neutral' || moodScores[m] > 1.2)
    .sort((a, b) => moodScores[b] - moodScores[a]);

  const dominantMood: Mood = sortedMoods[0] || 'neutral';
  const topScore = moodScores[dominantMood];
  const secondMoodCandidate = sortedMoods[1];
  const secondaryMood: Mood | null =
    secondMoodCandidate &&
    moodScores[secondMoodCandidate] > 0.8 &&
    moodScores[secondMoodCandidate] >= topScore * 0.4
      ? secondMoodCandidate
      : null;

  const avgValence = matchedTokens > 0 ? totalValence / matchedTokens : 0;
  const avgArousal = matchedTokens > 0 ? totalArousal / matchedTokens : 0.25;

  const config = MOOD_TO_ATMOSPHERE_CONFIG[dominantMood] || MOOD_TO_ATMOSPHERE_CONFIG.neutral;
  const confidence = Math.min(0.95, 0.45 + topScore * 0.1);
  const weatherInfo = deriveWeatherAndLighting(dominantMood, text);

  return {
    dominantMood,
    secondaryMood,
    recommendedAtmosphere: config.atmosphere,
    recommendedSoundscape: config.soundscape,
    poeticResonance: config.resonance,
    confidence,
    valence: Math.max(-1, Math.min(1, avgValence)),
    arousal: Math.max(0, Math.min(1, avgArousal)),
    wordCount,
    emotionalTags: weatherInfo.emotionalTags,
    weatherType: weatherInfo.weatherType,
    lightingMood: weatherInfo.lightingMood,
    weatherDescription: weatherInfo.weatherDescription,
  };
}

/**
 * Debounced Sentiment Analyzer Controller
 * Allows clean schedule, cancel, and immediate flush of text analysis
 */
export interface DebouncedAnalyzerOptions {
  delayMs?: number;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (result: SentimentAnalysisResult) => void;
  useRemoteIfAvailable?: boolean;
}

export class DebouncedSentimentAnalyzer {
  private timer: NodeJS.Timeout | null = null;
  private delayMs: number;
  private lastAnalyzedText: string = '';
  private onAnalysisStart?: () => void;
  private onAnalysisComplete?: (result: SentimentAnalysisResult) => void;
  private useRemote: boolean;
  private isProcessing: boolean = false;

  constructor(options: DebouncedAnalyzerOptions = {}) {
    this.delayMs = options.delayMs ?? 1400;
    this.onAnalysisStart = options.onAnalysisStart;
    this.onAnalysisComplete = options.onAnalysisComplete;
    this.useRemote = options.useRemoteIfAvailable ?? true;
  }

  public feed(text: string) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Skip if unchanged
    if (text.trim() === this.lastAnalyzedText.trim()) {
      return;
    }

    this.timer = setTimeout(() => {
      this.execute(text);
    }, this.delayMs);
  }

  public flush(text: string) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.execute(text);
  }

  public cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public isPending(): boolean {
    return this.timer !== null || this.isProcessing;
  }

  private async execute(text: string) {
    this.lastAnalyzedText = text;
    this.isProcessing = true;
    if (this.onAnalysisStart) this.onAnalysisStart();

    // 1. Calculate local sentiment analysis immediately
    const localResult = analyzeSentiment(text);

    // 2. If remote AI is requested and text is long enough, attempt server call
    if (this.useRemote && text.trim().split(/\s+/).length >= 5) {
      try {
        const response = await fetch('/api/analyze-mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.dominantMood) {
            const config =
              MOOD_TO_ATMOSPHERE_CONFIG[data.dominantMood as Mood] ||
              MOOD_TO_ATMOSPHERE_CONFIG.neutral;

            const finalResult: SentimentAnalysisResult = {
              dominantMood: data.dominantMood as Mood,
              secondaryMood: (data.secondaryMood as Mood) || localResult.secondaryMood,
              recommendedAtmosphere:
                (data.recommendedAtmosphere as AtmosphereType) || config.atmosphere,
              recommendedSoundscape:
                (data.recommendedSoundscape as SoundscapeType) || config.soundscape,
              poeticResonance: data.poeticResonance || config.resonance,
              confidence: 0.95,
              valence: localResult.valence,
              arousal: localResult.arousal,
              wordCount: localResult.wordCount,
              emotionalTags:
                Array.isArray(data.emotionalTags) && data.emotionalTags.length > 0
                  ? data.emotionalTags
                  : localResult.emotionalTags,
              weatherType: (data.weatherType as WeatherType) || localResult.weatherType,
              lightingMood: (data.lightingMood as LightingMood) || localResult.lightingMood,
              weatherDescription: localResult.weatherDescription,
            };

            this.isProcessing = false;
            if (this.onAnalysisComplete) this.onAnalysisComplete(finalResult);
            return;
          }
        }
      } catch (err) {
        // Silently fallback to localResult
      }
    }

    this.isProcessing = false;
    if (this.onAnalysisComplete) {
      this.onAnalysisComplete(localResult);
    }
  }
}
