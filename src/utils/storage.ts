import { Moment, AppSettings, TypographySettings } from '../types';

const MOMENTS_STORAGE_KEY = 'the_quiet_room_moments_v1';
const SEEDED_KEY = 'the_quiet_room_has_seeded_v1';
const SETTINGS_STORAGE_KEY = 'the_quiet_room_settings_v1';

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'cormorant',
  fontSize: 22,
  lineHeight: 1.8,
  letterSpacing: 0,
  width: 'normal',
  alignment: 'left',
  contrast: 'balanced',
};

export const DEFAULT_SETTINGS: AppSettings = {
  unwrittenPromptEnabled: true,
  unwrittenDelaySeconds: 24,
  audioEnabled: true,
  audioVolume: 0.32,
  defaultSoundscape: 'night',
  atmosphereIntensity: 'normal',
  highContrast: false,
  reducedMotion: false,
  autoSaveIntervalMs: 2000,
};

const SEED_MOMENTS: Moment[] = [
  {
    id: 'moment-seed-1',
    title: 'The Letter I Never Sent',
    content: `I still remember that rainy evening. The streets were empty, washed in wet reflections of amber lamplight. Everything felt strangely quiet, like the world had paused just to listen to the rain drumming against the windowsill.

I thought I had moved on. I told myself that time smooths down sharp memories into soft river pebbles. But sitting here tonight, watching the water trace down the glass, I realized that some words don't fade. They simply wait for a quiet room to find their voice.

Perhaps that is why I never folded this letter into an envelope. Some things are not meant to be read by anyone else. They are meant only to be felt, acknowledged, and finally allowed to rest.`,
    createdAt: '2026-10-08T20:14:00.000Z',
    updatedAt: '2026-10-08T20:45:00.000Z',
    wordCount: 122,
    characterCount: 712,
    dominantMood: 'melancholic',
    secondaryMood: 'reflective',
    atmosphere: 'rain',
    soundscape: 'rain',
    poeticResonance: 'Soft raindrops blurring the glass.',
    typographySettings: {
      fontFamily: 'cormorant',
      fontSize: 23,
      lineHeight: 1.85,
      letterSpacing: 0.01,
      width: 'normal',
      alignment: 'left',
      contrast: 'balanced',
    },
    moodHistory: [
      { timestamp: 1728418440000, mood: 'melancholic', secondaryMood: 'reflective', wordCount: 30 },
      { timestamp: 1728419040000, mood: 'melancholic', secondaryMood: 'nostalgic', wordCount: 85 },
      { timestamp: 1728420300000, mood: 'melancholic', secondaryMood: 'reflective', wordCount: 122 },
    ],
  },
  {
    id: 'moment-seed-2',
    title: 'A Walk I Remember',
    content: `The path through the pine woods was damp with early morning mist. With every step, the scent of crushed needles and moss rose up into the cool air. 

There were no horns, no notifications, no urgency pulling at my sleeves. Only the steady rhythmic sound of breathing and the sunlight filtering through ancient cedar branches, drawing bright diagonal beams across the forest floor.

For an hour, I forgot the noise of the world. In the quiet among the trees, I remembered what it felt like to simply exist.`,
    createdAt: '2026-10-06T09:20:00.000Z',
    updatedAt: '2026-10-06T09:50:00.000Z',
    wordCount: 94,
    characterCount: 562,
    dominantMood: 'peaceful',
    secondaryMood: 'nostalgic',
    atmosphere: 'forest',
    soundscape: 'forest',
    poeticResonance: 'A gentle breeze rustling through leaves.',
    typographySettings: {
      fontFamily: 'lora',
      fontSize: 22,
      lineHeight: 1.8,
      letterSpacing: 0,
      width: 'normal',
      alignment: 'left',
      contrast: 'balanced',
    },
    moodHistory: [
      { timestamp: 1728206400000, mood: 'peaceful', secondaryMood: 'nostalgic', wordCount: 45 },
      { timestamp: 1728208200000, mood: 'peaceful', secondaryMood: 'peaceful', wordCount: 94 },
    ],
  },
  {
    id: 'moment-seed-3',
    title: '2:17 AM',
    content: `The city sleeps, but the room remains awake.

At 2:17 AM, thoughts lose their daytime armor. There is no audience to impress, no deadlines to satisfy, no need to justify anything. Just the faint hum of midnight and the vast open sky beyond the darkened pane.

I look at the blank page and wonder how many souls are awake right now, gazing into the dark, searching for words to describe the ache of being alive. You are not alone in the quiet.`,
    createdAt: '2026-10-04T02:17:00.000Z',
    updatedAt: '2026-10-04T02:35:00.000Z',
    wordCount: 88,
    characterCount: 504,
    dominantMood: 'reflective',
    secondaryMood: 'lonely',
    atmosphere: 'night',
    soundscape: 'night',
    poeticResonance: 'Deep midnight, quiet and expansive.',
    typographySettings: {
      fontFamily: 'playfair',
      fontSize: 21,
      lineHeight: 1.9,
      letterSpacing: 0.02,
      width: 'normal',
      alignment: 'left',
      contrast: 'soft',
    },
    moodHistory: [
      { timestamp: 1728008220000, mood: 'reflective', secondaryMood: 'lonely', wordCount: 40 },
      { timestamp: 1728009300000, mood: 'reflective', secondaryMood: 'hopeful', wordCount: 88 },
    ],
  },
];

