import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, SlidersHorizontal, Trash2, Clock, BookOpen, Search } from 'lucide-react';
import { Moment, Mood } from '../types';

interface HomeScreenProps {
  moments: Moment[];
  onNewWriting: () => void;
  onOpenMoment: (moment: Moment) => void;
  onDeleteMoment: (moment: Moment, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
}

const MOOD_ATMOSPHERE_ACCENTS: Record<Mood, { glow: string; text: string; bg: string }> = {
  melancholic: { glow: 'from-blue-900/30 to-indigo-950/20', text: 'text-blue-300', bg: 'border-blue-500/20' },
  reflective: { glow: 'from-purple-900/30 to-slate-950/20', text: 'text-purple-300', bg: 'border-purple-500/20' },
  nostalgic: { glow: 'from-amber-900/30 to-stone-950/20', text: 'text-amber-300', bg: 'border-amber-500/20' },
  peaceful: { glow: 'from-emerald-900/30 to-teal-950/20', text: 'text-emerald-300', bg: 'border-emerald-500/20' },
  joyful: { glow: 'from-amber-800/30 to-orange-950/20', text: 'text-amber-200', bg: 'border-amber-400/20' },
  romantic: { glow: 'from-pink-900/30 to-rose-950/20', text: 'text-pink-300', bg: 'border-pink-500/20' },
  hopeful: { glow: 'from-sky-900/30 to-blue-950/20', text: 'text-sky-300', bg: 'border-sky-500/20' },
  dreamy: { glow: 'from-fuchsia-900/30 to-purple-950/20', text: 'text-fuchsia-300', bg: 'border-fuchsia-500/20' },
  lonely: { glow: 'from-slate-900/30 to-stone-950/20', text: 'text-slate-400', bg: 'border-slate-500/20' },
  energetic: { glow: 'from-orange-900/30 to-amber-950/20', text: 'text-orange-300', bg: 'border-orange-500/20' },
  angry: { glow: 'from-red-900/30 to-stone-950/20', text: 'text-red-400', bg: 'border-red-500/20' },
  neutral: { glow: 'from-stone-900/20 to-neutral-950/20', text: 'text-stone-300', bg: 'border-white/10' },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  moments,
  onNewWriting,
  onOpenMoment,
  onDeleteMoment,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const filteredMoments = moments.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMoodFilter === 'all' || m.dominantMood === selectedMoodFilter;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#0b0d12] text-[#e3e5ea] pb-16">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-radial from-stone-800/15 via-transparent to-transparent pointer-events-none" />

      {/* Header Contract */}
      <header className="relative z-20 flex items-center justify-between gap-8 px-6 md:px-12 py-8 max-w-6xl mx-auto w-full border-b border-white/5">
        <div className="font-serif-cormorant text-2xl tracking-wider text-stone-100 whitespace-nowrap shrink-0">
          THE QUIET ROOM
        </div>

        <nav className="flex items-center gap-6 text-xs font-light tracking-wider uppercase text-stone-400">
          <button
            onClick={onNewWriting}
            className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0 hidden sm:inline"
          >
            New Writing
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            Settings
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewWriting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-medium tracking-wider uppercase text-stone-950 bg-stone-100 hover:bg-white rounded-full transition-all duration-300 shadow-lg shadow-white/5 whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter a New Room</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 md:px-12 py-12 max-w-6xl mx-auto w-full">
        {/* Welcome Sanctuary Statement */}
        <div className="mb-12 text-left">
          <div className="text-xs text-amber-200/80 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Your Writing Sanctuary</span>
          </div>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl text-stone-100 font-normal tracking-wide">
            Your Moments
          </h2>
          <p className="text-sm text-stone-400 font-light mt-2 max-w-xl">
            Memories preserved with the atmosphere and emotional tone present when you wrote them.
          </p>
        </div>

        {/* Search & Mood Filter Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across moments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/3 hover:bg-white/5 focus:bg-white/5 border border-white/5 focus:border-white/15 rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'melancholic', 'peaceful', 'reflective', 'nostalgic'].map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMoodFilter(mood)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-colors border ${
                  selectedMoodFilter === mood
                    ? 'bg-white/15 border-amber-400/30 text-white font-medium'
                    : 'bg-white/2 border-white/5 text-stone-400 hover:text-stone-200'
                }`}
              >
                {mood === 'all' ? 'All Atmospheres' : mood}
              </button>
            ))}
          </div>
        </div>

        {/* Moments Showcase (Atmospheric Memories) */}
        {filteredMoments.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/5 bg-white/1 px-6">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-stone-400">
              <BookOpen className="w-5 h-5 text-amber-400/80" />
            </div>
            <h3 className="font-serif-cormorant text-2xl text-stone-200 font-normal mb-1">
              {searchQuery ? 'No moments match your search' : 'No Moments yet'}
            </h3>
            <p className="text-xs text-stone-400 font-light mb-6">
              {searchQuery
                ? 'Try searching with different words or reset the filter'
                : '“Your first moment is waiting.”'}
            </p>
            <button
              onClick={onNewWriting}
              className="px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-stone-900 bg-stone-100 hover:bg-white rounded-full transition-all shadow-md hover:scale-[1.02]"
            >
              Begin Writing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoments.map((moment) => {
              const accent = MOOD_ATMOSPHERE_ACCENTS[moment.dominantMood] || MOOD_ATMOSPHERE_ACCENTS.neutral;
              const dateStr = new Date(moment.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={moment.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onOpenMoment(moment)}
                  className={`group relative rounded-2xl p-6 bg-gradient-to-b ${accent.glow} bg-[#10131b] border ${accent.bg} hover:border-white/25 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg`}
                >
                  <div>
                    {/* Header: Date + Mood unboxed text */}
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`capitalize font-medium ${accent.text}`}>
                          {moment.dominantMood}
                        </span>
                        {moment.secondaryMood && (
                          <>
                            <span aria-hidden="true" className="text-stone-600">·</span>
                            <span className="capitalize">{moment.secondaryMood}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-500 font-light">
                        <Clock className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-cormorant text-2xl text-stone-100 font-normal mb-3 group-hover:text-amber-100 transition-colors line-clamp-1">
                      {moment.title || 'Untitled Moment'}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-400 font-light line-clamp-3 leading-relaxed mb-6">
                      {moment.content || 'A quiet page waiting for thoughts...'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-2">
                      <span>{moment.wordCount} words</span>
                      <span>·</span>
                      <span className="capitalize">{moment.atmosphere}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMoment(moment, e);
                        }}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 text-stone-500 hover:text-rose-400 transition-all rounded hover:bg-white/5"
                        title="Delete Moment"
                        aria-label="Delete Moment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
