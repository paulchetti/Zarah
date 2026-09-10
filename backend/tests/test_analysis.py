"""
Unit and Integration Tests for ChordCoach Backend MIR Pipeline
"""
import io
import pytest
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from main import app
from services.key_detector import estimate_key_from_chroma
from services.chord_recognizer import (
    match_chroma_to_chord,
    build_chord_dictionary,
    recognize_chords
)
from services.rhythm_estimator import estimate_rhythm_and_beats
from services.audio_processor import generate_synthetic_chord_audio

client = TestClient(app)


def test_api_health():
    """Verify health check endpoint returns OK status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Sonara" in data["service"]


def test_api_samples():
    """Verify sample songs endpoint returns all 3 sample tracks with full chord charts."""
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) == 3
    sample_ids = [s["id"] for s in data["samples"]]
    assert "acoustic-pop" in sample_ids
    assert "blues-progression" in sample_ids
    assert "ballad" in sample_ids

    pop = next(s for s in data["samples"] if s["id"] == "acoustic-pop")
    assert pop["key"] == "G Major"
    assert len(pop["chords"]) == 4
    assert pop["chords"][0]["chord"] == "G"


def test_chord_template_dictionary():
    """Verify chord template dictionary contains 96 distinct chords (12 roots * 8 qualities)."""
    chord_names, templates = build_chord_dictionary()
    assert len(chord_names) == 96
    assert templates.shape == (96, 12)
    assert "C" in chord_names
    assert "Am" in chord_names
    assert "G7" in chord_names
    assert "Dsus4" in chord_names


def test_chord_matching_accuracy():
    """Verify chroma vectors match to their correct chord names."""
    # C Major: C (0), E (4), G (7)
    c_maj_chroma = np.zeros(12)
    c_maj_chroma[0] = 1.0  # C
    c_maj_chroma[4] = 0.8  # E
    c_maj_chroma[7] = 0.7  # G
    chord_name, score = match_chroma_to_chord(c_maj_chroma)
    assert chord_name == "C"
    assert score > 0.85

    # A Minor: A (9), C (0), E (4)
    a_min_chroma = np.zeros(12)
    a_min_chroma[9] = 1.0  # A
    a_min_chroma[0] = 0.8  # C
    a_min_chroma[4] = 0.7  # E
    chord_name, score = match_chroma_to_chord(a_min_chroma)
    assert chord_name == "Am"
    assert score > 0.85


def test_key_detection():
    """Verify Krumhansl-Schmuckler key profile detection."""
    # G Major scale pitch distribution
    # G A B C D E F#
    g_maj_chroma = np.zeros(12)
    # G=7, A=9, B=11, C=0, D=2, E=4, F#=6
    for pitch in [7, 9, 11, 0, 2, 4, 6]:
        g_maj_chroma[pitch] = 1.0
    g_maj_chroma[7] = 2.0  # Emphasize tonic G
    g_maj_chroma[2] = 1.5  # Emphasize dominant D

    result = estimate_key_from_chroma(g_maj_chroma)
    assert result["tonic"] == "G"
    assert result["mode"] == "major"
    assert result["key"] == "G Major"


def test_full_audio_analysis_with_synthetic_audio():
    """Generate 4 seconds of synthetic G - C chord audio, write to WAV in memory, and analyze via /api/analyze."""
    y, sr = generate_synthetic_chord_audio(["G", "C"], seconds_per_chord=2.0, sr=22050)
    assert len(y) > 0

    wav_io = io.BytesIO()
    sf.write(wav_io, y, sr, format='WAV')
    wav_io.seek(0)

    response = client.post(
        "/api/analyze",
        files={"file": ("synthetic_test.wav", wav_io, "audio/wav")}
    )

    assert response.status_code == 200
    data = response.json()
    assert "chords" in data
    assert len(data["chords"]) >= 1
    assert "bpm" in data
    assert "key" in data
    assert "strummingPattern" in data


def test_youtube_url_detection():
    """Verify regex detection of YouTube URL formats."""
    from services.url_processor import is_youtube_url, extract_youtube_id, get_url_cache_id

    # Valid YouTube formats
    assert is_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert is_youtube_url("http://youtube.com/watch?v=dQw4w9WgXcQ&t=30s")
    assert is_youtube_url("https://youtu.be/dQw4w9WgXcQ")
    assert is_youtube_url("https://www.youtube.com/shorts/dQw4w9WgXcQ")
    assert is_youtube_url("https://music.youtube.com/watch?v=dQw4w9WgXcQ")

    assert extract_youtube_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_url_cache_id("https://youtu.be/dQw4w9WgXcQ") == "yt_dQw4w9WgXcQ"

    # Non-YouTube links
    assert not is_youtube_url("https://example.com/audio.mp3")
    assert not is_youtube_url("https://soundcloud.com/artist/track")
    assert get_url_cache_id("https://example.com/audio.mp3").startswith("url_")


def test_analyze_url_sample_and_validation():
    """Verify /api/analyze-url endpoint handles sample links and protocol validation."""
    # Invalid protocol
    res_bad = client.post("/api/analyze-url", json={"url": "ftp://example.com/song.mp3"})
    assert res_bad.status_code == 400

    # Sample song lookup
    res_sample = client.post("/api/analyze-url", json={"url": "https://example.com/samples/acoustic-pop.wav"})
    assert res_sample.status_code == 200
    assert res_sample.json()["id"] == "acoustic-pop"


def test_gemini_refiner_structure():
    """Verify Gemini refiner service handles timing bounds and chord continuity."""
    from services.gemini_refiner import refine_chords_with_gemini

    # Test with a famous track
    res = refine_chords_with_gemini(
        title="Let It Be",
        artist="The Beatles",
        duration=16.0,
        raw_key="C Major",
        raw_bpm=72.0
    )
    # If API key is valid and quota allows, verify structured output
    if res:
        assert "chords" in res
        assert len(res["chords"]) > 0
        assert res["chords"][0]["startTime"] == 0.0
        assert res["chords"][-1]["endTime"] == 16.0
        assert "key" in res
        assert "aiNotes" in res
        assert res.get("aiRefined") is True
