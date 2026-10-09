import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit3, BookOpen, Share2, Sparkles, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { Moment } from '../types';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { moodAudioController } from '../utils/audio/moodAudioController';

interface MemoryRoomModalProps {
  moment: Moment | null;
  onClose: () => void;
  onContinueWriting: (moment: Moment) => void;
  onExport: (moment: Moment) => void;
  onDelete?: (moment: Moment) => void;
}

export const MemoryRoomModal: React.FC<MemoryRoomModalProps> = ({
  moment,
  onClose,
  onContinueWriting,
  onExport,
  onDelete,
}) => {
  // Staged bloom phases: 0 = blackout, 1 = atmosphere awakens, 2 = title blooms, 3 = words fade in
  const [phase, setPhase] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    const unsub = moodAudioController.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!moment) {
      setPhase(0);
      return;
    }

    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 350); // atmosphere blooms
    const t2 = setTimeout(() => {
      setPhase(2);
      // Play matching ambient music for this preserved memory
      moodAudioController.play(moment.dominantMood);
    }, 1000); // title surfaces & audio emerges
    const t3 = setTimeout(() => setPhase(3), 1700); // full memory fades in

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [moment]);

  if (!moment) return null;

  const fontClass =
    moment.typographySettings.fontFamily === 'cormorant'
      ? 'font-cormorant'
      : moment.typographySettings.fontFamily === 'playfair'
      ? 'font-playfair'
      : moment.typographySettings.fontFamily === 'lora'
      ? 'font-lora'
      : moment.typographySettings.fontFamily === 'jetbrains'
      ? 'font-mono-code'
      : 'font-sans-modern';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black flex flex-col justify-between">
      {/* Dynamic atmospheric canvas awakens in phase 1 */}
      {phase >= 1 && (
        <AtmosphereCanvas
          atmosphere={moment.atmosphere}
          mood={moment.dominantMood}
          intensity="normal"
        />
      )}

      {/* Top memory navigation */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : -10 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12"
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-100 text-xs tracking-wider uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => moodAudioController.toggle(moment.dominantMood)}
            className={`p-2 rounded-full border transition-all text-xs ${
              isPlayingAudio
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
            }`}
            title={isPlayingAudio ? 'Mute Atmosphere' : 'Play Atmosphere'}
          >
            {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onExport(moment)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-stone-400 hover:text-stone-200 bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            title="Export moment"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preserve</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(moment)}
              className="p-2 rounded-full text-stone-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 transition-colors border border-white/5 hover:border-rose-500/20"
              title="Delete moment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onContinueWriting(moment)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Continue Writing</span>
          </button>
        </div>
      </motion.header>

      {/* Main reading canvas */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
        {/* Title surfaces in Phase 2 */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-10 w-full"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-amber-200/80 tracking-widest uppercase mb-3 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {moment.dominantMood}
                  {moment.secondaryMood ? ` · ${moment.secondaryMood}` : ''}
                </span>
                <span className="text-stone-600">|</span>
                <span>{new Date(moment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h1 className="font-serif-cormorant text-3xl md:text-5xl text-stone-100 font-normal tracking-wide">
                {moment.title || 'Untitled Moment'}
              </h1>

              {moment.poeticResonance && (
                <p className="text-xs text-stone-400 font-light italic mt-3">
                  “{moment.poeticResonance}”
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing body fades in Phase 3 */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`w-full whitespace-pre-wrap leading-relaxed text-stone-200/90 text-left ${fontClass}`}
              style={{
                fontSize: `${moment.typographySettings.fontSize || 22}px`,
                lineHeight: moment.typographySettings.lineHeight || 1.85,
                letterSpacing: `${moment.typographySettings.letterSpacing || 0}em`,
              }}
            >
              {moment.content}
            </motion.article>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom atmospheric footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 text-xs text-stone-500 font-light border-t border-white/5"
      >
        <div className="flex items-center gap-2">
          <span>{moment.wordCount} words</span>
          <span>·</span>
          <span>{moment.atmosphere} atmosphere</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-stone-400" />
          <span>The Quiet Room preserves every thought</span>
        </div>
      </motion.footer>
    </div>
  );
};
