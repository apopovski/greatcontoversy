import React, { useState, useEffect, useRef } from "react";
import "./BookReader.css";
export default function BookReader() {
    // State and refs
    const [showChaptersMenu, setShowChaptersMenu] = useState(false);
    const [chapterIdx, setChapterIdx] = useState(0);
    const [textSize, setTextSize] = useState(1);
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('reader-dark');
            if (saved !== null)
                return saved === '1';
            return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        catch (e) {
            return false;
        }
    });
    const [pageWidth, setPageWidth] = useState(500);
    const [isDesktop, setIsDesktop] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [lang, setLang] = useState("The Great Controversy - Ellen G. White 2");
    const [highlighted, setHighlighted] = useState(null);
    const [chapterMatchIdx, setChapterMatchIdx] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultIdx, setSearchResultIdx] = useState(0);
    const [bookTitle, setBookTitle] = useState("");
    const [toc, setToc] = useState([]);
    const [chapters, setChapters] = useState([]);
    // Available language folders (populated from workspace content)
    const [languageFolders] = useState([
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
        "alSra al Zym - Ellen G. White",
    ]);
    // Friendly display names for the folders (best-effort mapping)
    const [languageNames] = useState({
        "Der grosse Kampf - Ellen G. White": "German",
        "El Conflicto de los Siglos - Ellen G. White": "Spanish",
        "Il gran conflitto - Ellen G. White": "Italian",
        "MOD EN BEDRE FREMTID - Ellen G. White": "Danish",
        "Mot historiens klimaks - Ellen G. White": "Norwegian",
        "O Grande Conflito - Ellen G. White": "Portuguese",
        "O Le Finauga Tele - Ellen G. White": "Samoan",
        "Suur Voitlus - Ellen G. White": "Estonian",
        "The Great Controversy - Ellen G. White 2": "English",
        "Tragedia veacurilor - Ellen G. White": "Romanian",
        "VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White": "Serbo-Croatian",
        "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": "Bulgarian",
        "Velke drama veku - Ellen G. White": "Czech",
        "Velky spor vekov - Ellen G. White": "Slovak",
        "Vielika borot'ba - Ellen G. White": "Ukrainian",
        "Vielikaia bor'ba - Ellen G. White": "Russian",
        "Wielki boj - Ellen G. White": "Polish",
        "alSra al Zym - Ellen G. White": "Arabic",
    });
    const langBtnRef = useRef(null);
    const [langMenuPos, setLangMenuPos] = useState(null);
    const searchBtnRef = useRef(null);
    const [searchMenuPos, setSearchMenuPos] = useState(null);
    const contentRef = useRef(null);
    const wrapperRef = useRef(null);
    const headerControlsRef = useRef(null);
    const [chaptersMenuPos, setChaptersMenuPos] = useState(null);
    const searchInputRef = useRef(null);
    // persist/apply theme when changed
    useEffect(() => {
        try {
            if (darkMode)
                document.documentElement.setAttribute('data-theme', 'dark');
            else
                document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('reader-dark', darkMode ? '1' : '0');
            // also toggle a body class for older CSS hooks
            if (document.body)
                document.body.classList.toggle('dark', darkMode);
            // debug
            // eslint-disable-next-line no-console
            console.debug('BookReader: darkMode ->', darkMode);
        }
        catch (e) {
            // ignore
        }
    }, [darkMode]);
    function toggleDarkMode() {
        // eslint-disable-next-line no-console
        console.debug('BookReader: toggleDarkMode invoked (before) ->', darkMode);
        try {
            const newDark = !darkMode;
            if (newDark)
                document.documentElement.setAttribute('data-theme', 'dark');
            else
                document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('reader-dark', newDark ? '1' : '0');
            if (document.body)
                document.body.classList.toggle('dark', newDark);
            // eslint-disable-next-line no-console
            console.debug('BookReader: toggling to', newDark);
            setDarkMode(newDark);
        }
        catch (e) {
            setDarkMode(d => !d);
        }
    }
    // detect desktop (for showing slider)
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 900px)');
        const update = () => setIsDesktop(!!mq.matches);
        update();
        if (mq.addEventListener)
            mq.addEventListener('change', update);
        else
            mq.addListener(update);
        return () => {
            if (mq.removeEventListener)
                mq.removeEventListener('change', update);
            else
                mq.removeListener(update);
        };
    }, [showLangMenu]);
    // Search implementations
    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    }
    function getHighlightedChapterHtml(chapter, highlighted, matchIdx) {
        if (!highlighted)
            return chapter;
        try {
            const esc = escapeRegExp(highlighted);
            const re = new RegExp(esc, 'gi');
            // Parse the chapter HTML and walk text nodes to avoid injecting into tags
            const parser = new DOMParser();
            const doc = parser.parseFromString(chapter, 'text/html');
            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            let node = walker.nextNode();
            while (node) {
                textNodes.push(node);
                node = walker.nextNode();
            }
            textNodes.forEach(tn => {
                const text = tn.nodeValue || '';
                const nodeRe = new RegExp(esc, 'gi');
                const matches = Array.from(text.matchAll(nodeRe));
                if (matches.length === 0)
                    return;
                const parent = tn.parentNode;
                if (!parent)
                    return;
                const frag = doc.createDocumentFragment();
                let lastIndex = 0;
                for (const m of matches) {
                    const matchText = m[0] || '';
                    const offset = typeof m.index === 'number' ? m.index : 0;
                    if (offset > lastIndex) {
                        frag.appendChild(doc.createTextNode(text.slice(lastIndex, offset)));
                    }
                    const mark = doc.createElement('mark');
                    mark.className = 'search-highlight';
                    mark.textContent = matchText;
                    frag.appendChild(mark);
                    lastIndex = offset + matchText.length;
                }
                if (lastIndex < text.length)
                    frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
                parent.replaceChild(frag, tn);
            });
            return doc.body.innerHTML;
        }
        catch (e) {
            return chapter;
        }
    }
    // Apply a dropcap to the first character (or opening quote + char) of the chapter HTML
    function applyDropcap(html, langKey, cIdx) {
        // only apply to first chapter (chapter 0) and not for Arabic
        try {
            const isArabic = (languageNames[langKey] || '').toLowerCase() === 'arabic';
            if (isArabic)
                return html;
            // determine which TOC index corresponds to Chapter 1 (titles like "Chapter 1—...")
            const chapterOneIndex = toc.findIndex(t => /chapter\s*1\b/i.test(t.title || ''));
            // if we couldn't find a labelled Chapter 1, only apply when viewing the very first parsed chapter
            const targetIdx = chapterOneIndex >= 0 ? chapterOneIndex : 0;
            if (cIdx !== targetIdx)
                return html;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // prefer to apply dropcap to the first paragraph/blockquote/div with text (skip headings)
            const candidates = Array.from(doc.body.querySelectorAll('p, blockquote, div'));
            let target = null;
            for (const el of candidates) {
                const txt = (el.textContent || '').trim();
                if (txt.length > 0) {
                    target = el;
                    break;
                }
            }
            if (!target)
                return html;
            // find first text node within the target
            const walker = doc.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
            let node = walker.nextNode();
            while (node) {
                const text = node.nodeValue || '';
                const trimmed = text.replace(/^\s+/, '');
                if (trimmed.length === 0) {
                    node = walker.nextNode();
                    continue;
                }
                const parent = node.parentNode;
                if (!parent)
                    break;
                const quoteChars = ['"', '“', '”', '«', '»', "'", '‘', '’', '„'];
                let take = 1;
                const firstChar = trimmed.charAt(0);
                if (quoteChars.includes(firstChar) && trimmed.length >= 2)
                    take = 2;
                const leadingWs = text.match(/^\s*/)?.[0] || '';
                const realIndex = leadingWs.length;
                const dropText = text.substr(realIndex, take);
                const rest = text.substr(realIndex + take);
                const frag = doc.createDocumentFragment();
                const span = doc.createElement('span');
                span.className = 'dropcap';
                span.textContent = dropText;
                frag.appendChild(doc.createTextNode(leadingWs));
                frag.appendChild(span);
                if (rest.length > 0)
                    frag.appendChild(doc.createTextNode(rest));
                parent.replaceChild(frag, node);
                break;
            }
            return doc.body.innerHTML;
        }
        catch (e) {
            return html;
        }
    }
    function handleSearch() {
        const q = (searchQuery || '').trim();
        if (!q) {
            setSearchResults([]);
            setSearchResultIdx(0);
            setHighlighted(null);
            setChapterMatchIdx(null);
            return;
        }
        const results = [];
        const esc = escapeRegExp(q);
        const re = new RegExp(esc, 'gi');
        chapters.forEach((html, idx) => {
            const text = html.replace(/<[^>]+>/g, ' ');
            let match;
            let occ = 0;
            const runner = new RegExp(re.source, 'gi');
            while ((match = runner.exec(text)) !== null) {
                results.push({ idx, title: toc[idx]?.title || `Chapter ${idx + 1}`, occurrence: occ, charIndex: match.index });
                occ += 1;
                // prevent infinite loop for zero-length matches
                if (runner.lastIndex === match.index)
                    runner.lastIndex++;
            }
        });
        setSearchResults(results);
        setSearchResultIdx(0);
        if (results.length > 0) {
            const first = results[0];
            setChapterIdx(first.idx);
            setHighlighted(q);
            setChapterMatchIdx(first.charIndex);
            // attempt to scroll to the found occurrence after render
            setTimeout(() => scrollToResult(first), 220);
        }
        else {
            setHighlighted(null);
            setChapterMatchIdx(null);
        }
    }
    function scrollToResult(result) {
        if (!result)
            return;
        const container = contentRef.current;
        if (!container)
            return;
        // Wait a frame to ensure DOM is updated with highlights
        requestAnimationFrame(() => {
            // extra delay for larger renders
            setTimeout(() => {
                const marks = container.querySelectorAll('.search-highlight');
                const occ = result.occurrence || 0;
                if (marks && marks.length > occ) {
                    const el = marks[occ];
                    if (el && typeof el.scrollIntoView === 'function') {
                        try {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        catch (e) {
                            el.scrollIntoView();
                        }
                        el.style.outline = '3px solid rgba(100,100,255,0.18)';
                        setTimeout(() => { if (el)
                            el.style.outline = ''; }, 1400);
                    }
                }
            }, 40);
        });
    }
    // Load book content and parse ToC/chapters
    useEffect(() => {
        setLoading(true);
        // Build URL from selected language folder
        const folder = lang;
        const url = `/book-content/html/${encodeURIComponent(folder)}/index.html`;
        fetch(url)
            .then(res => res.text())
            .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            // Parse book title
            const title = doc.querySelector('title')?.textContent || "The Great Controversy";
            setBookTitle(title);
            // Parse ToC
            let tocEntries = [];
            let tocRoot = doc.querySelector('nav[type="toc"] ol') || doc.querySelector('nav[type="toc"]') || doc.querySelector('ol');
            if (tocRoot) {
                tocEntries = Array.from(tocRoot.querySelectorAll('a')).map(a => ({
                    title: a.textContent || '',
                    href: a.getAttribute('href') || ''
                })).filter(e => e.title && e.href);
            }
            setToc(tocEntries);
            // Parse chapters by matching ToC hrefs to element IDs
            const chapterHtmls = [];
            tocEntries.forEach(entry => {
                const id = entry.href.replace(/^#/, '');
                const el = doc.getElementById(id);
                if (el) {
                    // Get all content until the next chapter or end
                    let html = '';
                    let node = el;
                    while (node && node.nextElementSibling && !tocEntries.some(e => e.href.replace(/^#/, '') === node.nextElementSibling.id)) {
                        html += node.outerHTML;
                        node = node.nextElementSibling;
                    }
                    if (node)
                        html += node.outerHTML;
                    chapterHtmls.push(html);
                }
                else {
                    chapterHtmls.push('');
                }
            });
            setChapters(chapterHtmls);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [lang]);
    // Position language menu under the language button when opened
    useEffect(() => {
        if (!showLangMenu) {
            setLangMenuPos(null);
            return;
        }
        const compute = () => {
            const btn = langBtnRef.current;
            if (!btn)
                return;
            const r = btn.getBoundingClientRect();
            setLangMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 6) });
        };
        compute();
        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, { passive: true });
        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute);
        };
    }, [showLangMenu]);
    // Position search panel under the search button when opened
    useEffect(() => {
        if (!showSearch) {
            setSearchMenuPos(null);
            return;
        }
        const compute = () => {
            const btn = searchBtnRef.current;
            if (!btn)
                return;
            const r = btn.getBoundingClientRect();
            setSearchMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 6) });
        };
        compute();
        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, { passive: true });
        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute);
        };
    }, [showSearch]);
    useEffect(() => {
        if (searchResults.length > 0) {
            const result = searchResults[searchResultIdx];
            if (result) {
                // navigate to the result's chapter and highlight
                setChapterIdx(result.idx);
                setHighlighted(searchQuery.trim() || null);
                setChapterMatchIdx(result.charIndex);
                // scroll after render
                setTimeout(() => scrollToResult(result), 220);
            }
        }
    }, [searchResultIdx, searchResults]);
    // Position chapters menu under the header controls when opened
    useEffect(() => {
        if (!showChaptersMenu) {
            setChaptersMenuPos(null);
            return;
        }
        const compute = () => {
            const el = headerControlsRef.current;
            if (!el) {
                setChaptersMenuPos({ left: 12, top: 72 });
                return;
            }
            const r = el.getBoundingClientRect();
            setChaptersMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 6) });
        };
        compute();
        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, { passive: true });
        return () => { window.removeEventListener('resize', compute); window.removeEventListener('scroll', compute); };
    }, [showChaptersMenu]);
    return (React.createElement("div", { className: "reader-root" },
        React.createElement("div", { className: "reader-title-wrap", style: { width: isDesktop ? `${pageWidth}px` : '100%', marginLeft: isDesktop ? 'auto' : '', marginRight: isDesktop ? 'auto' : '', padding: '8px 0' } },
            React.createElement("div", { className: "reader-title-above-nav", style: { fontSize: '1.6em', fontWeight: 800, textAlign: 'left' } }, bookTitle)),
        React.createElement("div", { className: "reader-header-bar", style: { position: 'sticky', top: 0, zIndex: 3000, background: 'var(--reader-header, #fff)', borderBottom: '1px solid var(--reader-border, #e6e6f0)' } },
            React.createElement("div", { className: "reader-header-bar-inner", style: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' } },
                React.createElement("div", { ref: headerControlsRef, style: { display: 'flex', alignItems: 'center', width: isDesktop ? `${pageWidth}px` : '100%', marginLeft: isDesktop ? 'auto' : '', marginRight: isDesktop ? 'auto' : '', gap: 12 } },
                    React.createElement("button", { className: "reader-nav-btn reader-burger-icon", onClick: () => setShowChaptersMenu(v => !v), "aria-label": "Show contents", title: "Contents" },
                        React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 28 28", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                            React.createElement("rect", { y: "6", width: "28", height: "3", rx: "1.5", fill: "currentColor" }),
                            React.createElement("rect", { y: "13", width: "28", height: "3", rx: "1.5", fill: "currentColor" }),
                            React.createElement("rect", { y: "20", width: "28", height: "3", rx: "1.5", fill: "currentColor" }))),
                    React.createElement("button", { ref: langBtnRef, type: "button", className: "reader-lang-icon", onClick: (e) => { e.stopPropagation(); setShowLangMenu(v => !v); }, "aria-label": "Select language", title: "Language" }, "A \u6587"),
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement("button", { className: "reader-nav-btn", onClick: () => setChapterIdx(i => Math.max(i - 1, 0)), disabled: chapterIdx === 0 }, "\u2190"),
                        React.createElement("button", { className: "reader-nav-btn", onClick: () => setChapterIdx(i => Math.min(i + 1, toc.length - 1)), disabled: chapterIdx === toc.length - 1 }, "\u2192"),
                        React.createElement("button", { className: "reader-nav-btn", onClick: () => setTextSize(s => Math.max(0.7, s - 0.1)) }, "A-"),
                        React.createElement("button", { className: "reader-nav-btn", onClick: () => setTextSize(s => Math.min(2, s + 0.1)) }, "A+")),
                    React.createElement("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement("button", { type: "button", className: "reader-darkmode-toggle", onClick: (e) => { e.stopPropagation(); toggleDarkMode(); }, "aria-pressed": darkMode, title: darkMode ? 'Switch to light mode' : 'Switch to dark mode' },
                            React.createElement("span", { className: "material-icons", "aria-hidden": "true" }, darkMode ? 'dark_mode' : 'light_mode')),
                        isDesktop && (React.createElement(React.Fragment, null,
                            React.createElement("input", { className: "reader-width-slider", type: "range", min: 500, max: 1800, value: pageWidth, onChange: (e) => setPageWidth(Number(e.target.value)) }),
                            React.createElement("button", { ref: searchBtnRef, type: "button", className: "reader-search-btn", onClick: (e) => { e.stopPropagation(); setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 180); }, "aria-label": "Search", title: "Search" },
                                React.createElement("span", { className: "material-icons", "aria-hidden": "true" }, "search")))))))),
        showChaptersMenu && (React.createElement(React.Fragment, null,
            React.createElement("div", { onClick: () => setShowChaptersMenu(false), style: { position: 'fixed', inset: 0, zIndex: 218, background: 'rgba(0,0,0,0.45)' } }),
            React.createElement("div", { style: {
                    position: 'fixed',
                    top: chaptersMenuPos ? `${chaptersMenuPos.top}px` : 72,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 220,
                    pointerEvents: 'none',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '8px',
                } },
                React.createElement("div", { onClick: e => e.stopPropagation(), style: {
                        pointerEvents: 'auto',
                        maxHeight: '70vh',
                        width: isDesktop ? `${pageWidth}px` : '92%',
                        overflowY: 'auto',
                        background: darkMode ? '#23243a' : '#fff',
                        color: darkMode ? '#ffe066' : '#23235a',
                        border: '1.5px solid #e0e0e0',
                        borderRadius: 10,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        padding: '0.6em'
                    } },
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4em 0.6em' } },
                        React.createElement("strong", null, bookTitle),
                        React.createElement("button", { onClick: () => setShowChaptersMenu(false), "aria-label": "Close contents", style: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 } }, "\u2715")),
                    React.createElement("hr", { style: { border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0.2em 0 0.6em' } }),
                    React.createElement("ul", { style: { listStyle: 'none', padding: 0, margin: 0 } },
                        toc.length === 0 && React.createElement("li", { style: { padding: '0.6em' } }, "No contents available."),
                        toc.map((c, idx) => (React.createElement("li", { key: c.href, style: { margin: 0 } },
                            React.createElement("button", { onClick: () => { setChapterIdx(idx); setShowChaptersMenu(false); }, style: {
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.6em',
                                    border: 'none',
                                    background: idx === chapterIdx ? (darkMode ? '#2b2c44' : '#f0f4ff') : 'transparent',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    fontWeight: idx === chapterIdx ? 700 : 500,
                                } }, c.title))))))))),
        React.createElement("section", { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' } }, loading ? (React.createElement("div", null, "Loading...")) : (React.createElement(React.Fragment, null,
            React.createElement("div", { ref: wrapperRef, className: "reader-content", style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: isDesktop ? `${pageWidth}px` : '100%', marginLeft: isDesktop ? 'auto' : '', marginRight: isDesktop ? 'auto' : '' } },
                React.createElement("div", { ref: contentRef, className: "reader-book-html", style: { fontSize: `${textSize}em`, width: '100%' }, dangerouslySetInnerHTML: {
                        __html: (() => {
                            let html = highlighted
                                ? getHighlightedChapterHtml(chapters[chapterIdx] || "", highlighted, chapterMatchIdx)
                                : chapters[chapterIdx] || "";
                            // apply dropcap for chapter 1 opening (chapterIdx === 0) except Arabic
                            html = applyDropcap(html, lang, chapterIdx);
                            return html.replace(/(background|color)\s*:\s*[^;"']+;?/gi, '');
                        })()
                    } })),
            React.createElement("div", { className: "reader-bottom-nav" },
                React.createElement("button", { onClick: () => setChapterIdx(i => Math.max(i - 1, 0)), disabled: chapterIdx === 0 }, "\u2190"),
                React.createElement("button", { onClick: () => setChapterIdx(i => Math.min(i + 1, toc.length - 1)), disabled: chapterIdx === toc.length - 1 }, "\u2192"))))),
        showSearch && (React.createElement("div", { onClick: () => setShowSearch(false), style: { position: 'fixed', inset: 0, zIndex: 220, background: 'transparent' } },
            React.createElement("div", { onClick: e => e.stopPropagation(), style: { position: 'fixed', left: searchMenuPos ? `${searchMenuPos.left}px` : 'auto', top: searchMenuPos ? `${searchMenuPos.top}px` : '60px', minWidth: 280, zIndex: 230, background: darkMode ? '#23243a' : '#fff', color: darkMode ? '#ffe066' : '#23235a', borderRadius: 8, padding: '0.6em', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } },
                React.createElement("input", { ref: searchInputRef, value: searchQuery, onChange: e => setSearchQuery(e.target.value), onKeyDown: e => { if (e.key === 'Enter') {
                        handleSearch();
                    } }, placeholder: "Search in book...", style: { width: '100%', fontSize: '1.05em', padding: '0.45em', borderRadius: 6, border: '1px solid #ccc' } }),
                React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, alignItems: 'center' } },
                    React.createElement("button", { onClick: () => { setSearchResultIdx(i => Math.max(0, i - 1)); }, style: { padding: '0.35em 0.6em' }, "aria-label": "Previous" }, "\u25C0"),
                    React.createElement("div", { style: { fontSize: '0.9em' } }, searchResults.length > 0 ? `${searchResultIdx + 1} / ${searchResults.length}` : '0 / 0'),
                    React.createElement("button", { onClick: () => { setSearchResultIdx(i => Math.min((searchResults.length - 1) || 0, i + 1)); }, style: { padding: '0.35em 0.6em' }, "aria-label": "Next" }, "\u25B6"),
                    React.createElement("button", { onClick: () => { handleSearch(); }, style: { padding: '0.35em 0.7em' } }, "Search"),
                    React.createElement("button", { onClick: () => setShowSearch(false), style: { padding: '0.35em 0.7em' } }, "Close"))))),
        showLangMenu && (React.createElement("div", { onClick: () => setShowLangMenu(false), style: { position: 'fixed', inset: 0, zIndex: 220 } },
            React.createElement("div", { onClick: e => e.stopPropagation(), style: {
                    position: 'fixed',
                    left: langMenuPos ? `${langMenuPos.left}px` : 'auto',
                    top: langMenuPos ? `${langMenuPos.top}px` : '60px',
                    minWidth: '170px',
                    zIndex: 230,
                    background: darkMode ? '#23243a' : '#fff',
                    color: darkMode ? '#ffe066' : '#23235a',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: 10,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    padding: '0.35em 0',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                } },
                React.createElement("ul", { style: { listStyle: 'none', margin: 0, padding: 0 } }, languageFolders.map(l => (React.createElement("li", { key: l, style: { margin: 0 } },
                    React.createElement("button", { onClick: () => {
                            setLang(l);
                            setChapterIdx(0);
                            setSearchResults([]);
                            setSearchQuery('');
                            setHighlighted(null);
                            setChapterMatchIdx(null);
                            setShowLangMenu(false);
                        }, disabled: l === lang, style: {
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5em 0.9em',
                            border: 'none',
                            background: l === lang ? (darkMode ? '#2b2c44' : '#f0f4ff') : 'transparent',
                            color: 'inherit',
                            cursor: l === lang ? 'default' : 'pointer',
                            fontWeight: l === lang ? 700 : 500,
                        } }, languageNames[l] || l))))))))));
    div >
    ;
    div >
    ;
    ;
}
