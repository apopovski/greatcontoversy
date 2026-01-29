
import React, { useEffect, useRef, useState } from 'react';
import './BookReader.css';
import { MdMenu, MdLanguage, MdSearch, MdDarkMode, MdLightMode } from 'react-icons/md';

type TocEntry = { title: string; href: string };

const LANGUAGE_FOLDERS = [
  'The Great Controversy - Ellen G. White 2',
  'El Conflicto de los Siglos - Ellen G. White',
  'Der grosse Kampf - Ellen G. White',
  'Il gran conflitto - Ellen G. White',
  'MOD EN BEDRE FREMTID - Ellen G. White',
  'Mot historiens klimaks - Ellen G. White',
  'O Grande Conflito - Ellen G. White',
  'O Le Finauga Tele - Ellen G. White',
  'Suur Voitlus - Ellen G. White',
  'Tragedia veacurilor - Ellen G. White',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White",
  'Velke drama veku - Ellen G. White',
  'Velky spor vekov - Ellen G. White',
  "Vielika borot'ba - Ellen G. White",
  "Vielikaia bor'ba - Ellen G. White",
  'Wielki boj - Ellen G. White',
  "alSra` al`Zym - Ellen G. White",
];

const LANGUAGE_NAMES: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'English',
  'El Conflicto de los Siglos - Ellen G. White': 'Spanish',
  'Der grosse Kampf - Ellen G. White': 'German',
  'Il gran conflitto - Ellen G. White': 'Italian',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Danish',
  'Mot historiens klimaks - Ellen G. White': 'Norwegian',
  'O Grande Conflito - Ellen G. White': 'Portuguese',
  'O Le Finauga Tele - Ellen G. White': 'Samoan',
  'Suur Voitlus - Ellen G. White': 'Estonian',
  'Tragedia veacurilor - Ellen G. White': 'Romanian',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Serbian',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'Bulgarian',
  'Velke drama veku - Ellen G. White': 'Slovak',
  'Velky spor vekov - Ellen G. White': 'Czech',
  "Vielika borot'ba - Ellen G. White": 'Ukrainian',
  "Vielikaia bor'ba - Ellen G. White": 'Russian',
  'Wielki boj - Ellen G. White': 'Polish',
  "alSra` al`Zym - Ellen G. White": 'Arabic',
};

const LANGUAGE_ABBREV: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'EN',
  'El Conflicto de los Siglos - Ellen G. White': 'ES',
  'Der grosse Kampf - Ellen G. White': 'DE',
  'Il gran conflitto - Ellen G. White': 'IT',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'DA',
  'Mot historiens klimaks - Ellen G. White': 'NO',
  'O Grande Conflito - Ellen G. White': 'PT',
  'O Le Finauga Tele - Ellen G. White': 'SM',
  'Suur Voitlus - Ellen G. White': 'ET',
  'Tragedia veacurilor - Ellen G. White': 'RO',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'SR',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'BG',
  'Velke drama veku - Ellen G. White': 'SK',
  'Velky spor vekov - Ellen G. White': 'CS',
  "Vielika borot'ba - Ellen G. White": 'UK',
  "Vielikaia bor'ba - Ellen G. White": 'RU',
  'Wielki boj - Ellen G. White': 'PL',
  "alSra` al`Zym - Ellen G. White": 'AR',
};

const getBookTitleFromFolder = (folder: string) => (folder || '').split(' - Ellen')[0].trim();

