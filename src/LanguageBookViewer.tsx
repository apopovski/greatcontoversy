import React, { useState, useEffect } from "react";
import "./LanguageBookViewer.css";
import "./ModernReaderMenu.css";

// List of available language folders (only those with index.html)
const languageFolders = [
  "A nagy küzdelem - Ellen G. White",
  "Der grosse Kampf - Ellen G. White",
  "El Conflicto de los Siglos - Ellen G. White",
  "Il gran conflitto - Ellen G. White",
  "MOD EN BEDRE FREMTID - Ellen G. White",
  "Mot historiens klimaks - Ellen G. White",
  "O Grande Conflito - Ellen G. White",
  "O Le Finauga Tele - Ellen G. White",
  "Suur Voitlus - Ellen G. White",
  "The Great Controversy - Ellen G. White 2",
  "Tragedia veacurilor - Ellen G. White",
  "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White",
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White",
  "Velke drama veku - Ellen G. White",
  "Velky spor vekov - Ellen G. White",
  "Vielika borot'ba - Ellen G. White",
  "Vielikaia bor'ba - Ellen G. White",
  "Wielki boj - Ellen G. White",
  "Η Μεγάλη Διαμάχη - Ellen G. White",
  "alSra` al`Zym - Ellen G. White"
];

function getOrderedLanguageFolders(languageNames: Record<string, string>) {
  return languageFolders.slice().sort((a, b) => {
    const A = (languageNames[a] || a).toString();
    const B = (languageNames[b] || b).toString();
    return A.localeCompare(B, undefined, { sensitivity: 'base' });
  });
}

function getDefaultLanguageFolder() {
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || "en";
  const langMap: Record<string, string> = {
    en: "The Great Controversy - Ellen G. White 2",
    es: "El Conflicto de los Siglos - Ellen G. White",
    da: "MOD EN BEDRE FREMTID - Ellen G. White",
    de: "Der grosse Kampf - Ellen G. White",
    it: "Il gran conflitto - Ellen G. White",
    pt: "O Grande Conflito - Ellen G. White",
    fr: "",
    ru: "Vielikaia bor'ba - Ellen G. White",
    pl: "Wielki boj - Ellen G. White",
    ro: "Tragedia veacurilor - Ellen G. White",
    sk: "Velky spor vekov - Ellen G. White",
    cs: "Velke drama veku - Ellen G. White",
    et: "Suur Voitlus - Ellen G. White",
    uk: "Vielika borot'ba - Ellen G. White",
    hr: "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White",
    sq: "",
    sm: "O Le Finauga Tele - Ellen G. White",
    kl: "",
    nb: "",
    hu: "A nagy küzdelem - Ellen G. White",
    el: "Η Μεγάλη Διαμάχη - Ellen G. White",
    ar: "alSra` al`Zym - Ellen G. White",
  };
  const code = browserLang.split("-")[0];
  const folder = langMap[code as keyof typeof langMap] || languageFolders[0];
  const ordered = getOrderedLanguageFolders({
    "A nagy küzdelem - Ellen G. White": "Magyar",
    "Η Μεγάλη Διαμάχη - Ellen G. White": "Ελληνικά",
    "The Great Controversy - Ellen G. White 2": "English",
    "El Conflicto de los Siglos - Ellen G. White": "Español",
    "MOD EN BEDRE FREMTID - Ellen G. White": "Dansk",
    "Der grosse Kampf - Ellen G. White": "Deutsch",
    "Il gran conflitto - Ellen G. White": "Italiano",
    "O Grande Conflito - Ellen G. White": "Português",
    "Tragedia veacurilor - Ellen G. White": "Română",
    "Vielikaia bor'ba - Ellen G. White": "Русский",
    "Wielki boj - Ellen G. White": "Polski",
    "Velky spor vekov - Ellen G. White": "Slovenčina",
    "Velke drama veku - Ellen G. White": "Čeština",
    "Suur Voitlus - Ellen G. White": "Eesti",
    "Vielika borot'ba - Ellen G. White": "Українська",
    "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White": "Hrvatski",
    "O Le Finauga Tele - Ellen G. White": "Samoan",
    "alSra` al`Zym - Ellen G. White": "العربية",
    "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": "Български",
  });
  return ordered.includes(folder) ? folder : ordered[0];
}

