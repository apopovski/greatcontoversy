const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const ROOT = path.join(__dirname, '..');
const OG_DIR = path.join(ROOT, 'public', 'og');
const OG_IMAGES_DIR = path.join(OG_DIR, 'images');
const SOURCE_SVG = path.join(ROOT, 'public', 'graphics', 'gc-splash-new.svg');
const SHARED_IMAGE_FILENAME = 'gc-splash-new-og.jpg';
const SHARED_IMAGE_PUBLIC_PATH = `/og/images/${SHARED_IMAGE_FILENAME}`;
const SHARED_IMAGE_ABSOLUTE_PATH = path.join(OG_IMAGES_DIR, SHARED_IMAGE_FILENAME);
const WIDTH = 1200;
const HEIGHT = 630;
const SHARED_OG_IMAGE_URL = process.env.OG_IMAGE_URL
  ? String(process.env.OG_IMAGE_URL).trim()
  : `https://greatcontroversy.vercel.app${SHARED_IMAGE_PUBLIC_PATH}`;

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
  html = setOrInsertMeta(html, 'property', 'og:image:type', 'image/jpeg');
  html = setOrInsertMeta(html, 'property', 'og:image:width', String(WIDTH));
  html = setOrInsertMeta(html, 'property', 'og:image:height', String(HEIGHT));
  html = setOrInsertMeta(html, 'name', 'twitter:image', absoluteImageUrl);

  await fs.writeFile(htmlPath, html, 'utf8');
}

async function generateSharedOgImage() {
  await fs.mkdir(OG_IMAGES_DIR, { recursive: true });
  await sharp(SOURCE_SVG)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(SHARED_IMAGE_ABSOLUTE_PATH);
}

async function run() {
  // If OG_IMAGE_URL is explicitly provided, skip local image generation.
  if (!process.env.OG_IMAGE_URL) {
    await generateSharedOgImage();
  }

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

  console.log('\nDone. Updated OG image meta to shared raster splash image.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
