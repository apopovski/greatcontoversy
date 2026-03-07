/* global process */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const workspaceRoot = process.cwd();
const epubPath = path.join(workspaceRoot, 'public', 'book-content', 'ePub', 'hu_NK(GC).epub');
const outDir = path.join(workspaceRoot, 'public', 'book-content', 'html', 'A nagy küzdelem - Ellen G. White');
const outPath = path.join(outDir, 'index.html');

function unzipText(entryPath) {
  return execFileSync('unzip', ['-p', epubPath, entryPath], { encoding: 'utf8' });
}

function stripXmlEnvelope(html) {
  return String(html)
    .replace(/^<\?xml[^>]*>\s*/i, '')
    .replace(/<!DOCTYPE[^>]*>\s*/gi, '')
    .replace(/^[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '')
    .trim();
}

function extractChapterInner(html) {
  const body = stripXmlEnvelope(html);
  const match = body.match(/<div[^>]*class="chapter"[^>]*>([\s\S]*?)<\/div>\s*$/i);
  return (match ? match[1] : body).trim();
}

function stripOuterHeading(innerHtml) {
  return String(innerHtml)
    .replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*/i, '')
    .trim();
}

function slugifyId(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rewriteRelativeLinks(html, idByFile) {
  return String(html).replace(/href="([^"]+\.html)"/gi, (_, href) => {
    const fileName = path.basename(href);
    const targetId = idByFile.get(fileName);
    return targetId ? `href="#${targetId}"` : `href="${href}"`;
  });
}

const tocHtml = unzipText('OEBPS/toc.html');
const tocMatches = Array.from(tocHtml.matchAll(/<a\s+href="([^"]+\.html)">([\s\S]*?)<\/a>/gi));

const tocEntries = tocMatches.map((match, index) => {
  const fileName = path.basename(match[1]);
  const title = String(match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    fileName,
    title,
    id: `hu-${String(index + 1).padStart(2, '0')}-${slugifyId(title)}`,
  };
});

const idByFile = new Map(tocEntries.map((entry) => [entry.fileName, entry.id]));

const sectionsHtml = tocEntries.map((entry) => {
  const raw = unzipText(`OEBPS/${entry.fileName}`);
  const inner = rewriteRelativeLinks(extractChapterInner(raw), idByFile);
  const body = stripOuterHeading(inner);
  return `<section id="${entry.id}">\n  <h2 class="chapterhead">${escapeHtml(entry.title)}</h2>${body ? `\n  ${body.replace(/\n/g, '\n  ')}` : ''}\n</section>`;
}).join('\n\n');

const tocItems = tocEntries
  .map((entry) => `      <li><a href="#${entry.id}">${escapeHtml(entry.title)}</a></li>`)
  .join('\n');

const htmlDoc = `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>A nagy küzdelem - Ellen G. White</title>
</head>
<body>
  <nav type="toc">
    <ol>
${tocItems}
    </ol>
  </nav>

${sectionsHtml}
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, htmlDoc, 'utf8');

console.log(`wrote ${outPath} | sections=${tocEntries.length} | chars=${htmlDoc.length}`);
