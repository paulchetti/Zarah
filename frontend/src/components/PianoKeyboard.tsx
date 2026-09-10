'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getPianoChordData, CHROMATIC_SCALE } from '@/lib/chordData';
import { Piano, Sparkles } from 'lucide-react';

export const PianoKeyboard: React.FC = () => {
  const { transposedCurrentChord, activeInstrument } = usePlayerStore();

  if (activeInstrument === 'guitar') {
    return null;
  }

  const effectiveChord = transposedCurrentChord || 'C';
  const pianoData = getPianoChordData(effectiveChord);
  const activePitchClasses = new Set(pianoData.notes);

  // Keyboard range: C3 through C5 (15 white keys total)
  const whiteKeyNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const octaves = [3, 4];
  
  interface WhiteKey {
    note: string;
    octave: number;
    fullName: string;
    midi: number;
    x: number;
  }

  interface BlackKey {
    note: string;
    octave: number;
    fullName: string;
    midi: number;
    x: number;
  }

  const keyWidth = 46;
  const whiteKeyHeight = 158;
  const blackKeyWidth = 28;
  const blackKeyHeight = 100;

  const whiteKeys: WhiteKey[] = [];
  const blackKeys: BlackKey[] = [];

  let whiteIndex = 0;

  octaves.forEach((oct) => {
    whiteKeyNotes.forEach((n) => {
      const midi = (oct + 1) * 12 + CHROMATIC_SCALE.indexOf(n);
      whiteKeys.push({
        note: n,
        octave: oct,
        fullName: `${n}${oct}`,
        midi,
        x: whiteIndex * keyWidth,
      });
      whiteIndex++;
    });
  });

  // Add final high C5
  whiteKeys.push({
    note: 'C',
    octave: 5,
    fullName: 'C5',
    midi: 72,
    x: whiteIndex * keyWidth,
  });

  // Black keys positions relative to white keys
  const blackKeyOffsets: Record<string, number> = {
    'C#': 0.68,
    'D#': 1.72,
    'F#': 3.68,
    'G#': 4.70,
    'A#': 5.72,
  };

  octaves.forEach((oct, octIdx) => {
    const octBaseX = octIdx * 7 * keyWidth;
    Object.entries(blackKeyOffsets).forEach(([note, offsetRatio]) => {
      const midi = (oct + 1) * 12 + CHROMATIC_SCALE.indexOf(note);
      blackKeys.push({
        note,
        octave: oct,
        fullName: `${note}${oct}`,
        midi,
        x: octBaseX + offsetRatio * keyWidth - blackKeyWidth / 2,
      });
    });
  });

  const totalWidth = whiteKeys.length * keyWidth;

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Piano className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-outfit)]">
              Concert Grand Piano
            </h3>
            <p className="text-[11px] text-slate-400">Harmonic pitch voice distribution (C3 - C5)</p>
          </div>
        </div>

        {/* Chord Constituent Notes */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Notes in {effectiveChord}:</span>
          <div className="flex items-center gap-1.5">
            {pianoData.notes.map((n, i) => (
              <span
                key={n}
                className={`px-2.5 py-1 text-xs font-black rounded-xl border shadow-sm font-[family-name:var(--font-outfit)] ${
                  i === 0
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#05070d] text-cyan-300 border-white/10'
                }`}
              >
                {n} {i === 0 && <span className="text-[9px] font-normal opacity-75">(Root)</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Piano Keyboard Surface */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          <svg
            viewBox={`0 0 ${totalWidth} ${whiteKeyHeight + 22}`}
            className="w-full h-auto drop-shadow-2xl select-none"
          >
            <defs>
              {/* Natural Ivory Key Gradient */}
              <linearGradient id="ivoryNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              {/* Active White Key Illuminated Gradient */}
              <linearGradient id="ivoryActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Ebony Black Key Gradient */}
              <linearGradient id="ebonyNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="10%" stopColor="#18181b" />
                <stop offset="90%" stopColor="#09090b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Active Black Key Illuminated Gradient */}
              <linearGradient id="ebonyActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              <filter id="pianoHalo" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* White Keys */}
            {whiteKeys.map((k) => {
              const isPressed = activePitchClasses.has(k.note);
              return (
                <g key={k.fullName} className="transition-all duration-200">
                  {/* Subtle cast shadow */}
                  <rect
                    x={k.x + 1}
                    y={6}
                    width={keyWidth - 3}
                    height={whiteKeyHeight}
                    rx={5}
                    fill="#000000"
                    opacity={0.3}
                  />
                  {/* Key Body */}
                  <rect
                    x={k.x}
                    y={5}
                    width={keyWidth - 2}
                    height={whiteKeyHeight}
                    rx={5}
                    fill={isPressed ? 'url(#ivoryActive)' : 'url(#ivoryNormal)'}
                    stroke={isPressed ? '#bae6fd' : '#94a3b8'}
                    strokeWidth={isPressed ? 1.5 : 1}
                    filter={isPressed ? 'url(#pianoHalo)' : undefined}
                    className="cursor-pointer hover:brightness-105"
                  />
                  {/* Note Label at bottom */}
                  <text
                    x={k.x + (keyWidth - 2) / 2}
                    y={whiteKeyHeight - 14}
                    fill={isPressed ? '#ffffff' : '#334155'}
                    fontSize="12"
                    fontWeight="black"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {k.note}
                  </text>
                  {k.note === 'C' && (
                    <text
                      x={k.x + (keyWidth - 2) / 2}
                      y={whiteKeyHeight - 28}
                      fill={isPressed ? '#f0f9ff' : '#64748b'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {k.octave}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Black Keys */}
            {blackKeys.map((k) => {
              const isPressed = activePitchClasses.has(k.note);
              return (
                <g key={k.fullName} className="transition-all duration-200">
                  {/* Shadow beneath black key */}
                  <rect
                    x={k.x + 2}
                    y={7}
                    width={blackKeyWidth}
                    height={blackKeyHeight}
                    rx={4}
                    fill="#000000"
                    opacity={0.55}
                  />
                  {/* Black Key Body */}
                  <rect
                    x={k.x}
                    y={5}
                    width={blackKeyWidth}
                    height={blackKeyHeight}
                    rx={4}
                    fill={isPressed ? 'url(#ebonyActive)' : 'url(#ebonyNormal)'}
                    stroke={isPressed ? '#ddd6fe' : '#09090b'}
                    strokeWidth={isPressed ? 1.5 : 1}
                    filter={isPressed ? 'url(#pianoHalo)' : undefined}
                    className="cursor-pointer hover:brightness-125"
                  />
                  {isPressed && (
                    <text
                      x={k.x + blackKeyWidth / 2}
                      y={blackKeyHeight - 12}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="black"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {k.note}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
