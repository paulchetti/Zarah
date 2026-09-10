'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Bell,
  Gauge
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export const PlayerControls: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    loopA,
    loopB,
    isLooping,
    metronomeEnabled,
    setIsPlaying,
    setCurrentTime,
    setPlaybackRate,
    setVolume,
    toggleMute,
    toggleMetronome,
    setLoopA,
    setLoopB,
    toggleLoop,
    clearLoop
  } = usePlayerStore();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (deltaSeconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
    setCurrentTime(newTime);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const speeds = [0.5, 0.75, 1.0, 1.25];

  return (
    <div className="w-full bg-[#0b0e1b]/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-6 flex flex-col md:flex-row items-center justify-between gap-5 relative">
      {/* Primary Transport Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReplay}
          title="Restart from beginning"
          className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleSeek(-5)}
          title="Rewind 5 seconds"
          className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 shadow-sm"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Center Illuminated Play/Pause Button */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/40 via-indigo-500/40 to-cyan-400/40 rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
          <button
            onClick={handlePlayPause}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white drop-shadow" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5 drop-shadow" />
            )}
          </button>
        </div>

        <button
          onClick={() => handleSeek(5)}
          title="Forward 5 seconds"
          className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 shadow-sm"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Selector (Pitch Preserved) */}
      <div className="flex items-center gap-2 bg-[#060810] px-3.5 py-2 rounded-2xl border border-white/[0.08] shadow-inner">
        <Gauge className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-400 mr-1 font-[family-name:var(--font-outfit)]">Tempo:</span>
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackRate(s)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                playbackRate === s
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {playbackRate === s && <span className="w-1 h-1 rounded-full bg-cyan-300" />}
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* A-B Section Loop Deck */}
      <div className="flex items-center gap-2 bg-[#060810] px-3.5 py-2 rounded-2xl border border-white/[0.08] shadow-inner">
        <button
          onClick={() => setLoopA(currentTime)}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all ${
            loopA !== null
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Set Loop Start (A) to current playback position"
        >
          A {loopA !== null ? `(${loopA.toFixed(1)}s)` : ''}
        </button>

        <button
          onClick={() => setLoopB(currentTime)}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all ${
            loopB !== null
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Set Loop End (B) to current playback position"
        >
          B {loopB !== null ? `(${loopB.toFixed(1)}s)` : ''}
        </button>

        <button
          onClick={toggleLoop}
          className={`px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            isLooping
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
              : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Loop</span>
        </button>

        {(loopA !== null || loopB !== null) && (
          <button
            onClick={clearLoop}
            className="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Metronome & Volume Controls */}
      <div className="flex items-center gap-4">
        {/* Metronome Toggle */}
        <button
          onClick={toggleMetronome}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
            metronomeEnabled
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#060810] border-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Toggle Metronome Audio Click"
        >
          <Bell className={`w-4 h-4 ${metronomeEnabled ? 'text-amber-400 animate-bounce' : ''}`} />
          <span className="hidden sm:inline">Click</span>
        </button>

        {/* Volume Controls with Gradient Accent */}
        <div className="flex items-center gap-2.5 bg-[#060810] px-3.5 py-2 rounded-2xl border border-white/[0.08] shadow-inner">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 sm:w-24 accent-cyan-400 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
