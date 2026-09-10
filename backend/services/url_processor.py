"""
URL Audio Processor Service
Handles audio extraction and MIR analysis from YouTube links and streaming audio URLs with disk caching.
"""
import os
import re
import json
import hashlib
import urllib.parse
from typing import Dict, Any, Optional
import httpx
import librosa

from services.audio_processor import analyze_audio_data

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Regex pattern for matching YouTube video links
YOUTUBE_REGEX = re.compile(
    r'(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})',
    re.IGNORECASE
)


def is_youtube_url(url: str) -> bool:
    """Check if the provided URL is a YouTube link."""
    return bool(YOUTUBE_REGEX.search(url.strip()))


def extract_youtube_id(url: str) -> Optional[str]:
    """Extract the 11-character YouTube video ID from a URL."""
    match = YOUTUBE_REGEX.search(url.strip())
    if match:
        return match.group(1)
    return None


def get_url_cache_id(url: str) -> str:
    """Generate a clean, filesystem-safe cache identifier for a URL."""
    yt_id = extract_youtube_id(url)
    if yt_id:
        return f"yt_{yt_id}"
    # For non-YouTube URLs, use a deterministic SHA-256 hash
    url_hash = hashlib.sha256(url.strip().encode('utf-8')).hexdigest()[:16]
    return f"url_{url_hash}"


def _get_ffmpeg_path() -> Optional[str]:
    """Locate ffmpeg binary, prioritizing bundled imageio-ffmpeg."""
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        if os.path.exists(ffmpeg_exe):
            return ffmpeg_exe
    except Exception:
        pass
    return None


def download_youtube_audio(url: str, cache_id: str) -> Dict[str, Any]:
    """
    Downloads audio from YouTube using yt-dlp, extracts it to 192k MP3,
    and saves to CACHE_DIR.
    """
    import yt_dlp

    out_template = os.path.join(CACHE_DIR, f"{cache_id}.%(ext)s")
    target_mp3 = os.path.join(CACHE_DIR, f"{cache_id}.mp3")

    ffmpeg_path = _get_ffmpeg_path()
    ydl_opts: Dict[str, Any] = {
        'format': 'bestaudio/best',
        'outtmpl': out_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'max_filesize': 100 * 1024 * 1024,  # Max 100MB
        'js_runtimes': {'node': {}},
    }

    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # First extract info without downloading to validate duration
            info = ydl.extract_info(url, download=False)
            if not info:
                raise ValueError("Could not extract video information from YouTube.")

            duration = info.get('duration') or 0
            if duration > 900:  # 15 minutes limit
                raise ValueError(
                    f"Video duration ({round(duration / 60, 1)} mins) exceeds the 15-minute maximum limit for harmonic analysis."
                )

            # Download and extract audio
            ydl.download([url])

            title = info.get('title', 'YouTube Track')
            artist = info.get('uploader') or info.get('channel') or 'YouTube Creator'

            return {
                "filePath": target_mp3,
                "title": title,
                "artist": artist,
                "duration": duration,
            }

    except yt_dlp.utils.DownloadError as e:
        err_msg = str(e)
        if "Private video" in err_msg:
            raise ValueError("This YouTube video is private and cannot be analyzed.")
        elif "Sign in to confirm your age" in err_msg:
            raise ValueError("This YouTube video is age-restricted and requires authentication.")
        elif "Video unavailable" in err_msg:
            raise ValueError("This YouTube video is unavailable or has been removed.")
        elif "Premieres in" in err_msg:
            raise ValueError("This YouTube video is a scheduled premiere and has not aired yet.")
        else:
            clean_msg = err_msg.split("ERROR:")[-1].strip() if "ERROR:" in err_msg else err_msg
            raise ValueError(f"YouTube download failed: {clean_msg}")


