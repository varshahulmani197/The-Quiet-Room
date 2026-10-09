import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { AtmosphereCanvas } from './AtmosphereCanvas';

interface LandingPageProps {
  onEnter: () => void;
  onExplore: () => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnter,
  onExplore,
  onQuickDemo,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0a0c10] text-[#e2e4e9]">
      {/* Ambient background canvas */}
      <AtmosphereCanvas atmosphere="night" mood="reflective" intensity="subtle" />

      {/* Top bar contract: Zone 1 (Wordmark), Zone 2 (Clean links), Zone 3 (Primary action) */}
      <header className="relative z-20 flex items-center justify-between gap-8 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
        <div className="font-serif-cormorant text-2xl tracking-wider text-stone-100 whitespace-nowrap shrink-0">
          THE QUIET ROOM
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-light tracking-widest uppercase text-stone-400">
          <button
            onClick={onExplore}
            className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            Sanctuary
          </button>
          <button
            onClick={onExplore}
            className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            Atmospheres
          </button>
          <button
            onClick={onExplore}
            className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            Philosophy
          </button>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onEnter}
            className="px-5 py-2 text-xs font-medium tracking-wider uppercase text-stone-900 bg-stone-100 hover:bg-white rounded-full transition-all duration-300 shadow-lg shadow-white/5 whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter the Room
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Subtle poetic eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs text-amber-200/80 tracking-widest uppercase font-mono px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital sanctuary for deep writing</span>
          </div>

          <h1 className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-stone-100 text-balance leading-[1.05]">
            A writing space that feels what you write.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-stone-400 font-light max-w-2xl mx-auto leading-relaxed text-balance">
            Write freely. As your thoughts unfold, the room gently transforms around you through living atmosphere, typography, and acoustic soundscapes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-3.5 text-sm tracking-wider uppercase font-medium text-stone-950 bg-stone-100 hover:bg-white rounded-full transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Enter the Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto px-6 py-3.5 text-sm tracking-wider uppercase font-light text-stone-300 hover:text-white rounded-full border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400/80" />
              <span>Experience Demo Piece</span>
            </button>
          </div>

          {/* Emotional essence indicators */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-stone-400 font-light">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
              <span>Rain for reflection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              <span>Forest for calm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
              <span>Embers for nostalgia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80" />
              <span>Midnight for solitude</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Atmospheric footer */}
      <footer className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full text-xs text-stone-400 font-light border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>“Some thoughts need somewhere quiet to exist.”</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Private & Local</span>
          <span>·</span>
          <span>Zero Distractions</span>
          <span>·</span>
          <span>Adaptive Living Canvas</span>
        </div>
      </footer>
    </div>
  );
};
