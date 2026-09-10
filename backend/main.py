"""
FastAPI Application Entry Point for ChordCoach MIR Analysis Engine
"""
import os
import hashlib
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import httpx

from services.audio_processor import analyze_audio_file, analyze_audio_data, generate_synthetic_chord_audio
from services.url_processor import process_url_audio, is_youtube_url

app = FastAPI(
    title="Sonara API",
    description="Music Information Retrieval (MIR) API for Chords, Key, Beat Tracking, and Rhythm Estimation",
    version="1.0.0"
)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "audio_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=CACHE_DIR), name="media")

# Allow Cross-Origin Requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_SONGS = [
    {
        "id": "acoustic-pop",
        "title": "Sunny Acoustic Pop",
        "artist": "Sonara Studio",
        "audioUrl": "/samples/acoustic-pop.wav",
        "duration": 16.0,
        "bpm": 120.0,
        "timeSignature": "4/4",
        "key": "G Major",
        "tonic": "G",
        "mode": "major",
        "keyConfidence": 0.96,
        "strummingPattern": {
            "name": "Classic Folk / Pop",
            "pattern": "D - D U - U D U",
            "strokes": ["D", "-", "D", "U", "-", "U", "D", "U"],
            "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
            "description": "Versatile all-around acoustic strum, perfect for pop, folk, and singer-songwriter songs."
        },
        "beatTimes": [round(i * 0.5, 3) for i in range(32)],
        "chords": [
            {"chord": "G", "startTime": 0.0, "endTime": 4.0, "confidence": 0.95},
            {"chord": "Em", "startTime": 4.0, "endTime": 8.0, "confidence": 0.93},
            {"chord": "C", "startTime": 8.0, "endTime": 12.0, "confidence": 0.94},
            {"chord": "D", "startTime": 12.0, "endTime": 16.0, "confidence": 0.96},
        ],
        "rawChords": [
            {"chord": "G", "startTime": 0.0, "endTime": 1.8, "confidence": 0.72},
            {"chord": "Gsus4", "startTime": 1.8, "endTime": 2.3, "confidence": 0.65},
            {"chord": "G", "startTime": 2.3, "endTime": 4.0, "confidence": 0.78},
            {"chord": "Em", "startTime": 4.0, "endTime": 5.6, "confidence": 0.81},
            {"chord": "Em7", "startTime": 5.6, "endTime": 6.2, "confidence": 0.68},
            {"chord": "Em", "startTime": 6.2, "endTime": 8.0, "confidence": 0.84},
            {"chord": "C", "startTime": 8.0, "endTime": 9.7, "confidence": 0.76},
            {"chord": "Cadd9", "startTime": 9.7, "endTime": 10.3, "confidence": 0.63},
            {"chord": "C", "startTime": 10.3, "endTime": 12.0, "confidence": 0.80},
            {"chord": "D", "startTime": 12.0, "endTime": 14.2, "confidence": 0.82},
            {"chord": "Dsus4", "startTime": 14.2, "endTime": 15.0, "confidence": 0.67},
            {"chord": "D", "startTime": 15.0, "endTime": 16.0, "confidence": 0.85},
        ],
        "aiRefined": True,
        "aiNotes": "Standard I - vi - IV - V acoustic pop progression in G Major refined with Gemini AI."
    },
    {
        "id": "blues-progression",
        "title": "Midnight Blues Shuffle",
        "artist": "Sonara Studio",
        "audioUrl": "/samples/blues-progression.wav",
        "duration": 18.0,
        "bpm": 95.0,
        "timeSignature": "4/4",
        "key": "A Minor",
        "tonic": "A",
        "mode": "minor",
        "keyConfidence": 0.92,
        "strummingPattern": {
            "name": "Blues Shuffle",
            "pattern": "D - D U D - D U",
            "strokes": ["D", "-", "D", "U", "D", "-", "D", "U"],
            "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
            "description": "Swung shuffle rhythm characteristic of 12-bar blues and classic rock 'n' roll."
        },
        "beatTimes": [round(i * 0.631, 3) for i in range(29)],
        "chords": [
            {"chord": "A7", "startTime": 0.0, "endTime": 4.0, "confidence": 0.94},
            {"chord": "D7", "startTime": 4.0, "endTime": 8.0, "confidence": 0.91},
            {"chord": "A7", "startTime": 8.0, "endTime": 10.0, "confidence": 0.93},
            {"chord": "E7", "startTime": 10.0, "endTime": 13.0, "confidence": 0.90},
            {"chord": "D7", "startTime": 13.0, "endTime": 15.0, "confidence": 0.92},
            {"chord": "A7", "startTime": 15.0, "endTime": 18.0, "confidence": 0.95},
        ],
        "rawChords": [
            {"chord": "A", "startTime": 0.0, "endTime": 1.5, "confidence": 0.70},
            {"chord": "A7", "startTime": 1.5, "endTime": 4.0, "confidence": 0.88},
            {"chord": "D", "startTime": 4.0, "endTime": 5.8, "confidence": 0.74},
            {"chord": "D7", "startTime": 5.8, "endTime": 8.0, "confidence": 0.86},
            {"chord": "A7", "startTime": 8.0, "endTime": 10.0, "confidence": 0.89},
            {"chord": "E", "startTime": 10.0, "endTime": 11.2, "confidence": 0.73},
            {"chord": "E7", "startTime": 11.2, "endTime": 13.0, "confidence": 0.87},
            {"chord": "D7", "startTime": 13.0, "endTime": 15.0, "confidence": 0.85},
            {"chord": "A7", "startTime": 15.0, "endTime": 18.0, "confidence": 0.91},
        ],
        "aiRefined": True,
        "aiNotes": "Classic 12-bar blues shuffle in A with dominant 7th voicings refined with Gemini AI."
    },
    {
        "id": "ballad",
        "title": "Golden Hour Ballad",
        "artist": "Sonara Studio",
        "audioUrl": "/samples/ballad.wav",
        "duration": 16.0,
        "bpm": 76.0,
        "timeSignature": "4/4",
        "key": "C Major",
        "tonic": "C",
        "mode": "major",
        "keyConfidence": 0.95,
        "strummingPattern": {
            "name": "Steady 8th Ballad",
            "pattern": "D - D - D U D U",
            "strokes": ["D", "-", "D", "-", "D", "U", "D", "U"],
            "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
            "description": "Relaxed, supportive pattern ideal for ballads and slower acoustic tracks."
        },
        "beatTimes": [round(i * 0.789, 3) for i in range(21)],
        "chords": [
            {"chord": "C", "startTime": 0.0, "endTime": 4.0, "confidence": 0.96},
            {"chord": "G", "startTime": 4.0, "endTime": 8.0, "confidence": 0.92},
            {"chord": "Am", "startTime": 8.0, "endTime": 12.0, "confidence": 0.95},
            {"chord": "F", "startTime": 12.0, "endTime": 16.0, "confidence": 0.94},
        ],
        "rawChords": [
            {"chord": "C", "startTime": 0.0, "endTime": 3.2, "confidence": 0.85},
            {"chord": "Csus2", "startTime": 3.2, "endTime": 4.0, "confidence": 0.62},
            {"chord": "G", "startTime": 4.0, "endTime": 7.1, "confidence": 0.81},
            {"chord": "G7", "startTime": 7.1, "endTime": 8.0, "confidence": 0.69},
            {"chord": "Am", "startTime": 8.0, "endTime": 11.4, "confidence": 0.86},
            {"chord": "Am7", "startTime": 11.4, "endTime": 12.0, "confidence": 0.64},
            {"chord": "F", "startTime": 12.0, "endTime": 16.0, "confidence": 0.88},
        ],
        "aiRefined": True,
        "aiNotes": "Romantic I - V - vi - IV pop ballad in C Major refined with Gemini AI."
    }
]


