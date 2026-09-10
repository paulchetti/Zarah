# 🌌 Zarah - Intelligent Audio MIR & Harmonic Visualizer

**Zarah** is a production-ready, full-stack music intelligence workstation designed for musicians, producers, and learners to extract chords, musical keys, beat grids, and strumming patterns from audio recordings, visualizing them in real time across an artisan guitar fretboard and concert grand piano.

---

## 🌟 Visual & Musical Highlights

1. **Luminescent Obsidian Aesthetic**:
   - Deep obsidian canvas (`#05070d`) with floating atmospheric auroras (warm amber, electric indigo, radiant cyan).
   - Glassmorphic DAW-inspired studio decks (`backdrop-blur-2xl`, `border-white/[0.08]`).
   - Geometric typography powered by Google's **Outfit** font.

2. **Artisan Guitar Fretboard (Dynamic SVG)**:
   - African ebony woodgrain gradient with specular 3D nickel-silver fret wires.
   - Iridescent pearlescent abalone inlay markers (double dots at the 12th fret).
   - Realistic wound-bronze and steel guitar strings with drop shadows and active vibration ripples.
   - Polished golden brass Capo clamp with real-time open shape recalculation.
   - Numbered finger badges (1=Index, 2=Middle, 3=Ring, 4=Pinky) with radiant glowing halos.

3. **Concert Grand Piano Keyboard (Dynamic SVG)**:
   - Polished ivory keys with subtle 3D bevels and soft drop shadows.
   - Semi-gloss ebony black keys with realistic key elevations.
   - Dynamic radiant keypress illumination (cyan-indigo glow) with note letter badges and chord root indicators.

4. **Studio Master Demo Tracks**:
   - 3 Pre-loaded collector vinyl tracks with rich gradient artwork for instant auditioning:
     - *Sunny Acoustic Pop* (G Major | 120 BPM | G - Em - C - D)
     - *Midnight Blues Shuffle* (A Minor | 95 BPM | A7 - D7 - A7 - E7 - D7 - A7)
     - *Golden Hour Ballad* (C Major | 76 BPM | C - G - Am - F)

5. **Music Information Retrieval (MIR) Pipeline**:
   - **Key & Scale Detection**: Constant-Q Chromagram (CQT) correlated with Krumhansl-Schmuckler (K-S) key profiles across all 24 major and minor keys with confidence scoring.
   - **BPM & Beat Tracking**: Dynamic tempo estimation and beat-synchronized frame pooling.
   - **Chord Recognition**: Chroma template matching across 96 chord variations (Major, Minor, 7ths, Maj7, Min7, Sus2, Sus4, Diminished) with beat-synchronous pooling and temporal smoothing.
   - **Rhythm & Strumming Pattern Estimator**: Onset strength envelope analysis inferring standard guitar strumming patterns (Down/Up strokes, e.g., `D - D U - U D U`).

6. **Interactive Audio Visualizer & Player**:
   - **Waveform Display**: Wavesurfer.js waveform with reactive atmospheric halo, scrubbing, and time tracking.
   - **Harmonic Ribbon**: Horizontally scrolling chord timeline with live progress indicator and upcoming chord preview.
   - **Practice Controls**: Pitch-preserved speed controls (`0.5x`, `0.75x`, `1.0x`, `1.25x`), A-B section looping with shaded waveform overlay, and Web Audio synthesized metronome clicks.
   - **Transposition & Capo Tools**: Real-time pitch shifting (+/- 6 semitones) and guitar capo recalculation (frets 0 to 7).

7. **Graceful Offline Fallback**:
   - If the Python FastAPI backend is offline, Zarah automatically falls back to an embedded client-side MIR engine so that the application and practice tools remain 100% functional.

---

## 🛠️ Architecture & Technologies

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React icons, Zustand, Wavesurfer.js, Web Audio API, Vitest.
- **Backend API**: Python 3.11, FastAPI, Uvicorn, Librosa, SciPy, NumPy, SoundFile, Pytest.

```
Zarah/
├── backend/
│   ├── services/
│   │   ├── audio_processor.py   # Audio loading, resampling & pipeline orchestration
│   │   ├── key_detector.py      # Krumhansl-Schmuckler 24-key correlation
│   │   ├── chord_recognizer.py  # Beat-synced chroma template matching
│   │   └── rhythm_estimator.py  # Beat tracking & strumming inference
│   ├── tests/
│   │   └── test_analysis.py     # Backend test suite
│   ├── main.py                  # FastAPI server & endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (layout, page, globals.css)
│   │   ├── components/          # Visualizers, controls, timeline, uploader
│   │   ├── lib/                 # Music theory, chord database, transposition, API
│   │   ├── store/               # Zustand player state management
│   │   └── __tests__/           # Frontend test suite
│   ├── public/samples/          # Pre-loaded demo audio files
│   └── package.json
├── start.bat                    # Windows parallel startup script
├── start.ps1                    # PowerShell startup script
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v18+ or v20+) and npm
- Python 3.11+ (or `uv` package manager)

### 1. Backend Setup (FastAPI + Librosa)
```bash
cd backend
# Create virtual environment and install dependencies:
uv venv .venv --python 3.11
uv pip install -r requirements.txt --python .venv/Scripts/python.exe

# Run backend API server:
.venv\Scripts\python.exe main.py
```
*The API will be available at `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).*

### 2. Frontend Setup (Next.js)
```bash
cd frontend
# Install dependencies:
npm install

# Start Next.js development server:
npm run dev
```
*Open `http://localhost:3000` in your browser.*

### 3. One-Click Startup (Windows)
Run either:
```cmd
start.bat
```
or in PowerShell:
```powershell
.\start.ps1
```

---

## 🧪 Running Unit Tests

### Backend Unit Tests (Pytest)
```bash
cd backend
$env:PYTHONPATH = "."
.venv\Scripts\pytest.exe tests/test_analysis.py -v
```

### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```
