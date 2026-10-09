import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Mood, MoodHistoryEntry } from '../types';

interface EmotionTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  moodHistory: MoodHistoryEntry[];
  currentMood: Mood;
  secondaryMood?: Mood | null;
}

const MOOD_COLORS: Record<Mood, { dot: string; text: string; bg: string }> = {
  melancholic: { dot: '#60a5fa', text: 'text-blue-300', bg: 'bg-blue-500/10' },
  reflective: { dot: '#a78bfa', text: 'text-purple-300', bg: 'bg-purple-500/10' },
  nostalgic: { dot: '#fbbf24', text: 'text-amber-300', bg: 'bg-amber-500/10' },
  peaceful: { dot: '#34d399', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  joyful: { dot: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  romantic: { dot: '#f472b6', text: 'text-pink-300', bg: 'bg-pink-500/10' },
  hopeful: { dot: '#38bdf8', text: 'text-sky-300', bg: 'bg-sky-500/10' },
  dreamy: { dot: '#c084fc', text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10' },
  lonely: { dot: '#94a3b8', text: 'text-slate-400', bg: 'bg-slate-500/10' },
  energetic: { dot: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  angry: { dot: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10' },
  neutral: { dot: '#cbd5e1', text: 'text-stone-300', bg: 'bg-stone-500/10' },
};

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({
  isOpen,
  onClose,
  moodHistory,
  currentMood,
  secondaryMood,
}) => {
  // If mood history is empty or single, provide gentle narrative steps
  const displayHistory = moodHistory.length > 0 ? moodHistory : [
    { timestamp: Date.now(), mood: currentMood, secondaryMood, wordCount: 0 }
  ];

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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#10131a]/95 border border-white/10 rounded-2xl p-6 shadow-2xl text-stone-200 backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400/80" />
                <h3 className="font-serif-cormorant text-xl text-stone-100 font-normal">
                  Emotion Timeline
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Close timeline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 my-4 leading-relaxed font-light">
              An artistic impression of how the room shifted as your thoughts unfolded on the canvas.
            </p>

            <div className="relative pl-6 py-2 my-2 space-y-6">
              {/* Flowing vertical atmospheric thread */}
              <div
                className="absolute left-[11px] top-3 bottom-3 w-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(251,191,36,0.3), rgba(96,165,250,0.4), rgba(167,139,250,0.4))',
                }}
              />

              {/* Start node */}
              <div className="relative flex items-center gap-3">
                <div className="w-2.5 h-2.5 -ml-6 rounded-full bg-stone-500 ring-4 ring-[#10131a]" />
                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">
                  Beginning · Stillness
                </div>
              </div>

              {/* Mood nodes */}
              {displayHistory.map((item, idx) => {
                const style = MOOD_COLORS[item.mood] || MOOD_COLORS.neutral;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative flex items-start justify-between gap-3 group"
                  >
                    <div
                      className="w-2.5 h-2.5 -ml-6 mt-1 rounded-full ring-4 ring-[#10131a] transition-transform group-hover:scale-125"
                      style={{ backgroundColor: style.dot }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-serif-cormorant text-base capitalize ${style.text}`}>
                          {item.mood}
                        </span>
                        {item.secondaryMood && (
                          <span className="text-xs text-stone-500 font-light">
                            · {item.secondaryMood}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-light">
                        {item.wordCount > 0 ? `Around ${item.wordCount} words` : 'Initial tone'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Current node */}
              <div className="relative flex items-center gap-3 pt-2">
                <div
                  className="w-3 h-3 -ml-6 rounded-full ring-4 ring-[#10131a] animate-pulse"
                  style={{
                    backgroundColor: (MOOD_COLORS[currentMood] || MOOD_COLORS.neutral).dot,
                  }}
                />
                <div className="text-xs text-amber-200/90 uppercase tracking-widest font-mono font-medium">
                  Current Atmosphere
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Return to Canvas
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