class UrlAnalysisRequest(BaseModel):
    url: str
    title: Optional[str] = "Web Audio Stream"


@app.get("/")
def root():
    return {
        "name": "Sonara Audio Processing API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": ["/api/health", "/api/samples", "/api/analyze", "/api/analyze-url"]
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Sonara-MIR-Backend"}


@app.get("/api/samples")
def get_sample_songs():
    """
    Returns the pre-computed sample songs metadata and chord charts.
    """
    return {"samples": SAMPLE_SONGS}


@app.post("/api/analyze")
def analyze_file(file: UploadFile = File(...)):
    """
    Upload an audio file (MP3, WAV, M4A, OGG, OPUS, AAC, FLAC, etc.) to extract Key, BPM, Chords, and Strumming pattern.
    """
    allowed_extensions = {
        ".mp3", ".wav", ".m4a", ".ogg", ".flac", ".opus", ".aac",
        ".webm", ".weba", ".wma", ".aiff", ".mp4", ".oga", ".m4r"
    }
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext and ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format '{ext}'. Supported: MP3, WAV, M4A, OGG, OPUS, AAC, FLAC."
        )

    try:
        contents = file.file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file provided.")

        result = analyze_audio_file(contents, file.filename or "uploaded_audio.wav")
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")


@app.post("/api/analyze-url")
def analyze_url(req: UrlAnalysisRequest):
    """
    Fetch and extract an audio stream from a YouTube URL or direct audio stream,
    and process it through the MIR pipeline with disk caching.
    """
    url = req.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="Invalid URL protocol. Must start with http:// or https://")

    # Check if URL matches one of our demo sample song IDs/URLs
    for sample in SAMPLE_SONGS:
        if sample["id"] in url or sample["audioUrl"] in url:
            return sample

    try:
        result = process_url_audio(url, title_override=req.title)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to process audio stream from URL: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