def download_direct_audio(url: str, cache_id: str, title_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Downloads direct audio files (MP3, WAV, etc.) from standard HTTP URLs.
    """
    parsed = urllib.parse.urlparse(url)
    filename = os.path.basename(parsed.path) or "stream_audio.mp3"
    ext = os.path.splitext(filename)[1].lower() or ".mp3"
    target_path = os.path.join(CACHE_DIR, f"{cache_id}{ext}")

    with httpx.Client(timeout=45.0, follow_redirects=True) as client:
        resp = client.get(url)
        if resp.status_code != 200:
            raise ValueError(f"Failed to fetch audio stream from URL (HTTP {resp.status_code})")

        content_type = resp.headers.get("content-type", "").lower()
        if "html" in content_type:
            raise ValueError("The provided URL returned a webpage instead of an audio stream.")

        with open(target_path, "wb") as f:
            f.write(resp.content)

    title = title_override or os.path.splitext(filename)[0]
    return {
        "filePath": target_path,
        "title": title,
        "artist": "Web Audio Stream",
        "duration": None,
    }


def process_url_audio(url: str, title_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Main entry point for processing audio from a URL (YouTube or Direct Stream).
    Checks cache first, downloads audio, executes Librosa MIR analysis, and returns
    full analysis dictionary with audioUrl pointing to the static /media endpoint.
    """
    url = url.strip()
    cache_id = get_url_cache_id(url)
    cache_meta_path = os.path.join(CACHE_DIR, f"{cache_id}_analysis.json")
    target_mp3 = os.path.join(CACHE_DIR, f"{cache_id}.mp3")

    # 1. Instant Cache Hit Check
    if os.path.exists(cache_meta_path) and (os.path.exists(target_mp3) or os.path.exists(f"{target_mp3[:-4]}.wav")):
        try:
            with open(cache_meta_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)

            # If cached prior to Gemini integration, enrich with Gemini AI refinement
            if not cached_data.get("aiRefined") and cached_data.get("chords"):
                try:
                    from services.gemini_refiner import refine_chords_with_gemini
                    refined = refine_chords_with_gemini(
                        title=cached_data.get("title", "Audio Track"),
                        artist=cached_data.get("artist", ""),
                        duration=float(cached_data.get("duration", 60.0)),
                        raw_key=cached_data.get("key", "C Major"),
                        raw_bpm=float(cached_data.get("bpm", 120.0)),
                        raw_chords=cached_data["chords"]
                    )
                    if refined and refined.get("chords"):
                        cached_data["rawChords"] = cached_data["chords"]
                        cached_data["chords"] = refined["chords"]
                        cached_data["aiRefined"] = True
                        cached_data["aiNotes"] = refined.get("aiNotes", "Harmonically structured by Gemini AI.")
                        with open(cache_meta_path, "w", encoding="utf-8") as fw:
                            json.dump(cached_data, fw, indent=2)
                except Exception as refine_err:
                    logger.warning(f"Could not backfill Gemini refinement on cached track: {refine_err}")

            return cached_data
        except Exception:
            pass  # If cache read fails, recompute

    # 2. Download / Extract Audio
    audio_info: Dict[str, Any]
    if is_youtube_url(url):
        audio_info = download_youtube_audio(url, cache_id)
    else:
        # Try direct audio download first, fallback to yt-dlp if it's another video/audio platform
        try:
            audio_info = download_direct_audio(url, cache_id, title_override)
        except Exception as direct_err:
            try:
                audio_info = download_youtube_audio(url, cache_id)
            except Exception:
                raise direct_err

    file_path = audio_info["filePath"]
    if not os.path.exists(file_path):
        raise ValueError("Extracted audio file could not be found on server.")

    # 3. Librosa MIR Audio Pipeline
    # Downsample to 22050 Hz mono for optimal speed and MIR accuracy
    y, sr = librosa.load(file_path, sr=22050, mono=True)
    title = audio_info.get("title") or title_override or "Analyzed Audio"
    artist = audio_info.get("artist", "YouTube Creator" if is_youtube_url(url) else "Audio Artist")

    analysis = analyze_audio_data(y, sr, title=title, artist=artist)

    # 4. Enrich with track metadata and audio streaming URL
    audio_filename = os.path.basename(file_path)
    analysis["id"] = cache_id
    analysis["artist"] = artist
    analysis["audioUrl"] = f"/media/{audio_filename}"

    # 5. Save to disk cache for instantaneous future retrievals
    try:
        with open(cache_meta_path, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2)
    except Exception:
        pass

    return analysis
