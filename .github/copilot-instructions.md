# Copilot & AI Agent Instructions for The Great Controversy Web App

## Project Overview
- **Purpose:** Multi-language, offline-friendly book reader for "The Great Controversy" and translations.
- **Stack:** React (TypeScript), Vite, minimal dependencies, no backend.
- **Key Directories:**
  - `src/` — All app logic and UI components
  - `public/book-content/` — Book content in multiple formats (HTML, EPUB, TXT) and languages

## Architecture & Data Flow
- **BookReader.tsx** is the main UI: fetches, parses, and displays book chapters from HTML files in `public/book-content/html/<LANG_FOLDER>/index.html`.
- **Language/Book selection:**
  - Language folders are mapped in `BookReader.tsx` and selected via dropdown.
  - Default language is detected from browser, fallback to English.
- **Table of Contents (ToC):**
  - Parsed from HTML `<nav type="toc">`, `<ol>`, or fallback `<div>` with links.
  - Chapters are extracted by matching ToC hrefs to HTML element IDs.
- **Search:**
  - Client-side, highlights matches in rendered HTML.
- **State:**
  - Uses React hooks for UI state, bookmarks, dark mode, text size, etc. (see `src/utils/`).
  - Bookmarks and dark mode are persisted in `localStorage`.

## Developer Workflows
- **Start dev server:** `npm run dev` (Vite)
- **Build for production:** `npm run build`
- **Preview build:** `npm run preview`
- **No automated tests** (as of Jan 2026)
- **No backend/server code** — all content is static and loaded via fetch.

## Project-Specific Patterns & Conventions
- **Minimal dependencies:** Only `react`, `react-dom`, `react-icons`, and `vite`.
- **No Redux, no context API:** All state is local or via custom hooks.
- **Book content is NOT bundled:** It is loaded at runtime from `public/book-content/html/`.
- **Adding a new language:**
  1. Add a new folder to `public/book-content/html/` with the correct structure.
  2. Update the `languageFolders` and `languageNames` in `BookReader.tsx`.
- **UI theming:**
  - Dark mode toggled via React state and `data-theme` attribute.
  - Text size adjustable via UI buttons.

## Integration Points
- **No external APIs** — all data is local/static.
- **Service worker:** `src/service-worker.js` for offline support (if present).

## Examples
- See `BookReader.tsx` for ToC parsing, chapter navigation, and search logic.
- See `src/utils/` for custom hooks (e.g., `useBookmark`, `useDarkMode`).

---

**When in doubt, prefer simplicity and static data loading.**

