import { describe, it, expect } from 'vitest';
import { getGuitarChordData, getPianoChordData, parseChord } from '../lib/chordData';

describe('Chord Data & Instrument Visualizer Mappings', () => {
  it('should parse chord root and quality accurately', () => {
    expect(parseChord('G')).toEqual({ root: 'G', quality: '' });
    expect(parseChord('Am')).toEqual({ root: 'A', quality: 'm' });
    expect(parseChord('F#7')).toEqual({ root: 'F#', quality: '7' });
    expect(parseChord('Bbmaj7')).toEqual({ root: 'A#', quality: 'maj7' });
    expect(parseChord('Csus4')).toEqual({ root: 'C', quality: 'sus4' });
  });

  it('should return valid guitar fingering data for open chords', () => {
    // C Major
    const cChord = getGuitarChordData('C');
    expect(cChord.name).toBe('C');
    expect(cChord.frets).toEqual([-1, 3, 2, 0, 1, 0]);
    expect(cChord.frets.length).toBe(6);
    expect(cChord.fingers.length).toBe(6);

    // G Major
    const gChord = getGuitarChordData('G');
    expect(gChord.frets.length).toBe(6);
    expect(gChord.frets[0]).toBe(3); // 3rd fret on low E
    expect(gChord.frets[5]).toBe(3); // 3rd fret on high E

    // E Minor
    const emChord = getGuitarChordData('Em');
    expect(emChord.frets).toEqual([0, 2, 2, 0, 0, 0]);
  });

  it('should return valid piano chord data with correct pitch classes', () => {
    // C Major triad: C, E, G
    const cPiano = getPianoChordData('C');
    expect(cPiano.notes).toEqual(['C', 'E', 'G']);
    expect(cPiano.midiNotes.length).toBe(3);
    expect(cPiano.midiNotes[0]).toBe(60); // Middle C

    // A Minor triad: A, C, E
    const aPiano = getPianoChordData('Am');
    expect(aPiano.notes).toEqual(['A', 'C', 'E']);

    // G7 dominant 7th: G, B, D, F
    const g7Piano = getPianoChordData('G7');
    expect(g7Piano.notes).toEqual(['G', 'B', 'D', 'F']);
    expect(g7Piano.midiNotes.length).toBe(4);
  });

  it('should generate movable barre chord fallback for any root note', () => {
    const abChord = getGuitarChordData('G#m');
    expect(abChord.frets.length).toBe(6);
    expect(abChord.quality).toBe('m');
  });
});
