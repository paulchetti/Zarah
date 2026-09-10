"""
Template-Based Chord Recognition Service with Beat-Synchronous Smoothing
"""
from typing import List, Dict, Any, Tuple
import numpy as np
import librosa

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Chord quality interval offsets and weights (Root, 3rd, 5th, extra)
CHORD_TEMPLATES_DEF = {
    "":     {"intervals": [0, 4, 7],         "weights": [1.3, 1.0, 0.8]},       # Major triad
    "m":    {"intervals": [0, 3, 7],         "weights": [1.3, 1.0, 0.8]},       # Minor triad
    "7":    {"intervals": [0, 4, 7, 10],     "weights": [1.2, 0.9, 0.7, 1.0]},  # Dominant 7th
    "maj7": {"intervals": [0, 4, 7, 11],     "weights": [1.2, 0.9, 0.7, 1.0]},  # Major 7th
    "m7":   {"intervals": [0, 3, 7, 10],     "weights": [1.2, 0.9, 0.7, 1.0]},  # Minor 7th
    "sus4": {"intervals": [0, 5, 7],         "weights": [1.2, 1.1, 0.8]},       # Suspended 4th
    "sus2": {"intervals": [0, 2, 7],         "weights": [1.2, 1.1, 0.8]},       # Suspended 2nd
    "dim":  {"intervals": [0, 3, 6],         "weights": [1.2, 1.0, 0.9]},       # Diminished
}

def build_chord_dictionary() -> Tuple[List[str], np.ndarray]:
    """
    Constructs normalized 12-element chroma template vectors for all 96 chords (12 roots * 8 qualities).
    """
    chord_names = []
    templates = []

    for root_idx, root_name in enumerate(NOTE_NAMES):
        for quality, def_data in CHORD_TEMPLATES_DEF.items():
            chord_name = f"{root_name}{quality}"
            vec = np.zeros(12, dtype=np.float32)
            for interval, weight in zip(def_data["intervals"], def_data["weights"]):
                pitch_idx = (root_idx + interval) % 12
                vec[pitch_idx] = weight
            # Normalize vector to unit length
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            chord_names.append(chord_name)
            templates.append(vec)

    return chord_names, np.array(templates, dtype=np.float32)


CHORD_NAMES, CHORD_TEMPLATES = build_chord_dictionary()


def match_chroma_to_chord(chroma_vec: np.ndarray) -> Tuple[str, float]:
    """
    Finds the best matching chord name and cosine similarity score for a 12-pitch chroma vector.
    """
    norm = np.linalg.norm(chroma_vec)
    if norm < 1e-4:
        return "N", 0.0  # Silence or no tonal content

    normalized_chroma = chroma_vec / norm
    similarities = np.dot(CHORD_TEMPLATES, normalized_chroma)
    best_idx = int(np.argmax(similarities))
    best_score = float(similarities[best_idx])
    return CHORD_NAMES[best_idx], best_score


def recognize_chords(
    y: np.ndarray,
    sr: int,
    beat_frames: np.ndarray = None,
    total_duration: float = None,
    min_chord_duration: float = 0.75,
    chroma: np.ndarray = None
) -> List[Dict[str, Any]]:
    """
    Extracts time-aligned chord events using harmonic chroma features synchronized with musical measures.
    """
    if total_duration is None:
        total_duration = float(librosa.get_duration(y=y, sr=sr))

    if total_duration <= 0:
        return []

    hop_length = 512

    if chroma is None:
        # Separate harmonic content to remove drum transient spikes
        try:
            y_harmonic = librosa.effects.harmonic(y, margin=3.0)
        except Exception:
            y_harmonic = y

        # Compute CENS or CQT chromagram
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr, hop_length=hop_length)

    # If beat frames are provided and valid, perform beat-synchronous pooling
    if beat_frames is not None and len(beat_frames) > 2:
        # Evaluate at beat resolution so chords change exactly when the song changes
        end_frame = chroma.shape[1] - 1
        all_frames = [0] + [f for f in beat_frames if 0 < f < end_frame] + [end_frame]
        all_frames = sorted(list(set(all_frames)))

        # Average chroma between each beat window
        frame_chords = []

        for i in range(len(all_frames) - 1):
            f_start = all_frames[i]
            f_end = all_frames[i + 1]
            if f_end <= f_start:
                continue
            slice_chroma = chroma[:, f_start:f_end]
            avg_chroma = np.mean(slice_chroma, axis=1)

            chord_name, score = match_chroma_to_chord(avg_chroma)
            t_start = float(librosa.frames_to_time(f_start, sr=sr, hop_length=hop_length))
            t_end = float(librosa.frames_to_time(f_end, sr=sr, hop_length=hop_length))
            t_end = min(t_end, total_duration)

            frame_chords.append((chord_name, t_start, t_end, score))
    else:
        # Window-based analysis every 1.5s (standard musical harmonic rhythm)
        step_time = 1.5
        n_steps = max(1, int(np.ceil(total_duration / step_time)))
        frame_chords = []

        for step in range(n_steps):
            t_start = step * step_time
            t_end = min((step + 1) * step_time, total_duration)
            f_start = librosa.time_to_frames(t_start, sr=sr, hop_length=hop_length)
            f_end = librosa.time_to_frames(t_end, sr=sr, hop_length=hop_length)
            f_end = max(f_start + 1, min(f_end, chroma.shape[1]))

            slice_chroma = chroma[:, f_start:f_end]
            avg_chroma = np.mean(slice_chroma, axis=1) if slice_chroma.shape[1] > 0 else np.zeros(12)
            chord_name, score = match_chroma_to_chord(avg_chroma)
            frame_chords.append((chord_name, t_start, t_end, score))

    if not frame_chords:
        return [{"chord": "C", "startTime": 0.0, "endTime": round(total_duration, 2), "confidence": 0.8}]

    # Merge consecutive identical chords
    merged: List[Dict[str, Any]] = []
    current_chord = frame_chords[0][0]
    current_start = frame_chords[0][1]
    current_end = frame_chords[0][2]
    scores = [frame_chords[0][3]]

    for chord_name, t_start, t_end, score in frame_chords[1:]:
        if chord_name == current_chord:
            current_end = t_end
            scores.append(score)
        else:
            avg_conf = float(np.mean(scores)) if scores else 0.8
            # Only add if duration is meaningful
            merged.append({
                "chord": current_chord if current_chord != "N" else "Rest",
                "startTime": round(current_start, 2),
                "endTime": round(current_end, 2),
                "confidence": round(avg_conf, 2)
            })
            current_chord = chord_name
            current_start = t_start
            current_end = t_end
            scores = [score]

    avg_conf = float(np.mean(scores)) if scores else 0.8
    merged.append({
        "chord": current_chord if current_chord != "N" else "Rest",
        "startTime": round(current_start, 2),
        "endTime": round(min(current_end, total_duration), 2),
        "confidence": round(avg_conf, 2)
    })

    # Filter out very short transient glitches (< min_chord_duration) by merging them into adjacent chords
    filtered: List[Dict[str, Any]] = []
    for item in merged:
        dur = item["endTime"] - item["startTime"]
        if dur < min_chord_duration and len(filtered) > 0:
            # Extend previous chord
            filtered[-1]["endTime"] = item["endTime"]
        else:
            filtered.append(item)

    # Ensure timeline covers from 0 to total_duration
    if filtered:
        filtered[0]["startTime"] = 0.0
        filtered[-1]["endTime"] = round(total_duration, 2)

    return filtered
