// @ts-nocheck
/* global require, process */
const fs = require('fs');
const path = require('path');

const BOOK_ID = 192;

async function getToken() {
  const tok = await fetch('https://egwwritings.org/api/getToken').then((r) => r.json());
  return tok.access_token;
}

function cleanText(s = '') {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b[A-Z]{2,6}\s*\d+(?:\.\d+)?\s*Paragraph\b/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(s = '') {
  return String(s)
    .replace(/^\s*[-:]+\s*/, '')
    .replace(/\s*[-:]+\s*$/g, '')
    .replace(/^\s*Chapiter\s*(\d+)\s*[—–-]\s*/i, '$1 — ')
    .replace(/\bI’homme\b/g, 'l’homme')
    .replace(/\bEcritures\b/g, 'Écritures')
    .replace(/[*]+.*$/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugifyId(input = '') {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

(async () => {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const toc = await fetch(`https://a.egwwritings.org/content/books/${BOOK_ID}/toc`, { headers }).then((r) => r.json());
  const sections = (Array.isArray(toc) ? toc : [])
    .filter((x) => Number(x.level) === 1)
    .filter((x) => !/^\s*préface\s*$/i.test(String(x.title || '').trim()))
    .map((x) => ({
      title: normalizeTitle(String(x.title || '').trim()),
      start: Number(String(x.para_id || '').split('.')[1]),
    }))
    .filter((x) => Number.isFinite(x.start));

  const blocks = [];
  const chapters = [];

  for (const section of sections) {
    const url = `https://a.egwwritings.org/content/books/${BOOK_ID}/chapter/${section.start}`;
    const items = await fetch(url, { headers }).then((r) => r.json());
    const paragraphs = [];

    blocks.push(`@@CHAPTER@@ ${section.title}`);
    blocks.push('');

    for (const it of Array.isArray(items) ? items : []) {
      const type = String(it.element_type || '').toLowerCase();
      if (type === 'p' || type === 'blockquote') {
        const txt = cleanText(it.content || '');
        if (txt) {
          paragraphs.push(txt);
          blocks.push(txt);
          blocks.push('');
        }
      }
    }

    chapters.push({
      title: section.title,
      id: `fr-${String(section.start)}-${slugifyId(section.title)}`,
      paragraphs,
    });
  }

  const out = blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  const outPath = path.join(process.cwd(), 'public', 'book-content', 'txt', 'GC-French.txt');
  fs.writeFileSync(outPath, out, 'utf8');

  const tocItems = chapters
    .map((ch) => `      <li><a href="#${ch.id}">${escapeHtml(ch.title)}</a></li>`)
    .join('\n');

  const chapterHtml = chapters
    .map((ch) => {
      const body = ch.paragraphs.map((p) => `    <p>${escapeHtml(p)}</p>`).join('\n');
      return `<section id="${ch.id}">\n  <h2 class="chapterhead">${escapeHtml(ch.title)}</h2>\n${body}\n</section>`;
    })
    .join('\n\n');

  const htmlDoc = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>La Tragédie des Siècles - Ellen G. White</title>
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

  const htmlDir = path.join(process.cwd(), 'public', 'book-content', 'html', 'French - Ellen G. White');
  fs.mkdirSync(htmlDir, { recursive: true });
  const htmlPath = path.join(htmlDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlDoc, 'utf8');

  console.log(`wrote ${outPath} | sections=${sections.length} | chars=${out.length}`);
  console.log(`wrote ${htmlPath} | chapters=${chapters.length} | chars=${htmlDoc.length}`);
})();
