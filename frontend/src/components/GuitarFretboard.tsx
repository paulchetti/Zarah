'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getGuitarChordData, STANDARD_TUNING_NOTES } from '@/lib/chordData';
import { getCapoChord } from '@/lib/transposition';
import { Guitar, Info, Sparkles } from 'lucide-react';

export const GuitarFretboard: React.FC = () => {
  const {
    transposedCurrentChord,
    capoFret,
    activeInstrument,
    isPlaying
  } = usePlayerStore();

  if (activeInstrument === 'piano') {
    return null;
  }

  const effectiveChord = transposedCurrentChord || 'C';
  const capoInfo = getCapoChord(effectiveChord, capoFret);
  const playedChordName = capoFret > 0 ? capoInfo.playedChord : effectiveChord;
  const chordData = getGuitarChordData(playedChordName);

  // Fretboard layout metrics
  const numFrets = 15;
  const numStrings = 6;
  const width = 880;
  const height = 220;
  const nutWidth = 12;
  const fretboardLeft = 60;
  const fretboardWidth = width - fretboardLeft - 30;
  const fretSpacing = fretboardWidth / numFrets;
  const stringSpacing = (height - 65) / (numStrings - 1);
  const stringTop = 38;

  // Inlay markers
  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFret = 12;

  // Finger badge colors: 1 (Cyan), 2 (Indigo), 3 (Violet), 4 (Rose)
  const fingerColors: Record<number, { fill: string; glow: string; border: string }> = {
    1: { fill: '#06b6d4', glow: 'rgba(6,182,212,0.5)', border: '#67e8f9' },
    2: { fill: '#6366f1', glow: 'rgba(99,102,241,0.5)', border: '#a5b4fc' },
    3: { fill: '#a855f7', glow: 'rgba(168,85,247,0.5)', border: '#d8b4fe' },
    4: { fill: '#f43f5e', glow: 'rgba(244,63,94,0.5)', border: '#fda4af' },
    0: { fill: '#10b981', glow: 'rgba(16,185,129,0.5)', border: '#6ee7b7' },
  };

  // String metallic gauges and colors (from low E to high E)
  const stringSpecs = [
    { gauge: 3.5, color: '#d4af37', shadow: 3 }, // Low E (Wound Nickel/Bronze)
    { gauge: 3.0, color: '#c5a059', shadow: 2.5 }, // A (Wound Nickel)
    { gauge: 2.4, color: '#cbd5e1', shadow: 2 }, // D (Wound Nickel)
    { gauge: 1.8, color: '#e2e8f0', shadow: 1.8 }, // G (Steel)
    { gauge: 1.3, color: '#f1f5f9', shadow: 1.5 }, // B (Steel)
    { gauge: 0.9, color: '#ffffff', shadow: 1.2 }, // High E (Steel)
  ];

  return (
    <div className="w-full bg-[#090d1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Guitar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-outfit)]">
              Artisan Guitar Fretboard
            </h3>
            <p className="text-[11px] text-slate-400">Authentic 6-string fingerings & capo simulation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#05070d] border border-white/[0.08] text-xs shadow-inner">
            <span className="text-slate-400 font-medium">Fingered Shape:</span>
            <span className="font-extrabold text-amber-400 font-[family-name:var(--font-outfit)] text-base">
              {playedChordName}
            </span>
            {capoFret > 0 && (
              <span className="text-[11px] text-indigo-300 ml-1 font-semibold">
                (Sounds: {effectiveChord} with Capo {capoFret})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Fretboard Surface */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[800px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto drop-shadow-2xl select-none"
          >
            <defs>
              {/* African Ebony / Rosewood Rich Woodgrain */}
              <linearGradient id="ebonyWood" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#12100e" />
                <stop offset="25%" stopColor="#1c1815" />
                <stop offset="50%" stopColor="#14110f" />
                <stop offset="75%" stopColor="#221e1a" />
                <stop offset="100%" stopColor="#110f0d" />
              </linearGradient>

              {/* Fret wire nickel specular highlight */}
              <linearGradient id="nickelFret" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Bone Nut Gradient */}
              <linearGradient id="boneNut" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              {/* Polished Golden Brass Capo */}
              <linearGradient id="brassCapo" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Mother-of-pearl Abalone Inlay Gradient */}
              <radialGradient id="pearlInlay" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e0e7ff" />
                <stop offset="90%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#818cf8" />
              </radialGradient>

              <filter id="fretGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Fretboard Wood Slab */}
            <rect
              x={fretboardLeft}
              y={stringTop - 14}
              width={fretboardWidth}
              height={height - 54}
              rx={8}
              fill="url(#ebonyWood)"
              stroke="#292524"
              strokeWidth="2.5"
            />

            {/* Fret Markers / Pearlescent Inlays */}
            {singleDotFrets.map((fret) => {
              const cx = fretboardLeft + (fret - 0.5) * fretSpacing;
              const cy = stringTop + (height - 65) / 2;
              return (
                <circle
                  key={`dot-${fret}`}
                  cx={cx}
                  cy={cy}
                  r={5.5}
                  fill="url(#pearlInlay)"
                  opacity={0.85}
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* 12th Fret Double Pearl Dots */}
            {(() => {
              const cx = fretboardLeft + (doubleDotFret - 0.5) * fretSpacing;
              const y1 = stringTop + stringSpacing * 1.5;
              const y2 = stringTop + stringSpacing * 3.5;
              return (
                <g key="double-dots">
                  <circle cx={cx} cy={y1} r={5} fill="url(#pearlInlay)" opacity={0.85} />
                  <circle cx={cx} cy={y2} r={5} fill="url(#pearlInlay)" opacity={0.85} />
                </g>
              );
            })()}

            {/* Nickel Fret Wires & Fret Numbers */}
            {Array.from({ length: numFrets + 1 }).map((_, f) => {
              const x = fretboardLeft + f * fretSpacing;
              return (
                <g key={`fret-${f}`}>
                  {f > 0 && (
                    <>
                      {/* Shadow behind fret */}
                      <line
                        x1={x + 1}
                        y1={stringTop - 14}
                        x2={x + 1}
                        y2={stringTop + (numStrings - 1) * stringSpacing + 14}
                        stroke="#0a0a0a"
                        strokeWidth={1.5}
                      />
                      {/* Metallic Nickel Fret Wire */}
                      <line
                        x1={x}
                        y1={stringTop - 14}
                        x2={x}
                        y2={stringTop + (numStrings - 1) * stringSpacing + 14}
                        stroke="url(#nickelFret)"
                        strokeWidth={f === 1 ? 3 : 2.2}
                      />
                      {/* Fret number */}
                      <text
                        x={x - fretSpacing / 2}
                        y={height - 8}
                        fill="#71717a"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {f}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Vintage Bone Nut */}
            <rect
              x={fretboardLeft - nutWidth}
              y={stringTop - 14}
              width={nutWidth}
              height={height - 54}
              fill="url(#boneNut)"
              rx={3}
              stroke="#94a3b8"
              strokeWidth="1"
            />

            {/* Golden Brass Capo Clamp */}
            {capoFret > 0 && capoFret <= numFrets && (
              <g id="brass-capo-clamp" className="transition-all duration-300">
                <rect
                  x={fretboardLeft + (capoFret - 1) * fretSpacing + fretSpacing * 0.72}
                  y={stringTop - 20}
                  width={10}
                  height={height - 42}
                  rx={5}
                  fill="url(#brassCapo)"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  filter="url(#fretGlow)"
                />
                <text
                  x={fretboardLeft + (capoFret - 1) * fretSpacing + fretSpacing * 0.72 + 5}
                  y={stringTop - 24}
                  fill="#fef08a"
                  fontSize="9.5"
                  fontWeight="black"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  CAPO {capoFret}
                </text>
              </g>
            )}

            {/* 6 Strings with authentic gauges and shadows */}
            {Array.from({ length: numStrings }).map((_, s) => {
              const y = stringTop + s * stringSpacing;
              const stringNote = STANDARD_TUNING_NOTES[s];
              const fretVal = chordData.frets[s];
              const spec = stringSpecs[s];
              const isStringPlayed = fretVal >= 0;

              return (
                <g key={`string-${s}`}>
                  {/* String Note Badge at Nut */}
                  <text
                    x={fretboardLeft - nutWidth - 28}
                    y={y + 4.5}
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {stringNote}
                  </text>

                  {/* Open / Muted Symbol */}
                  {fretVal === -1 ? (
                    <text
                      x={fretboardLeft - nutWidth - 12}
                      y={y + 4.5}
                      fill="#f43f5e"
                      fontSize="12"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      ✕
                    </text>
                  ) : fretVal === 0 ? (
                    <circle
                      cx={fretboardLeft - nutWidth - 12}
                      cy={y}
                      r={4.5}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  ) : null}

                  {/* Cast shadow under string */}
                  <line
                    x1={fretboardLeft}
                    y1={y + 1.5}
                    x2={fretboardLeft + fretboardWidth}
                    y2={y + 1.5}
                    stroke="#000000"
                    strokeWidth={spec.gauge}
                    opacity={0.6}
                  />

                  {/* Metallic String */}
                  <line
                    x1={fretboardLeft}
                    y1={y}
                    x2={fretboardLeft + fretboardWidth}
                    y2={y}
                    stroke={spec.color}
                    strokeWidth={spec.gauge}
                    opacity={0.9}
                  />

                  {/* Subtle vibrating ripple if chord is playing */}
                  {isPlaying && isStringPlayed && (
                    <line
                      x1={fretboardLeft}
                      y1={y}
                      x2={fretboardLeft + fretboardWidth}
                      y2={y}
                      stroke="#38bdf8"
                      strokeWidth={1}
                      opacity={0.35}
                    />
                  )}
                </g>
              );
            })}

            {/* Barre Chord Indicator Bar */}
            {chordData.barres && chordData.barres.length > 0 && (
              <g id="barre-indicators">
                {chordData.barres.map((barreFret) => {
                  const x = fretboardLeft + (barreFret - 0.5) * fretSpacing;
                  const y1 = stringTop - 6;
                  const y2 = stringTop + 5 * stringSpacing + 6;
                  return (
                    <rect
                      key={`barre-${barreFret}`}
                      x={x - 11}
                      y={y1}
                      width={22}
                      height={y2 - y1}
                      rx={11}
                      fill="#6366f1"
                      opacity={0.35}
                      stroke="#818cf8"
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}

            {/* Fingering Circles / Touchpoints with Neon Halo */}
            {chordData.frets.map((fretVal, stringIdx) => {
              if (fretVal <= 0) return null;

              const x = fretboardLeft + (fretVal - 0.5) * fretSpacing;
              const y = stringTop + stringIdx * stringSpacing;
              const finger = chordData.fingers[stringIdx] || 1;
              const colorInfo = fingerColors[finger] || fingerColors[1];

              return (
                <g key={`finger-${stringIdx}-${fretVal}`} className="transition-all duration-300">
                  {/* Outer pulse aura */}
                  <circle
                    cx={x}
                    cy={y}
                    r={15}
                    fill={colorInfo.fill}
                    opacity={0.35}
                    filter="url(#fretGlow)"
                  />
                  {/* Main finger dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={11}
                    fill={colorInfo.fill}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Finger number (1..4) */}
                  <text
                    x={x}
                    y={y + 4}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="black"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {finger}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Fingering Color Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-4 pt-3.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-slate-300 font-[family-name:var(--font-outfit)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Fingers:
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] inline-block" /> 1: Index
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] inline-block" /> 2: Middle
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] inline-block" /> 3: Ring
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] inline-block" /> 4: Pinky
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-[11px] font-semibold text-slate-400">
          <span><strong className="text-emerald-400">O</strong> = Open String</span>
          <span><strong className="text-rose-400">✕</strong> = Muted String</span>
        </div>
      </div>
    </div>
  );
};
