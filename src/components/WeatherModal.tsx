import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CloudRain,
  Snowflake,
  Sun,
  Wind,
  Flame,
  Sparkles,
  Zap,
  Sliders,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { WeatherType, LightingMood, WeatherOverlaySettings } from '../types';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeather: WeatherType;
  lightingMood: LightingMood;
  emotionalTags: string[];
  weatherDescription: string;
  settings: WeatherOverlaySettings;
  onSettingsChange: (settings: WeatherOverlaySettings) => void;
  onResetToAuto: () => void;
}

const WEATHER_OPTIONS: {
  id: WeatherType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}[] = [
  {
    id: 'rain',
    label: 'Gentle Rain',
    description: 'Slanted translucent rain needles and floor ripples',
    icon: CloudRain,
    accentColor: 'text-sky-400',
  },
  {
    id: 'snow',
    label: 'Quiet Snowfall',
    description: 'Slow sinusoidal flurries and winter solitude',
    icon: Snowflake,
    accentColor: 'text-blue-200',
  },
  {
    id: 'sunbeams',
    label: 'Golden Sunbeams',
    description: 'Volumetric light shafts and floating sun motes',
    icon: Sun,
    accentColor: 'text-amber-300',
  },
  {
    id: 'petals',
    label: 'Drifting Petals',
    description: 'Tumbling blossom petals and sage forest spores',
    icon: Wind,
    accentColor: 'text-rose-300',
  },
  {
    id: 'embers',
    label: 'Hearth Embers',
    description: 'Convective rising sparks and amber hearth warmth',
    icon: Flame,
    accentColor: 'text-orange-400',
  },
  {
    id: 'fireflies',
    label: 'Twilight Fireflies',
    description: 'Pulsing starlight halos and dreamy velvet dusk',
    icon: Sparkles,
    accentColor: 'text-purple-300',
  },
  {
    id: 'zeal-sparks',
    label: 'Zeal Momentum',
    description: 'Spirited upward sparks and electric determination',
    icon: Zap,
    accentColor: 'text-amber-400',
  },
  {
    id: 'clear',
    label: 'Still Sanctuary',
    description: 'Subtle ethereal dust motes in calm stillness',
    icon: Sliders,
    accentColor: 'text-stone-300',
  },
];

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  activeWeather,
  lightingMood,
  emotionalTags,
  weatherDescription,
  settings,
  onSettingsChange,
  onResetToAuto,
}) => {
  const isAuto = settings.mode === 'auto';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm bg-[#11141c]/95 border border-white/10 rounded-2xl p-6 shadow-2xl text-stone-200 backdrop-blur-md pointer-events-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-serif-cormorant text-xl text-stone-100 font-normal">
                  Weather & Light Overlay
                </h3>
                <p className="text-[11px] text-stone-400 font-light">
                  {weatherDescription || 'Visual poetry responding to your prose'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Close weather settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 pt-4">
              {/* Emotional Tags Banner */}
              <div className="p-3.5 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                    Emotional Weather Tags
                  </span>
                  {isAuto ? (
                    <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                      Auto-Responding
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-300 font-medium tracking-wide">
                      Custom Weather
                    </span>
                  )}
                </div>

                {/* Clean typographic tokens */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-300 font-light mt-1">
                  {emotionalTags && emotionalTags.length > 0 ? (
                    emotionalTags.map((tag, idx) => (
                      <span key={tag} className="flex items-center gap-1.5 text-stone-300">
                        <span className="text-stone-500 font-mono text-[10px]">#</span>
                        <span className="font-medium text-stone-200">{tag}</span>
                        {idx < emotionalTags.length - 1 && (
                          <span className="text-stone-600">·</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500 text-xs italic">
                      Type in the room to inspire weather tags...
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="capitalize font-mono text-[10px]">
                    Light Mood: <span className="text-stone-300">{lightingMood.replace('-', ' ')}</span>
                  </span>
                  <span className="capitalize font-mono text-[10px]">
                    Active: <span className="text-amber-300 font-semibold">{activeWeather}</span>
                  </span>
                </div>

                {!isAuto && (
                  <button
                    onClick={onResetToAuto}
                    className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Return to Writing-Adaptive Weather</span>
                  </button>
                )}
              </div>

              {/* Weather Modes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Weather Environment
                  </label>
                  {isAuto && (
                    <span className="text-[10px] text-stone-500 font-mono">
                      (Follows writing)
                    </span>
                  )}
                </div>

                {/* Adaptive Auto option */}
                <button
                  onClick={() => onSettingsChange({ ...settings, mode: 'auto' })}
                  className={`w-full text-left p-2.5 rounded-xl border mb-2 transition-all flex items-start gap-3 ${
                    isAuto
                      ? 'bg-white/10 border-amber-400/50 text-stone-100'
                      : 'bg-white/2 border-white/5 hover:border-white/15 text-stone-300'
                  }`}
                >
                  <Eye className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-100">
                        Adaptive (Emotional Harmony)
                      </span>
                      {isAuto && (
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Subtly adapts rain, snow, sunbeams, or embers to match what you write
                    </p>
                  </div>
                </button>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {WEATHER_OPTIONS.map((item) => {
                    const isSelected = !isAuto && settings.mode === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          onSettingsChange({
                            ...settings,
                            mode: item.id,
                          })
                        }
                        className={`w-full text-left p-2 rounded-xl border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-white/10 border-amber-400/50 text-stone-100'
                            : 'bg-white/2 border-white/5 hover:border-white/10 text-stone-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.accentColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-stone-100 truncate">
                              {item.label}
                            </span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-amber-300 shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 font-light truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Falling Particle Intensity */}
              <div className="p-3 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone-300 font-light">Falling Particles</span>
                  <span className="text-[11px] font-mono text-amber-300 capitalize">
                    {settings.particleIntensity}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['off', 'subtle', 'balanced', 'rich'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          particleIntensity: intensity,
                        })
                      }
                      className={`py-1 rounded-lg text-[11px] capitalize transition-all border ${
                        settings.particleIntensity === intensity
                          ? 'bg-white/15 border-amber-400/40 text-stone-100 font-medium'
                          : 'bg-white/2 border-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Changing Light / Volumetric Illumination */}
              <div className="p-3 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone-300 font-light">Changing Light Shafts</span>
                  <span className="text-[11px] font-mono text-amber-300 capitalize">
                    {settings.lightingIntensity}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['off', 'soft', 'moderate', 'vivid'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          lightingIntensity: intensity,
                        })
                      }
                      className={`py-1 rounded-lg text-[11px] capitalize transition-all border ${
                        settings.lightingIntensity === intensity
                          ? 'bg-white/15 border-amber-400/40 text-stone-100 font-medium'
                          : 'bg-white/2 border-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breathing Light Pulse Toggle */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-xs text-stone-300 font-light block">
                    Living Ambient Breath
                  </span>
                  <span className="text-[10px] text-stone-500 font-light">
                    Gentle organic light breathing cycle
                  </span>
                </div>
                <button
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      ambientLightPulse: !settings.ambientLightPulse,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    settings.ambientLightPulse ? 'bg-amber-400' : 'bg-white/10'
                  }`}
                  aria-label="Toggle ambient breath"
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-stone-900 transition-transform ${
                      settings.ambientLightPulse ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
