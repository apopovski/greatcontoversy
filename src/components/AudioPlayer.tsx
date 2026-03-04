import React, { useEffect, useRef, useState } from 'react';
import MinimizedAudioBar from './MinimizedAudioBar';
import './AudioPlayer.css';
import { LANGUAGE_NAMES } from '../utils/language';

type Props = {
  lang: string;
  chapterIdx: number;
  chapterTitle?: string;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  minimized?: boolean;
  onExpand?: () => void;
  onMinimize?: () => void;
  containerWidth?: number | null;
};

type AudioManifestTrack = {
  chapterIdx: number;
  code?: string;
  title?: string;
  url: string;
};

type AudioManifest = {
  bookLanguageFolder?: string;
  bookLanguageName?: string;
  source?: {
    name?: string;
    url?: string;
    licenseSummary?: string;
    termsUrl?: string;
  };
  tracks?: AudioManifestTrack[];
};

type Attribution = {
  name: string;
  url: string;
  licenseSummary?: string;
};

const ENGLISH_FOLDER = 'The Great Controversy - Ellen G. White 2';
const ENGLISH_MANIFEST_PATH = '/book-content/audio-manifests/gc-english.json';

const EWA_BASE = 'https://ellenwhiteaudio.org/audio';

const AUDIO_LANGUAGE_CODES: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'en',
  'El Conflicto de los Siglos - Ellen G. White': 'sp',
  'Der grosse Kampf - Ellen G. White': 'de',
  'Il gran conflitto - Ellen G. White': 'it',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'da',
  'Mot historiens klimaks - Ellen G. White': 'no',
  'O Grande Conflito - Ellen G. White': 'pt',
  'O Le Finauga Tele - Ellen G. White': 'sm',
  'Suur Voitlus - Ellen G. White': 'et',
  'Tragedia veacurilor - Ellen G. White': 'ro',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'hr',
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': 'bg',
  'Velke drama veku - Ellen G. White': 'sk',
  'Velky spor vekov - Ellen G. White': 'cs',
  "Vielika borot'ba - Ellen G. White": 'uk',
  "Vielikaia bor'ba - Ellen G. White": 'ru',
  'Wielki boj - Ellen G. White': 'pl',
  "alSra` al`Zym - Ellen G. White": 'ar',
  'Amharic - Ellen G. White': 'am',
  'Chinese - Ellen G. White': 'cn',
  'Japanese - Ellen G. White': 'ja',
  'Korean - Ellen G. White': 'kr',
  'Serbian - Ellen G. White': 'sr',
  'Farsi - Ellen G. White': 'fa',
  'Afrikaans - Ellen G. White': 'af',
  'Hindi - Ellen G. White': 'hi',
  'Bengali - Ellen G. White': 'bn',
  'Indonesian - Ellen G. White': 'id',
  'Urdu - Ellen G. White': 'ur',
  'French - Ellen G. White': 'fr',
  'Beteja e Madhe - Ellen G. White': 'sq',
};

type DirectoryTrack = {
  order: number;
  name: string;
  url: string;
};