const COPYRIGHTS: Record<string, string> = {
  // Use the localized book title (derived from the language folder) as the copyright holder.
  ...Object.fromEntries(LANGUAGE_FOLDERS.map(f => [f, `© 2026 ${getBookTitleFromFolder(f)}`]))
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function getHighlightedHtml(html: string, q: string | null) {
  if (!q) return html || '';
  try {
    const esc = escapeRegExp(q);
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    // Remove any <style> and external stylesheet links from the fragment to avoid
    // ebook styles leaking into the app UI when we inject the HTML.
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());
    // Also strip inline styles, classes and event handlers from all nodes so
    // the ebook's CSS/JS can't change layout or selection behaviour.
    doc.querySelectorAll('*').forEach((el) => {
      if ((el as Element).hasAttribute('style')) (el as Element).removeAttribute('style');
      if ((el as Element).hasAttribute('class')) (el as Element).removeAttribute('class');
      // remove inline event handlers
      Array.from((el as Element).attributes).forEach((a) => {
        if (a.name.startsWith('on')) (el as Element).removeAttribute(a.name);
      });
    });
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null as any);
    let n = walker.nextNode();
    while (n) {
      const t = n as Text;
      const text = t.nodeValue || '';
      const frag = doc.createDocumentFragment();
      let last = 0;
      const r = new RegExp(esc, 'gi');
      let m: RegExpExecArray | null;
      while ((m = r.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
        const mark = doc.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (r.lastIndex === m.index) r.lastIndex++;
      }
      if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
      if (frag.childNodes.length) t.parentNode?.replaceChild(frag, t);
      n = walker.nextNode();
    }
    return doc.body.innerHTML;
  } catch {
    return html || '';
  }
}

