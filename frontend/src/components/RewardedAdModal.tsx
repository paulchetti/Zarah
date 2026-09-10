'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Play, Volume2, VolumeX, ShieldCheck, X } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  songTitle?: string;
  onRewardEarned: () => void;
  onClose?: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  songTitle,
  onRewardEarned,
  onClose
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Reset timer when opened
  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setIsCompleted(false);
      return;
    }

    // Check if Google Ad Manager / Google Publisher Tag rewarded slot is present
    const googletag = (typeof window !== 'undefined' && (window as any).googletag) || null;
    const hasGoogleRewarded = Boolean(googletag && googletag.apiReady && (window as any).__hasRewardedSlot);

    if (hasGoogleRewarded) {
      // If live Google Ad Manager is configured on production domain
      try {
        googletag.cmd.push(() => {
          if ((window as any).__rewardedSlot) {
            googletag.display((window as any).__rewardedSlot);
          }
        });
      } catch (err) {
        console.warn('Live Google rewarded slot display error, falling back to simulator:', err);
      }
    }

    // 5-second countdown timer for rewarded unlock (works on localhost & fallback)
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const MONETAG_DIRECT_LINK =
    process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK || 'https://omg10.com/4/11765775';

  const handleAdClick = () => {
    if (typeof window !== 'undefined' && MONETAG_DIRECT_LINK) {
      window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClaim = () => {
    // Open Monetag rewarded sponsor link in a new tab
    if (typeof window !== 'undefined' && MONETAG_DIRECT_LINK) {
      try {
        window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Pop-up blocker caught direct link, continuing reward:', err);
      }
    }
    // Grant reward and unlock chords in Zarah
    onRewardEarned();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#090d1a] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden text-slate-100 flex flex-col">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sponsor Message
            </span>
            <span className="text-xs text-slate-400">Rewarded Access</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              title="Close without unlocking"
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-4 relative z-10">
          <h3 className="text-lg font-bold tracking-tight text-white">
            Audio Extraction Complete!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {songTitle ? (
              <>Harmonics and chords for <span className="text-indigo-300 font-semibold">{songTitle}</span> are ready to view.</>
            ) : (
              'Your musical chord progression is fully processed and ready to play.'
            )}
          </p>
        </div>

        {/* Ad Video / Interactive Preview Creative */}
        <div
          onClick={handleAdClick}
          title="Click to visit sponsor"
          className="relative z-10 w-full h-52 bg-slate-950/80 rounded-2xl border border-white/[0.08] hover:border-indigo-500/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner group transition-all"
        >
          {/* Simulated Ad Visual Graphic */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-purple-900/20 to-amber-950/30" />
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Play className="w-6 h-6 fill-indigo-400 text-indigo-400 translate-x-0.5" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                Sponsored Partner
              </p>
              <h4 className="text-sm font-semibold text-white mt-0.5">
                Zarah Pro Audio Studio
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                AI Harmonic separation, Capo transposer, and real-time interactive fretboard visualizer.
              </p>
            </div>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-slate-400 hover:text-white transition-colors border border-white/10 text-xs flex items-center gap-1"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Ad badge tag */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-400 border border-white/10 uppercase tracking-wider font-mono">
            Ad • 5s
          </div>
        </div>

        {/* Progress & Countdown status */}
        <div className="mt-4 relative z-10">
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5 mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${((5 - secondsRemaining) / 5) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Verified Sponsor
            </span>
            <span className="font-mono text-slate-300">
              {isCompleted ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reward Ready
                </span>
              ) : (
                `Reward unlocks in ${secondsRemaining}s`
              )}
            </span>
          </div>
        </div>

        {/* Unlock Action Button */}
        <div className="mt-5 relative z-10 flex gap-3">
          <button
            onClick={handleClaim}
            disabled={!isCompleted}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              isCompleted
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer scale-[1.01]'
                : 'bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Unlock Chords & Fretboard
              </>
            ) : (
              `Please wait ${secondsRemaining}s to unlock`
            )}
          </button>
        </div>

        {/* Legal / User Notice */}
        <p className="text-[10px] text-slate-400 text-center mt-3 relative z-10">
          Viewing this quick sponsor message keeps Zarah AI free for musicians worldwide.
        </p>
      </div>
    </div>
  );
};
