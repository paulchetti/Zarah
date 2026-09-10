'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { AudioUploader } from '@/components/AudioUploader';
import { WaveformVisualizer } from '@/components/WaveformVisualizer';
import { PlayerControls } from '@/components/PlayerControls';
import { ChordTimeline } from '@/components/ChordTimeline';
import { PracticeTools } from '@/components/PracticeTools';
import { GuitarFretboard } from '@/components/GuitarFretboard';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { StrummingPatternVisualizer } from '@/components/StrummingPatternVisualizer';
import { usePlayerStore } from '@/store/usePlayerStore';
import { checkBackendHealth } from '@/lib/api';
import { Sparkles, Waves, Disc } from 'lucide-react';

export default function Home() {
  const { setBackendConnected } = usePlayerStore();

  useEffect(() => {
    const verifyBackend = async () => {
      const isOnline = await checkBackendHealth();
      setBackendConnected(isOnline);
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 10000);
    return () => clearInterval(interval);
  }, [setBackendConnected]);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Floating Atmospheric Ambient Auroras */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '5s' }} />

      {/* Main Studio Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-2 relative z-10">
        {/* Audio Ingestion & Studio Master Tracks */}
        <AudioUploader />

        {/* Audio Waveform Visualizer & Looper */}
        <WaveformVisualizer />

        {/* Master Transport & Speed Controls */}
        <PlayerControls />

        {/* Harmonic Progression Timeline Ribbon */}
        <ChordTimeline />

        {/* Transposition & Capo Tools */}
        <PracticeTools />

        {/* Instrument Visualizers */}
        <div className="grid grid-cols-1 gap-2">
          <GuitarFretboard />
          <PianoKeyboard />
        </div>

        {/* Rhythm & Strumming Pattern Estimator */}
        <StrummingPatternVisualizer />
      </main>

      {/* Studio Master Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#030408]/90 py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-tight font-[family-name:var(--font-outfit)] text-sm">
              Zarah
            </span>
            <span className="text-slate-400">•</span>
            <span>Intelligent Audio MIR & Harmonic Visualizer</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors">
              <Waves className="w-3.5 h-3.5 text-indigo-400" /> Librosa & SciPy DSP
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
              <Disc className="w-3.5 h-3.5 text-cyan-400" /> Next.js 14 & Wavesurfer
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Web Audio API
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
