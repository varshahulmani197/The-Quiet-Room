import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Initialise Gemini client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Mood analysis endpoint
app.post('/api/analyze-mood', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  // If text is very short (< 3 words), return neutral immediately
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 3) {
    return res.json({
      dominantMood: 'neutral',
      secondaryMood: null,
      confidence: 0.9,
      recommendedAtmosphere: 'minimal',
      recommendedSoundscape: 'night',
      poeticResonance: 'A blank room awaiting thoughts.',
      source: 'heuristic',
    });
  }

  // Attempt Gemini AI classification
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze the emotional undertone and atmosphere of this piece of writing for an ambient sanctuary app called "The Quiet Room".
Categorize strictly into one of these moods:
- joyful
- peaceful
- reflective
- nostalgic
- melancholic
- romantic
- energetic
- angry
- lonely
- hopeful
- dreamy
- neutral

Also identify an optional secondary mood from the same list, a recommended visual atmosphere (rain, night, forest, sunrise, fireplace, minimal), a recommended soundscape (rain, night, forest, lofi, fireplace, ambient), and a brief one-line poetic interpretation of the room's feeling (max 10 words, e.g. "Echoes of rain and distant memory").

Text to analyze:
"""${text.slice(0, 4000)}"""`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          systemInstruction:
            'You are the poetic atmosphere engine of The Quiet Room. You feel the writer\'s emotion without judgment or clinical language. Return only JSON matching: {"dominantMood": string, "secondaryMood": string|null, "recommendedAtmosphere": string, "recommendedSoundscape": string, "poeticResonance": string}',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.dominantMood) {
        return res.json({
          dominantMood: parsed.dominantMood.toLowerCase(),
          secondaryMood: parsed.secondaryMood ? parsed.secondaryMood.toLowerCase() : null,
          recommendedAtmosphere: parsed.recommendedAtmosphere || 'minimal',
          recommendedSoundscape: parsed.recommendedSoundscape || 'night',
          poeticResonance: parsed.poeticResonance || 'Words quietly taking shape.',
          source: 'gemini',
        });
      }
    } catch (apiErr) {
      console.warn('Gemini mood classification experienced transient issue, gracefully applying server-side poetic heuristic.');
    }
  }

  // Graceful server-side poetic heuristic fallback
  const lower = text.toLowerCase();
  let dominant = 'reflective';
  let secondary: string | null = 'melancholic';
  let atmosphere = 'rain';
  let soundscape = 'rain';
  let resonance = 'Soft raindrops blurring the glass.';

  if (/rain|sad|grief|tears|lost|ache|alone|dark|cold|shadow/.test(lower)) {
    dominant = 'melancholic';
    secondary = 'reflective';
    atmosphere = 'rain';
    soundscape = 'rain';
    resonance = 'Soft raindrops blurring the glass.';
  } else if (/peace|calm|quiet|breeze|forest|leaves|stream|soft|serene|rest/.test(lower)) {
    dominant = 'peaceful';
    secondary = 'nostalgic';
    atmosphere = 'forest';
    soundscape = 'forest';
    resonance = 'A gentle breeze rustling through leaves.';
  } else if (/remember|memory|used to|photograph|childhood|summer|old|ago/.test(lower)) {
    dominant = 'nostalgic';
    secondary = 'reflective';
    atmosphere = 'fireplace';
    soundscape = 'fireplace';
    resonance = 'The warm embers of remembering.';
  } else if (/laugh|sun|warm|delight|alive|bright|smile|joy|radiant/.test(lower)) {
    dominant = 'joyful';
    secondary = 'hopeful';
    atmosphere = 'sunrise';
    soundscape = 'ambient';
    resonance = 'Golden morning light resting on the desk.';
  } else if (/love|heart|embrace|whisper|tender|kiss|beloved|forever/.test(lower)) {
    dominant = 'romantic';
    secondary = 'peaceful';
    atmosphere = 'night';
    soundscape = 'ambient';
    resonance = 'Velvet dusk and quiet closeness.';
  } else if (/dawn|tomorrow|hope|rise|horizon|begin|promise|sprout/.test(lower)) {
    dominant = 'hopeful';
    secondary = 'peaceful';
    atmosphere = 'sunrise';
    soundscape = 'ambient';
    resonance = 'A subtle dawn breaking on the horizon.';
  }

  return res.json({
    dominantMood: dominant,
    secondaryMood: secondary,
    recommendedAtmosphere: atmosphere,
    recommendedSoundscape: soundscape,
    poeticResonance: resonance,
    source: 'heuristic-resilient',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`The Quiet Room server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
