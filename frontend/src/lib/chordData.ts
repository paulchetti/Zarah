import { GuitarChordData, PianoChordData } from './types';

// Chromatic scale
export const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ENHARMONIC_MAP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

export const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
export const STANDARD_TUNING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

// Guitar Chord Shapes (Standard open & common movable voicings)
export const GUITAR_CHORD_LIBRARY: Record<string, GuitarChordData> = {
  // C Chords
  'C': {
    name: 'C', root: 'C', quality: '',
    frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
    baseFret: 1, notes: ['C', 'E', 'G', 'C', 'E']
  },
  'Cm': {
    name: 'Cm', root: 'C', quality: 'm',
    frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1],
    barres: [3], baseFret: 3, notes: ['C', 'G', 'C', 'D#', 'G']
  },
  'C7': {
    name: 'C7', root: 'C', quality: '7',
    frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0],
    baseFret: 1, notes: ['C', 'E', 'A#', 'C', 'E']
  },
  'Cmaj7': {
    name: 'Cmaj7', root: 'C', quality: 'maj7',
    frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0],
    baseFret: 1, notes: ['C', 'E', 'G', 'B', 'E']
  },
  'Cm7': {
    name: 'Cm7', root: 'C', quality: 'm7',
    frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1],
    barres: [3], baseFret: 3, notes: ['C', 'G', 'A#', 'D#', 'G']
  },
  'Csus4': {
    name: 'Csus4', root: 'C', quality: 'sus4',
    frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1],
    baseFret: 1, notes: ['C', 'F', 'G', 'C', 'F']
  },
  'Csus2': {
    name: 'Csus2', root: 'C', quality: 'sus2',
    frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 2, 0, 0, 1, 4],
    baseFret: 1, notes: ['C', 'D', 'G', 'C', 'G']
  },

  // D Chords
  'D': {
    name: 'D', root: 'D', quality: '',
    frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2],
    baseFret: 1, notes: ['D', 'A', 'D', 'F#']
  },
  'Dm': {
    name: 'Dm', root: 'D', quality: 'm',
    frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1],
    baseFret: 1, notes: ['D', 'A', 'D', 'F']
  },
  'D7': {
    name: 'D7', root: 'D', quality: '7',
    frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3],
    baseFret: 1, notes: ['D', 'A', 'C', 'F#']
  },
  'Dmaj7': {
    name: 'Dmaj7', root: 'D', quality: 'maj7',
    frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1],
    barres: [2], baseFret: 1, notes: ['D', 'A', 'C#', 'F#']
  },
  'Dm7': {
    name: 'Dm7', root: 'D', quality: 'm7',
    frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1],
    barres: [1], baseFret: 1, notes: ['D', 'A', 'C', 'F']
  },
  'Dsus4': {
    name: 'Dsus4', root: 'D', quality: 'sus4',
    frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3],
    baseFret: 1, notes: ['D', 'A', 'D', 'G']
  },
  'Dsus2': {
    name: 'Dsus2', root: 'D', quality: 'sus2',
    frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0],
    baseFret: 1, notes: ['D', 'A', 'D', 'E']
  },

  // E Chords
  'E': {
    name: 'E', root: 'E', quality: '',
    frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0],
    baseFret: 1, notes: ['E', 'B', 'E', 'G#', 'B', 'E']
  },
  'Em': {
    name: 'Em', root: 'E', quality: 'm',
    frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
    baseFret: 1, notes: ['E', 'B', 'E', 'G', 'B', 'E']
  },
  'E7': {
    name: 'E7', root: 'E', quality: '7',
    frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0],
    baseFret: 1, notes: ['E', 'B', 'D', 'G#', 'B', 'E']
  },
  'Emaj7': {
    name: 'Emaj7', root: 'E', quality: 'maj7',
    frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0],
    baseFret: 1, notes: ['E', 'B', 'D#', 'G#', 'B', 'E']
  },
  'Em7': {
    name: 'Em7', root: 'E', quality: 'm7',
    frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0],
    baseFret: 1, notes: ['E', 'B', 'E', 'G', 'D', 'E']
  },
  'Esus4': {
    name: 'Esus4', root: 'E', quality: 'sus4',
    frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0],
    baseFret: 1, notes: ['E', 'B', 'E', 'A', 'B', 'E']
  },

  // F Chords
  'F': {
    name: 'F', root: 'F', quality: '',
    frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1],
    barres: [1], baseFret: 1, notes: ['F', 'C', 'F', 'A', 'C', 'F']
  },
  'Fm': {
    name: 'Fm', root: 'F', quality: 'm',
    frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1],
    barres: [1], baseFret: 1, notes: ['F', 'C', 'F', 'G#', 'C', 'F']
  },
  'F7': {
    name: 'F7', root: 'F', quality: '7',
    frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1],
    barres: [1], baseFret: 1, notes: ['F', 'C', 'D#', 'A', 'C', 'F']
  },
  'Fmaj7': {
    name: 'Fmaj7', root: 'F', quality: 'maj7',
    frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0],
    baseFret: 1, notes: ['F', 'A', 'C', 'E']
  },
  'Fm7': {
    name: 'Fm7', root: 'F', quality: 'm7',
    frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1],
    barres: [1], baseFret: 1, notes: ['F', 'C', 'D#', 'G#', 'C', 'F']
  },

  // G Chords
  'G': {
    name: 'G', root: 'G', quality: '',
    frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
    baseFret: 1, notes: ['G', 'B', 'D', 'G', 'B', 'G']
  },
  'Gm': {
    name: 'Gm', root: 'G', quality: 'm',
    frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1],
    barres: [3], baseFret: 3, notes: ['G', 'D', 'G', 'A#', 'D', 'G']
  },
  'G7': {
    name: 'G7', root: 'G', quality: '7',
    frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1],
    baseFret: 1, notes: ['G', 'B', 'D', 'G', 'B', 'F']
  },
  'Gmaj7': {
    name: 'Gmaj7', root: 'G', quality: 'maj7',
    frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3],
    baseFret: 1, notes: ['G', 'B', 'D', 'G', 'B', 'F#']
  },
  'Gm7': {
    name: 'Gm7', root: 'G', quality: 'm7',
    frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1],
    barres: [3], baseFret: 3, notes: ['G', 'D', 'F', 'A#', 'D', 'G']
  },
  'Gsus4': {
    name: 'Gsus4', root: 'G', quality: 'sus4',
    frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4],
    baseFret: 1, notes: ['G', 'C', 'D', 'G', 'C', 'G']
  },
  'Gsus2': {
    name: 'Gsus2', root: 'G', quality: 'sus2',
    frets: [3, 0, 0, 0, 3, 3], fingers: [1, 0, 0, 0, 3, 4],
    baseFret: 1, notes: ['G', 'A', 'D', 'G', 'D', 'G']
  },

  // A Chords
  'A': {
    name: 'A', root: 'A', quality: '',
    frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0],
    baseFret: 1, notes: ['A', 'E', 'A', 'C#', 'E']
  },
  'Am': {
    name: 'Am', root: 'A', quality: 'm',
    frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
    baseFret: 1, notes: ['A', 'E', 'A', 'C', 'E']
  },
  'A7': {
    name: 'A7', root: 'A', quality: '7',
    frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0],
    baseFret: 1, notes: ['A', 'E', 'G', 'C#', 'E']
  },
  'Amaj7': {
    name: 'Amaj7', root: 'A', quality: 'maj7',
    frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0],
    baseFret: 1, notes: ['A', 'E', 'G#', 'C#', 'E']
  },
  'Am7': {
    name: 'Am7', root: 'A', quality: 'm7',
    frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0],
    baseFret: 1, notes: ['A', 'E', 'G', 'C', 'E']
  },
  'Asus4': {
    name: 'Asus4', root: 'A', quality: 'sus4',
    frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0],
    baseFret: 1, notes: ['A', 'E', 'A', 'D', 'E']
  },
  'Asus2': {
    name: 'Asus2', root: 'A', quality: 'sus2',
    frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0],
    baseFret: 1, notes: ['A', 'E', 'A', 'B', 'E']
  },

  // B Chords
  'B': {
    name: 'B', root: 'B', quality: '',
    frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1],
    barres: [2], baseFret: 2, notes: ['B', 'F#', 'B', 'D#', 'F#']
  },
  'Bm': {
    name: 'Bm', root: 'B', quality: 'm',
    frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1],
    barres: [2], baseFret: 2, notes: ['B', 'F#', 'B', 'D', 'F#']
  },
  'B7': {
    name: 'B7', root: 'B', quality: '7',
    frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4],
    baseFret: 1, notes: ['B', 'D#', 'A', 'B', 'F#']
  },
  'Bmaj7': {
    name: 'Bmaj7', root: 'B', quality: 'maj7',
    frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1],
    barres: [2], baseFret: 2, notes: ['B', 'F#', 'A#', 'D#', 'F#']
  },
  'Bm7': {
    name: 'Bm7', root: 'B', quality: 'm7',
    frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1],
    barres: [2], baseFret: 2, notes: ['B', 'F#', 'A', 'D', 'F#']
  },
  'Bsus4': {
    name: 'Bsus4', root: 'B', quality: 'sus4',
    frets: [-1, 2, 4, 4, 5, 2], fingers: [0, 1, 2, 3, 4, 1],
    barres: [2], baseFret: 2, notes: ['B', 'F#', 'B', 'E', 'F#']
  },

  // F# / Gb
  'F#': {
    name: 'F#', root: 'F#', quality: '',
    frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1],
    barres: [2], baseFret: 2, notes: ['F#', 'C#', 'F#', 'A#', 'C#', 'F#']
  },
  'F#m': {
    name: 'F#m', root: 'F#', quality: 'm',
    frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1],
    barres: [2], baseFret: 2, notes: ['F#', 'C#', 'F#', 'A', 'C#', 'F#']
  },
  'F#7': {
    name: 'F#7', root: 'F#', quality: '7',
    frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1],
    barres: [2], baseFret: 2, notes: ['F#', 'C#', 'E', 'A#', 'C#', 'F#']
  },

  // C# / Db
  'C#': {
    name: 'C#', root: 'C#', quality: '',
    frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1],
    barres: [4], baseFret: 4, notes: ['C#', 'G#', 'C#', 'F', 'G#']
  },
  'C#m': {
    name: 'C#m', root: 'C#', quality: 'm',
    frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1],
    barres: [4], baseFret: 4, notes: ['C#', 'G#', 'C#', 'E', 'G#']
  },

  // G# / Ab
  'G#': {
    name: 'G#', root: 'G#', quality: '',
    frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1],
    barres: [4], baseFret: 4, notes: ['G#', 'D#', 'G#', 'C', 'D#', 'G#']
  },
  'G#m': {
    name: 'G#m', root: 'G#', quality: 'm',
    frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1],
    barres: [4], baseFret: 4, notes: ['G#', 'D#', 'G#', 'B', 'D#', 'G#']
  },

  // D# / Eb
  'D#': {
    name: 'D#', root: 'D#', quality: '',
    frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1],
    barres: [6], baseFret: 6, notes: ['D#', 'A#', 'D#', 'G', 'A#']
  },
  'D#m': {
    name: 'D#m', root: 'D#', quality: 'm',
    frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1],
    barres: [6], baseFret: 6, notes: ['D#', 'A#', 'D#', 'F#', 'A#']
  },

  // A# / Bb
  'A#': {
    name: 'A#', root: 'A#', quality: '',
    frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1],
    barres: [1], baseFret: 1, notes: ['A#', 'F', 'A#', 'D', 'F']
  },
  'A#m': {
    name: 'A#m', root: 'A#', quality: 'm',
    frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1],
    barres: [1], baseFret: 1, notes: ['A#', 'F', 'A#', 'C#', 'F']
  }
};

