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
  autoPlayRequest?: number;
  onPlayingChange?: (playing: boolean) => void;
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

type AudioSourceKind =
  | 'english-manifest'
  | 'multilang-manifest'
  | 'remote-directory'
  | 'source-page'
  | 'local-index';

const ENGLISH_FOLDER = 'The Great Controversy - Ellen G. White 2';
const ENGLISH_MANIFEST_PATH = '/book-content/audio-manifests/gc-english.json';
const MULTILANG_MANIFEST_PATH = '/book-content/audio-manifests/gc-multilang.json';
const MULTILANG_EXTRA_MANIFEST_PATH = '/book-content/audio-manifests/gc-multilang-extra.json';

const EWA_BASE = 'https://ellenwhiteaudio.org/audio';

type AudioSourceCandidate = {
  languageCodes: string[];
  bookCodes: string[];
  sourcePageUrl?: string;
};

const AUDIO_SOURCE_CANDIDATES: Record<string, AudioSourceCandidate> = {
  'The Great Controversy - Ellen G. White 2': { languageCodes: ['en'], bookCodes: ['gc'] },
  'El Conflicto de los Siglos - Ellen G. White': {
    languageCodes: ['sp', 'es'],
    bookCodes: ['gc', 'cs'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sp/el-conflicto-de-los-siglos-nueva-narracion/',
  },
  'Der grosse Kampf - Ellen G. White': { languageCodes: ['de'], bookCodes: ['gc', 'gk'] },
  'Il gran conflitto - Ellen G. White': {
    languageCodes: ['it'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/it/il-gran-conflitto/',
  },
  'MOD EN BEDRE FREMTID - Ellen G. White': { languageCodes: ['da'], bookCodes: ['gc', 'mbf'] },
  'Mot historiens klimaks - Ellen G. White': {
    languageCodes: ['no', 'nb'],
    bookCodes: ['gc', 'mhk'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/no/mot-historiens-klimaks-ai/',
  },
  'O Grande Conflito - Ellen G. White': {
    languageCodes: ['pt'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/pt/grande-conflito/',
  },
  'O Le Finauga Tele - Ellen G. White': { languageCodes: ['sm'], bookCodes: ['gc', 'ft'] },
  'Suur Voitlus - Ellen G. White': { languageCodes: ['et'], bookCodes: ['gc', 'sv'] },
  'Tragedia veacurilor - Ellen G. White': { languageCodes: ['ro'], bookCodes: ['gc', 'tv'] },
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': { languageCodes: ['hr'], bookCodes: ['gc', 'vb'] },
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': { languageCodes: ['bg'], bookCodes: ['gc', 'bc'] },
  'Velke drama veku - Ellen G. White': {
    languageCodes: ['sk'],
    bookCodes: ['gc', 'vdv', 'vsv'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sk/velky-spor-vekov-ai/',
  },
  'Velky spor vekov - Ellen G. White': { languageCodes: ['cs'], bookCodes: ['gc', 'vsv', 'vdv'] },
  "Vielika borot'ba - Ellen G. White": { languageCodes: ['uk'], bookCodes: ['gc', 'vb', 'вб'] },
  "Vielikaia bor'ba - Ellen G. White": {
    languageCodes: ['ru'],
    bookCodes: ['gc', 'vb', 'вб'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/ru/%d0%b2%d0%b5%d0%bb%d0%b8%d0%ba%d0%b0%d1%8f-%d0%b1%d0%be%d1%80%d1%8c%d0%b1%d0%b0/',
  },
  'Wielki boj - Ellen G. White': { languageCodes: ['pl'], bookCodes: ['gc', 'wb'] },
  "alSra` al`Zym - Ellen G. White": {
    languageCodes: ['ar'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/ar/ai-%d8%a7%d9%84%d8%b5%d8%b1%d8%a7%d8%b9-%d8%a7%d9%84%d8%b9%d8%b8%d9%8a%d9%85/',
  },
  'Amharic - Ellen G. White': { languageCodes: ['am'], bookCodes: ['gc'] },
  'Chinese - Ellen G. White': {
    languageCodes: ['cn', 'zh'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/cn/%e5%96%84%e6%81%b6%e4%b9%8b%e4%ba%89/',
  },
  'Japanese - Ellen G. White': { languageCodes: ['ja'], bookCodes: ['gc'] },
  'Korean - Ellen G. White': { languageCodes: ['kr', 'ko'], bookCodes: ['gc'] },
  'Serbian - Ellen G. White': {
    languageCodes: ['sr', 'rs'],
    bookCodes: ['gc', 'vb'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sr/velika-borba/',
  },
  'Farsi - Ellen G. White': { languageCodes: ['fa'], bookCodes: ['gc'] },
  'Afrikaans - Ellen G. White': { languageCodes: ['af'], bookCodes: ['gc'] },
  'Hindi - Ellen G. White': { languageCodes: ['hi'], bookCodes: ['gc'] },
  'Bengali - Ellen G. White': { languageCodes: ['bn'], bookCodes: ['gc'] },
  'Indonesian - Ellen G. White': { languageCodes: ['id'], bookCodes: ['gc'] },
  'Urdu - Ellen G. White': { languageCodes: ['ur'], bookCodes: ['gc'] },
  'French - Ellen G. White': {
    languageCodes: ['fr'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/fr/la-tragedie-des-siecles/',
  },
  'Beteja e Madhe - Ellen G. White': { languageCodes: ['sq'], bookCodes: ['gc', 'bz'] },
  'Veliki boj med Kristusom in Satanom - Ellen G. White': {
    languageCodes: ['sl'],
    bookCodes: ['gc', 'vb'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sl/veliki-boj-med-kristusom-in-satanom/',
  },
};

// Show language-menu audio badges only for folders with deterministic, known
// manifest-backed audio availability (to avoid false positives).
const MANIFEST_AUDIO_LANGUAGE_CODES = new Set<string>([
  'en',
  'ar',
  'sr',
  'sp',
  'fr',
  'pt',
  'cn',
  'it',
  'no',
  'ru',
  'sl',
  'sk',
]);

export const AUDIO_AVAILABLE_LANGUAGE_FOLDERS = new Set<string>(
  Object.entries(AUDIO_SOURCE_CANDIDATES)
    .filter(([, candidate]) =>
      candidate.languageCodes.some((code) => MANIFEST_AUDIO_LANGUAGE_CODES.has(code.trim().toLowerCase()))
    )
    .map(([folder]) => folder)
);

type DirectoryTrack = {
  order: number;
  name: string;
  url: string;
};

type MultiLangManifest = Record<string, AudioManifestTrack[]>;

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

function pickTrackFromMultiLangManifest(
  manifest: MultiLangManifest | null,
  languageCodes: string[],
  chapterIndex: number,
) {
  if (!manifest) return null;

  for (const code of languageCodes) {
    const codeTracks = manifest[code];
    if (!codeTracks?.length) continue;

    const exact = codeTracks.find((t) => t.chapterIdx === chapterIndex);
    if (exact?.url) return exact;

    const asDirectoryTracks: DirectoryTrack[] = codeTracks.map((t) => ({
      order: t.chapterIdx,
      name: t.code || t.title || String(t.chapterIdx),
      url: t.url,
    }));

    const picked = pickDirectoryTrackForChapter(asDirectoryTracks, chapterIndex);
    if (picked?.url) {
      return {
        chapterIdx: picked.order,
        title: picked.name,
        url: picked.url,
      } satisfies AudioManifestTrack;
    }
  }

  return null;
}

function fmtTime(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ lang, chapterIdx, chapterTitle, onNextChapter, onPrevChapter, minimized, autoPlayRequest = 0, onPlayingChange, onExpand, onMinimize, containerWidth }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDev = import.meta.env.DEV;
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState<number>(() => Number(localStorage.getItem('audio-speed') || '1'));
  const [volume, setVolume] = useState<number>(() => Number(localStorage.getItem('audio-volume') || '1'));
  const [audioLang, setAudioLang] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [sourceKind, setSourceKind] = useState<AudioSourceKind | null>(null);
  const [copiedSource, setCopiedSource] = useState(false);

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

    const fetchMultiLangManifest = async (manifestPath: string) => {
      try {
        const r = await fetch(manifestPath);
        if (!r.ok) return null;
        return (await r.json()) as MultiLangManifest;
      } catch {
        return null;
      }
    };

    const fetchDirectoryTracks = async (audioCode: string, bookCode: string) => {
      const dirUrl = `${EWA_BASE}/${encodeURIComponent(audioCode)}/${encodeURIComponent(bookCode)}/`;
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

    const fetchBookPageTracks = async (pageUrl: string) => {
      try {
        const r = await fetch(pageUrl);
        if (!r.ok) return null;
        const html = await r.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const tracks: DirectoryTrack[] = [];
        const seen = new Set<string>();

        const pushUrl = (raw: string | null | undefined) => {
          const href = (raw || '').trim();
          if (!href || !/\.mp3(?:$|\?)/i.test(href)) return;
          let absolute = href;
          try {
            absolute = new URL(href, pageUrl).toString();
          } catch {
            return;
          }
          if (seen.has(absolute)) return;
          seen.add(absolute);

          const fileName = decodeLoose(absolute.split('/').pop() || href);
          tracks.push({
            order: inferTrackOrder(fileName),
            name: fileName,
            url: absolute,
          });
        };

        const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        anchors.forEach((a) => pushUrl(a.getAttribute('href')));

        // Some pages may expose audio links through data attributes.
        const anyNodes = Array.from(doc.querySelectorAll('*')) as HTMLElement[];
        anyNodes.forEach((el) => {
          pushUrl(el.getAttribute('data-src'));
          pushUrl(el.getAttribute('data-audio'));
          pushUrl(el.getAttribute('data-mp3'));
        });

        if (!tracks.length) return null;

        return tracks.sort((a, b) => {
          if (a.order === b.order) return a.name.localeCompare(b.name);
          return a.order - b.order;
        });
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
      setSourceKind(null);

      // Try to get the language name from LANGUAGE_NAMES mapping
      const mappedLang = LANGUAGE_NAMES[lang];

      // Use mapped name if available, otherwise use input directly
      const preferredLang = mappedLang || lang;

      // 1) Try manifest source for the selected language (currently English GC)
      const preferredManifestPath = resolveManifestPath(lang, preferredLang);

      if (preferredManifestPath) {
        const manifest = await fetchManifest(preferredManifestPath);
        const track = findTrackFromManifest(manifest, chapterIdx);
        if (mounted && track?.url) {
          setSrc(track.url);
          setAudioLang(manifest?.bookLanguageName || preferredLang);
          setSourceKind('english-manifest');
          setAttribution({
            name: manifest?.source?.name || 'EllenWhiteAudio.org',
            url: manifest?.source?.url || 'https://ellenwhiteaudio.org/great-controversy/',
            licenseSummary: manifest?.source?.licenseSummary,
          });
          setLoadingAudio(false);
          return;
        }
      }

      // 2) Try dynamic EllenWhiteAudio multilingual directories
      const sourceCandidates = AUDIO_SOURCE_CANDIDATES[lang];
      if (sourceCandidates) {
        const languageCodes = [...new Set(sourceCandidates.languageCodes.map((v) => v.trim().toLowerCase()).filter(Boolean))];
        const bookCodes = [...new Set(sourceCandidates.bookCodes.map((v) => v.trim().toLowerCase()).filter(Boolean))];

        // 2a) Deterministic local multilingual mapping (avoids runtime remote parsing/CORS fragility).
        const [multiLangManifest, extraMultiLangManifest] = await Promise.all([
          fetchMultiLangManifest(MULTILANG_MANIFEST_PATH),
          fetchMultiLangManifest(MULTILANG_EXTRA_MANIFEST_PATH),
        ]);
        const mergedManifest = {
          ...(multiLangManifest || {}),
          ...(extraMultiLangManifest || {}),
        } as MultiLangManifest;

        const staticTrack = pickTrackFromMultiLangManifest(mergedManifest, languageCodes, chapterIdx);
        if (mounted && staticTrack?.url) {
          setSrc(staticTrack.url);
          setAudioLang(preferredLang);
          setSourceKind('multilang-manifest');
          setAttribution({
            name: 'EllenWhiteAudio.org',
            url: sourceCandidates.sourcePageUrl || `https://ellenwhiteaudio.org/${languageCodes[0] === 'en' ? '' : languageCodes[0]}`,
            licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
          });
          setLoadingAudio(false);
          return;
        }

        // 2b) Runtime directory probing fallback.
        for (const languageCode of languageCodes) {
          for (const bookCode of bookCodes) {
            const tracks = await fetchDirectoryTracks(languageCode, bookCode);
            const chosen = pickDirectoryTrackForChapter(tracks || [], chapterIdx);
            if (mounted && chosen) {
              setSrc(chosen.url);
              setAudioLang(preferredLang);
              setSourceKind('remote-directory');
              setAttribution({
                name: 'EllenWhiteAudio.org',
                url: sourceCandidates.sourcePageUrl || `https://ellenwhiteaudio.org/${languageCode === 'en' ? '' : languageCode}`,
                licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
              });
              setLoadingAudio(false);
              return;
            }
          }
        }

        // 2c) Fallback: parse direct MP3 links from the canonical language book page.
        if (sourceCandidates.sourcePageUrl) {
          const pageTracks = await fetchBookPageTracks(sourceCandidates.sourcePageUrl);
          const chosen = pickDirectoryTrackForChapter(pageTracks || [], chapterIdx);
          if (mounted && chosen) {
            setSrc(chosen.url);
            setAudioLang(preferredLang);
            setSourceKind('source-page');
            setAttribution({
              name: 'EllenWhiteAudio.org',
              url: sourceCandidates.sourcePageUrl,
              licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
            });
            setLoadingAudio(false);
            return;
          }
        }
      }

      // 3) Fallback to local audio index support for selected language only
      let result = await fetchIndex(preferredLang);

      if (!mounted) return;

      if (result) {
        const pad = String(chapterIdx + 1).padStart(2, '0');
        const match = result.list.find((f) => f.startsWith(`GC-${pad}-`) || f.startsWith(`GC-${pad}`));
        setAudioLang(preferredLang);
        const newSrc = match ? `${result.base}/${encodeURIComponent(match)}` : null;
        setSrc(newSrc);
        setSourceKind(newSrc ? 'local-index' : null);
      } else {
        setAudioLang(null);
        setSrc(null);
        setSourceKind(null);
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
    const onPlay = () => {
      setPlaying(true);
      onPlayingChange?.(true);
    };
    const onPause = () => {
      setPlaying(false);
      onPlayingChange?.(false);
    };
    const onTime = () => setTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      onPlayingChange?.(false);
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
  }, [src, onNextChapter, onPlayingChange]);

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

  // Request autoplay from external chapter actions (e.g., ToC play buttons).
  useEffect(() => {
    if (!autoPlayRequest || !src) return;
    const a = audioRef.current;
    if (!a) return;

    const playNow = async () => {
      try {
        await a.play();
      } catch (err) {
        console.error('[AudioPlayer] Autoplay request failed:', err);
      }
    };

    if (a.readyState >= 2) {
      void playNow();
      return;
    }

    const onCanPlay = () => {
      void playNow();
    };
    a.addEventListener('canplay', onCanPlay, { once: true });
    return () => {
      a.removeEventListener('canplay', onCanPlay);
    };
  }, [autoPlayRequest, src]);
  
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

  const seekRelative = (deltaSeconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    const next = (a.currentTime || 0) + deltaSeconds;
    const max = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : Number.MAX_SAFE_INTEGER;
    a.currentTime = Math.max(0, Math.min(max, next));
  };

  const cycleSpeed = () => {
    setSpeed((prev) => {
      const currentIndex = SPEED_STEPS.findIndex((s) => Math.abs(s - prev) < 0.001);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % SPEED_STEPS.length : 1;
      return SPEED_STEPS[nextIndex];
    });
  };

  const copyCurrentSourceUrl = async () => {
    if (!src) return;
    try {
      if (!navigator?.clipboard?.writeText) return;
      await navigator.clipboard.writeText(src);
      setCopiedSource(true);
    } catch {
      setCopiedSource(false);
    }
  };

  useEffect(() => {
    if (!copiedSource) return;
    const timer = window.setTimeout(() => setCopiedSource(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedSource]);

  const displayAudioLang = audioLang || (LANGUAGE_NAMES[lang] || lang);
  const sourceKindLabel = sourceKind
    ? sourceKind
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' · ')
    : null;

  if (loadingAudio) {
    return (
      <div className="audio-player modern-audio-player audio-unavailable">
        <div className="audio-unavailable-text">Loading audio…</div>
      </div>
    );
  }

  if (!src) return null;

  if (minimized) {
    return (
      <MinimizedAudioBar
        playing={playing}
        time={time}
        duration={duration}
        speed={speed}
        onToggle={toggle}
        onSeekRelative={seekRelative}
        onSeekTo={seekTo}
        onCycleSpeed={cycleSpeed}
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
          {isDev && sourceKindLabel ? (
            <div className="audio-dev-row">
              <span className="audio-source-badge" title={`Audio source resolver: ${sourceKind}`}>
                Source: {sourceKindLabel}
              </span>
              <button
                type="button"
                className="audio-source-copy-btn"
                onClick={copyCurrentSourceUrl}
                title="Copy resolved audio URL"
              >
                {copiedSource ? 'Copied' : 'Copy URL'}
              </button>
            </div>
          ) : null}
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
