'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  Music2,
  FileAudio,
  AlertCircle,
  Loader2,
  Disc3,
  Play
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { analyzeAudioFile, analyzeAudioUrl, isYouTubeUrl, AnalysisResult } from '@/lib/api';
import { PRELOADED_SAMPLE_SONGS } from '@/lib/mockAnalysis';
import { RewardedAdModal } from './RewardedAdModal';

// Bespoke artwork gradients for the 3 master sample tracks
const SAMPLE_THEMES: Record<string, { gradient: string; accent: string; badge: string; iconColor: string }> = {
  'acoustic-pop': {
    gradient: 'from-amber-500/20 via-orange-600/15 to-transparent',
    accent: 'border-amber-500/40 hover:border-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  'blues-progression': {
    gradient: 'from-indigo-600/25 via-blue-600/15 to-transparent',
    accent: 'border-indigo-500/40 hover:border-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    iconColor: 'text-indigo-400'
  },
  'ballad': {
    gradient: 'from-teal-500/20 via-cyan-600/15 to-transparent',
    accent: 'border-teal-500/40 hover:border-teal-400',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    iconColor: 'text-teal-400'
  }
};

export const AudioUploader: React.FC = () => {
  const { setAnalysis, setLoading, isLoading, analysis } = usePlayerStore();
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlLoadingStatus, setUrlLoadingStatus] = useState<string | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<AnalysisResult | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRewardEarned = () => {
    if (pendingAnalysis) {
      setAnalysis(pendingAnalysis);
      setPendingAnalysis(null);
    }
    setShowRewardedAd(false);
  };

  const handleCloseAd = () => {
    setShowRewardedAd(false);
    setPendingAnalysis(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const validTypes = [
      'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a',
      'audio/ogg', 'audio/mpeg', 'audio/opus', 'audio/webm', 'audio/flac',
      'audio/aac', 'audio/x-aac', 'audio/mp4'
    ];
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac', '.opus', '.webm', '.weba', '.wma', '.mp4'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setErrorMessage('Please upload a supported audio format (MP3, WAV, M4A, OGG, OPUS, AAC).');
      return;
    }

    setLoading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const result = await analyzeAudioFile(file, objectUrl);
      // Gate extraction behind Rewarded Ad before setting active analysis
      setPendingAnalysis(result);
      setShowRewardedAd(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process audio file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    setErrorMessage(null);
    setLoading(true);
    const isYT = isYouTubeUrl(cleanUrl);
    setUrlLoadingStatus(
      isYT
        ? 'Extracting audio stream from YouTube & computing musical harmonics...'
        : 'Downloading audio stream & computing musical harmonics...'
    );

    try {
      const result = await analyzeAudioUrl(cleanUrl);
      // Gate extraction behind Rewarded Ad before setting active analysis
      setPendingAnalysis(result);
      setShowRewardedAd(true);
      setUrlInput('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to analyze audio stream from URL.');
    } finally {
      setLoading(false);
      setUrlLoadingStatus(null);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = PRELOADED_SAMPLE_SONGS.find(s => s.id === sampleId);
    if (sample) {
      setAnalysis(sample);
      setErrorMessage(null);
    }
  };

  return (
    <div className="w-full bg-[#090d1a]/70 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-6 relative overflow-hidden">
      {/* Decorative ambient backdrop flare */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pre-loaded Studio Master Songs */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-[family-name:var(--font-outfit)]">
              Studio Demo Tracks
            </label>
            <span className="text-[10px] text-slate-400 ml-1 font-medium">
              (Instant ground-truth MIR analysis)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Select to audition</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {PRELOADED_SAMPLE_SONGS.map((sample) => {
            const isSelected = analysis?.id === sample.id;
            const theme = SAMPLE_THEMES[sample.id || 'acoustic-pop'] || SAMPLE_THEMES['acoustic-pop'];

            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id!)}
                disabled={isLoading}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                  isSelected
                    ? `bg-gradient-to-br ${theme.gradient} bg-[#111628] border-indigo-400/80 shadow-[0_0_25px_rgba(99,102,241,0.2)] scale-[1.02]`
                    : `bg-[#0b0e1b]/90 border-white/[0.07] hover:border-white/20 hover:bg-[#0f1426] hover:-translate-y-0.5`
                }`}
              >
                {/* Vinyl Record Icon & Header */}
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center ${theme.iconColor}`}>
                      <Disc3 className={`w-4 h-4 ${isSelected ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {sample.title}
                      </h2>
                      <p className="text-[10px] text-slate-400">{sample.artist}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                    {sample.key}
                  </span>
                </div>

                {/* Chords Sequence Preview */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-auto pt-2 border-t border-white/[0.04]">
                  <span className="font-mono text-slate-300 font-semibold tracking-tight truncate">
                    {sample.chords.map(c => c.chord).slice(0, 4).join(' → ')}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{sample.bpm} BPM</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Ingestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Drag & Drop Audio File Zone */}
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[135px] ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_25px_rgba(99,102,241,0.3)] scale-[1.01]'
                : 'border-white/[0.1] hover:border-indigo-500/50 bg-[#070a14]/80 hover:bg-[#0b0f1f]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.flac,.opus,.webm,.weba,.aac,.wma"
              onChange={handleFileChange}
              className="hidden"
            />
            {isLoading ? (
              <div className="flex flex-col items-center gap-2.5">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                <p className="text-xs font-bold text-slate-200">
                  Extracting Chromagram, Beats & Harmonics with MIR...
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2.5 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  Drop MP3, WAV, OPUS, or M4A audio here, or <span className="text-indigo-400 underline decoration-indigo-400/40">browse file</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">MP3</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">WAV</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">OPUS</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">M4A</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Audio & YouTube URL Input Bar */}
        <div className="flex flex-col justify-center">
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Analyze from YouTube or Audio URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  YouTube Supported
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  AI Refined
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                className="flex-1 bg-[#070a14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                {isLoading && urlLoadingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Analyze'}
              </button>
            </div>

            {urlLoadingStatus ? (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 flex-shrink-0" />
                <span className="font-medium">{urlLoadingStatus}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Paste any YouTube link (<span className="text-slate-300 font-medium">watch, share, shorts</span>) or direct audio URL. Zarah extracts the audio stream and computes chords, key & rhythm.
              </p>
            )}
          </form>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rewarded Ad Gate Modal */}
      <RewardedAdModal
        isOpen={showRewardedAd}
        songTitle={pendingAnalysis?.title}
        onRewardEarned={handleRewardEarned}
        onClose={handleCloseAd}
      />
    </div>
  );
};
