'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Music2, ExternalLink, ShieldCheck, Timer } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  songTitle?: string;
  onRewardEarned: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  songTitle,
  onRewardEarned,
}) => {
  const MONETAG_DIRECT_LINK =
    process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK || 'https://omg10.com/4/11765775';

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setSecondsRemaining(20);
    }
  }, [isOpen]);

  // 20-second countdown that runs once the user clicks to visit the sponsor
  useEffect(() => {
    if (!isOpen || !hasStarted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Automatically close modal and launch chords after 20 seconds!
          setTimeout(() => {
            onRewardEarned();
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, hasStarted, onRewardEarned]);

  if (!isOpen) return null;

  const handleStartUnlock = () => {
    // 1. Open the Monetag sponsor ad in a new tab
    if (typeof window !== 'undefined' && MONETAG_DIRECT_LINK) {
      try {
        window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Pop-up blocker intercepted link:', err);
      }
    }
    // 2. Start the 20-second verification countdown
    setHasStarted(true);
  };

  const progressPercent = Math.min(100, Math.max(0, ((20 - secondsRemaining) / 20) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md bg-[#090d1a] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100 flex flex-col m-auto">
        {/* Ambient atmospheric backdrop glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Sponsor Supported
          </span>

          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Verified Free Access
          </span>
        </div>

        {/* Music Title Row */}
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/20 border border-white/15 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-lg">
            <Music2 className="w-5 h-5 text-amber-300 animate-pulse-slow" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              Audio Extraction Complete! 🎵
            </h3>
            <p className="text-xs text-slate-300 truncate">
              {songTitle ? songTitle : 'Chords & beat grid ready.'}
            </p>
          </div>
        </div>

        {/* Dynamic Action: Before Click vs Active 20s Countdown */}
        {!hasStarted ? (
          <div className="relative z-10 flex flex-col gap-2.5">
            {/* Clear, Compact Instruction */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-xs text-slate-300 space-y-1">
              <p className="font-medium text-white flex items-center gap-1.5">
                <span>👉</span> Stay on the sponsor page for <strong>at least 20 seconds</strong>.
              </p>
              <p className="text-[11px] text-emerald-400">
                ✓ Once 20 seconds are up, this box closes and your chords launch automatically!
              </p>
            </div>

            {/* BIG PROMINENT BUTTON - 100% VISIBLE */}
            <button
              onClick={handleStartUnlock}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Open Sponsor & Unlock (20s)</span>
              <ExternalLink className="w-4 h-4 text-white/80" />
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col gap-2.5">
            {/* Active 20-second Countdown Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
                <Timer className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Sponsor Opened — Verifying 20s Visit</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5 my-2.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Time on sponsor:</span>
                <span className="text-amber-300 font-bold text-xs sm:text-sm">
                  {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Launching chords...'}
                </span>
              </div>
            </div>

            {/* Countdown notice */}
            <div className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800/80 text-slate-300 border border-white/5 flex items-center justify-center gap-1.5 text-center">
              <Timer className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Automatically closing & launching in {secondsRemaining}s...</span>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-2.5 relative z-10">
          Viewing this quick sponsor message keeps Zarah AI free for musicians worldwide.
        </p>
      </div>
    </div>
  );
};
