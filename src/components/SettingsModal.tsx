import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Sliders, Volume2, Eye, Trash2, Heart } from 'lucide-react';
import { AppSettings, SoundscapeType } from '../types';
import { clearAllLocalData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onMomentsCleared: () => void;
}

const SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
  { id: 'night', label: 'Night' },
  { id: 'rain', label: 'Rain' },
  { id: 'forest', label: 'Forest' },
  { id: 'fireplace', label: 'Fireplace' },
  { id: 'lofi', label: 'Lo-fi' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'none', label: 'Muted by Default' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onMomentsCleared,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleClearData = () => {
    clearAllLocalData();
    onMomentsCleared();
    setShowConfirmClear(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-[#11141c]/95 border border-white/10 rounded-2xl p-6 shadow-2xl text-stone-200 backdrop-blur-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-serif-cormorant text-2xl text-stone-100 font-normal">
                  Sanctuary Settings
                </h3>
                <p className="text-xs text-stone-400 font-light">Fine-tune your writing environment</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 pt-6 text-sm">
              {/* Atmospheric Engine & Animation Intensity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-300 font-medium">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Atmosphere & Motion</span>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Canvas Animation Intensity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['subtle', 'normal', 'rich'] as const).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => onSaveSettings({ ...settings, atmosphereIntensity: intensity })}
                        className={`py-2 px-3 rounded-xl text-xs capitalize transition-all border ${
                          settings.atmosphereIntensity === intensity
                            ? 'bg-white/15 border-amber-400/30 text-white font-medium'
                            : 'bg-white/5 border-white/5 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {intensity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-xs text-stone-300 font-medium">The Unwritten Prompt</div>
                    <div className="text-[11px] text-stone-500">
                      Gently asks if a stopped sentence needs patience
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.unwrittenPromptEnabled}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, unwrittenPromptEnabled: e.target.checked })
                    }
                    className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Soundscape Defaults */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-stone-300 font-medium">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Soundscape Defaults</span>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Default Ambient Acoustic</label>
                  <select
                    value={settings.defaultSoundscape}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, defaultSoundscape: e.target.value as SoundscapeType })
                    }
                    className="w-full bg-[#161a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400/40"
                  >
                    {SOUNDSCAPES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-stone-300 font-medium">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Accessibility</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs text-stone-300 font-medium">Reduced Motion</div>
                    <div className="text-[11px] text-stone-500">
                      Disables particle drifts, rain streaks and camera shifts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, reducedMotion: e.target.checked })
                    }
                    className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs text-stone-300 font-medium">High Contrast Mode</div>
                    <div className="text-[11px] text-stone-500">
                      Boosts text luminosity against the dark background
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, highContrast: e.target.checked })
                    }
                    className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Privacy First */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-stone-300 font-medium">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Privacy & Storage</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-xs text-stone-400 leading-relaxed font-light">
                  <strong className="text-stone-200 block mb-1">“Your words belong to you.”</strong>
                  All drafts and moments are saved in your local browser storage. No writing is stored on remote databases or retained for training.
                </div>

                {showConfirmClear ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <p className="text-xs text-rose-200">
                      Permanently remove all moments and drafts?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearData}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
                      >
                        Yes, Clear Everything
                      </button>
                      <button
                        onClick={() => setShowConfirmClear(false)}
                        className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 bg-white/5 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Local Data & Moments</span>
                  </button>
                )}
              </div>

              {/* About */}
              <div className="pt-4 border-t border-white/5 text-center text-xs text-stone-500 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-stone-300 font-serif-cormorant text-base">
                  <span>The Quiet Room</span>
                  <Heart className="w-3 h-3 text-amber-400/80 inline" />
                </div>
                <p className="italic font-light">“A place for thoughts that need somewhere quiet to exist.”</p>
                <p className="text-[11px] text-stone-600">Version 1.0 · Designed for writers, poets, and thinkers</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
