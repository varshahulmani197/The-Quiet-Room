import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { TypographySettings, FontFamilyOption } from '../types';
import { DEFAULT_TYPOGRAPHY } from '../utils/storage';

interface TypographyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TypographySettings;
  onChange: (settings: TypographySettings) => void;
}

const FONTS: { id: FontFamilyOption; name: string; preview: string; className: string }[] = [
  { id: 'cormorant', name: 'Cormorant Garamond', preview: 'Literary & Classical', className: 'font-cormorant' },
  { id: 'playfair', name: 'Playfair Display', preview: 'Editorial Elegance', className: 'font-playfair' },
  { id: 'lora', name: 'Lora', preview: 'Warm & Natural', className: 'font-lora' },
  { id: 'jakarta', name: 'Plus Jakarta', preview: 'Clean & Contemporary', className: 'font-sans-modern' },
  { id: 'jetbrains', name: 'JetBrains Mono', preview: 'Intimate Draft', className: 'font-mono-code' },
];

export const TypographyPanel: React.FC<TypographyPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
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
                  Typography
                </h3>
                <p className="text-[11px] text-stone-400 font-light">The texture of your words</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onChange(DEFAULT_TYPOGRAPHY)}
                  className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
                  title="Reset to default"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-5">
              {/* Font selection */}
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2.5">
                  Typeface
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {FONTS.map((font) => {
                    const isSelected = settings.fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => onChange({ ...settings, fontFamily: font.id })}
                        className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'bg-white/10 border-amber-400/40 text-stone-100'
                            : 'bg-white/2 border-white/5 hover:border-white/15 text-stone-300'
                        }`}
                      >
                        <span className={`text-base ${font.className}`}>
                          {font.name}
                        </span>
                        <span className="text-[11px] text-stone-400 font-light">
                          {font.preview}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Size
                  </label>
                  <span className="text-xs font-mono text-stone-300">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="17"
                  max="32"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onChange({ ...settings, fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* Line Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Line Spacing
                  </label>
                  <span className="text-xs font-mono text-stone-300">{settings.lineHeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.4"
                  max="2.3"
                  step="0.05"
                  value={settings.lineHeight}
                  onChange={(e) => onChange({ ...settings, lineHeight: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Tracking
                  </label>
                  <span className="text-xs font-mono text-stone-300">
                    {settings.letterSpacing > 0 ? `+${settings.letterSpacing}` : settings.letterSpacing}em
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.02"
                  max="0.06"
                  step="0.01"
                  value={settings.letterSpacing}
                  onChange={(e) => onChange({ ...settings, letterSpacing: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* Canvas Width */}
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2">
                  Page Width
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['narrow', 'normal', 'wide'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => onChange({ ...settings, width: w })}
                      className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all border ${
                        settings.width === w
                          ? 'bg-white/15 border-amber-400/30 text-white font-medium'
                          : 'bg-white/5 border-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {w === 'narrow' ? 'Intimate' : w === 'normal' ? 'Poetic' : 'Expansive'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Contrast */}
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2">
                  Text Luster
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['soft', 'balanced', 'crisp'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange({ ...settings, contrast: c })}
                      className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all border ${
                        settings.contrast === c
                          ? 'bg-white/15 border-amber-400/30 text-white font-medium'
                          : 'bg-white/5 border-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
