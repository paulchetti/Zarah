import { create } from 'zustand';
import { AnalysisResult, ChordEvent } from '@/lib/types';
import { transposeChord, getCapoChord } from '@/lib/transposition';
import { PRELOADED_SAMPLE_SONGS } from '@/lib/mockAnalysis';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  metronomeEnabled: boolean;
  
  // Active Chord Tracking
  activeChordIndex: number;
  currentChord: string | null;
  nextChord: string | null;
  transposedCurrentChord: string | null;
  transposedNextChord: string | null;
  capoPlayedChord: string | null;

  // Practice Controls
  loopA: number | null;
  loopB: number | null;
  isLooping: boolean;
  transposeSemitones: number;
  capoFret: number;

  // Song & Audio State
  analysis: AnalysisResult | null;
  audioUrl: string | null;
  isLoading: boolean;
  backendConnected: boolean;
  useAiChords: boolean;
  activeInstrument: 'both' | 'guitar' | 'piano';

  // Actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleMetronome: () => void;
  toggleAiChords: () => void;
  setLoopA: (time: number | null) => void;
  setLoopB: (time: number | null) => void;
  toggleLoop: () => void;
  clearLoop: () => void;
  setTranspose: (semitones: number) => void;
  setCapo: (fret: number) => void;
  setActiveInstrument: (inst: 'both' | 'guitar' | 'piano') => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setBackendConnected: (connected: boolean) => void;
  loadSampleSong: (sampleId: string) => void;
}