// Interval definitions for Piano note mapping
export const CHORD_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],         // Major
  'm': [0, 3, 7],        // Minor
  '7': [0, 4, 7, 10],    // Dominant 7th
  'maj7': [0, 4, 7, 11], // Major 7th
  'm7': [0, 3, 7, 10],   // Minor 7th
  'sus4': [0, 5, 7],     // Sus4
  'sus2': [0, 2, 7],     // Sus2
  'dim': [0, 3, 6],      // Diminished
};

export function parseChord(chordName: string): { root: string; quality: string } {
  if (!chordName || chordName === 'Rest' || chordName === 'N') {
    return { root: 'C', quality: '' };
  }
  let root = chordName[0];
  let quality = chordName.slice(1);
  if (chordName.length > 1 && (chordName[1] === '#' || chordName[1] === 'b')) {
    root = chordName.slice(0, 2);
    quality = chordName.slice(2);
  }
  if (ENHARMONIC_MAP[root]) {
    root = ENHARMONIC_MAP[root];
  }
  return { root, quality };
}

export function getGuitarChordData(chordName: string): GuitarChordData {
  const { root, quality } = parseChord(chordName);
  const key = `${root}${quality}`;
  
  if (GUITAR_CHORD_LIBRARY[key]) {
    return GUITAR_CHORD_LIBRARY[key];
  }

  // Generate movable E-shape or A-shape barre chord fallback
  const rootIndex = CHROMATIC_SCALE.indexOf(root);
  if (rootIndex !== -1) {
    // E-shape barre chord (root on 6th string, low E=0)
    // E root is at index 4 (E). F=1, F#=2, G=3...
    const fret6th = (rootIndex - 4 + 12) % 12;
    if (quality === 'm') {
      return {
        name: chordName, root, quality,
        frets: [fret6th, fret6th + 2, fret6th + 2, fret6th, fret6th, fret6th],
        fingers: [1, 3, 4, 1, 1, 1],
        barres: [fret6th], baseFret: Math.max(1, fret6th),
        notes: [root, '5th', root, 'b3rd', '5th', root]
      };
    } else if (quality === '7') {
      return {
        name: chordName, root, quality,
        frets: [fret6th, fret6th + 2, fret6th, fret6th + 1, fret6th, fret6th],
        fingers: [1, 3, 1, 2, 1, 1],
        barres: [fret6th], baseFret: Math.max(1, fret6th),
        notes: [root, '5th', 'b7th', '3rd', '5th', root]
      };
    } else {
      // Major E-shape
      return {
        name: chordName, root, quality,
        frets: [fret6th, fret6th + 2, fret6th + 2, fret6th + 1, fret6th, fret6th],
        fingers: [1, 3, 4, 2, 1, 1],
        barres: [fret6th], baseFret: Math.max(1, fret6th),
        notes: [root, '5th', root, '3rd', '5th', root]
      };
    }
  }

  return GUITAR_CHORD_LIBRARY['C'];
}

export function getPianoChordData(chordName: string): PianoChordData {
  const { root, quality } = parseChord(chordName);
  const rootIdx = CHROMATIC_SCALE.indexOf(root);
  const safeRootIdx = rootIdx !== -1 ? rootIdx : 0;
  
  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS[''];
  const notes: string[] = [];
  const midiNotes: number[] = [];

  // Middle C is MIDI 60 (C4)
  const baseMidi = 60 + safeRootIdx;

  for (const interval of intervals) {
    const pitchIdx = (safeRootIdx + interval) % 12;
    notes.push(CHROMATIC_SCALE[pitchIdx]);
    midiNotes.push(baseMidi + interval);
  }

  return {
    name: chordName,
    root,
    quality,
    notes,
    midiNotes
  };
}
