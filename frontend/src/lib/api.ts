import { AnalysisResult } from './types';
export type { AnalysisResult };
import { generateClientFallbackAnalysis, PRELOADED_SAMPLE_SONGS } from './mockAnalysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSampleSongs(): Promise<AnalysisResult[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/samples`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.samples && data.samples.length > 0) {
        return data.samples;
      }
    }
  } catch {
    // Fall back to pre-loaded sample songs data
  }
  return PRELOADED_SAMPLE_SONGS;
}

async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      resolve(audio.duration && !isNaN(audio.duration) && audio.duration > 0 ? audio.duration : 60.0);
    };
    audio.onerror = () => {
      resolve(60.0);
    };
  });
}

export async function analyzeAudioFile(file: File, objectUrl?: string): Promise<AnalysisResult> {
  const effectiveUrl = objectUrl || URL.createObjectURL(file);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s max for deep audio analysis

    const res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result: AnalysisResult = await res.json();
      result.audioUrl = effectiveUrl;
      return result;
    } else {
      const errText = await res.text();
      console.warn(`Backend /api/analyze error (${res.status}):`, errText);
    }
  } catch (err) {
    console.warn('Backend unavailable or failed, utilizing client-side MIR fallback:', err);
  }

  // Graceful client-side fallback with true audio duration
  const realDuration = await getAudioDuration(effectiveUrl);
  return generateClientFallbackAnalysis(
    file.name.replace(/\.[^/.]+$/, ""),
    realDuration,
    effectiveUrl
  );
}

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)/i.test(url.trim());
}

export async function analyzeAudioUrl(url: string): Promise<AnalysisResult> {
  const isYT = isYouTubeUrl(url);

  // Check if URL matches one of preloaded sample songs
  const matchedSample = PRELOADED_SAMPLE_SONGS.find(s => s.id && url.includes(s.id));
  if (matchedSample) {
    return matchedSample;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s for YouTube extraction, DSP & Gemini AI

  try {
    const res = await fetch(`${API_BASE_URL}/api/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title: isYT ? 'YouTube Audio' : 'Web Audio' }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result: AnalysisResult = await res.json();
      if (result.audioUrl && result.audioUrl.startsWith('/')) {
        result.audioUrl = `${API_BASE_URL}${result.audioUrl}`;
      }
      return result;
    } else {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.detail || `Server returned error (${res.status})`;
      throw new Error(msg);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error('Analysis timed out. The audio may be too long or the connection is slow.');
    }

    // If it was an explicit error message, re-throw it so UI shows it
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
      throw err;
    }

    console.warn('Backend URL analysis unavailable:', err);

    // If backend is offline/unreachable and it's a YouTube link, inform the user
    if (isYT) {
      throw new Error(
        'The Zarah Python backend is required to extract and analyze YouTube audio. Please ensure the backend is running at http://127.0.0.1:8000 (run start.bat or start.ps1).'
      );
    }

    return generateClientFallbackAnalysis('Streaming Track', 20.0, url);
  }
}
