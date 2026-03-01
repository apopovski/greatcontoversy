const fs = require('fs/promises');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OG_DIR = path.join(ROOT, 'public', 'og');
const SHARED_OG_IMAGE_URL = process.env.OG_IMAGE_URL
  ? String(process.env.OG_IMAGE_URL).trim()
  : 'https://greatcontroversy.vercel.app/graphics/gc-splash-new.svg';

function setOrInsertMeta(html, attrName, attrValue, contentValue) {
  const tagRe = new RegExp(`<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*\\/?\\s*>`, 'i');
  const nextTag = `<meta ${attrName}="${attrValue}" content="${contentValue}" />`;
  if (tagRe.test(html)) return html.replace(tagRe, nextTag);
  return html.replace(/<\/head>/i, `  ${nextTag}\n</head>`);
}

async function updateOgHtmlImageRefs(code, absoluteImageUrl) {
  const htmlPath = path.join(OG_DIR, `${code}.html`);
  let html = await fs.readFile(htmlPath, 'utf8');

  html = setOrInsertMeta(html, 'property', 'og:image', absoluteImageUrl);
  html = setOrInsertMeta(html, 'name', 'twitter:image', absoluteImageUrl);

  await fs.writeFile(htmlPath, html, 'utf8');
}

async function run() {
  const all = await fs.readdir(OG_DIR);
  const htmlFiles = all.filter((n) => /^[a-z]{2}\.html$/i.test(n));

  if (!htmlFiles.length) {
    throw new Error('No language OG HTML files found in public/og.');
  }

  for (const file of htmlFiles) {
    const code = file.replace(/\.html$/i, '').toLowerCase();
    await updateOgHtmlImageRefs(code, SHARED_OG_IMAGE_URL);
    console.log(`✓ ${code} -> ${SHARED_OG_IMAGE_URL}`);
  }

  console.log('\nDone. Updated OG image meta to shared splash SVG.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
