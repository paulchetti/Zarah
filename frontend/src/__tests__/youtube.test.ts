import { describe, it, expect } from 'vitest';
import { isYouTubeUrl } from '../lib/api';

describe('YouTube URL parser', () => {
  it('correctly recognizes standard YouTube watch URLs', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=45s')).toBe(true);
  });

  it('correctly recognizes shortened youtu.be URLs', () => {
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('http://youtu.be/dQw4w9WgXcQ?si=abc123xyz')).toBe(true);
  });

  it('correctly recognizes YouTube Shorts and Music URLs', () => {
    expect(isYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('correctly returns false for non-YouTube links', () => {
    expect(isYouTubeUrl('https://example.com/audio.mp3')).toBe(false);
    expect(isYouTubeUrl('https://soundcloud.com/artist/song')).toBe(false);
    expect(isYouTubeUrl('https://spotify.com/track/123')).toBe(false);
    expect(isYouTubeUrl('')).toBe(false);
  });
});