function applyDropcap(html: string, langKey: string, chapterIndex: number, toc: TocEntry[]) {
  try {
    const name = LANGUAGE_NAMES[langKey] || '';
    if (name.toLowerCase() === 'arabic') return html;
    // Apply dropcap to the opening paragraph of the chapter being rendered.
    // (skip for Arabic languages)
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    // Strip any styles or stylesheet links from the parsed chapter to avoid
    // overriding the main app styles when we insert the processed HTML.
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());
    // Also sanitize inline styles/classes/event handlers so the imported HTML
    // cannot prevent selection or shift layout.
    // Remove inline styles and event handlers, but preserve our markup classes
    // that are used for highlighting (`search-highlight`) and the dropcap.
    doc.querySelectorAll('*').forEach((el) => {
      if ((el as Element).hasAttribute('style')) (el as Element).removeAttribute('style');
      if ((el as Element).hasAttribute('class')) {
        const cls = ((el as Element).getAttribute('class') || '').split(/\s+/);
        const isHighlight = el.tagName === 'MARK' && cls.includes('search-highlight');
        const isDropcap = el.tagName === 'SPAN' && cls.includes('dropcap');
        if (!isHighlight && !isDropcap) (el as Element).removeAttribute('class');
      }
      Array.from((el as Element).attributes).forEach((a) => {
        if (a.name.startsWith('on')) (el as Element).removeAttribute(a.name);
      });
    });
    // Prefer the first paragraph (or blockquote) after the chapter heading
    let p: Element | null = null;
    const heading = doc.body.querySelector('h1,h2,h3,h4,h5,h6');
    // If the chapter heading indicates meta sections like "Information about this Book"
    // or "Introduction", do not apply the visual dropcap.
    if (heading) {
      const ht = (heading.textContent || '').trim();
      if (/information\s+about.*book/i.test(ht) || /^\s*introduction\b/i.test(ht)) return html;
    }
    if (heading) {
      // walk siblings until we find a paragraph or blockquote with text
      let sib: Element | null = (heading.nextElementSibling as Element | null);
      while (sib) {
        if (/^P$/i.test(sib.tagName) || /^BLOCKQUOTE$/i.test(sib.tagName) || (sib.tagName === 'DIV' && sib.textContent && sib.textContent.trim().length)) {
          p = sib;
          break;
        }
        sib = sib.nextElementSibling as Element | null;
      }
    }
    // fallback: any paragraph, blockquote or div in the body
    if (!p) p = doc.body.querySelector('p, blockquote, div');
    if (!p) return html;
    const walker = doc.createTreeWalker(p, NodeFilter.SHOW_TEXT, null as any);
    let tn = walker.nextNode();
    while (tn) {
      const txt = tn.nodeValue || '';
      const trimmed = txt.replace(/^\s+/, '');
      if (trimmed.length) {
        const quoteChars = ['"', '“', '”', '«', '»', '\u2018', '\u2019', '\u201E'];
        let take = 1;
        if (quoteChars.includes(trimmed[0]) && trimmed.length >= 2) take = 2;
        const leading = txt.match(/^\s*/)?.[0] || '';
        const drop = txt.substr(leading.length, take);
        const rest = txt.substr(leading.length + take);
        const frag = doc.createDocumentFragment();
        const span = doc.createElement('span');
        span.className = 'dropcap';
        span.textContent = drop;
        frag.appendChild(doc.createTextNode(leading));
        frag.appendChild(span);
        if (rest.length) frag.appendChild(doc.createTextNode(rest));
        tn.parentNode?.replaceChild(frag, tn);
        break;
      }
      tn = walker.nextNode();
    }
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

export default function BookReader() {
  const [lang, setLang] = useState(LANGUAGE_FOLDERS[0]);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(720);
  const [textSize, setTextSize] = useState(() => {
    const v = localStorage.getItem('reader-text-size');
    return v ? Number(v) : 18;
  });
  const [isDesktop, setIsDesktop] = useState(true);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ idx: number; occ: number }[]>([]);
  const [searchIdx, setSearchIdx] = useState(0);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [pendingScroll, setPendingScroll] = useState<number | null>(null);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const langBtnRef = useRef<HTMLButtonElement | null>(null);
  const burgerBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchBtnRef = useRef<HTMLButtonElement | null>(null);

  const [langPanelStyle, setLangPanelStyle] = useState<React.CSSProperties | null>(null);
  const [chaptersPanelStyle, setChaptersPanelStyle] = useState<React.CSSProperties | null>(null);
  const [searchPanelStyle, setSearchPanelStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width:900px)');
    const fn = () => setIsDesktop(!!mq.matches);
    fn();
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = `./book-content/html/${encodeURIComponent(lang)}/index.html`;
    fetch(url)
      .then((r) => r.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Try several strategies to locate a table-of-contents
        let tocRoot: Element | null = doc.querySelector('nav[type="toc"]') || doc.querySelector('nav.toc') || doc.querySelector('.toc') || doc.querySelector('#toc') || doc.querySelector('ol');
        const entries: TocEntry[] = [];
        if (tocRoot) {
          tocRoot.querySelectorAll('a').forEach((a) => {
            const href = a.getAttribute('href') || '';
            const title = (a.textContent || '').trim();
            if (href && title) entries.push({ title, href });
          });
        }
        // Fallback: collect anchors that reference in-page ids and point to existing elements
        if (!entries.length) {
          const seen = new Set<string>();
          const all = Array.from(doc.querySelectorAll('a[href]'));
          all.forEach((a) => {
            const href = a.getAttribute('href') || '';
            if (!href.startsWith('#')) return;
            const id = href.replace(/^#/, '');
            if (!id) return;
            if (!doc.getElementById(id)) return;
            const title = (a.textContent || '').trim();
            if (!title) return;
            if (seen.has(href)) return;
            seen.add(href);
            entries.push({ title, href });
          });
        }
        setToc(entries);
        // Choose a sensible default chapter to show first.
        // Prefer a chapter titled "Introduction" (or common fallbacks like Preface/Foreword).
        let defaultIdx = 0;
        const introIdx = entries.findIndex((e) => /\bintroduction\b/i.test(e.title));
        const prefaceIdx = entries.findIndex((e) => /\b(preface|foreword)\b/i.test(e.title));
        const infoIdx = entries.findIndex((e) => /^information\s+about/i.test(e.title));
        if (introIdx >= 0) defaultIdx = introIdx;
        else if (prefaceIdx >= 0) defaultIdx = prefaceIdx;
        else if (infoIdx >= 0 && infoIdx + 1 < entries.length) defaultIdx = infoIdx + 1;
        setChapterIdx(defaultIdx);
        const chapterHtmls = entries.map((e) => {
          const id = e.href.replace(/^#/, '');
          const el = doc.getElementById(id);
          if (!el) return '';
          let node: Element | null = el;
          let acc = '';
          while (node) {
            acc += node.outerHTML;
            const next = node.nextElementSibling;
            if (next && entries.some((en) => en.href.replace(/^#/, '') === next.id)) break;
            node = node.nextElementSibling;
          }
          return acc;
        });
        setChapters(chapterHtmls);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

  function runSearch() {
    const q = (searchQuery || '').trim();
    if (!q) {
      setSearchResults([]);
      setHighlighted(null);
      return;
    }
    const esc = escapeRegExp(q);
    const results: { idx: number; occ: number }[] = [];
    chapters.forEach((html, idx) => {
      const text = html.replace(/<[^>]+>/g, ' ');
      let m: RegExpExecArray | null;
      let occ = 0;
      const runner = new RegExp(esc, 'gi');
      while ((m = runner.exec(text)) !== null) {
        results.push({ idx, occ });
        occ++;
        if (runner.lastIndex === m.index) runner.lastIndex++;
      }
    });
    setSearchResults(results);
    if (results.length) {
      const first = results[0];
      setChapterIdx(first.idx);
      setHighlighted(q);
      setSearchIdx(0);
      setTimeout(() => scrollToHighlight(first.occ), 200);
    } else {
      setHighlighted(null);
    }
  }

  function scrollToHighlight(occurrence = 0) {
    const el = contentRef.current;
    if (!el) return;
    const marks = el.querySelectorAll('.search-highlight');
    const m = marks[occurrence] as HTMLElement | undefined;
    if (m) {
      try {
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        m.scrollIntoView();
      }
      m.style.outline = '3px solid rgba(50,100,255,0.14)';
      setTimeout(() => {
        if (m) m.style.outline = '';
      }, 1200);
    }
  }

  useEffect(() => {
    if (!searchResults.length) return;
    const r = searchResults[Math.min(searchIdx, searchResults.length - 1)];
    if (r) {
      setChapterIdx(r.idx);
      setHighlighted(searchQuery.trim() || null);
      setTimeout(() => scrollToHighlight(r.occ), 200);
    }
  }, [searchIdx, searchResults]);

  // When a click requests navigation to an occurrence we may need to wait
  // until the rendered HTML has been updated and highlights exist. Poll a
  // short while and then perform the scroll; this avoids race conditions
  // where scroll is attempted before marks are present in the DOM.
  useEffect(() => {
    if (pendingScroll === null) return;
    const el = contentRef.current;
    if (!el) return;
    const tryScroll = () => {
      const marks = el.querySelectorAll('.search-highlight');
      if (marks.length > pendingScroll) {
        scrollToHighlight(pendingScroll);
        setPendingScroll(null);
        return true;
      }
      return false;
    };
    if (tryScroll()) return;
    const interval = setInterval(() => {
      if (tryScroll()) clearInterval(interval);
    }, 150);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      // final attempt
      scrollToHighlight(pendingScroll as number);
      setPendingScroll(null);
    }, 1200);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingScroll, chapterIdx, highlighted]);

  const currentHtml = chapters[chapterIdx] || '';
  const highlightedHtml = getHighlightedHtml(currentHtml, highlighted);
  const displayedHtml = applyDropcap(highlightedHtml, lang, chapterIdx, toc);

  // Derive a readable book title from the language folder name.
  // Many folders are named like "<Localized Title> - Ellen G. White" so split off
  // the author suffix to get the localized title for the header.
  const displayTitle = (lang || '').split(' - Ellen')[0].trim();

  return (
    <div className="reader-root">
      <div className="reader-title-above-nav">
        {displayTitle}
      </div>
      {/* Language title removed — header icons now indicate language */}
      <header className="reader-header-bar">
        <div className="reader-header-bar-inner" style={{ width: isDesktop ? `${pageWidth}px` : '100%' }}>
          <div className="reader-header-controls">
            {/* Previous chapter button */}
            <button
              className="reader-prev-chapter"
              aria-label="Previous chapter"
              disabled={chapterIdx <= 0}
              onClick={() => {
                if (chapterIdx > 0) setChapterIdx(chapterIdx - 1);
              }}
              style={{marginRight: 4}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {/* Chapter menu (burger) */}
            <button
              className="reader-burger-icon"
              ref={burgerBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                const btn = burgerBtnRef.current;
                const panelW = 360;
                const maxAllowed = Math.max(120, window.innerWidth - 32);
                const w = Math.min(panelW, maxAllowed);
                if (btn) {
                  const r = btn.getBoundingClientRect();
                  // compute left so panel stays fully on-screen, prefer aligning to button left
                  let left = r.left;
                  if (left + w + 16 > window.innerWidth) left = Math.max(12, window.innerWidth - w - 16);
                  if (left < 12) left = 12;
                  const style: React.CSSProperties = {
                    position: 'fixed',
                    top: r.bottom + 8,
                    left,
                    width: w,
                    maxWidth: '92%',
                    zIndex: 9999,
                  };
                  setChaptersPanelStyle(style);
                } else {
                  // fallback: center near top
                  const left = Math.max(12, Math.floor((window.innerWidth - w) / 2));
                  setChaptersPanelStyle({ position: 'fixed', top: 72, left, width: w, zIndex: 9999 });
                }
                setShowChaptersMenu((v) => !v);
              }}
              aria-label="Contents"
            >
              <MdMenu size={28} />
            </button>
            {/* Next chapter button */}
            <button
              className="reader-next-chapter"
              aria-label="Next chapter"
              disabled={chapterIdx >= chapters.length - 1}
              onClick={() => {
                if (chapterIdx < chapters.length - 1) setChapterIdx(chapterIdx + 1);
              }}
              style={{marginLeft: 4}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
            <button
              ref={langBtnRef}
              className="reader-lang-icon"
              onClick={(e) => {
                e.stopPropagation();
                const btn = langBtnRef.current;
                if (btn) {
                  const r = btn.getBoundingClientRect();
                  setLangPanelStyle({ position: 'fixed', top: r.bottom + 8, left: r.left, minWidth: 220 });
                }
                setShowLangMenu((v) => !v);
              }}
              aria-label="Language"
            >
              <MdLanguage size={26} />
            </button>
            {/* Search icon - visible on mobile and desktop (previously only desktop) */}
            <button
              className="reader-search-icon"
              ref={searchBtnRef}
              onClick={() => {
                const btn = searchBtnRef.current;
                if (btn) {
                  const r = btn.getBoundingClientRect();
                  setSearchPanelStyle({ position: 'fixed', top: r.bottom + 8, left: r.left, minWidth: 320 });
                }
                setShowSearch(true);
                setTimeout(() => {
                  const el = document.querySelector('.reader-search-input') as HTMLInputElement | null;
                  el?.focus();
                }, 120);
              }}
              aria-label="Search"
            >
              <MdSearch size={24} />
            </button>
            {/* Title now shown above the header */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                className="reader-darkmode-toggle"
                onClick={() => {
                  const next = localStorage.getItem('reader-dark') === '1' ? '0' : '1';
                  localStorage.setItem('reader-dark', next);
                  document.documentElement.setAttribute('data-theme', next === '1' ? 'dark' : 'light');
                }}
                aria-label="Toggle dark mode"
              >
                {localStorage.getItem('reader-dark') === '1' ? <MdDarkMode size={22} /> : <MdLightMode size={22} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="reader-text-size-btn"
                  aria-label="Decrease text size"
                  onClick={() => {
                    setTextSize((s) => {
                      const next = Math.max(12, s - 1);
                      localStorage.setItem('reader-text-size', String(next));
                      return next;
                    });
                  }}
                >
                  A −
                </button>
                <button
                  className="reader-text-size-btn"
                  aria-label="Increase text size"
                  onClick={() => {
                    setTextSize((s) => {
                      const next = Math.min(36, s + 1);
                      localStorage.setItem('reader-text-size', String(next));
                      return next;
                    });
                  }}
                >
                  A +
                </button>
              </div>
              {isDesktop && (
                <>
                  <input
                    className="reader-width-slider"
                    type="range"
                    min={500}
                    max={1400}
                    value={pageWidth}
                    onChange={(e) => setPageWidth(Number(e.target.value))}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {showChaptersMenu && (
        <>
          <div className="reader-anchor-backdrop" onClick={() => setShowChaptersMenu(false)} />
          <div
            className="reader-chapters-panel"
            style={chaptersPanelStyle || { position: 'fixed', top: 72, left: 16, minWidth: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reader-modal-header">
              <strong>Contents</strong>
              <button onClick={() => setShowChaptersMenu(false)}>✕</button>
            </div>
            <ul className="reader-toc-list">
              {toc.length === 0 && <li className="reader-toc-empty">No contents</li>}
              {toc.map((t, i) => (
                <li key={t.href}>
                  <button
                    className={i === chapterIdx ? 'active' : ''}
                    onClick={() => {
                      setChapterIdx(i);
                      setShowChaptersMenu(false);
                    }}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <main className="reader-main">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="reader-wrapper" style={{ width: isDesktop ? `${pageWidth}px` : '100%', fontSize: `${textSize}px` }}>
            <div ref={contentRef} className="reader-book-html" dangerouslySetInnerHTML={{ __html: displayedHtml }} />
            <footer className="reader-footer">
              <div className="reader-footer-inner">
                {(COPYRIGHTS[lang] || `© ${getBookTitleFromFolder(lang) || LANGUAGE_NAMES[lang] || lang}`)}
              </div>
            </footer>
          </div>
        )}
      </main>

      {showSearch && (
        <div className="reader-search-modal" onClick={() => setShowSearch(false)}>
          <div className="reader-search-card" onClick={(e) => e.stopPropagation()}>
            <div className="reader-search-bar">
              <input
                className="reader-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch();
                }}
                placeholder="Search in this language"
              />
              <button className="reader-search-close" onClick={() => setShowSearch(false)}>✕</button>
            </div>
            <div className="reader-search-results">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setSearchIdx((i) => Math.max(0, i - 1))}>Prev</button>
                <div style={{ minWidth: 80, textAlign: 'center' }}>{searchResults.length ? `${searchIdx + 1} / ${searchResults.length}` : '0 / 0'}</div>
                <button onClick={() => setSearchIdx((i) => Math.min((searchResults.length - 1) || 0, i + 1))}>Next</button>
                <button onClick={() => runSearch()}>Search</button>
              </div>
              {/* Render simple snippets for results */}
              {searchResults.length === 0 && <div className="reader-search-noresults">No results</div>}
              {searchResults.map((r, i) => {
                const html = chapters[r.idx] || '';
                const text = html.replace(/<[^>]+>/g, ' ');
                const q = (searchQuery || '').trim();
                const idx = (() => {
                  let found = 0;
                  const re = new RegExp(escapeRegExp(q), 'gi');
                  let m: RegExpExecArray | null;
                  while ((m = re.exec(text)) !== null) {
                    if (found === r.occ) return m.index;
                    found++;
                    if (re.lastIndex === m.index) re.lastIndex++;
                  }
                  return -1;
                })();
                const snippet = idx >= 0 ? text.substr(Math.max(0, idx - 40), Math.min(160, text.length - idx + 40)) : text.substr(0, 160);
                return (
                  <button
                    key={`${r.idx}-${r.occ}-${i}`}
                    className="reader-search-result"
                    onClick={() => {
                        // close search modal so the book content is visible,
                        // then navigate to the chapter and request a scroll to the exact occurrence
                        setShowSearch(false);
                        setChapterIdx(r.idx);
                        setSearchIdx(i);
                        // ensure highlights are enabled for the target chapter
                        setHighlighted((searchQuery || '').trim() || null);
                        // defer actual scrolling until the rendered HTML contains the highlights
                        setPendingScroll(r.occ);
                      }}
                  >
                    <div style={{ fontSize: '0.95rem', color: 'inherit' }} dangerouslySetInnerHTML={{ __html: snippet.replace(new RegExp(escapeRegExp(searchQuery), 'gi'), (m) => `<mark class=\"search-highlight\">${m}</mark>`) }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showLangMenu && (
        <div className="reader-anchor-backdrop" onClick={() => setShowLangMenu(false)}>
          <div className="reader-lang-panel" style={langPanelStyle || undefined} onClick={(e) => e.stopPropagation()}>
            <ul>
              {LANGUAGE_FOLDERS.map((f) => (
                <li key={f}>
                  <button
                    disabled={f === lang}
                    onClick={() => {
                      setLang(f);
                      setChapterIdx(0);
                      setShowLangMenu(false);
                    }}
                  >
                    {LANGUAGE_NAMES[f] || f}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
    }

