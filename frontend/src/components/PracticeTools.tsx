'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';
import { transposeKey } from '@/lib/transposition';

export const PracticeTools: React.FC = () => {
  const {
    transposeSemitones,
    capoFret,
    analysis,
    setTranspose,
    setCapo
  } = usePlayerStore();

  const originalKey = analysis?.key || 'G Major';
  const effectiveKey = transposeKey(originalKey, transposeSemitones);

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-outfit)]">
              Harmonic Transposition & Guitar Capo Engine
            </h3>
            <p className="text-xs text-slate-400">Recalculate open shapes and sounding pitch in real time</p>
          </div>
        </div>

        {(transposeSemitones !== 0 || capoFret !== 0) && (
          <button
            onClick={() => {
              setTranspose(0);
              setCapo(0);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pitch Transposition */}
        <div className="bg-[#05070d]/90 p-5 rounded-2xl border border-white/[0.07] flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-200 font-[family-name:var(--font-outfit)]">Pitch Transposition</span>
              <p className="text-[11px] text-slate-400">Shift pitch chromatically (+/- 6 semitones)</p>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-indigo-400 font-mono">
                {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">semitones</span>
            </div>
          </div>

          <div className="flex items-center gap-3 my-3">
            <button
              onClick={() => setTranspose(Math.max(-6, transposeSemitones - 1))}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] text-white font-black text-sm transition-all active:scale-95"
            >
              -1
            </button>
            <input
              type="range"
              min="-6"
              max="6"
              step="1"
              value={transposeSemitones}
              onChange={(e) => setTranspose(parseInt(e.target.value))}
              className="flex-1 accent-indigo-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <button
              onClick={() => setTranspose(Math.min(6, transposeSemitones + 1))}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] text-white font-black text-sm transition-all active:scale-95"
            >
              +1
            </button>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-white/[0.04]">
            <span>Original Key: <strong className="text-slate-200">{originalKey}</strong></span>
            <span>Sounding Key: <strong className="text-indigo-300 font-bold">{effectiveKey}</strong></span>
          </div>
        </div>

        {/* Guitar Capo Position */}
        <div className="bg-[#05070d]/90 p-5 rounded-2xl border border-white/[0.07] flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-200 font-[family-name:var(--font-outfit)]">Guitar Capo Position</span>
              <p className="text-[11px] text-slate-400">Calculates open chord shapes relative to clamp</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-400 font-mono">
                {capoFret === 0 ? 'No Capo' : `Fret ${capoFret}`}
              </span>
            </div>
          </div>

          {/* Capo Fret Buttons (0..7) */}
          <div className="flex items-center justify-between gap-1.5 my-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((fret) => (
              <button
                key={`capo-fret-${fret}`}
                onClick={() => setCapo(fret)}
                className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${
                  capoFret === fret
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-[#0b0e1b] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {fret === 0 ? 'None' : `${fret}`}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
            {capoFret > 0 ? (
              <span className="text-amber-300 font-medium">
                Clamp capo at fret {capoFret} to play open shapes while sounding in {effectiveKey}.
              </span>
            ) : (
              <span>Standard open guitar tuning (E A D G B E).</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
