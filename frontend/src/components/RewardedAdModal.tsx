'use client';

import React from 'react';
import { Sparkles, Music2, ExternalLink, ShieldCheck } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleOnClickAd = () => {
    // 1. Open Monetag On-Click Sponsor in a new tab
    if (typeof window !== 'undefined' && MONETAG_DIRECT_LINK) {
      try {
        window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Pop-up blocker caught direct link, continuing unlock:', err);
      }
    }
    // 2. Immediately unlock the chords & player in Zarah
    onRewardEarned();
  };

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
        <div className="text-center my-3 relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/20 border border-white/15 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(99,102,241,0.25)] mb-3">
            <Music2 className="w-7 h-7 text-amber-300 animate-pulse-slow" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">
            Audio Extraction Complete!
          </h3>

          <p className="text-xs text-slate-300 mt-1.5 max-w-sm px-2">
            {songTitle ? (
              <>Harmonics and chords for <span className="text-indigo-300 font-semibold">{songTitle}</span> are processed.</>
            ) : (
              'Your musical chord progression, rhythm, and beat grid are ready.'
            )}
          </p>
        </div>

        {/* Single On-Click Unlock Action Button */}
        <div className="mt-5 relative z-10 flex flex-col gap-2">
          <button
            onClick={handleOnClickAd}
            className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Click to View Chords & Tabs</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80" />
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
            Clicking opens our sponsor page in a background tab and unlocks your song instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