type TocEntry = { title: string; href: string; };
type Chapter = { id: string; title: string; html: string };

// Map folder names to book titles
const bookTitles: Record<string, string> = {
  "A nagy küzdelem - Ellen G. White": "A nagy küzdelem",
  "Η Μεγάλη Διαμάχη - Ellen G. White": "Η Μεγάλη Διαμάχη",
  "The Great Controversy - Ellen G. White 2": "The Great Controversy",
  "El Conflicto de los Siglos - Ellen G. White": "El Conflicto de los Siglos",
  "MOD EN BEDRE FREMTID - Ellen G. White": "Mod en bedre fremtid",
  "Der grosse Kampf - Ellen G. White": "Der große Kampf",
  "Il gran conflitto - Ellen G. White": "Il gran conflitto",
  "O Grande Conflito - Ellen G. White": "O Grande Conflito",
  "Tragedia veacurilor - Ellen G. White": "Tragedia veacurilor",
  "Vielikaia bor'ba - Ellen G. White": "Великая борьба",
  "Wielki boj - Ellen G. White": "Wielki bój",
  "Velky spor vekov - Ellen G. White": "Velký spor věků",
  "Velke drama veku - Ellen G. White": "Veľké drama vekov",
  "Suur Voitlus - Ellen G. White": "Suur Võitlus",
  "Vielika borot'ba - Ellen G. White": "Велика боротьба",
  "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White": "Velika borba između Krista i Sotone",
  "O Le Finauga Tele - Ellen G. White": "O Le Finauga Tele",
  "alSra` al`Zym - Ellen G. White": "الصراع العظيم",
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": "Великата борба между Христос и Сатана",
};