export function getStoredMoments(): Moment[] {
  try {
    const isSeeded = localStorage.getItem(SEEDED_KEY);
    if (!isSeeded) {
      localStorage.setItem(SEEDED_KEY, 'true');
      localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(SEED_MOMENTS));
      return SEED_MOMENTS;
    }
    const raw = localStorage.getItem(MOMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read moments from localStorage:', err);
    return [];
  }
}

export function saveMoment(moment: Moment): void {
  try {
    const moments = getStoredMoments();
    const existingIndex = moments.findIndex((m) => m.id === moment.id);
    if (existingIndex >= 0) {
      moments[existingIndex] = { ...moment, updatedAt: new Date().toISOString() };
    } else {
      moments.unshift(moment);
    }
    localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(moments));
  } catch (err) {
    console.warn('Failed to save moment:', err);
  }
}

export function deleteMoment(id: string): void {
  try {
    const moments = getStoredMoments().filter((m) => m.id !== id);
    localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(moments));
  } catch (err) {
    console.warn('Failed to delete moment:', err);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear storage:', err);
  }
}

export function exportMomentAsFile(moment: Moment, format: 'txt' | 'md' | 'json') {
  let content = '';
  let filename = `${(moment.title || 'Untitled Moment').replace(/[^a-z0-9_-]/gi, '_')}`;
  let mimeType = 'text/plain';

  if (format === 'txt') {
    content = `${moment.title || 'Untitled Moment'}
Recorded: ${new Date(moment.createdAt).toLocaleDateString()}
Mood: ${moment.dominantMood}${moment.secondaryMood ? ' · ' + moment.secondaryMood : ''}
Atmosphere: ${moment.atmosphere}
Word Count: ${moment.wordCount}
--------------------------------------------------

${moment.content}

--------------------------------------------------
The Quiet Room — A writing space that feels what you write.
`;
    filename += '.txt';
  } else if (format === 'md') {
    content = `# ${moment.title || 'Untitled Moment'}

> *Recorded on ${new Date(moment.createdAt).toLocaleDateString()}*  
> *Atmosphere: ${moment.dominantMood} (${moment.atmosphere})*  
> *Words: ${moment.wordCount}*

${moment.content}

---
*Preserved in The Quiet Room*
`;
    filename += '.md';
    mimeType = 'text/markdown';
  } else if (format === 'json') {
    content = JSON.stringify(moment, null, 2);
    filename += '.json';
    mimeType = 'application/json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
