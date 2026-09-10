'use client';

import React from 'react';
import { Waves, Sparkles, Guitar, Piano, Radio, Activity, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export const Header: React.FC = () => {
  const {
    analysis,
    backendConnected,
    activeInstrument,
    setActiveInstrument,
    transposedCurrentChord,
    isPlaying
  } = usePlayerStore();

  return (
    <header className="w-full border-b border-white/[0.06] bg-[#05070d]/80 backdrop-blur-2xl sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sonara Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer">
            {/* Glowing ambient aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
            
            {/* Monogram Box */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-[#181c2e] to-[#0a0d18] border border-white/10 p-0.5 shadow-2xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)]">
                Sonara
              </h1>
              <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                AUDIO MIR STUDIO
              </span>

              {/* Live Equalizer Animation */}
              <div className="flex items-end gap-0.5 h-4 ml-1">
                <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? 'eq-bar-1' : 'h-1.5 opacity-40'}`} />
                <span className={`w-1 bg-indigo-400 rounded-full ${isPlaying ? 'eq-bar-2' : 'h-2.5 opacity-40'}`} />
                <span className={`w-1 bg-cyan-400 rounded-full ${isPlaying ? 'eq-bar-3' : 'h-3 opacity-40'}`} />
                <span className={`w-1 bg-violet-400 rounded-full ${isPlaying ? 'eq-bar-4' : 'h-1 opacity-40'}`} />
              </div>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium hidden sm:block">
              Intelligent Audio MIR & Harmonic Visualizer
            </p>
          </div>
        </div>

        {/* Current Track & Key Info (Center Deck) */}
        {analysis && (
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-2xl bg-[#0b0e1b]/80 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200 max-w-[170px] truncate tracking-tight">
                {analysis.title}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {analysis.artist || 'Studio Master'}
              </p>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            
            {/* Key Pill with Golden Gradient */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Key</span>
              <span className="text-xs font-black text-amber-200">{analysis.key}</span>
            </div>

            {/* BPM Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">
                {analysis.bpm} <span className="text-[10px] font-normal text-slate-400">BPM</span>
              </span>
            </div>

            {/* Active Chord Beacon */}
            {transposedCurrentChord && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">CHORD:</span>
                <span className="text-sm font-black text-emerald-300 tracking-wide font-[family-name:var(--font-outfit)]">
                  {transposedCurrentChord}
                </span>
              </div>
            )}

            {/* AI Harmonic Refinement Pill */}
            {analysis.aiRefined && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500/25 via-indigo-500/25 to-pink-500/25 border border-purple-400/50 text-purple-200 text-xs font-black shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                title={analysis.aiNotes || "Chords harmonically refined by AI"}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="tracking-wide">AI REFINED</span>
              </div>
            )}
          </div>
        )}

        {/* Right Section: Instrument Selector & Engine / AI Badges */}
        <div className="flex items-center gap-2.5">
          {/* Glass Instrument Selector */}
          <div className="flex items-center bg-[#0d1122]/90 p-1 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setActiveInstrument('both')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeInstrument === 'both'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Instruments
            </button>
            <button
              onClick={() => setActiveInstrument('guitar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeInstrument === 'guitar'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Guitar className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guitar</span>
            </button>
            <button
              onClick={() => setActiveInstrument('piano')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeInstrument === 'piano'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Piano className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Piano</span>
            </button>
          </div>

          {/* AI Status Badge (Permanent) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border bg-gradient-to-r from-purple-950/50 to-indigo-950/50 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            title="AI Harmonic Refinement Online & Ready"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI Active</span>
          </div>

          {/* Engine Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              backendConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-amber-950/30 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
            }`}
            title={backendConnected ? 'FastAPI Librosa Engine Active' : 'Client-Side Offline MIR Fallback Active'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden lg:inline">
              {backendConnected ? 'MIR Engine' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
