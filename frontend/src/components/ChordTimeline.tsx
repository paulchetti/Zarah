'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { transposeChord } from '@/lib/transposition';
import { FastForward, ArrowRight, Disc, Layers, Sparkles } from 'lucide-react';

export const ChordTimeline: React.FC = () => {
  const {
    analysis,
    currentTime,
    activeChordIndex,
    transposeSemitones,
    useAiChords,
    toggleAiChords,
    setCurrentTime
  } = usePlayerStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  const chords = (useAiChords || !analysis?.rawChords?.length)
    ? (analysis?.chords || [])
    : analysis.rawChords;

  // Auto-scroll timeline to center active chord smoothly
  useEffect(() => {
    if (activeCardRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = activeCardRef.current;

      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: cardLeft - containerWidth / 2 + cardWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [activeChordIndex]);

  if (!chords || chords.length === 0) {
    return null;
  }

  const activeChordEvent = chords[activeChordIndex];
  const nextChordEvent = chords[activeChordIndex + 1];

  let chordProgressPercent = 0;
  if (activeChordEvent) {
    const chordDuration = activeChordEvent.endTime - activeChordEvent.startTime;
    if (chordDuration > 0) {
      chordProgressPercent = Math.min(
        100,
        Math.max(0, ((currentTime - activeChordEvent.startTime) / chordDuration) * 100)
      );
    }
  }

  const hasRawChords = Boolean(analysis?.rawChords && analysis.rawChords.length > 0);

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-6 relative overflow-hidden">
      {/* Header Deck & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-outfit)]">
            Harmonic Progression Ribbon
          </span>
          <span className="text-[11px] text-slate-400 font-medium">({chords.length} segments)</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* AI / DSP Mode Toggle */}
          {hasRawChords && (
            <button
              onClick={toggleAiChords}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                useAiChords
                  ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-900/90 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${useAiChords ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{useAiChords ? 'AI Refined Chords' : 'Raw DSP Chords'}</span>
            </button>
          )}

          {nextChordEvent && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#05070d] border border-white/[0.08] text-xs text-slate-300 shadow-inner">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Next:</span>
              <span className="font-extrabold text-amber-400 font-[family-name:var(--font-outfit)] text-xs">
                {transposeChord(nextChordEvent.chord, transposeSemitones)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">@{nextChordEvent.startTime.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Musical Explanation Banner */}
      {analysis?.aiNotes && useAiChords && (
        <div className="flex items-center gap-2 mb-3.5 px-3.5 py-2 rounded-xl bg-purple-950/25 border border-purple-800/40 text-[11px] text-purple-200 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 animate-pulse" />
          <span className="font-medium">{analysis.aiNotes}</span>
        </div>
      )}

      {/* Sequencer Tape Ribbon */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1.5 scrollbar-thin scrollbar-thumb-indigo-500/40 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        {chords.map((chordEvent, index) => {
          const isActive = index === activeChordIndex;
          const isNext = index === activeChordIndex + 1;
          const displayChord = transposeChord(chordEvent.chord, transposeSemitones);

          return (
            <div
              key={`${chordEvent.chord}-${chordEvent.startTime}-${index}`}
              ref={isActive ? activeCardRef : null}
              onClick={() => setCurrentTime(chordEvent.startTime)}
              className={`flex-shrink-0 cursor-pointer rounded-2xl p-4 transition-all duration-300 relative overflow-hidden border ${
                isActive
                  ? 'bg-gradient-to-b from-[#1c233f] to-[#0d1224] border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.35)] scale-105 min-w-[130px]'
                  : isNext
                  ? 'bg-[#0c1020]/90 border-white/20 hover:border-white/30 min-w-[105px] hover:-translate-y-0.5'
                  : 'bg-[#060812]/80 border-white/[0.06] hover:border-white/20 min-w-[100px] hover:-translate-y-0.5'
              }`}
            >
              {/* Active Chord Bottom Progress Bar Indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-cyan-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${chordProgressPercent}%` }}
                />
              )}

              {/* Timestamp & Tag Header */}
              <div className="flex items-center justify-between mb-1.5 text-[10px]">
                <span className={`font-mono font-bold ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {chordEvent.startTime.toFixed(1)}s
                </span>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-cyan-300 text-[9px] font-black tracking-widest border border-cyan-400/40 animate-pulse">
                    PLAYING
                  </span>
                )}
                {isNext && (
                  <span className="text-amber-400 text-[9px] font-extrabold flex items-center gap-0.5">
                    NEXT <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Chord Symbol Display */}
              <div className="text-center py-1.5">
                <span
                  className={`block font-black tracking-tight font-[family-name:var(--font-outfit)] transition-transform ${
                    isActive
                      ? 'text-3xl text-white scale-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]'
                      : 'text-xl text-slate-300'
                  }`}
                >
                  {displayChord}
                </span>
              </div>

              {/* Segment Duration Footer */}
              <div className="text-center text-[10px] text-slate-400 mt-1 font-mono">
                {(chordEvent.endTime - chordEvent.startTime).toFixed(1)}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
