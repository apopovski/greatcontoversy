// @ts-nocheck
/* global require, process */
const fs = require('fs');
const path = require('path');

const BOOKS = [
  { id: 11375 },
  { id: 11376 },
];

const OUTPUT_FOLDER = 'Η Μεγάλη Διαμάχη - Ellen G. White';
const OUTPUT_TITLE = 'Η Μεγάλη Διαμάχη - Ellen G. White';
const EXTERNAL_LINK_LABEL = 'Άνοιγμα στο EGW Writings';

async function getToken() {
  const tok = await fetch('https://egwwritings.org/api/getToken').then((r) => r.json());
  return tok.access_token;
}

function decodeEntities(s = '') {
  return String(s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function cleanText(s = '') {
  return decodeEntities(
    String(s)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\b[A-Z]{2,6}\s*\d+(?:\.\d+)?\s*Paragraph\b/g, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function normalizeTitle(s = '') {
  return decodeEntities(
    String(s)
      .replace(/^\s*[-:]+\s*/, '')
      .replace(/\s*[-:]+\s*$/g, '')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

function getSectionTitleFromItems(items, fallbackTitle) {
  const heading = (Array.isArray(items) ? items : []).find((item) => {
    const type = String(item?.element_type || '').toLowerCase();
    return ['h2', 'h3', 'h4'].includes(type) && cleanText(item?.content || '').trim();
  });
  return normalizeTitle(cleanText(heading?.content || '') || fallbackTitle || 'Ενότητα');
}

(async () => {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const sections = [];

  for (const book of BOOKS) {
    const toc = await fetchJson(`https://a.egwwritings.org/content/books/${book.id}/toc`, headers);
    const tocEntries = (Array.isArray(toc) ? toc : [])
      .filter((item) => Number(item?.level) === 1)
      .map((item) => ({
        bookId: book.id,
        start: Number(String(item?.para_id || '').split('.')[1]),
        fallbackTitle: normalizeTitle(String(item?.title || '').trim()),
      }))
      .filter((item) => Number.isFinite(item.start));

    for (const entry of tocEntries) {
      const items = await fetchJson(
        `https://a.egwwritings.org/content/books/${entry.bookId}/chapter/${entry.start}`,
        headers,
      );
      const paragraphs = [];

      for (const item of Array.isArray(items) ? items : []) {
        const type = String(item?.element_type || '').toLowerCase();
        if (type === 'p' || type === 'blockquote') {
          const txt = cleanText(item?.content || '');
          if (txt) paragraphs.push(txt);
        }
      }

      const title = getSectionTitleFromItems(items, entry.fallbackTitle);
      sections.push({
        id: `el-${entry.bookId}-${entry.start}`,
        title,
        bookId: entry.bookId,
        start: entry.start,
        paragraphs,
      });
    }
  }

  const textChunks = [];
  for (const section of sections) {
    textChunks.push(`@@CHAPTER@@ ${section.title}`);
    textChunks.push('');
    textChunks.push(...section.paragraphs);
    textChunks.push('');
  }

  const txtOut = `${textChunks.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
  const txtPath = path.join(process.cwd(), 'public', 'book-content', 'txt', 'GC-Greek.txt');
  fs.writeFileSync(txtPath, txtOut, 'utf8');

  const tocItems = sections
    .map((section) => `      <li><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`)
    .join('\n');

  const chapterHtml = sections
    .map((section) => {
      const body = section.paragraphs.map((p) => `    <p>${escapeHtml(p)}</p>`).join('\n');
      const externalUrl = `https://text.egwwritings.org/read/${section.bookId}.${section.start}`;
      return `<section id="${section.id}">\n  <h2 class="chapterhead">${escapeHtml(section.title)}</h2>\n  <p><a href="${externalUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(EXTERNAL_LINK_LABEL)}</a></p>\n${body}\n</section>`;
    })
    .join('\n\n');

  const htmlDoc = `<!doctype html>
<html lang="el">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(OUTPUT_TITLE)}</title>
</head>
<body>
  <nav type="toc">
    <ol>
${tocItems}
    </ol>
  </nav>

${chapterHtml}
</body>
</html>
`;

  const htmlDir = path.join(process.cwd(), 'public', 'book-content', 'html', OUTPUT_FOLDER);
  fs.mkdirSync(htmlDir, { recursive: true });
  const htmlPath = path.join(htmlDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlDoc, 'utf8');

  console.log(`wrote ${txtPath} | sections=${sections.length} | chars=${txtOut.length}`);
  console.log(`wrote ${htmlPath} | sections=${sections.length} | chars=${htmlDoc.length}`);
})();
