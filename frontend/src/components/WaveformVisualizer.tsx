'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Volume2, VolumeX, Repeat, Clock, Radio } from 'lucide-react';

export const WaveformVisualizer: React.FC = () => {
  const {
    audioUrl,
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
    analysis,
    setIsPlaying,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatIndexRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    setIsReady(false);
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4338ca', // Deep electric indigo
      progressColor: '#22d3ee', // Luminous Cyan Neon
      cursorColor: '#f59e0b', // Golden cursor
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 4,
      height: 104,
      normalize: true,
      url: audioUrl,
    });

    ws.on('ready', () => {
      const dur = ws.getDuration();
      setDuration(dur);
      setIsReady(true);
      ws.setPlaybackRate(playbackRate, true);
      ws.setVolume(isMuted ? 0 : volume);
    });

    ws.on('error', (err) => {
      console.warn('WaveSurfer audio loading error:', err);
      setIsReady(false);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => {
      const state = usePlayerStore.getState();
      if (state.isLooping && state.loopA !== null) {
        ws.setTime(state.loopA);
        ws.play();
      } else {
        setIsPlaying(false);
      }
    });

    ws.on('timeupdate', (time) => {
      const state = usePlayerStore.getState();
      // Handle A-B loop boundary clamp
      if (state.isLooping && state.loopA !== null && state.loopB !== null) {
        if (time >= state.loopB) {
          ws.setTime(state.loopA);
          setCurrentTime(state.loopA);
          return;
        }
      }

      setCurrentTime(time);

      // Metronome Click Synthesis on beat timestamps
      if (state.metronomeEnabled && state.analysis?.beatTimes) {
        const beats = state.analysis.beatTimes;
        const currentIdx = nextBeatIndexRef.current;
        if (currentIdx < beats.length && Math.abs(time - beats[currentIdx]) < 0.08) {
          playMetronomeClick(currentIdx % 4 === 0);
          nextBeatIndexRef.current = currentIdx + 1;
        } else if (currentIdx < beats.length && time > beats[currentIdx] + 0.1) {
          nextBeatIndexRef.current = currentIdx + 1;
        } else if (time < (beats[0] || 0)) {
          nextBeatIndexRef.current = 0;
        }
      }
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  // Sync play/pause
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    if (isPlaying && !wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play().catch(console.warn);
    } else if (!isPlaying && wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isReady]);

  // Sync playback rate
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setPlaybackRate(playbackRate, true);
    }
  }, [playbackRate, isReady]);

  // Sync volume
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted, isReady]);

  // Handle external seek
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    const wsTime = wavesurferRef.current.getCurrentTime();
    if (Math.abs(wsTime - currentTime) > 0.35) {
      wavesurferRef.current.setTime(currentTime);
      if (analysis?.beatTimes) {
        const nextIdx = analysis.beatTimes.findIndex(t => t >= currentTime);
        nextBeatIndexRef.current = nextIdx !== -1 ? nextIdx : 0;
      }
    }
  }, [currentTime, isReady]);

  const playMetronomeClick = (isDownbeat: boolean) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isDownbeat ? 1080 : 780, ctx.currentTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Browser autoplay policy handler
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const loopLeftPercent = duration > 0 && loopA !== null ? (loopA / duration) * 100 : 0;
  const loopWidthPercent =
    duration > 0 && loopA !== null && loopB !== null ? Math.max(0, ((loopB - loopA) / duration) * 100) : 0;

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden">
      {/* Ambient reactive waveform backlight */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-cyan-500/10 to-amber-500/10 blur-3xl transition-opacity duration-700 pointer-events-none ${
          isPlaying ? 'opacity-100' : 'opacity-40'
        }`}
      />

      {/* Header Deck: Timecode and Status */}
      <div className="flex items-center justify-between mb-3 text-xs relative z-10">
        <div className="flex items-center gap-3">
          {/* OLED Digital Timecode Display */}
          <div className="flex items-center gap-2 bg-[#05070d] px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-sm font-black text-cyan-300 tracking-wider">
              {formatTime(currentTime)}
            </span>
            <span className="text-slate-400 font-mono text-xs">/ {formatTime(duration)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <span>Harmonic Track:</span>
            <span className="text-slate-200 font-semibold">{analysis?.title || 'Loaded Audio'}</span>
          </div>
        </div>

        {/* Loop status badge */}
        {isLooping && loopA !== null && loopB !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Repeat className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '5s' }} />
            <span>Loop Section: {formatTime(loopA)} - {formatTime(loopB)}</span>
          </div>
        )}
      </div>

      {/* Waveform Surface */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#05070d]/90 border border-white/[0.08] p-3 shadow-inner relative z-10">
        <div ref={containerRef} className="w-full cursor-pointer select-none" />

        {/* A-B Loop Shaded Range Overlay */}
        {isLooping && loopA !== null && loopB !== null && loopWidthPercent > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x-2 border-emerald-400 pointer-events-none transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            style={{
              left: `${loopLeftPercent}%`,
              width: `${loopWidthPercent}%`,
            }}
          >
            <span className="absolute top-2 left-2 text-[9px] font-black text-emerald-200 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow">
              A
            </span>
            <span className="absolute top-2 right-2 text-[9px] font-black text-emerald-200 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow">
              B
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 px-1 relative z-10 font-medium">
        <span>Click or drag directly along waveform to seek</span>
        <span>Pitch-Preserved Time Stretching: <strong className="text-cyan-300">{playbackRate}x</strong></span>
      </div>
    </div>
  );
};
