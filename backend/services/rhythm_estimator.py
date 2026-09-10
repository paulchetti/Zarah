"""
Rhythm and Strumming Pattern Estimator using Beat Tracking and Onset Energy Envelopes
"""
from typing import Dict, Any, List, Tuple
import numpy as np
import librosa


# Common guitar strumming patterns for 4/4 time signature
STANDARD_STRUM_PATTERNS = [
    {
        "name": "Classic Folk / Pop",
        "pattern": "D - D U - U D U",
        "strokes": ["D", "-", "D", "U", "-", "U", "D", "U"],
        "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
        "description": "Versatile all-around acoustic strum, perfect for pop, folk, and singer-songwriter songs."
    },
    {
        "name": "Driving Pop-Rock",
        "pattern": "D D U - U D - U",
        "strokes": ["D", "D", "U", "-", "U", "D", "-", "U"],
        "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
        "description": "Energetic syncopated rhythm giving a driving feel to rock and uptempo tunes."
    },
    {
        "name": "Steady 8th Ballad",
        "pattern": "D - D - D U D U",
        "strokes": ["D", "-", "D", "-", "D", "U", "D", "U"],
        "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
        "description": "Relaxed, supportive pattern ideal for ballads and slower acoustic tracks."
    },
    {
        "name": "Even Quarter Strum",
        "pattern": "D - D - D - D -",
        "strokes": ["D", "-", "D", "-", "D", "-", "D", "-"],
        "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
        "description": "Fundamental 4-to-the-bar foundation, great for keeping solid time."
    },
    {
        "name": "Blues Shuffle",
        "pattern": "D - D U D - D U",
        "strokes": ["D", "-", "D", "U", "D", "-", "D", "U"],
        "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
        "description": "Swung shuffle rhythm characteristic of 12-bar blues and classic rock 'n' roll."
    }
]


def estimate_rhythm_and_beats(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Computes BPM, beat timestamps, and infers a recommended guitar strumming pattern.
    """
    # 1. Onset envelope computation
    hop_length = 512
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)

    # 2. Beat tracking
    tempo, beat_frames = librosa.beat.beat_track(
        y=y,
        sr=sr,
        onset_envelope=onset_env,
        hop_length=hop_length,
        trim=False
    )

    # Handle float or array tempo
    bpm = float(tempo[0]) if isinstance(tempo, (list, np.ndarray)) else float(tempo)
    bpm = round(bpm, 1)

    # Convert frames to time seconds
    beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_length)
    beat_times_list = [round(float(t), 3) for t in beat_times]

    # 3. Analyze off-beat energy relative to on-beat energy
    selected_pattern = STANDARD_STRUM_PATTERNS[0]  # default Classic Pop

    if len(beat_frames) >= 4:
        on_beat_energies = []
        off_beat_energies = []

        for i in range(len(beat_frames) - 1):
            f_start = beat_frames[i]
            f_end = beat_frames[i + 1]
            if f_end <= f_start:
                continue
            f_mid = (f_start + f_end) // 2

            # On-beat window
            on_slice = onset_env[max(0, f_start - 2): min(len(onset_env), f_start + 3)]
            if len(on_slice) > 0:
                on_beat_energies.append(np.max(on_slice))

            # Off-beat window
            off_slice = onset_env[max(0, f_mid - 2): min(len(onset_env), f_mid + 3)]
            if len(off_slice) > 0:
                off_beat_energies.append(np.max(off_slice))

        avg_on = float(np.mean(on_beat_energies)) if on_beat_energies else 1.0
        avg_off = float(np.mean(off_beat_energies)) if off_beat_energies else 0.5
        syncopation_ratio = avg_off / max(1e-4, avg_on)

        if bpm < 85:
            # Slower tempo -> Ballad
            selected_pattern = STANDARD_STRUM_PATTERNS[2]
        elif bpm > 130:
            # Fast tempo -> Driving Pop-Rock
            selected_pattern = STANDARD_STRUM_PATTERNS[1]
        elif syncopation_ratio > 0.65:
            # High syncopation -> Driving or Blues Shuffle
            selected_pattern = STANDARD_STRUM_PATTERNS[1]
        else:
            # Medium tempo -> Classic Folk/Pop
            selected_pattern = STANDARD_STRUM_PATTERNS[0]

    return {
        "bpm": bpm,
        "timeSignature": "4/4",
        "beatTimes": beat_times_list,
        "beatFrames": beat_frames,
        "strummingPattern": {
            "name": selected_pattern["name"],
            "pattern": selected_pattern["pattern"],
            "strokes": selected_pattern["strokes"],
            "subdivisions": selected_pattern["subdivisions"],
            "description": selected_pattern["description"]
        }
    }