export function LanguageBookViewer() {
  const [selectedLang, setSelectedLang] = useState(getDefaultLanguageFolder());
  const [rawHtml, setRawHtml] = useState("");
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [textSize, setTextSize] = useState(1.0); // 1.0 = 100%

  // Map folder names to language display names
  const languageNames: Record<string, string> = {
    "A nagy küzdelem - Ellen G. White": "Magyar",
    "Η Μεγάλη Διαμάχη - Ellen G. White": "Ελληνικά",
    "The Great Controversy - Ellen G. White 2": "English",
    "El Conflicto de los Siglos - Ellen G. White": "Español",
    "MOD EN BEDRE FREMTID - Ellen G. White": "Dansk",
    "Der grosse Kampf - Ellen G. White": "Deutsch",
    "Il gran conflitto - Ellen G. White": "Italiano",
    "O Grande Conflito - Ellen G. White": "Português",
    "Tragedia veacurilor - Ellen G. White": "Română",
    "Vielikaia bor'ba - Ellen G. White": "Русский",
    "Wielki boj - Ellen G. White": "Polski",
    "Velky spor vekov - Ellen G. White": "Slovenčina",
    "Velke drama veku - Ellen G. White": "Čeština",
    "Suur Voitlus - Ellen G. White": "Eesti",
    "Vielika borot'ba - Ellen G. White": "Українська",
    "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White": "Hrvatski",
    "O Le Finauga Tele - Ellen G. White": "Samoan",
    "alSra` al`Zym - Ellen G. White": "العربية",
    "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": "Български",
    // Add more as needed
  };

  // Fetch and parse HTML for ToC and chapters
  useEffect(() => {
    const fetchHtml = async () => {
      const url = `./book-content/html/${encodeURIComponent(selectedLang)}/index.html`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load book content");
        const text = await res.text();
        setRawHtml(text);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setRawHtml(`<div style='color:red'>Error loading content: ${msg}</div>`);
      }
    };
    fetchHtml();
    window.scrollTo(0, 0);
    setProgress(0);
    setToc([]);
    setChapters([]);
    setSelectedChapterIdx(0);
  }, [selectedLang]);

  // Parse ToC and chapters from HTML
  useEffect(() => {
    if (!rawHtml) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");
      // Find ToC: look for <nav type="toc">, <ol>, or fallback to <div> with many <a> links
      let tocEntries: TocEntry[] = [];
      let tocNav = doc.querySelector('nav[type="toc"]') || doc.querySelector('nav[role="doc-toc"]');
      if (!tocNav) {
        tocNav = doc.querySelector('ol');
      }
      if (!tocNav) {
        // fallback: find a <div> with many <a href="#..."></a> links (for some languages)
        const divs = Array.from(doc.querySelectorAll('div'));
        tocNav = divs.find(div => div.querySelectorAll('a[href^="#"]').length > 5) || null;
      }
      if (tocNav) {
        tocEntries = Array.from(tocNav.querySelectorAll('a')).map(a => ({
          title: a.textContent?.replace(/\s+/g, ' ').trim() || '',
          href: a.getAttribute('href') || ''
        })).filter(e => e.href.startsWith('#'));
      }
      setToc(tocEntries);

      // Find chapters: look for elements with id matching ToC hrefs
      const chapters: Chapter[] = tocEntries.map(entry => {
        const id = entry.href.replace(/^#/, '');
        const el = doc.getElementById(id);
        if (!el) return { id, title: entry.title, html: `<div>Chapter not found</div>` };
        // Get all content until the next chapter id or end of body
        let html = '';
        let node: ChildNode | null = el;
        while (node) {
          html += (node as HTMLElement).outerHTML || '';
          // Stop if next sibling is a chapter start (id in toc)
          const next: ChildNode | null = node.nextSibling;
          if (next && next.nodeType === 1 && tocEntries.some(e => e.href.replace(/^#/, '') === (next as HTMLElement).id)) break;
          node = next;
        }
        return { id, title: entry.title, html };
      });
      setChapters(chapters);
    } catch (e) {
      setToc([]);
      setChapters([]);
    }
  }, [rawHtml]);

  // Progress bar logic (scroll position)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intercept anchor clicks in loaded HTML for smooth in-content navigation
  useEffect(() => {
    const content = document.querySelector('.modern-reader-html');
    if (!content) return;
    function handleClick(e: Event) {
      let el = e.target as HTMLElement | null;
      while (el && el !== content) {
        if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('#')) {
          const id = el.getAttribute('href')!.slice(1);
          const targetElem = document.getElementById(id);
          if (targetElem) {
            e.preventDefault();
            targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', `#${id}`);
          }
          break;
        }
        el = el.parentElement;
      }
    }
    content.addEventListener('click', handleClick as EventListener);
    return () => content.removeEventListener('click', handleClick as EventListener);
  }, [rawHtml]);

  // Debugging hooks: log selection events and pointerup for diagnostics
  useEffect(() => {
    const content = document.querySelector('.modern-reader-html');
    if (!content) return;

    const onSelectionChange = () => {
      try {
        const sel = window.getSelection?.();
        const txt = sel ? (sel.toString() || '').trim() : '';
        if (!txt) return;
        // only log selections that live inside the reader content
        let inContent = false;
        try {
          if (sel && sel.rangeCount) {
            const r = sel.getRangeAt(0);
            const node = r.commonAncestorContainer;
            const el = (node && (node as any).nodeType === 3) ? (node as any).parentElement : (node as HTMLElement | null);
            if (el && content.contains(el)) inContent = true;
          }
        } catch {}
        if (inContent) console.debug('LBV selectionchange', { text: txt.slice(0, 200), len: txt.length });
      } catch (e) {
        // ignore
      }
    };

    const onPointerUp = () => {
      try {
        const sel = window.getSelection?.();
        const txt = sel ? (sel.toString() || '').trim() : '';
        console.debug('LBV pointerup', { textLen: (txt || '').length });
      } catch {}
    };

    document.addEventListener('selectionchange', onSelectionChange, false);
    document.addEventListener('pointerup', onPointerUp, false);
    document.addEventListener('touchend', onPointerUp, false);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange, false);
      document.removeEventListener('pointerup', onPointerUp, false);
      document.removeEventListener('touchend', onPointerUp, false);
    };
  }, [rawHtml]);

  return (
    <div className="modern-reader-container">
      <div className="modern-reader-progress-bar" style={{ width: `${progress * 100}%` }} />
      <div className="modern-reader-book-title" style={{textAlign: 'center', fontWeight: 700, fontSize: '2rem', margin: '1.2rem 0 0.5rem 0'}}>
        <a href="/" aria-label="Home" style={{ color: 'inherit', textDecoration: 'none' }}>{bookTitles[selectedLang] || ''}</a>
      </div>
      <header className="modern-reader-header">
        <select className="modern-reader-lang" value={selectedLang} onChange={e => setSelectedLang(e.target.value)}>
          {getOrderedLanguageFolders(languageNames).map(lang => (
            <option key={lang} value={lang}>{languageNames[lang] || lang}</option>
          ))}
        </select>
        <select
          className="modern-reader-toc-dropdown"
          value={selectedChapterIdx}
          onChange={e => setSelectedChapterIdx(Number(e.target.value))}
        >
          {toc.map((entry, idx) => (
            <option key={entry.href} value={idx}>{entry.title}</option>
          ))}
        </select>
      </header>
      <main className="modern-reader-content">
        <div className="modern-reader-controls">
          {selectedLang === "alSra` al`Zym - Ellen G. White" ? (
            <>
              <button disabled={selectedChapterIdx === chapters.length - 1} onClick={() => setSelectedChapterIdx(i => Math.min(i + 1, chapters.length - 1))} aria-label="Next chapter" style={{ fontSize: '1.2em', padding: '0.3em 0.7em' }}><span aria-hidden="true">&#8594;</span></button>
              <span className="modern-reader-chapter-title">{chapters[selectedChapterIdx]?.title || ''}</span>
              <button disabled={selectedChapterIdx === 0} onClick={() => setSelectedChapterIdx(i => Math.max(i - 1, 0))} aria-label="Previous chapter" style={{ fontSize: '1.2em', padding: '0.3em 0.7em' }}><span aria-hidden="true">&#8592;</span></button>
            </>
          ) : (
            <>
              <button disabled={selectedChapterIdx === 0} onClick={() => setSelectedChapterIdx(i => Math.max(i - 1, 0))} aria-label="Previous chapter" style={{ fontSize: '1.2em', padding: '0.3em 0.7em' }}><span aria-hidden="true">&#8592;</span></button>
              <span className="modern-reader-chapter-title">{chapters[selectedChapterIdx]?.title || ''}</span>
              <button disabled={selectedChapterIdx === chapters.length - 1} onClick={() => setSelectedChapterIdx(i => Math.min(i + 1, chapters.length - 1))} aria-label="Next chapter" style={{ fontSize: '1.2em', padding: '0.3em 0.7em' }}><span aria-hidden="true">&#8594;</span></button>
            </>
          )}
          <button title="Decrease text size" onClick={() => setTextSize(s => Math.max(0.7, s - 0.1))}>A-</button>
          <button title="Increase text size" onClick={() => setTextSize(s => Math.min(2, s + 0.1))}>A+</button>
          {/* Search UI will be added here */}
        </div>
        <div
          className="modern-reader-html"
          style={{ fontSize: `${textSize}em` }}
          dangerouslySetInnerHTML={{ __html: chapters[selectedChapterIdx]?.html || '' }}
        />
      </main>
    </div>
  );
}