function decodeLoose(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function inferTrackOrder(fileName: string) {
  const normalized = decodeLoose(fileName).replace(/[_]+/g, ' ').trim();
  const leading = normalized.match(/^[^\d]{0,8}(\d{1,3})(?:\D|$)/);
  if (leading) return Number(leading[1]);

  const generic = normalized.match(/(?:^|\D)(\d{1,3})(?:\D|$)/);
  if (generic) return Number(generic[1]);

  return Number.MAX_SAFE_INTEGER;
}

function pickDirectoryTrackForChapter(tracks: DirectoryTrack[], chapterIndex: number) {
  if (!tracks.length) return null;

  const byExact = tracks.find((t) => t.order === chapterIndex);
  if (byExact) return byExact;

  const byPlusOne = tracks.find((t) => t.order === chapterIndex + 1);
  if (byPlusOne) return byPlusOne;

  const sorted = [...tracks].sort((a, b) => {
    if (a.order === b.order) return a.name.localeCompare(b.name);
    return a.order - b.order;
  });

  if (chapterIndex >= 0 && chapterIndex < sorted.length) {
    return sorted[chapterIndex];
  }

  return null;
}

function fmtTime(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function AudioPlayer({ lang, chapterIdx, chapterTitle, onNextChapter, onPrevChapter, minimized, onExpand, onMinimize, containerWidth }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState<number>(() => Number(localStorage.getItem('audio-speed') || '1'));
  const [volume, setVolume] = useState<number>(() => Number(localStorage.getItem('audio-volume') || '1'));
  const [audioLang, setAudioLang] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [attribution, setAttribution] = useState<Attribution | null>(null);

  // Load audio from manifest first, then fallback to local index.json if available
  useEffect(() => {
    let mounted = true;

    const fetchIndex = async (languageName: string) => {
      const base = `/book-content/audio/${encodeURIComponent(languageName)}`;
      try {
        const r = await fetch(`${base}/index.json`);
        if (!r.ok) return null;
        const list = await r.json() as string[];
        return { list, base };
      } catch (err) {
        console.error('[AudioPlayer] Local audio index fetch failed', err);
        return null;
      }
    };

    const fetchManifest = async (manifestPath: string) => {
      try {
        const r = await fetch(manifestPath);
        if (!r.ok) return null;
        return (await r.json()) as AudioManifest;
      } catch {
        return null;
      }
    };

    const fetchDirectoryTracks = async (audioCode: string) => {
      const dirUrl = `${EWA_BASE}/${encodeURIComponent(audioCode)}/gc/`;
      try {
        const r = await fetch(dirUrl);
        if (!r.ok) return null;
        const html = await r.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];

        const tracks: DirectoryTrack[] = anchors
          .map((a) => (a.getAttribute('href') || '').trim())
          .filter((href) => /\.mp3(?:$|\?)/i.test(href))
          .map((href) => {
            const absolute = new URL(href, dirUrl).toString();
            const fileName = decodeLoose(absolute.split('/').pop() || href);
            return {
              order: inferTrackOrder(fileName),
              name: fileName,
              url: absolute,
            };
          })
          .filter((t, idx, arr) => arr.findIndex((x) => x.url === t.url) === idx)
          .sort((a, b) => {
            if (a.order === b.order) return a.name.localeCompare(b.name);
            return a.order - b.order;
          });

        return tracks.length ? tracks : null;
      } catch {
        return null;
      }
    };

    const resolveManifestPath = (langFolder: string, languageName: string) => {
      if (langFolder === ENGLISH_FOLDER) return ENGLISH_MANIFEST_PATH;
      if ((languageName || '').toLowerCase() === 'english') return ENGLISH_MANIFEST_PATH;
      return null;
    };

    const findTrackFromManifest = (manifest: AudioManifest | null, currentChapterIdx: number) => {
      if (!manifest?.tracks?.length) return null;
      return manifest.tracks.find((t) => t.chapterIdx === currentChapterIdx) || null;
    };

    const load = async () => {
      setLoadingAudio(true);
      setSrc(null);
      setAudioLang(null);
      setAttribution(null);

      // Try to get the language name from LANGUAGE_NAMES mapping
      const mappedLang = LANGUAGE_NAMES[lang];

      // Use mapped name if available, otherwise use input directly
      const preferredLang = mappedLang || lang;

      // 1) Try external manifest source (currently English GC)
      const preferredManifestPath = resolveManifestPath(lang, preferredLang);
      const fallbackManifestPath = preferredManifestPath ? null : ENGLISH_MANIFEST_PATH;

      if (preferredManifestPath) {
        const manifest = await fetchManifest(preferredManifestPath);
        const track = findTrackFromManifest(manifest, chapterIdx);
        if (mounted && track?.url) {
          setSrc(track.url);
          setAudioLang(manifest?.bookLanguageName || preferredLang);
          setAttribution({
            name: manifest?.source?.name || 'EllenWhiteAudio.org',
            url: manifest?.source?.url || 'https://ellenwhiteaudio.org/great-controversy/',
            licenseSummary: manifest?.source?.licenseSummary,
          });
          setLoadingAudio(false);
          return;
        }
      }

      if (fallbackManifestPath) {
        const manifest = await fetchManifest(fallbackManifestPath);
        const track = findTrackFromManifest(manifest, chapterIdx);
        if (mounted && track?.url) {
          setSrc(track.url);
          setAudioLang(manifest?.bookLanguageName || 'English');
          setAttribution({
            name: manifest?.source?.name || 'EllenWhiteAudio.org',
            url: manifest?.source?.url || 'https://ellenwhiteaudio.org/great-controversy/',
            licenseSummary: manifest?.source?.licenseSummary,
          });
          setLoadingAudio(false);
          return;
        }
      }

      // 1b) Try dynamic EllenWhiteAudio multilingual directory
      const audioCode = AUDIO_LANGUAGE_CODES[lang];
      if (audioCode) {
        const tracks = await fetchDirectoryTracks(audioCode);
        const chosen = pickDirectoryTrackForChapter(tracks || [], chapterIdx);
        if (mounted && chosen) {
          setSrc(chosen.url);
          setAudioLang(preferredLang);
          setAttribution({
            name: 'EllenWhiteAudio.org',
            url: `https://ellenwhiteaudio.org/${audioCode === 'en' ? '' : audioCode}`,
            licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
          });
          setLoadingAudio(false);
          return;
        }
      }

      // 2) Fallback to local audio index support
      let result = await fetchIndex(preferredLang);
      let usedLang = preferredLang;

      // If not found and not English, try English
      if (!result && preferredLang.toLowerCase() !== 'english') {
        result = await fetchIndex('English');
        if (result) usedLang = 'English';
      }

      if (!mounted) return;

      if (result) {
        const pad = String(chapterIdx + 1).padStart(2, '0');
        const match = result.list.find((f) => f.startsWith(`GC-${pad}-`) || f.startsWith(`GC-${pad}`));
        setAudioLang(usedLang);
        const newSrc = match ? `${result.base}/${encodeURIComponent(match)}` : null;
        setSrc(newSrc);
      } else {
        setAudioLang(null);
        setSrc(null);
      }

      setLoadingAudio(false);
    };

    load();
    return () => { mounted = false; };
  }, [lang, chapterIdx]);

  // persist speed and volume
  useEffect(() => {
    try { localStorage.setItem('audio-speed', String(speed)); } catch {}
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);
  useEffect(() => { 
    try { localStorage.setItem('audio-volume', String(volume)); } catch {} 
    if (audioRef.current) audioRef.current.volume = volume; 
  }, [volume]);

  // attach events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      // Auto-play next chapter if available
      if (onNextChapter) onNextChapter();
    };
    const onError = (e: ErrorEvent) => { console.error('[AudioPlayer] Event: error', e); };

    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
    };
  }, [src, onNextChapter]);

  // resume saved position per lang+chapter
  useEffect(() => {
    if (!src) return;
    const languageName = LANGUAGE_NAMES[lang] || lang;
    const key = `audio-pos:${languageName}:${chapterIdx}`;
    const a = audioRef.current;
    const tryRestore = () => {
      try {
        const v = Number(localStorage.getItem(key) || '0');
        if (a && isFinite(v) && v > 2 && v < (a.duration || Infinity)) {
          a.currentTime = v;
        }
      } catch(e) {
        console.error('[AudioPlayer] Error restoring position', e);
      }
    };
    // wait for metadata
    const onMeta = () => {
      tryRestore();
    }
    a?.addEventListener('loadedmetadata', onMeta);
    tryRestore(); // Also try immediately in case metadata is already loaded
    return () => { a?.removeEventListener('loadedmetadata', onMeta); };
  }, [src, lang, chapterIdx]);

  // save position periodically
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) return;
    let t: number | null = null;
    const save = () => {
      if (a.currentTime > 0 && a.duration > 0) {
        const languageName = LANGUAGE_NAMES[lang] || lang;
        const key = `audio-pos:${languageName}:${chapterIdx}`;
        try { 
          localStorage.setItem(key, String(a.currentTime || 0)); 
          // console.log(`[AudioPlayer] Position saved for ${key}: ${a.currentTime}`);
        } catch {}
      }
    };
    t = window.setInterval(save, 3000);
    return () => { if (t) window.clearInterval(t); };
  }, [src, lang, chapterIdx]);
  
  // toggle play/pause
  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) {
        await a.play();
      } else {
        a.pause();
      }
    } catch (err) {
      console.error('[AudioPlayer] Error in toggle play/pause:', err);
    }
  };

  const seekTo = (p: number) => {
    const a = audioRef.current; 
    if (!a) return; 
    a.currentTime = p;
  };

  const displayAudioLang = audioLang || (LANGUAGE_NAMES[lang] || lang);

  if (loadingAudio) {
    return (
      <div className="audio-player modern-audio-player audio-unavailable">
        <div className="audio-unavailable-text">Loading audio…</div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="audio-player modern-audio-player audio-unavailable">
        <div className="audio-unavailable-text">
          {audioLang ? 'Audio is not available for this chapter.' : 'Audio is not available for this language yet.'}
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <MinimizedAudioBar
        playing={playing}
        time={time}
        duration={duration}
        onToggle={toggle}
        onExpand={onExpand || (() => {})}
        chapterTitle={chapterTitle || ''}
        containerWidth={containerWidth}
      />
    );
  }

  return (
    <div className="audio-player modern-audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="audio-info">
        <div className="audio-chapter">
          <span className="audio-chapter-title">{chapterTitle || 'Untitled Chapter'}</span>
          <span className="audio-chapter-lang">{displayAudioLang}</span>
        </div>
        <div className="audio-top-actions">
          <div className="audio-times">{fmtTime(time)} / {fmtTime(duration)}</div>
          {onMinimize && (
            <button className="audio-minimize-btn" onClick={onMinimize} aria-label="Minimize player" title="Minimize player">
              ─
            </button>
          )}
        </div>
      </div>
      <div className="audio-controls">
        <button className="audio-btn audio-btn-secondary" onClick={() => onPrevChapter?.()} aria-label="Previous chapter" title="Previous chapter" disabled={!onPrevChapter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20L9 12l10-8v16z"/><path d="M5 19V5"/></svg>
        </button>
        <button className="audio-btn audio-rewind" onClick={() => seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - 15))} aria-label="Rewind 15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19l-9-7 9-7v14zM22 19l-9-7 9-7v14z"/></svg>
        </button>
        <button className="audio-btn audio-play" onClick={toggle} aria-label="Play/Pause">
          {playing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button className="audio-btn audio-forward" onClick={() => seekTo(Math.min(audioRef.current?.duration || 0, (audioRef.current?.currentTime || 0) + 15))} aria-label="Forward 15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5l9 7-9 7V5zM2 5l9 7-9 7V5z"/></svg>
        </button>
        <button className="audio-btn audio-btn-secondary" onClick={() => onNextChapter?.()} aria-label="Next chapter" title="Next chapter" disabled={!onNextChapter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4l10 8-10 8V4z"/><path d="M19 5v14"/></svg>
        </button>
      </div>
      <div className="audio-timeline" onClick={(e) => {
        const el = e.currentTarget as HTMLElement; const rect = el.getBoundingClientRect(); const x = (e as React.MouseEvent).clientX - rect.left; const pct = x / rect.width; seekTo((audioRef.current?.duration || 0) * pct);
      }}>
        <div className="audio-progress" style={{ width: `${(duration ? (time / duration) : 0) * 100}%` }} />
      </div>
      <div className="audio-settings">
        <label className="audio-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <select value={String(speed)} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </label>
        <label className="audio-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <input type="range" min={0} max={1} step={0.01} value={String(volume)} onChange={(e) => setVolume(Number(e.target.value))} />
        </label>
        {src && <a className="audio-download" href={src} download target="_blank" rel="noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>}
      </div>
      {attribution && (
        <div className="audio-attribution">
          Audio by <a href={attribution.url} target="_blank" rel="noreferrer">{attribution.name}</a>
          {attribution.licenseSummary ? <span> · {attribution.licenseSummary}</span> : null}
        </div>
      )}
    </div>
  );
}
