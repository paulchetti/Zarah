import { describe, it, expect } from 'vitest';
import { transposeChord, transposeKey, getCapoChord } from '../lib/transposition';

describe('Music Theory Transposition Engine', () => {
  it('should transpose major and minor triads accurately', () => {
    // Up 2 semitones
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('Am', 2)).toBe('Bm');
    expect(transposeChord('G', 2)).toBe('A');
    expect(transposeChord('F', 2)).toBe('G');

    // Down 1 semitone
    expect(transposeChord('C', -1)).toBe('B');
    expect(transposeChord('Em', -1)).toBe('D#m');
    expect(transposeChord('A', -2)).toBe('G');
  });

  it('should preserve chord qualities (7, maj7, m7, sus4, sus2, dim)', () => {
    expect(transposeChord('G7', 2)).toBe('A7');
    expect(transposeChord('Cmaj7', 5)).toBe('Fmaj7');
    expect(transposeChord('Am7', 3)).toBe('Cm7');
    expect(transposeChord('Dsus4', 2)).toBe('Esus4');
    expect(transposeChord('Asus2', 2)).toBe('Bsus2');
    expect(transposeChord('Bdim', 1)).toBe('Cdim');
  });

  it('should handle slash chords (bass inversions)', () => {
    expect(transposeChord('G/B', 2)).toBe('A/C#');
    expect(transposeChord('C/E', 2)).toBe('D/F#');
  });

  it('should calculate guitar capo played shapes relative to sounding pitch', () => {
    // If sounding chord is D and Capo is at Fret 2, played chord is C (C + 2 = D)
    const capo2D = getCapoChord('D', 2);
    expect(capo2D.soundingChord).toBe('D');
    expect(capo2D.playedChord).toBe('C');

    // If sounding chord is C and Capo is at Fret 3, played chord is A (A + 3 = C)
    const capo3C = getCapoChord('C', 3);
    expect(capo3C.soundingChord).toBe('C');
    expect(capo3C.playedChord).toBe('A');

    // If sounding chord is G and Capo is at Fret 3, played chord is E (E + 3 = G)
    const capo3G = getCapoChord('G', 3);
    expect(capo3G.soundingChord).toBe('G');
    expect(capo3G.playedChord).toBe('E');

    // Capo 0 returns unchanged chord
    const capo0 = getCapoChord('Em', 0);
    expect(capo0.playedChord).toBe('Em');
  });

  it('should transpose musical keys correctly', () => {
    expect(transposeKey('G Major', 2)).toBe('A Major');
    expect(transposeKey('A Minor', 3)).toBe('C Minor');
    expect(transposeKey('C Major', -2)).toBe('A# Major');
  });
});
