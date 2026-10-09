import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TheUnwrittenProps {
  isVisible: boolean;
  onContinue: () => void;
  onStay: () => void;
}

export const TheUnwritten: React.FC<TheUnwrittenProps> = ({
  isVisible,
  onContinue,
  onStay,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 max-w-md w-[90%] text-center px-6 py-5 rounded-2xl bg-[#11141c]/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/60 pointer-events-auto"
        >
          <p className="font-serif-cormorant text-xl md:text-2xl text-stone-200 tracking-wide font-normal mb-1">
            “You stopped here.”
          </p>
          <p className="text-xs md:text-sm text-stone-400 font-light tracking-wide mb-4 leading-relaxed">
            Perhaps this is the sentence you aren&apos;t ready to write yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onContinue}
              className="px-4 py-1.5 text-xs tracking-wider uppercase font-medium text-amber-200/90 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 rounded-full transition-all duration-300"
            >
              Continue Writing
            </button>
            <button
              onClick={onStay}
              className="px-4 py-1.5 text-xs tracking-wider uppercase font-light text-stone-400 hover:text-stone-200 border border-white/5 hover:border-white/15 rounded-full transition-all duration-300"
            >
              Stay Here
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
