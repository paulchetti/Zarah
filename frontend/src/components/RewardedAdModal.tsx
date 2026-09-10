'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Music2, ExternalLink, ShieldCheck, Timer, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-[#090d1a] border border-white/10 rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100 flex flex-col my-auto">
        {/* Ambient atmospheric backdrop glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sponsor Supported
            </span>
            <span className="text-xs text-slate-400">Free Access</span>
          </div>

          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Verified
          </span>
        </div>

        {/* Music Icon & Title */}
        <div className="text-center my-2 relative z-10 flex flex-col items-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/20 border border-white/15 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(99,102,241,0.25)] mb-3">
            <Music2 className="w-6 h-6 text-amber-300 animate-pulse-slow" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">
            Audio Extraction Complete!
          </h3>

          <p className="text-xs text-slate-300 mt-1 max-w-sm px-2">
            {songTitle ? (
              <>Harmonics and chords for <span className="text-indigo-300 font-semibold">{songTitle}</span> are ready.</>
            ) : (
              'Your musical chord progression, rhythm, and beat grid are ready.'
            )}
          </p>
        </div>

        {/* Dynamic State: Before Click vs 20s Countdown */}
        {!hasStarted ? (
          <div className="mt-4 relative z-10 flex flex-col gap-3">
            {/* Step Explanation Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] text-xs space-y-2">
              <div className="flex items-start gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Click the button below to open our sponsor page.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Stay on the sponsor page for <strong className="text-amber-300">at least 20 seconds</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>After 20 seconds, this box closes and your chords launch automatically!</span>
              </div>
            </div>

            {/* Click to Start Action */}
            <button
              onClick={handleStartUnlock}
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Open Sponsor to Start 20s Unlock</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        ) : (
          <div className="mt-4 relative z-10 flex flex-col gap-3">
            {/* Active 20-second Countdown Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-300 text-sm font-semibold mb-2">
                <Timer className="w-4 h-4 animate-spin text-amber-400" />
                <span>Sponsor Opened — Verifying 20s Visit</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5 my-3">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Time on sponsor:</span>
                <span className="text-amber-300 font-bold text-sm">
                  {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Launching chords...'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                Please stay on the opened sponsor page for 20 seconds. This box will automatically close and show your chords when time expires!
              </p>
            </div>

            {/* Locked Countdown Button */}
            <div className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-slate-800/80 text-slate-400 border border-white/5 flex items-center justify-center gap-2">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>Automatically launching chords in {secondsRemaining}s...</span>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-3 relative z-10">
          Viewing this quick sponsor message keeps Zarah AI free for musicians worldwide.
        </p>
      </div>
    </div>
  );
};
