"""
Audio Processor Pipeline: Orchestrates audio loading, key detection, chord recognition, and rhythm analysis
"""
import io
import os
import tempfile
from typing import Dict, Any
import numpy as np
import librosa
import soundfile as sf

from services.key_detector import detect_key
from services.chord_recognizer import recognize_chords
from services.rhythm_estimator import estimate_rhythm_and_beats
from services.gemini_refiner import refine_chords_with_gemini


def analyze_audio_data(
    y: np.ndarray,
    sr: int,
    title: str = "Analyzed Audio",
    artist: str = ""
) -> Dict[str, Any]:
    """
    Runs the full MIR analysis pipeline, enhanced with Gemini AI harmonic refinement.
    """
    duration = float(librosa.get_duration(y=y, sr=sr))

    # 1. Rhythm & Beat Tracking
    rhythm_res = estimate_rhythm_and_beats(y, sr)
    beat_frames = rhythm_res.get("beatFrames")

    # Compute harmonic chroma once to share across Key Detection and Chord Recognition
    try:
        y_harmonic = librosa.effects.harmonic(y, margin=3.0)
    except Exception:
        y_harmonic = y
    shared_chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr, hop_length=512)

    # 2. Key & Scale Detection (reusing pre-computed chroma)
    key_res = detect_key(y, sr, chroma=shared_chroma)

    # 3. Chord Progression Recognition (reusing pre-computed chroma)
    dsp_chords = recognize_chords(
        y=y,
        sr=sr,
        beat_frames=beat_frames,
        total_duration=duration,
        chroma=shared_chroma
    )

    # 4. Gemini AI Harmonic Refiner (Musical structure & authentic song recognition)
    refined = refine_chords_with_gemini(
        title=title,
        artist=artist,
        duration=duration,
        raw_key=key_res["key"],
        raw_bpm=rhythm_res["bpm"],
        raw_chords=dsp_chords
    )

    if refined:
        final_key = refined.get("key", key_res["key"])
        final_tonic = refined.get("tonic", key_res["tonic"])
        final_mode = refined.get("mode", key_res["mode"])
        final_bpm = refined.get("bpm", rhythm_res["bpm"])
        final_strum = refined.get("strummingPattern") or rhythm_res["strummingPattern"]
        final_chords = refined.get("chords") or dsp_chords
        ai_refined = True
        ai_notes = refined.get("aiNotes", "Harmonically structured by Gemini AI.")
    else:
        final_key = key_res["key"]
        final_tonic = key_res["tonic"]
        final_mode = key_res["mode"]
        final_bpm = rhythm_res["bpm"]
        final_strum = rhythm_res["strummingPattern"]
        final_chords = dsp_chords
        ai_refined = False
        ai_notes = None

    return {
        "title": title,
        "artist": artist,
        "duration": round(duration, 2),
        "bpm": final_bpm,
        "timeSignature": rhythm_res["timeSignature"],
        "key": final_key,
        "tonic": final_tonic,
        "mode": final_mode,
        "keyConfidence": key_res["confidence"],
        "strummingPattern": final_strum,
        "beatTimes": rhythm_res["beatTimes"],
        "chords": final_chords,
        "rawChords": dsp_chords,
        "aiRefined": ai_refined,
        "aiNotes": ai_notes
    }


def _get_ffmpeg_path() -> str:
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        return get_ffmpeg_exe()
    except Exception:
        import shutil
        return shutil.which("ffmpeg") or "ffmpeg"


def analyze_audio_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Saves temporary audio file, decodes it via librosa (with ffmpeg fallback for .opus/.aac/etc.),
    and runs the MIR pipeline.
    """
    suffix = os.path.splitext(filename)[1].lower() or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    decoded_wav_path = None
    try:
        y = None
        sr = 22050

        # Attempt 1: Direct librosa load
        try:
            y, sr = librosa.load(tmp_path, sr=22050, mono=True)
        except Exception:
            # Attempt 2: Use ffmpeg to convert any codec (opus, aac, amr, etc.) to 22050Hz mono WAV
            ffmpeg_exe = _get_ffmpeg_path()
            if ffmpeg_exe:
                import subprocess
                decoded_wav_path = f"{tmp_path}_decoded.wav"
                cmd = [
                    ffmpeg_exe, "-y", "-i", tmp_path,
                    "-ar", "22050", "-ac", "1", "-vn",
                    decoded_wav_path
                ]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45)
                if res.returncode == 0 and os.path.exists(decoded_wav_path):
                    y, sr = librosa.load(decoded_wav_path, sr=22050, mono=True)

        if y is None or len(y) == 0:
            raise ValueError(f"Could not decode audio format for file '{filename}'.")

        title = os.path.splitext(os.path.basename(filename))[0]
        return analyze_audio_data(y, sr, title=title)
    finally:
        for p in (tmp_path, decoded_wav_path):
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


def generate_synthetic_chord_audio(chord_names: list, seconds_per_chord: float = 2.0, sr: int = 22050) -> tuple:
    """
    Generates synthetic acoustic-style chord audio using additive synthesis for testing and sample previews.
    """
    note_to_freq = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
        'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
        'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    }
    
    total_samples = int(len(chord_names) * seconds_per_chord * sr)
    audio = np.zeros(total_samples, dtype=np.float32)
    
    chord_intervals = {
        '': [0, 4, 7],
        'm': [0, 3, 7],
        '7': [0, 4, 7, 10],
        'maj7': [0, 4, 7, 11],
        'm7': [0, 3, 7, 10],
        'sus4': [0, 5, 7],
        'sus2': [0, 2, 7],
        'dim': [0, 3, 6]
    }
    
    notes_chroma = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    for i, chord in enumerate(chord_names):
        # Extract root and quality
        root = chord[0:2] if len(chord) > 1 and chord[1] == '#' else chord[0]
        quality = chord[len(root):]
        if quality not in chord_intervals:
            quality = ''
            
        root_idx = notes_chroma.index(root) if root in notes_chroma else 0
        intervals = chord_intervals[quality]
        
        start_idx = int(i * seconds_per_chord * sr)
        chord_len = int(seconds_per_chord * sr)
        t = np.linspace(0, seconds_per_chord, chord_len, False)
        
        # Exponential decay envelope for acoustic pluck feel
        decay = np.exp(-2.5 * t)
        
        chord_wave = np.zeros(chord_len, dtype=np.float32)
        for interval in intervals:
            note_idx = (root_idx + interval) % 12
            base_freq = note_to_freq[notes_chroma[note_idx]]
            # Fundamental + 1st harmonic
            wave = np.sin(2 * np.pi * base_freq * t) + 0.4 * np.sin(2 * np.pi * (base_freq * 2) * t)
            chord_wave += wave * decay
            
        # Normalize chord segment
        max_val = np.max(np.abs(chord_wave))
        if max_val > 0:
            chord_wave = chord_wave / max_val * 0.7
            
        audio[start_idx:start_idx + chord_len] += chord_wave

    return audio, sr

