import { Mood, AtmosphereType, SoundscapeType } from '../types';

interface MoodAnalysisResult {
  dominantMood: Mood;
  secondaryMood?: Mood | null;
  recommendedAtmosphere: AtmosphereType;
  recommendedSoundscape: SoundscapeType;
  poeticResonance: string;
  confidence: number;
}

// Curated lexicon with weighted affinities
const MOOD_LEXICONS: Record<Mood, string[]> = {
  melancholic: [
    'rain', 'rainy', 'grey', 'gray', 'sorrow', 'grief', 'tears', 'crying', 'sad', 'sadness',
    'lost', 'ache', 'aching', 'hollow', 'quietly', 'faded', 'miss', 'missing', 'mourn',
    'heavy', 'shadow', 'wept', 'broken', 'dull', 'solitude', 'forgotten', 'cold', 'wound',
    'pain', 'emptiness', 'disappear', 'unspoken', 'silent', 'drift', 'withering'
  ],
  reflective: [
    'remember', 'memory', 'thought', 'thinking', 'perhaps', 'wonder', 'wondering', 'why',
    'still', 'past', 'time', 'years', 'night', 'stars', 'quiet', 'contemplate', 'solitude',
    'window', 'gaze', 'ponder', 'depth', 'meaning', 'silence', 'midnight', 'look back',
    'question', 'realize', 'realized', 'observe', 'mirror', 'drift', 'whisper'
  ],
  nostalgic: [
    'remember', 'childhood', 'used to', 'once', 'photograph', 'summer', 'old', 'yesterday',
    'scent', 'kitchen', 'porch', 'streets', 'antique', 'record', 'grandfather', 'grandmother',
    'mother', 'father', 'ago', 'back then', 'reminisce', 'relic', 'sepia', 'familiar',
    'hometown', 'golden hour', 'bygone', 'youth', 'years ago', 'trace', 'echo'
  ],
  peaceful: [
    'calm', 'serene', 'tranquil', 'gentle', 'breeze', 'leaf', 'leaves', 'forest', 'stream',
    'river', 'green', 'soft', 'breathe', 'breath', 'slow', 'resting', 'rest', 'soothing',
    'peace', 'quiet', 'moss', 'pine', 'birds', 'morning light', 'stillness', 'ease',
    'unhurried', 'clarity', 'safe', 'shelter', 'sanctuary', 'flow'
  ],
  joyful: [
    'laugh', 'laughter', 'smile', 'bright', 'sun', 'sunlight', 'warm', 'warmth', 'delight',
    'dance', 'dancing', 'alive', 'glow', 'glowing', 'radiant', 'celebrate', 'ecstatic',
    'sparkle', 'light', 'blooming', 'golden', 'rejoice', 'wonder', 'happiness', 'cheer',
    'vibrant', 'sweet', 'spring', 'singing', 'music', 'feast'
  ],
  romantic: [
    'love', 'kiss', 'touch', 'hand', 'embrace', 'heart', 'darling', 'beloved', 'tender',
    'whisper', 'softly', 'skin', 'eyes', 'close', 'closer', 'devotion', 'passion',
    'sweetheart', 'longing', 'breath', 'hold', 'forever', 'together', 'candle', 'dusk',
    'crimson', 'rose', 'entwined', 'pulse', 'cherish'
  ],
  hopeful: [
    'tomorrow', 'dawn', 'horizon', 'rise', 'rising', 'begin', 'beginning', 'light',
    'promise', 'renew', 'renewal', 'bloom', 'unfold', 'believe', 'faith', 'possible',
    'healing', 'forward', 'seed', 'sprout', 'sunrise', 'clear skies', 'future',
    'courage', 'spark', 'breathe again', 'opening', 'soar'
  ],
  dreamy: [
    'cloud', 'clouds', 'drift', 'floating', 'ocean', 'waves', 'mist', 'haze', 'illusion',
    'sleep', 'slumber', 'stars', 'moon', 'nebula', 'magic', 'unreal', 'ethereal',
    'mirage', 'shimmer', 'whispering', 'tide', 'blue', 'infinite', 'realm', 'wander',
    'surreal', 'feather', 'weightless'
  ],
  lonely: [
    'alone', 'nobody', 'empty room', 'isolated', 'distant', 'stranger', 'abandoned',
    'quiet', 'solitary', 'far away', 'echo', 'distance', 'reach', 'unseen', 'unheard',
    'island', 'darkness', 'door closed', 'cold bed', 'silence hurts'
  ],
  energetic: [
    'fast', 'run', 'racing', 'fire', 'flame', 'wild', 'electric', 'surge', 'rush',
    'beat', 'pulse', 'power', 'bold', 'strike', 'ignite', 'lightning', 'spark',
    'urgent', 'stride', 'unstoppable', 'speed', 'thunder', 'roar', 'fierce'
  ],
  angry: [
    'furious', 'rage', 'shatter', 'burn', 'hate', 'bitter', 'cruel', 'lie', 'lies',
    'betrayal', 'fist', 'scream', 'sharp', 'poison', 'curse', 'iron', 'storm',
    'wrath', 'harsh', 'blade', 'tear down', 'blunt', 'bruise'
  ],
  neutral: [
    'the', 'is', 'it', 'there', 'desk', 'room', 'table', 'chair', 'paper', 'pen'
  ],
};

