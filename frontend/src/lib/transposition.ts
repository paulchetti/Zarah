import { CHROMATIC_SCALE, ENHARMONIC_MAP, parseChord } from './chordData';

export function transposePitch(note: string, semitones: number): string {
  let cleanNote = note.trim();
  if (ENHARMONIC_MAP[cleanNote]) {
    cleanNote = ENHARMONIC_MAP[cleanNote];
  }
  const idx = CHROMATIC_SCALE.indexOf(cleanNote);
  if (idx === -1) return note;

  const newIdx = (idx + semitones + 24) % 12;
  return CHROMATIC_SCALE[newIdx];
}

export function transposeChord(chordName: string, semitones: number): string {
  if (!chordName || chordName === 'Rest' || chordName === 'N') {
    return chordName;
  }
  if (semitones === 0) {
    return chordName;
  }

  // Handle slash chords, e.g., G/B or C/E
  if (chordName.includes('/')) {
    const [main, bass] = chordName.split('/');
    const newMain = transposeChord(main, semitones);
    const newBass = transposePitch(bass, semitones);
    return `${newMain}/${newBass}`;
  }

  const { root, quality } = parseChord(chordName);
  const newRoot = transposePitch(root, semitones);
  return `${newRoot}${quality}`;
}

export function transposeKey(keyString: string, semitones: number): string {
  if (!keyString || semitones === 0) return keyString;
  const parts = keyString.split(' ');
  const tonic = parts[0];
  const mode = parts.slice(1).join(' ');
  const newTonic = transposePitch(tonic, semitones);
  return mode ? `${newTonic} ${mode}` : newTonic;
}

export function getCapoChord(
  soundingChord: string,
  capoFret: number
): { playedChord: string; soundingChord: string; capoFret: number } {
  if (capoFret === 0 || !soundingChord || soundingChord === 'Rest' || soundingChord === 'N') {
    return { playedChord: soundingChord, soundingChord, capoFret: 0 };
  }

  // To sound at `soundingChord` with capo at `capoFret`,
  // the player must finger the shape `capoFret` semitones LOWER!
  const playedChord = transposeChord(soundingChord, -capoFret);
  return {
    playedChord,
    soundingChord,
    capoFret
  };
}
