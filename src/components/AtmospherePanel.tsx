import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  CloudRain,
  Moon,
  Trees,
  Flame,
  Sun,
  Sparkles,
  Sliders,
  Music,
  Heart,
  Zap,
} from 'lucide-react';
import { AtmosphereType, Mood } from '../types';
import { CanonicalMusicMood } from '../utils/audio/moodAudioLibrary';

interface AtmospherePanelProps {
  isOpen: boolean;
  onClose: () => void;
  atmosphere: AtmosphereType;
  onAtmosphereChange: (atmo: AtmosphereType) => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isManualOverride: boolean;
  onResetToAuto: () => void;
  currentMood: Mood;
  currentMusicMood: CanonicalMusicMood;
  isCrossfading: boolean;
  currentTrackLabel: string;
  onSelectMusicMood: (mood: CanonicalMusicMood) => void;
  isAutoplayBlocked: boolean;
  poeticResonance?: string;
}

const VISUAL_ATMOSPHERES: { id: AtmosphereType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'auto', label: 'Auto (Feels what you write)', icon: Sparkles },
  { id: 'rain', label: 'Rain against glass', icon: CloudRain },
  { id: 'night', label: 'Nocturnal stars & dusk', icon: Moon },
  { id: 'forest', label: 'Forest breeze & moss', icon: Trees },
  { id: 'sunrise', label: 'Gentle sunrise & warmth', icon: Sun },
  { id: 'fireplace', label: 'Hearth & amber embers', icon: Flame },
  { id: 'minimal', label: 'Minimal stillness', icon: Sliders },
];

const CANONICAL_MOOD_SOUNDSCAPES: {
  id: CanonicalMusicMood;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  {
    id: 'happy',
    name: 'Happy · Uplifting Piano',
    description: 'Warm delicate acoustic textures, shimmering pads & gentle hope',
    icon: Sun,
    accent: 'text-amber-300',
  },
  {
    id: 'sad',
    name: 'Sad · Reflective Piano & Rain',
    description: 'Slow expressive piano, gentle melancholic rain & deep atmosphere',
    icon: CloudRain,
    accent: 'text-blue-300',
  },
  {
    id: 'romantic',
    name: 'Romantic · Intimate Strings & Piano',
    description: 'Delicate melodic phrasing, gentle string vibrato & warm velvet textures',
    icon: Heart,
    accent: 'text-pink-300',
  },
  {
    id: 'zeal',
    name: 'Zeal · Cinematic Inspiring Pulse',
    description: 'Rhythmic pulsing ambient layers, rising musical energy & momentum',
    icon: Zap,
    accent: 'text-orange-300',
  },
];

export const AtmospherePanel: React.FC<AtmospherePanelProps> = ({
  isOpen,
  onClose,
  atmosphere,
  onAtmosphereChange,
  isPlayingAudio,
  onToggleAudio,
  volume,
  onVolumeChange,
  isManualOverride,
  onResetToAuto,
  currentMood,
  currentMusicMood,
  isCrossfading,
  currentTrackLabel,
  onSelectMusicMood,
  isAutoplayBlocked,
  poeticResonance,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm bg-[#11141c]/95 border border-white/10 rounded-2xl p-6 shadow-2xl text-stone-200 backdrop-blur-md pointer-events-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-serif-cormorant text-xl text-stone-100 font-normal">
                  Atmosphere & Music
                </h3>
                <p className="text-[11px] text-stone-400 font-light">
                  {poeticResonance || 'Synchronized soundscape and living room'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 pt-5">
              {/* Autoplay blocked banner */}
              {isAutoplayBlocked && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
                  <div className="font-medium mb-1">Audio paused by browser</div>
                  <p className="text-[11px] text-amber-200/80 mb-2 font-light">
                    Click to grant browser audio permission and begin the soundscape.
                  </p>
                  <button
                    onClick={onToggleAudio}
                    className="w-full py-1.5 bg-amber-400 text-stone-950 font-medium rounded-lg text-xs"
                  >
                    Play Atmosphere
                  </button>
                </div>
              )}

              {/* Mood State Banner */}
              <div className="p-3.5 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400">
                    Detected Tone
                  </span>
                  {isManualOverride ? (
                    <span className="text-[11px] text-amber-300 font-medium">Manual Override</span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">Auto-Synchronized</span>
                  )}
                </div>
                <div className="text-base font-serif-cormorant capitalize text-stone-100 mb-1 flex items-center justify-between">
                  <span>{currentMood}</span>
                  <span className="text-xs text-amber-300/80 uppercase font-mono tracking-wider font-light">
                    Track: {currentMusicMood}
                  </span>
                </div>

                {isCrossfading && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-light mt-1.5 animate-pulse">
                    <Music className="w-3 h-3" />
                    <span>Crossfading soundscapes (3.5s smooth blend)...</span>
                  </div>
                )}

                {isManualOverride ? (
                  <button
                    onClick={onResetToAuto}
                    className="w-full mt-2 text-center py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                  >
                    Return to Automatic Synchronization
                  </button>
                ) : (
                  <p className="text-[11px] text-stone-500 font-light mt-1">
                    Visual environment and ambient music evolve in lockstep as you write.
                  </p>
                )}
              </div>

              {/* Soundscape Music Tracks (4 Canonical Moods) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Ambient Music Soundscape
                  </label>
                  <button
                    onClick={onToggleAudio}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors border ${
                      isPlayingAudio
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Music On</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Music Muted</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 mb-3">
                  {CANONICAL_MOOD_SOUNDSCAPES.map((track) => {
                    const isSelected = currentMusicMood === track.id;
                    const Icon = track.icon;
                    return (
                      <button
                        key={track.id}
                        onClick={() => onSelectMusicMood(track.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                          isSelected
                            ? 'bg-white/10 border-amber-400/40 text-stone-100'
                            : 'bg-white/2 border-white/5 hover:border-white/15 text-stone-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${track.accent}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-stone-100 truncate">
                              {track.name}
                            </span>
                            {isSelected && isPlayingAudio && (
                              <span className="text-[10px] text-amber-300 font-mono tracking-wider ml-2 shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 font-light truncate mt-0.5">
                            {track.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Master Volume Slider */}
                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-stone-400 font-light">Acoustic Level</span>
                    <span className="text-[11px] font-mono text-stone-300">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                </div>
              </div>

              {/* Visual Atmosphere Selection */}
              <div className="pt-2 border-t border-white/5">
                <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2.5">
                  Visual Canvas Atmosphere
                </label>
                <div className="space-y-1.5">
                  {VISUAL_ATMOSPHERES.map((item) => {
                    const isSelected = atmosphere === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onAtmosphereChange(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? 'bg-white/10 border-amber-400/40 text-stone-100 font-medium'
                            : 'bg-white/2 border-white/5 hover:border-white/15 text-stone-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-stone-400 shrink-0" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