const MOOD_ATMOSPHERE_MAP: Record<Mood, { atmosphere: AtmosphereType; soundscape: SoundscapeType; resonance: string }> = {
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
  nostalgic: {
    atmosphere: 'fireplace',
    soundscape: 'fireplace',
    resonance: 'The warm embers of remembering.',
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

export function analyzeMoodLocally(text: string): MoodAnalysisResult {
  const clean = text.toLowerCase();
  const words = clean.match(/[a-z']+/g) || [];

  if (words.length < 4) {
    return {
      dominantMood: 'neutral',
      secondaryMood: null,
      recommendedAtmosphere: 'minimal',
      recommendedSoundscape: 'night',
      poeticResonance: 'A calm, unhurried sanctuary.',
      confidence: 0.5,
    };
  }

  const scores: Record<Mood, number> = {
    melancholic: 0,
    reflective: 0,
    nostalgic: 0,
    peaceful: 0,
    joyful: 0,
    romantic: 0,
    hopeful: 0,
    dreamy: 0,
    lonely: 0,
    energetic: 0,
    angry: 0,
    neutral: 0.2,
  };

  for (const [mood, keywords] of Object.entries(MOOD_LEXICONS) as [Mood, string[]][]) {
    for (const kw of keywords) {
      if (kw.includes(' ')) {
        // Multi-word phrase matching
        if (clean.includes(kw)) {
          scores[mood] += 3;
        }
      } else {
        // Word matching
        for (const w of words) {
          if (w === kw) {
            scores[mood] += 1.5;
          } else if (w.startsWith(kw) && kw.length >= 4) {
            scores[mood] += 0.8;
          }
        }
      }
    }
  }

  // Punctuation and structure heuristics
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.{3}|…/g) || []).length;

  if (exclamations > 1) {
    scores.energetic += exclamations * 0.8;
    scores.joyful += exclamations * 0.4;
  }
  if (questions > 1) {
    scores.reflective += questions * 0.9;
  }
  if (ellipses > 1) {
    scores.melancholic += ellipses * 0.8;
    scores.reflective += ellipses * 0.5;
  }

  // Sort moods by score
  const sorted = (Object.keys(scores) as Mood[])
    .filter((m) => m !== 'neutral' || scores[m] > 1)
    .sort((a, b) => scores[b] - scores[a]);

  const topMood = sorted[0] || 'neutral';
  const topScore = scores[topMood];
  const secondMood = sorted[1] && scores[sorted[1]] > 0.8 && scores[sorted[1]] >= topScore * 0.4 ? sorted[1] : null;

  const mapping = MOOD_ATMOSPHERE_MAP[topMood] || MOOD_ATMOSPHERE_MAP.neutral;

  return {
    dominantMood: topMood,
    secondaryMood: secondMood,
    recommendedAtmosphere: mapping.atmosphere,
    recommendedSoundscape: mapping.soundscape,
    poeticResonance: mapping.resonance,
    confidence: Math.min(0.95, 0.4 + topScore * 0.1),
  };
}

export async function analyzeMood(text: string): Promise<MoodAnalysisResult> {
  const local = analyzeMoodLocally(text);

  // If text is short, local heuristic is already instantaneous and ideal
  if (text.trim().split(/\s+/).length < 6) {
    return local;
  }

  // Try server-side Gemini endpoint
  try {
    const res = await fetch('/api/analyze-mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.dominantMood && data.source === 'gemini') {
        const mapping = MOOD_ATMOSPHERE_MAP[data.dominantMood as Mood] || MOOD_ATMOSPHERE_MAP.neutral;
        return {
          dominantMood: data.dominantMood as Mood,
          secondaryMood: (data.secondaryMood as Mood) || local.secondaryMood,
          recommendedAtmosphere: (data.recommendedAtmosphere as AtmosphereType) || mapping.atmosphere,
          recommendedSoundscape: (data.recommendedSoundscape as SoundscapeType) || mapping.soundscape,
          poeticResonance: data.poeticResonance || mapping.resonance,
          confidence: 0.95,
        };
      }
    }
  } catch (err) {
    // Silently fall back to local analysis
  }

  return local;
}
