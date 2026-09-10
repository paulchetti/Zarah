"""



Gemini AI Musical Harmony & Chord Refiner Service
Leverages Google Gemini to synthesize authentic, measure-aligned chord progressions,
eliminating micro-chord jitter and providing harmonic perfection.
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load .env variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv()

logger = logging.getLogger("gemini_refiner")

# Preferred Gemini models in fallback order
PREFERRED_MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-3-flash-preview",
]


def _get_gemini_client():
    """Returns an authenticated Gemini client if API key is configured."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Could not initialize Google GenAI client: {e}")
        return None


def refine_chords_with_gemini(
    title: str,
    artist: str = "",
    duration: float = 30.0,
    raw_key: str = "C Major",
    raw_bpm: float = 120.0,
    raw_chords: List[Dict[str, Any]] = None
) -> Optional[Dict[str, Any]]:
    """
    Calls Gemini AI to analyze track metadata and raw DSP chords, returning
    a musically perfect, measure-aligned chord progression.
    """
    client = _get_gemini_client()
    if not client:
        return None

    # Format a condensed summary of the raw DSP chords for context
    raw_chord_summary = []
    if raw_chords:
        for c in raw_chords[:60]:
            raw_chord_summary.append(f"{c.get('chord')}({c.get('startTime')}s-{c.get('endTime')}s)")
    raw_summary_str = ", ".join(raw_chord_summary) if raw_chord_summary else "None"

    prompt = f"""You are a master music theorist, guitarist, and pianist transcribing musical chords.
The user is analyzing an audio track:
- Song Title: "{title}"
- Artist / Channel: "{artist or 'Unknown Artist'}"
- Audio Duration: {round(duration, 2)} seconds
- Raw Detected Key: {raw_key}
- Raw Detected BPM: {round(raw_bpm, 1)}
- Raw DSP Chord Sequence (Contains noise and transient micro-chords):
  [{raw_summary_str}]

YOUR MISSION:
Synthesize the true, authentic harmonic chord progression for this track.

CRITICAL MUSICAL RULES:
1. DYNAMIC CHORD TIMINGS (CRITICAL):
   - Chords MUST NOT all be given an identical rigid duration (do NOT make every chord 4.0 seconds).
   - In real music, chord lengths naturally vary according to the actual song: some chords hold for a full measure, some for 2 measures, some for half a measure (2 beats, ~1-2 seconds) during transitions or cadences, while intro/outro chords may sustain longer.
   - Use the raw detected chord timestamps as musical grounding to place chord changes where the harmony ACTUALLY transitions in the audio.
2. TIMELINE CONTINUITY:
   - The first chord MUST start at startTime: 0.0.
   - The last chord MUST end at endTime: {round(duration, 2)}.
   - Every chord's endTime must exactly equal the next chord's startTime (NO gaps, NO overlaps).
3. STANDARD GUITAR/PIANO CHORDS: Use clean, standard chord shapes (e.g., C, G, Am, F, Em, Dm, D, A, E, Bm, Bb, G7, Cmaj7, Dsus4). Avoid complex micro-jazz extensions unless explicitly in the song. In flat keys, prefer standard enharmonic spelling (e.g., prefer Ab Major over G# Major).
4. SONG RECOGNITION & CAPO GUIDANCE: 
   - If this is a recognized song (like "Stand By Me", "Perfect", etc.), adhere to the authentic song structure.
   - If the audio is pitched in an awkward key for guitar (such as Ab/G# Major, F# Major, or Bb Major), mention the exact Capo position in `aiNotes` (e.g., "Tip: For guitar, place Capo on Fret 1 and play in standard G Major shapes: G - Em - C - D, or transpose +1 to standard A Major").
5. STRUMMING PATTERN: Provide a fitting acoustic/electric strumming pattern (e.g. "D - D U - U D U") with descriptive strokes and subdivisions.

OUTPUT SCHEMA (Return ONLY valid JSON):
{{
  "key": "Refined musical key (e.g. 'G Major' or 'A Minor')",
  "tonic": "Tonic note (e.g. 'G')",
  "mode": "major or minor",
  "bpm": {round(raw_bpm, 1)},
  "aiNotes": "Brief 1-2 sentence description of the harmonic structure and key progression (e.g., 'Classic I - vi - IV - V progression in G Major')",
  "strummingPattern": {{
    "name": "Pattern name",
    "pattern": "D - D U - U D U",
    "strokes": ["D", "-", "D", "U", "-", "U", "D", "U"],
    "subdivisions": ["1", "&", "2", "&", "3", "&", "4", "&"],
    "description": "Playing advice for guitarists and pianists"
  }},
  "chords": [
    {{"chord": "Am", "startTime": 0.0, "endTime": 3.4, "confidence": 0.98}},
    {{"chord": "F", "startTime": 3.4, "endTime": 5.2, "confidence": 0.96}},
    {{"chord": "C", "startTime": 5.2, "endTime": 8.6, "confidence": 0.97}}
  ]
}}
"""

    from google.genai import types

    for model_name in PREFERRED_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,  # Low temperature for precise musical consistency
                )
            )

            if not response or not response.text:
                continue

            data = json.loads(response.text)
            chords = data.get("chords")

            if not chords or not isinstance(chords, list) or len(chords) == 0:
                continue

            # Validate and fix chord timing bounds
            validated_chords = []
            last_end = 0.0

            for i, c in enumerate(chords):
                chord_name = str(c.get("chord", "C")).strip() or "C"
                start = round(float(c.get("startTime", last_end)), 2)
                end = round(float(c.get("endTime", start + 2.0)), 2)

                # Clamp start time to previous end time
                if i == 0:
                    start = 0.0
                else:
                    start = last_end

                if end <= start:
                    end = round(start + 2.0, 2)

                conf = float(c.get("confidence", 0.96))
                validated_chords.append({
                    "chord": chord_name,
                    "startTime": start,
                    "endTime": end,
                    "confidence": min(1.0, max(0.5, conf))
                })
                last_end = end

            # If the chord sequence stops before the track ends, loop the progression across measures
            if validated_chords and last_end < duration - 3.0:
                pattern = [c["chord"] for c in validated_chords]
                chord_durations = [max(1.5, c["endTime"] - c["startTime"]) for c in validated_chords]
                pattern_len = len(pattern)

                loop_idx = 0
                while last_end < duration:
                    chord_name = pattern[loop_idx % pattern_len]
                    chord_dur = chord_durations[loop_idx % pattern_len] if chord_durations else 4.0
                    start = last_end
                    end = min(round(duration, 2), round(start + chord_dur, 2))
                    if end - start < 1.0:
                        validated_chords[-1]["endTime"] = round(duration, 2)
                        break
                    validated_chords.append({
                        "chord": chord_name,
                        "startTime": start,
                        "endTime": end,
                        "confidence": 0.95
                    })
                    last_end = end
                    loop_idx += 1

            # Ensure final chord covers exactly up to track duration
            if validated_chords:
                validated_chords[-1]["endTime"] = round(duration, 2)

            data["chords"] = validated_chords
            data["aiRefined"] = True
            logger.info(f"Successfully refined chords with Gemini ({model_name}): {len(validated_chords)} chords")
            return data

        except Exception as err:
            logger.warning(f"Gemini model {model_name} failed: {err}")
            continue

    return None
