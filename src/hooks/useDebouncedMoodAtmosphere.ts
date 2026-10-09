import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mood,
  AtmosphereType,
  SoundscapeType,
  MoodHistoryEntry,
  WeatherType,
  LightingMood,
  WeatherOverlaySettings,
} from '../types';
import {
  DebouncedSentimentAnalyzer,
  SentimentAnalysisResult,
  analyzeSentiment,
} from '../utils/debouncedSentimentAnalyzer';
import { moodTransitionHandler } from '../utils/audio/moodTransitionHandler';
import {
  moodAudioController,
  MoodAudioState,
} from '../utils/audio/moodAudioController';
import { CanonicalMusicMood } from '../utils/audio/moodAudioLibrary';

interface UseDebouncedMoodAtmosphereOptions {
  initialMood?: Mood;
  initialAtmosphere?: AtmosphereType;
  initialMoodHistory?: MoodHistoryEntry[];
  initialEmotionalTags?: string[];
  initialWeatherType?: WeatherType;
  debounceMs?: number;
  isManualAtmosphereOverride?: boolean;
}

const DEFAULT_WEATHER_SETTINGS: WeatherOverlaySettings = {
  mode: 'auto',
  particleIntensity: 'balanced',
  lightingIntensity: 'moderate',
  ambientLightPulse: true,
};