function resolveChords(
  chords: ChordEvent[],
  time: number,
  transpose: number,
  capo: number
) {
  if (!chords || chords.length === 0) {
    return {
      activeIdx: -1,
      curr: null,
      next: null,
      transCurr: null,
      transNext: null,
      capoPlayed: null,
    };
  }

  let activeIdx = chords.findIndex(c => time >= c.startTime && time < c.endTime);
  if (activeIdx === -1) {
    if (time >= chords[chords.length - 1].endTime) {
      activeIdx = chords.length - 1;
    } else {
      activeIdx = 0;
    }
  }

  const curr = chords[activeIdx]?.chord || null;
  const next = chords[activeIdx + 1]?.chord || null;

  const transCurr = curr ? transposeChord(curr, transpose) : null;
  const transNext = next ? transposeChord(next, transpose) : null;
  const capoPlayed = transCurr ? getCapoChord(transCurr, capo).playedChord : null;

  return {
    activeIdx,
    curr,
    next,
    transCurr,
    transNext,
    capoPlayed,
  };
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const initialSong = PRELOADED_SAMPLE_SONGS[0];
  const initialResolved = resolveChords(initialSong.chords, 0, 0, 0);

  return {
    isPlaying: false,
    currentTime: 0,
    duration: initialSong.duration,
    playbackRate: 1.0,
    volume: 0.85,
    isMuted: false,
    metronomeEnabled: false,

    activeChordIndex: initialResolved.activeIdx,
    currentChord: initialResolved.curr,
    nextChord: initialResolved.next,
    transposedCurrentChord: initialResolved.transCurr,
    transposedNextChord: initialResolved.transNext,
    capoPlayedChord: initialResolved.capoPlayed,

    loopA: null,
    loopB: null,
    isLooping: false,
    transposeSemitones: 0,
    capoFret: 0,

    analysis: initialSong,
    audioUrl: initialSong.audioUrl || null,
    isLoading: false,
    backendConnected: false,
    useAiChords: true,
    activeInstrument: 'both',

    setIsPlaying: (playing) => set({ isPlaying: playing }),

    setCurrentTime: (time) => {
      const state = get();
      let targetTime = time;

      // Handle A-B loop constraint
      if (state.isLooping && state.loopA !== null && state.loopB !== null) {
        if (targetTime >= state.loopB) {
          targetTime = state.loopA;
        }
      }

      const activeChords = (state.useAiChords || !state.analysis?.rawChords?.length)
        ? (state.analysis?.chords || [])
        : state.analysis.rawChords;
      const resolved = resolveChords(activeChords, targetTime, state.transposeSemitones, state.capoFret);

      set({
        currentTime: targetTime,
        activeChordIndex: resolved.activeIdx,
        currentChord: resolved.curr,
        nextChord: resolved.next,
        transposedCurrentChord: resolved.transCurr,
        transposedNextChord: resolved.transNext,
        capoPlayedChord: resolved.capoPlayed,
      });
    },

    setDuration: (duration) => set({ duration }),
    setPlaybackRate: (rate) => set({ playbackRate: rate }),
    setVolume: (vol) => set({ volume: vol, isMuted: vol === 0 }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    toggleMetronome: () => set((state) => ({ metronomeEnabled: !state.metronomeEnabled })),

    toggleAiChords: () => {
      const state = get();
      const nextAi = !state.useAiChords;
      const activeChords = (nextAi || !state.analysis?.rawChords?.length)
        ? (state.analysis?.chords || [])
        : state.analysis.rawChords;
      const resolved = resolveChords(activeChords, state.currentTime, state.transposeSemitones, state.capoFret);
      set({
        useAiChords: nextAi,
        activeChordIndex: resolved.activeIdx,
        currentChord: resolved.curr,
        nextChord: resolved.next,
        transposedCurrentChord: resolved.transCurr,
        transposedNextChord: resolved.transNext,
        capoPlayedChord: resolved.capoPlayed,
      });
    },

    setLoopA: (time) => {
      set({ loopA: time, isLooping: time !== null && get().loopB !== null });
    },
    setLoopB: (time) => {
      set({ loopB: time, isLooping: get().loopA !== null && time !== null });
    },
    toggleLoop: () => {
      const state = get();
      if (!state.isLooping && (state.loopA === null || state.loopB === null)) {
        // Automatically default loop A to current chord start and B to current chord end
        const activeChord = state.analysis?.chords[state.activeChordIndex];
        if (activeChord) {
          set({
            loopA: activeChord.startTime,
            loopB: activeChord.endTime,
            isLooping: true
          });
          return;
        }
      }
      set({ isLooping: !state.isLooping });
    },
    clearLoop: () => set({ loopA: null, loopB: null, isLooping: false }),

    setTranspose: (semitones) => {
      const state = get();
      const activeChords = (state.useAiChords || !state.analysis?.rawChords?.length)
        ? (state.analysis?.chords || [])
        : state.analysis.rawChords;
      const resolved = resolveChords(activeChords, state.currentTime, semitones, state.capoFret);
      set({
        transposeSemitones: semitones,
        transposedCurrentChord: resolved.transCurr,
        transposedNextChord: resolved.transNext,
        capoPlayedChord: resolved.capoPlayed,
      });
    },

    setCapo: (fret) => {
      const state = get();
      const activeChords = (state.useAiChords || !state.analysis?.rawChords?.length)
        ? (state.analysis?.chords || [])
        : state.analysis.rawChords;
      const resolved = resolveChords(activeChords, state.currentTime, state.transposeSemitones, fret);
      set({
        capoFret: fret,
        capoPlayedChord: resolved.capoPlayed,
      });
    },

    setActiveInstrument: (inst) => set({ activeInstrument: inst }),

    setAnalysis: (analysis) => {
      const state = get();
      const resolved = resolveChords(analysis.chords, 0, state.transposeSemitones, state.capoFret);
      set({
        analysis,
        audioUrl: analysis.audioUrl || null,
        duration: analysis.duration,
        currentTime: 0,
        isPlaying: false,
        useAiChords: true,
        activeChordIndex: resolved.activeIdx,
        currentChord: resolved.curr,
        nextChord: resolved.next,
        transposedCurrentChord: resolved.transCurr,
        transposedNextChord: resolved.transNext,
        capoPlayedChord: resolved.capoPlayed,
        loopA: null,
        loopB: null,
        isLooping: false,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setBackendConnected: (connected) => set({ backendConnected: connected }),

    loadSampleSong: (sampleId) => {
      const song = PRELOADED_SAMPLE_SONGS.find(s => s.id === sampleId) || PRELOADED_SAMPLE_SONGS[0];
      get().setAnalysis(song);
    }
  };
});
