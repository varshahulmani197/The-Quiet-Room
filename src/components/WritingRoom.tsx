import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Type,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Wind,
  Flame,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  Share2,
  Bookmark,
  Check,
  Activity,
  Music,
  Sliders,
} from 'lucide-react';
import {
  Moment,
  AtmosphereType,
  SoundscapeType,
  TypographySettings,
  AppSettings,
  WeatherType,
} from '../types';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { WeatherOverlay } from './WeatherOverlay';
import { WeatherModal } from './WeatherModal';
import { TypographyPanel } from './TypographyPanel';
import { AtmospherePanel } from './AtmospherePanel';
import { EmotionTimeline } from './EmotionTimeline';
import { TheUnwritten } from './TheUnwritten';
import { ExportModal } from './ExportModal';
import { moodAudioController } from '../utils/audio/moodAudioController';
import { CanonicalMusicMood } from '../utils/audio/moodAudioLibrary';
import { saveMoment } from '../utils/storage';
import { useDebouncedMoodAtmosphere } from '../hooks/useDebouncedMoodAtmosphere';

interface WritingRoomProps {
  initialMoment?: Moment | null;
  settings: AppSettings;
  onExit: () => void;
  onMomentSaved: (moment: Moment) => void;
}

export const WritingRoom: React.FC<WritingRoomProps> = ({
  initialMoment,
  settings,
  onExit,
  onMomentSaved,
}) => {
  // Core text state
  const [momentId] = useState<string>(
    initialMoment?.id || `moment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );
  const [title, setTitle] = useState<string>(initialMoment?.title || '');
  const [content, setContent] = useState<string>(initialMoment?.content || '');
  const [createdAt] = useState<string>(initialMoment?.createdAt || new Date().toISOString());

  // Debounced Mood & Atmosphere state manager
  // Automatically detects sentiment, updates background atmosphere, weather overlay, and crossfades music!
  const {
    dominantMood,
    secondaryMood,
    atmosphereState,
    recommendedSoundscape,
    poeticResonance,
    isAnalyzing,
    moodHistory,
    isManualOverride,
    audioState,
    emotionalTags,
    lightingMood,
    weatherDescription,
    weatherSettings,
    activeEffectiveWeather,
    setWeatherSettings,
    feedText,
    setManualAtmosphere,
    resetToAutoAtmosphere,
  } = useDebouncedMoodAtmosphere({
    initialMood: initialMoment?.dominantMood || 'neutral',
    initialAtmosphere: initialMoment?.atmosphere || 'auto',
    initialMoodHistory: initialMoment?.moodHistory || [],
    initialEmotionalTags: initialMoment?.emotionalTags,
    initialWeatherType: initialMoment?.weatherType,
    debounceMs: 1200,
    isManualAtmosphereOverride:
      initialMoment?.atmosphere !== undefined && initialMoment?.atmosphere !== 'auto',
  });

  // Typography state
  const [typography, setTypography] = useState<TypographySettings>(
    initialMoment?.typographySettings || {
      fontFamily: 'cormorant',
      fontSize: 22,
      lineHeight: 1.85,
      letterSpacing: 0,
      width: 'normal',
      alignment: 'left',
      contrast: 'balanced',
    }
  );

  // Modes & Modals
  const [isMonologueMode, setIsMonologueMode] = useState<boolean>(false);
  const [showTypographyPanel, setShowTypographyPanel] = useState<boolean>(false);
  const [showAtmospherePanel, setShowAtmospherePanel] = useState<boolean>(false);
  const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showUnwrittenPrompt, setShowUnwrittenPrompt] = useState<boolean>(false);
  const [hasDismissedUnwrittenThisSession, setHasDismissedUnwrittenThisSession] = useState<boolean>(false);

  // UI state
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isPreservedToast, setIsPreservedToast] = useState<boolean>(false);
  const [monologueControlsVisible, setMonologueControlsVisible] = useState<boolean>(false);

  // Refs for tracking typing idle timer & textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Word count and Character count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characterCount = content.length;

  // Typing event handler with debounced sentiment analysis
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Hide The Unwritten prompt as soon as user types
    if (showUnwrittenPrompt) {
      setShowUnwrittenPrompt(false);
    }

    // Reset idle timer for The Unwritten
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (
      settings.unwrittenPromptEnabled &&
      !hasDismissedUnwrittenThisSession &&
      newContent.trim().length > 40
    ) {
      idleTimerRef.current = setTimeout(() => {
        setShowUnwrittenPrompt(true);
      }, (settings.unwrittenDelaySeconds || 24) * 1000);
    }

    // Feed to debounced sentiment analyzer to update mood and crossfade music
    feedText(newContent);
  };

  // Auto-save routine
  const currentMomentObject = useCallback((): Moment => {
    return {
      id: momentId,
      title: title.trim() || 'Untitled Moment',
      content,
      createdAt,
      updatedAt: new Date().toISOString(),
      wordCount,
      characterCount,
      dominantMood,
      secondaryMood,
      atmosphere: isManualOverride ? atmosphereState : 'auto',
      soundscape: (audioState.currentMood as SoundscapeType) || 'night',
      typographySettings: typography,
      moodHistory,
      poeticResonance,
      emotionalTags,
      weatherType: activeEffectiveWeather,
    };
  }, [
    momentId,
    title,
    content,
    createdAt,
    wordCount,
    characterCount,
    dominantMood,
    secondaryMood,
    isManualOverride,
    atmosphereState,
    audioState.currentMood,
    typography,
    moodHistory,
    poeticResonance,
    emotionalTags,
    activeEffectiveWeather,
  ]);

  // Periodic Auto-save
  useEffect(() => {
    if (!content.trim() && !title.trim()) return;

    const interval = setInterval(() => {
      const moment = currentMomentObject();
      saveMoment(moment);
      onMomentSaved(moment);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(`Saved at ${timeStr}`);
    }, settings.autoSaveIntervalMs || 2500);

    return () => clearInterval(interval);
  }, [currentMomentObject, content, title, settings.autoSaveIntervalMs, onMomentSaved]);

  // Keyboard shortcut listener (Esc for monologue, Ctrl+M / Cmd+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMonologueMode((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isMonologueMode) {
          setIsMonologueMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMonologueMode]);

  // Audio controls
  const handleToggleAudio = () => {
    moodAudioController.toggle(dominantMood);
  };

  const handleSelectMusicMood = (mood: CanonicalMusicMood) => {
    moodAudioController.transitionTo(mood);
    if (!audioState.isPlaying) {
      moodAudioController.play(mood);
    }
  };

  const handleAtmosphereChange = (newAtmo: AtmosphereType) => {
    setManualAtmosphere(newAtmo);
  };

  const handleResetToAuto = () => {
    resetToAutoAtmosphere(content);
  };

  // Preserve this moment handler
  const handlePreserveMoment = () => {
    const moment = currentMomentObject();
    saveMoment(moment);
    onMomentSaved(moment);
    setIsPreservedToast(true);
    setTimeout(() => setIsPreservedToast(false), 3000);
  };

  // Font styling resolver
  const getFontFamilyClass = () => {
    switch (typography.fontFamily) {
      case 'cormorant':
        return 'font-cormorant';
      case 'playfair':
        return 'font-playfair';
      case 'lora':
        return 'font-lora';
      case 'jetbrains':
        return 'font-mono-code';
      case 'jakarta':
      default:
        return 'font-sans-modern';
    }
  };

  const getCanvasWidthClass = () => {
    switch (typography.width) {
      case 'narrow':
        return 'max-w-2xl';
      case 'wide':
        return 'max-w-4xl';
      case 'normal':
      default:
        return 'max-w-3xl';
    }
  };

  const getTextContrastClass = () => {
    switch (typography.contrast) {
      case 'soft':
        return 'text-stone-300/80';
      case 'crisp':
        return 'text-stone-50';
      case 'balanced':
      default:
        return 'text-stone-200/90';
    }
  };

  const getWeatherIcon = (w: WeatherType) => {
    switch (w) {
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'snow':
        return <Snowflake className="w-3.5 h-3.5 text-blue-200" />;
      case 'sunbeams':
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
      case 'petals':
        return <Wind className="w-3.5 h-3.5 text-rose-300" />;
      case 'embers':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'fireflies':
        return <Sparkles className="w-3.5 h-3.5 text-purple-300" />;
      case 'zeal-sparks':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'clear':
      default:
        return <Sliders className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-100 ${
        isMonologueMode ? 'cursor-text' : ''
      }`}
      onMouseMove={() => {
        if (isMonologueMode) {
          setMonologueControlsVisible(true);
        }
      }}
    >
      {/* Dynamic atmospheric Living Canvas: background and audio transition together */}
      <AtmosphereCanvas
        atmosphere={atmosphereState}
        mood={dominantMood}
        intensity={settings.atmosphereIntensity}
        reducedMotion={settings.reducedMotion}
      />

      {/* Weather-based visual overlay system: subtle falling particles and changing light based on emotional tags */}
      <WeatherOverlay
        weather={activeEffectiveWeather}
        lightingMood={lightingMood}
        emotionalTags={emotionalTags}
        settings={weatherSettings}
        reducedMotion={settings.reducedMotion}
      />

      {/* ============================================================== */}
      {/* TOP HEADER / SANCTUARY NAVIGATION                              */}
      {/* ============================================================== */}
      <AnimatePresence>
        {!isMonologueMode && (
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 flex items-center justify-between gap-4 px-6 md:px-12 py-6 max-w-6xl mx-auto w-full"
          >
            {/* Zone 1: Exit / Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  moodAudioController.stop();
                  onExit();
                }}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-100 text-xs tracking-wider uppercase transition-colors rounded-lg py-1 px-2 hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sanctuary</span>
              </button>

              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/5">
                <span className="text-[11px] text-stone-500 tracking-wider uppercase font-mono">
                  {lastSavedTime}
                </span>
              </div>
            </div>

            {/* Zone 2: Subtle Mood & Weather Indicators with analyzing pulse & crossfade state */}
            <div className="flex items-center gap-2 text-xs text-stone-400 font-light flex-wrap">
              <button
                onClick={() => setShowTimeline(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 hover:bg-white/8 border border-white/5 transition-all text-xs"
                title="View emotional journey"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isAnalyzing ? 'animate-ping' : ''
                  }`}
                  style={{
                    backgroundColor:
                      dominantMood === 'melancholic'
                        ? '#60a5fa'
                        : dominantMood === 'peaceful'
                        ? '#34d399'
                        : dominantMood === 'joyful'
                        ? '#f59e0b'
                        : dominantMood === 'romantic'
                        ? '#f472b6'
                        : '#cbd5e1',
                  }}
                />
                <span className="capitalize font-medium text-stone-200">
                  {dominantMood}
                </span>
                {secondaryMood && (
                  <>
                    <span className="text-stone-600">·</span>
                    <span className="capitalize text-stone-400">{secondaryMood}</span>
                  </>
                )}
                <Activity className="w-3 h-3 text-stone-500 ml-1" />
              </button>

              {/* Weather & Emotional Tags Overlay Indicator */}
              <button
                onClick={() => setShowWeatherModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/3 hover:bg-white/8 border border-white/5 transition-all text-xs text-stone-300 hover:text-stone-100"
                title={`Weather: ${activeEffectiveWeather.replace('-', ' ')} (${weatherDescription}) · Click to customize overlay`}
              >
                {getWeatherIcon(activeEffectiveWeather)}
                <span className="capitalize font-medium text-stone-200">
                  {activeEffectiveWeather.replace('-', ' ')}
                </span>
                {emotionalTags && emotionalTags.length > 0 && (
                  <>
                    <span className="text-stone-600 hidden md:inline">·</span>
                    <span className="text-stone-400 font-light text-[11px] hidden md:inline truncate max-w-[110px]">
                      {emotionalTags[0]}
                    </span>
                  </>
                )}
              </button>

              {/* Crossfading indicator badge */}
              {audioState.isCrossfading && (
                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-300/90 font-light px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse">
                  <Music className="w-3 h-3" />
                  <span>Crossfading to {audioState.currentMood}...</span>
                </div>
              )}
            </div>

            {/* Zone 3: Interactive Sanctuary Controls */}
            <div className="flex items-center gap-2">
              {/* Autoplay blocked prompt */}
              {audioState.isAutoplayBlocked && (
                <button
                  onClick={handleToggleAudio}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs rounded-full transition-all shadow-md animate-pulse"
                >
                  Play Atmosphere
                </button>
              )}

              {/* Soundscape Quick Toggle */}
              <button
                onClick={handleToggleAudio}
                className={`p-2 rounded-full border transition-all text-stone-400 hover:text-stone-100 ${
                  audioState.isPlaying
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                    : 'bg-white/3 border-white/5 hover:bg-white/8'
                }`}
                title={
                  audioState.isPlaying
                    ? `Pause ${audioState.currentTrackLabel}`
                    : `Play ${audioState.currentTrackLabel}`
                }
                aria-label="Soundscape toggle"
              >
                {audioState.isPlaying ? (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Atmosphere Panel Button */}
              <button
                onClick={() => setShowAtmospherePanel(true)}
                className={`p-2 rounded-full border transition-all text-stone-400 hover:text-stone-100 ${
                  isManualOverride
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-white/3 border-white/5 hover:bg-white/8'
                }`}
                title="Atmosphere & sound settings"
                aria-label="Atmosphere control"
              >
                <CloudRain className="w-4 h-4" />
              </button>

              {/* Weather & Light Overlay Button */}
              <button
                onClick={() => setShowWeatherModal(true)}
                className={`p-2 rounded-full border transition-all text-stone-400 hover:text-stone-100 ${
                  weatherSettings.mode !== 'auto'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-white/3 border-white/5 hover:bg-white/8'
                }`}
                title="Weather & Light overlay settings"
                aria-label="Weather overlay settings"
              >
                <CloudSun className="w-4 h-4" />
              </button>

              {/* Typography Button */}
              <button
                onClick={() => setShowTypographyPanel(true)}
                className="p-2 rounded-full bg-white/3 hover:bg-white/8 border border-white/5 text-stone-400 hover:text-stone-100 transition-all"
                title="Typography settings"
                aria-label="Typography settings"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Monologue Mode Button */}
              <button
                onClick={() => setIsMonologueMode(true)}
                className="p-2 rounded-full bg-white/3 hover:bg-white/8 border border-white/5 text-stone-400 hover:text-stone-100 transition-all"
                title="Enter Monologue Mode (Esc to exit)"
                aria-label="Monologue Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Preserve this Moment */}
              <button
                onClick={handlePreserveMoment}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-stone-900 bg-stone-100 hover:bg-white rounded-full transition-all shadow-md ml-1 hover:scale-[1.02]"
              >
                {isPreservedToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preserved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Preserve</span>
                  </>
                )}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MONOLOGUE MODE OVERLAY CONTROLS                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isMonologueMode && monologueControlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-40 flex items-center gap-3"
            onMouseLeave={() => setMonologueControlsVisible(false)}
          >
            <button
              onClick={() => setIsMonologueMode(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-xs text-stone-400 hover:text-stone-100 backdrop-blur-md transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Monologue (Esc)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MAIN WRITING CANVAS                                            */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 md:px-12 py-8 max-w-6xl mx-auto w-full">
        <div className={`w-full ${getCanvasWidthClass()} transition-all duration-500`}>
          {/* Title Area */}
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Untitled Thought..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full bg-transparent border-none outline-none font-serif-cormorant text-3xl sm:text-4xl md:text-5xl font-normal text-stone-100 placeholder:text-stone-600/50 mb-6 transition-all duration-300 ${
              typography.alignment === 'center' ? 'text-center' : 'text-left'
            }`}
          />

          {/* Large Writing Textarea */}
          <textarea
            ref={textareaRef}
            placeholder="Begin anywhere..."
            value={content}
            onChange={handleContentChange}
            className={`w-full min-h-[60vh] bg-transparent border-none outline-none resize-none leading-relaxed transition-all duration-300 placeholder:text-stone-600/60 ${getFontFamilyClass()} ${getTextContrastClass()} ${
              typography.alignment === 'center' ? 'text-center' : 'text-left'
            }`}
            style={{
              fontSize: `${typography.fontSize}px`,
              lineHeight: typography.lineHeight,
              letterSpacing: `${typography.letterSpacing}em`,
            }}
            spellCheck="true"
            autoFocus
          />
        </div>
      </main>

      {/* ============================================================== */}
      {/* BOTTOM METRICS & FOOTER                                         */}
      {/* ============================================================== */}
      <footer className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto w-full text-xs text-stone-500 font-light">
        {/* Left: Word & character statistics + current soundscape track */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-stone-400 tabular-nums font-normal">{wordCount} words</span>
          <span>·</span>
          <span className="font-mono text-stone-500 tabular-nums font-normal">{characterCount} characters</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline text-stone-400 font-light truncate max-w-xs">
            {audioState.isPlaying ? audioState.currentTrackLabel : 'Music Muted'}
          </span>
        </div>

        {/* Center: Monologue word count pill if monologue is active */}
        {isMonologueMode && (
          <div className="text-stone-500/80 font-mono text-[11px] tracking-wider">
            {wordCount} words
          </div>
        )}

        {/* Right: Preserve & Export Actions */}
        {!isMonologueMode && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        )}
      </footer>

      {/* ============================================================== */}
      {/* THE UNWRITTEN IDLE PROMPT                                      */}
      {/* ============================================================== */}
      <TheUnwritten
        isVisible={showUnwrittenPrompt}
        onContinue={() => {
          setShowUnwrittenPrompt(false);
          textareaRef.current?.focus();
        }}
        onStay={() => {
          setShowUnwrittenPrompt(false);
          setHasDismissedUnwrittenThisSession(true);
        }}
      />

      {/* ============================================================== */}
      {/* MODALS & SLIDE-OUT PANELS                                      */}
      {/* ============================================================== */}
      <TypographyPanel
        isOpen={showTypographyPanel}
        onClose={() => setShowTypographyPanel(false)}
        settings={typography}
        onChange={setTypography}
      />

      <AtmospherePanel
        isOpen={showAtmospherePanel}
        onClose={() => setShowAtmospherePanel(false)}
        atmosphere={isManualOverride ? atmosphereState : 'auto'}
        onAtmosphereChange={handleAtmosphereChange}
        isPlayingAudio={audioState.isPlaying}
        onToggleAudio={handleToggleAudio}
        volume={audioState.volume}
        onVolumeChange={(v) => moodAudioController.setVolume(v)}
        isManualOverride={isManualOverride}
        onResetToAuto={handleResetToAuto}
        currentMood={dominantMood}
        currentMusicMood={audioState.currentMood}
        isCrossfading={audioState.isCrossfading}
        currentTrackLabel={audioState.currentTrackLabel}
        onSelectMusicMood={handleSelectMusicMood}
        isAutoplayBlocked={audioState.isAutoplayBlocked}
        poeticResonance={poeticResonance}
        weatherType={activeEffectiveWeather}
        lightingMood={lightingMood}
        emotionalTags={emotionalTags}
        onOpenWeatherModal={() => setShowWeatherModal(true)}
      />

      <WeatherModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        activeWeather={activeEffectiveWeather}
        lightingMood={lightingMood}
        emotionalTags={emotionalTags}
        weatherDescription={weatherDescription}
        settings={weatherSettings}
        onSettingsChange={setWeatherSettings}
        onResetToAuto={() => resetToAutoAtmosphere(content)}
      />

      <EmotionTimeline
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
        moodHistory={moodHistory}
        currentMood={dominantMood}
        secondaryMood={secondaryMood}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        moment={currentMomentObject()}
      />
    </div>
  );
};
