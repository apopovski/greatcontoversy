const fs = require('fs');
const https = require('https');

const ids = [
  1248, 1358, 1406, 1491, 1609, 1662, 1749, 1822, 1900, 1968, 2008, 2091, 2135, 2220,
  2280, 2338, 2370, 2403, 2468, 2562, 2613, 2702, 2751, 2796, 2838, 2936, 3015, 3061,
];

const urls = ids.map((id) => `https://text.egwwritings.org/read/14626.${id}`);

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function decodeHtml(str) {
  const named = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>',
  };

  let out = str.replace(/&(nbsp|amp|quot|lt|gt);|&#39;/g, (m) => named[m] || m);
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
  out = out.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
  return out;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

function cleanText(s) {
  return decodeHtml(stripTags(s))
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function extractChapter(html) {
  const regionMatch = html.match(/<div id="r-pl"[\s\S]*?<\/div>\s*<div id="js-rtp"/);
  if (!regionMatch) return null;
  const region = regionMatch[0];

  const titleMatch = region.match(/<p id="14626\.\d+" class="h3">([\s\S]*?)<\/p>/);
  const title = titleMatch ? cleanText(titleMatch[1]) : null;

  const paras = [];
  const pRegex = /<p class="para[^>]*>[\s\S]*?<\/p>/g;
  const blocks = region.match(pRegex) || [];

  for (const p of blocks) {
    const spanMatch = p.match(/<span>([\s\S]*?)<\/span>/);
    if (!spanMatch) continue;
    let t = spanMatch[1];
    t = t.replace(/<span class="page-break"[^>]*><\/span>/g, '');
    t = cleanText(t);
    if (t) paras.push(t);
  }

  if (!title || paras.length === 0) return null;
  return { title, paras };
}

(async () => {
  const chunks = [];
  chunks.push('Büyük Mücadele (Türkçe) — Bölüm 15-42');
  chunks.push('Kaynak: text.egwwritings.org');
  chunks.push('');

  for (const url of urls) {
    const html = await fetch(url);
    const chapter = extractChapter(html);

    if (!chapter) {
      chunks.push('='.repeat(80));
      chunks.push(`[HATA] ${url}`);
      chunks.push('Bu bölüm temiz çıkarılamadı.');
      chunks.push('');
      continue;
    }

    chunks.push('='.repeat(80));
    chunks.push(chapter.title);
    chunks.push('-'.repeat(chapter.title.length));
    chunks.push('');

    for (const p of chapter.paras) {
      chunks.push(p);
      chunks.push('');
    }
  }

  const outPath = 'data/turkish_gc_chapters_15_42.txt';
  fs.writeFileSync(outPath, chunks.join('\n'), 'utf8');
  console.log(`Wrote ${outPath}`);
})();
