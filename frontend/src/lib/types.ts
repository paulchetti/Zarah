export interface ChordEvent {
  chord: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface StrummingPattern {
  name: string;
  pattern: string;
  strokes: string[];
  subdivisions: string[];
  description: string;
}

export interface AnalysisResult {
  id?: string;
  title: string;
  artist?: string;
  duration: number;
  bpm: number;
  timeSignature: string;
  key: string;
  tonic: string;
  mode: string;
  keyConfidence: number;
  strummingPattern: StrummingPattern;
  beatTimes: number[];
  chords: ChordEvent[];
  rawChords?: ChordEvent[];
  aiRefined?: boolean;
  aiNotes?: string;
  audioUrl?: string;
}

export interface GuitarChordData {
  name: string;
  root: string;
  quality: string;
  frets: number[]; // 6 elements: -1 (mute), 0 (open), 1-15 (fret)
  fingers: number[]; // 6 elements: 0 (none), 1 (index), 2 (mid), 3 (ring), 4 (pinky)
  barres?: number[]; // barre frets
  baseFret?: number; // default 1
  notes: string[]; // notes on sounding strings from 6th (low E) to 1st (high E)
}

export interface PianoChordData {
  name: string;
  root: string;
  quality: string;
  notes: string[]; // e.g. ['C', 'E', 'G']
  midiNotes: number[]; // e.g. [60, 64, 67]
}