export function useDebouncedMoodAtmosphere({
  initialMood = 'neutral',
  initialAtmosphere = 'auto',
  initialMoodHistory = [],
  initialEmotionalTags,
  initialWeatherType,
  debounceMs = 1200,
  isManualAtmosphereOverride = false,
}: UseDebouncedMoodAtmosphereOptions = {}) {
  const [dominantMood, setDominantMood] = useState<Mood>(initialMood);
  const [secondaryMood, setSecondaryMood] = useState<Mood | null>(null);
  const [atmosphereState, setAtmosphereState] = useState<AtmosphereType>(
    initialAtmosphere === 'auto' ? 'minimal' : initialAtmosphere
  );
  const [recommendedSoundscape, setRecommendedSoundscape] = useState<SoundscapeType>('night');
  const [poeticResonance, setPoeticResonance] = useState<string>('A calm, unhurried sanctuary.');
  const [confidence, setConfidence] = useState<number>(0.5);
  const [valence, setValence] = useState<number>(0);
  const [arousal, setArousal] = useState<number>(0.2);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>(initialMoodHistory);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(isManualAtmosphereOverride);

  // Weather-based visual overlay system state
  const [emotionalTags, setEmotionalTags] = useState<string[]>(
    initialEmotionalTags || ['still-sanctuary', 'diffuse-calm']
  );
  const [weatherType, setWeatherType] = useState<WeatherType>(
    initialWeatherType || 'clear'
  );
  const [lightingMood, setLightingMood] = useState<LightingMood>('neutral-diffuse');
  const [weatherDescription, setWeatherDescription] = useState<string>(
    'Tranquil stillness with subtle floating motes'
  );
  const [weatherSettings, setWeatherSettings] = useState<WeatherOverlaySettings>(
    DEFAULT_WEATHER_SETTINGS
  );

  // Audio engine state sync
  const [audioState, setAudioState] = useState<MoodAudioState>(moodAudioController.getState());

  useEffect(() => {
    const unsub = moodAudioController.subscribe((state) => {
      setAudioState(state);
    });
    return unsub;
  }, []);

  const isManualOverrideRef = useRef(isManualOverride);
  useEffect(() => {
    isManualOverrideRef.current = isManualOverride;
  }, [isManualOverride]);

  const analyzerRef = useRef<DebouncedSentimentAnalyzer | null>(null);

  const handleAnalysisResult = useCallback((result: SentimentAnalysisResult) => {
    setIsAnalyzing(false);
    setDominantMood(result.dominantMood);
    setSecondaryMood(result.secondaryMood);
    setPoeticResonance(result.poeticResonance);
    setRecommendedSoundscape(result.recommendedSoundscape);
    setConfidence(result.confidence);
    setValence(result.valence);
    setArousal(result.arousal);

    // Weather overlay & emotional tags updates
    setEmotionalTags(result.emotionalTags);
    setWeatherType(result.weatherType);
    setLightingMood(result.lightingMood);
    setWeatherDescription(result.weatherDescription);

    // 1. Update visual atmosphere canvas state if not overridden manually
    if (!isManualOverrideRef.current) {
      setAtmosphereState(result.recommendedAtmosphere);
    }

    // 2. CRITICAL SYNC: Synchronize ambient music engine with detected mood!
    moodTransitionHandler.handleMoodDetected(result.dominantMood, result.confidence);

    // 3. Append to mood history timeline if different from last recorded entry
    setMoodHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.mood !== result.dominantMood) {
        return [
          ...prev,
          {
            timestamp: Date.now(),
            mood: result.dominantMood,
            secondaryMood: result.secondaryMood,
            wordCount: result.wordCount,
          },
        ];
      }
      return prev;
    });
  }, []);

  // Initialize DebouncedSentimentAnalyzer instance
  useEffect(() => {
    const analyzer = new DebouncedSentimentAnalyzer({
      delayMs: debounceMs,
      onAnalysisStart: () => setIsAnalyzing(true),
      onAnalysisComplete: handleAnalysisResult,
      useRemoteIfAvailable: true,
    });

    analyzerRef.current = analyzer;

    return () => {
      analyzer.cancel();
    };
  }, [debounceMs, handleAnalysisResult]);

  // Feed text to debounced analyzer
  const feedText = useCallback((text: string) => {
    if (analyzerRef.current) {
      analyzerRef.current.feed(text);
    }
  }, []);

  // Immediate synchronous flush
  const flushText = useCallback((text: string) => {
    if (analyzerRef.current) {
      analyzerRef.current.flush(text);
    }
  }, []);

  // Manual atmosphere override control: keeps visual and audio synchronized
  const setManualAtmosphere = useCallback((newAtmo: AtmosphereType) => {
    if (newAtmo === 'auto') {
      setIsManualOverride(false);
    } else {
      setIsManualOverride(true);
      setAtmosphereState(newAtmo);

      // Map manual atmosphere to matching canonical audio mood
      const moodMap: Record<AtmosphereType, CanonicalMusicMood> = {
        rain: 'sad',
        forest: 'happy',
        sunrise: 'happy',
        night: 'romantic',
        fireplace: 'zeal',
        minimal: 'happy',
        auto: 'happy',
      };
      moodAudioController.transitionTo(moodMap[newAtmo]);
    }
  }, []);

  // Weather overlay manual selection vs auto
  const setManualWeather = useCallback((newWeather: WeatherType | 'auto') => {
    setWeatherSettings((prev) => ({
      ...prev,
      mode: newWeather,
    }));
  }, []);

  const resetToAutoAtmosphere = useCallback((currentText: string) => {
    setIsManualOverride(false);
    const instant = analyzeSentiment(currentText);
    setAtmosphereState(instant.recommendedAtmosphere);
    setDominantMood(instant.dominantMood);
    setSecondaryMood(instant.secondaryMood);
    setEmotionalTags(instant.emotionalTags);
    setWeatherType(instant.weatherType);
    setLightingMood(instant.lightingMood);
    setWeatherDescription(instant.weatherDescription);
    setWeatherSettings((prev) => ({ ...prev, mode: 'auto' }));
    moodTransitionHandler.handleMoodDetected(instant.dominantMood, 0.95);
  }, []);

  const activeEffectiveWeather: WeatherType =
    weatherSettings.mode === 'auto' ? weatherType : weatherSettings.mode;

  return {
    dominantMood,
    secondaryMood,
    atmosphereState,
    recommendedSoundscape,
    poeticResonance,
    confidence,
    valence,
    arousal,
    isAnalyzing,
    moodHistory,
    isManualOverride,
    audioState,
    emotionalTags,
    weatherType,
    lightingMood,
    weatherDescription,
    weatherSettings,
    activeEffectiveWeather,
    setWeatherSettings,
    setManualWeather,
    feedText,
    flushText,
    setManualAtmosphere,
    resetToAutoAtmosphere,
    setMoodHistory,
  };
}
