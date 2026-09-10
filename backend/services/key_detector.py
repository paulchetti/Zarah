"""
Key and Scale Detection Service using Krumhansl-Schmuckler Key-Finding Algorithm
"""
from typing import Dict, Any, Tuple
import numpy as np
import librosa

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Krumhansl-Kessler / Krumhansl-Schmuckler key profiles
# Normalized weights for the 12 chromatic pitch classes in major and minor modes
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

# Normalize profiles to zero mean and unit variance for correlation
MAJOR_PROFILE_NORM = (MAJOR_PROFILE - np.mean(MAJOR_PROFILE)) / np.std(MAJOR_PROFILE)
MINOR_PROFILE_NORM = (MINOR_PROFILE - np.mean(MINOR_PROFILE)) / np.std(MINOR_PROFILE)


def estimate_key_from_chroma(chroma_mean: np.ndarray) -> Dict[str, Any]:
    """
    Given a 12-dimensional pitch class energy distribution (chromagram averaged across time),
    correlates with 24 major and minor profiles and finds the most probable musical key.
    """
    if len(chroma_mean) != 12:
        raise ValueError("Chroma mean vector must have exactly 12 pitch classes.")

    std = np.std(chroma_mean)
    if std < 1e-6:
        # Uniform or silent audio, default to C Major
        return {
            "key": "C Major",
            "tonic": "C",
            "mode": "major",
            "confidence": 0.5,
            "all_scores": {"C Major": 0.5}
        }

    chroma_norm = (chroma_mean - np.mean(chroma_mean)) / std

    best_key = "C Major"
    best_tonic = "C"
    best_mode = "major"
    highest_corr = -2.0
    all_scores = {}

    for i, root in enumerate(NOTE_NAMES):
        # Major correlation (roll template to match root)
        maj_template = np.roll(MAJOR_PROFILE_NORM, i)
        maj_corr = float(np.corrcoef(chroma_norm, maj_template)[0, 1])
        maj_key_name = f"{root} Major"
        all_scores[maj_key_name] = round(maj_corr, 3)

        if maj_corr > highest_corr:
            highest_corr = maj_corr
            best_key = maj_key_name
            best_tonic = root
            best_mode = "major"

        # Minor correlation
        min_template = np.roll(MINOR_PROFILE_NORM, i)
        min_corr = float(np.corrcoef(chroma_norm, min_template)[0, 1])
        min_key_name = f"{root} Minor"
        all_scores[min_key_name] = round(min_corr, 3)

        if min_corr > highest_corr:
            highest_corr = min_corr
            best_key = min_key_name
            best_tonic = root
            best_mode = "minor"

    # Map correlation (-1 to 1) to confidence (0 to 1)
    confidence = max(0.0, min(1.0, (highest_corr + 1.0) / 2.0))

    return {
        "key": best_key,
        "tonic": best_tonic,
        "mode": best_mode,
        "confidence": round(confidence, 2),
        "all_scores": all_scores
    }


def detect_key(y: np.ndarray, sr: int, chroma: np.ndarray = None) -> Dict[str, Any]:
    """
    Detects the key and scale of an audio time series y with sample rate sr.
    Can reuse pre-computed chroma feature matrix for maximum performance.
    """
    if chroma is None:
        # Harmonic-percussive separation to isolate pitch content from drums/transients
        try:
            y_harmonic = librosa.effects.harmonic(y, margin=3.0)
        except Exception:
            y_harmonic = y

        # Compute Constant-Q chromagram for accurate musical pitch resolution
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr, bins_per_octave=24)

    # Average energy across time
    chroma_mean = np.mean(chroma, axis=1)

    return estimate_key_from_chroma(chroma_mean)
