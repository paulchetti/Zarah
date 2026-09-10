'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowDown, ArrowUp, Minus, Activity, Radio } from 'lucide-react';

export const StrummingPatternVisualizer: React.FC = () => {
  const { analysis, currentTime, isPlaying } = usePlayerStore();

  const patternData = analysis?.strummingPattern;
  if (!patternData) return null;

  const { strokes, subdivisions, name, pattern, description } = patternData;

  const bpm = analysis?.bpm || 120;
  const secondsPerBeat = 60 / bpm;
  const secondsPerEighth = secondsPerBeat / 2;
  const currentStep = Math.floor((currentTime % (secondsPerBeat * 4)) / secondsPerEighth) % 8;

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-6 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-outfit)]">
              Recommended Rhythm & Strum: {name}
            </h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>

        <div className="px-4 py-1.5 rounded-2xl bg-[#05070d] border border-white/[0.08] text-xs font-mono font-black text-amber-300 shadow-inner tracking-wider">
          {pattern}
        </div>
      </div>

      {/* 8-Slot Strum Rhythm Grid */}
      <div className="grid grid-cols-8 gap-2.5 max-w-2xl mx-auto">
        {strokes.map((stroke, index) => {
          const isStepActive = isPlaying && currentStep === index;
          const isDown = stroke === 'D';
          const isUp = stroke === 'U';
          const isRest = stroke === '-';

          return (
            <div
              key={`stroke-${index}`}
              className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-200 ${
                isStepActive
                  ? 'bg-gradient-to-b from-amber-500/25 to-indigo-900/40 border-amber-400 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                  : 'bg-[#05070d]/90 border-white/[0.07] hover:border-white/15'
              }`}
            >
              {/* Subdivision Beat Label */}
              <span
                className={`text-[11px] font-mono font-bold mb-2 ${
                  isStepActive ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {subdivisions[index]}
              </span>

              {/* Stroke Direction Box */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mb-1.5 transition-colors ${
                  isDown
                    ? 'bg-indigo-600/25 border border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : isUp
                    ? 'bg-cyan-600/25 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.05]'
                }`}
              >
                {isDown ? (
                  <ArrowDown className="w-5 h-5 stroke-[2.5]" />
                ) : isUp ? (
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </div>

              {/* Stroke Symbol */}
              <span
                className={`text-xs font-black tracking-wider font-[family-name:var(--font-outfit)] ${
                  isStepActive
                    ? 'text-amber-400 scale-125 font-extrabold'
                    : 'text-slate-300'
                }`}
              >
                {stroke}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
