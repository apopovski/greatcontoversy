import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const OG_DIR = path.join(ROOT, 'public', 'og');

const TAGLINES = {
  en: 'Cosmic conflict between good and evil',
  es: 'Conflicto cósmico entre el bien y el mal',
  de: 'Kosmischer Konflikt zwischen Gut und Böse',
  it: 'Conflitto cosmico tra il bene e il male',
  da: 'Kosmisk konflikt mellem godt og ondt',
  no: 'Kosmisk konflikt mellom godt og ondt',
  pt: 'Conflito cósmico entre o bem e o mal',
  sm: 'Feteʻenaʻiga faale-vateatea i le va o le lelei ma le leaga',
  et: 'Kosmiline konflikt hea ja kurja vahel',
  ro: 'Conflict cosmic între bine și rău',
  hr: 'Kozmički sukob između dobra i zla',
  bg: 'Космически конфликт между доброто и злото',
  sk: 'Kozmický konflikt medzi dobrom a zlom',
  cs: 'Kosmický konflikt mezi dobrem a zlem',
  uk: 'Космічний конфлікт між добром і злом',
  ru: 'Космический конфликт между добром и злом',
  pl: 'Kosmiczny konflikt między dobrem a złem',
  ar: 'صراع كوني بين الخير والشر',
  am: 'በመልካምና በክፉ መካከል ያለ ኮስሚክ ግጭት',
  zh: '善与恶之间的宇宙冲突',
  sr: 'Космички сукоб између добра и зла',
  fa: 'نبرد کیهانی میان خیر و شر',
  af: 'Kosmiese konflik tussen goed en kwaad',
  hi: 'अच्छाई और बुराई के बीच ब्रह्मांडीय संघर्ष',
  bn: 'ভাল ও মন্দের মধ্যে মহাজাগতিক সংঘর্ষ',
  id: 'Konflik kosmik antara yang baik dan yang jahat',
};

const BOOK_TITLES = {
  en: 'The Great Controversy',
  es: 'El Conflicto de los Siglos',
  de: 'Der große Kampf',
  it: 'Il gran conflitto',
  da: 'Mod en bedre fremtid',
  no: 'Mot historiens klimaks',
  pt: 'O Grande Conflito',
  sm: 'O Le Finauga Tele',
  et: 'Suur Võitlus',
  ro: 'Tragedia veacurilor',
  hr: 'Velika borba između Krista i Sotone',
  bg: 'Великата борба между Христос и Сатана',
  sk: 'Veľké drama vekov',
  cs: 'Velký spor věků',
  uk: 'Велика боротьба',
  ru: 'Великая борьба',
  pl: 'Wielki bój',
  ar: 'الصراع العظيم',
  am: 'ታላቁ ተጋድሎ',
  zh: '善恶之争',
  sr: 'Велика борба између Христа и Сотоне',
  fa: 'نبرد عظیم',
  af: 'Die Groot Stryd',
  hi: 'महान संघर्ष',
  bn: 'মহা বিবাদ',
  id: 'Kemenangan Akhir',
};

function replaceMeta(html, attrName, attrValue, contentValue) {
  const pattern = new RegExp(`(<meta\\s+${attrName}="${attrValue}"\\s+content=")[^"]*("\\s*\\/?>)`, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, `$1${contentValue}$2`);
  }
  const tag = `  <meta ${attrName}="${attrValue}" content="${contentValue}" />\n`;
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function replaceTitleTag(html, titleValue) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleValue}</title>`);
  }
  return html.replace(/<head>/i, `<head>\n  <title>${titleValue}</title>`);
}

function getBookTitleFromOgTitle(ogTitle) {
  if (!ogTitle) return 'The Great Controversy';
  const parts = ogTitle.split(/\s+[—–-]\s+/);
  return (parts[0] || ogTitle).trim();
}

async function run() {
  const names = await fs.readdir(OG_DIR);
  const htmlFiles = names.filter((n) => /^[a-z]{2}\.html$/i.test(n));

  for (const file of htmlFiles) {
    const code = file.slice(0, 2).toLowerCase();
    const tagline = TAGLINES[code] || TAGLINES.en;
    const fullPath = path.join(OG_DIR, file);
    let html = await fs.readFile(fullPath, 'utf8');

    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"\s*\/?>/i);
    const fallbackTitle = getBookTitleFromOgTitle(ogTitleMatch?.[1] || 'The Great Controversy');
    const bookTitle = BOOK_TITLES[code] || fallbackTitle;
    const nextTitle = bookTitle;
    const nextDescription = `${bookTitle} — ${tagline}.`;

    html = replaceTitleTag(html, nextTitle);
    html = replaceMeta(html, 'property', 'og:title', nextTitle);
    html = replaceMeta(html, 'name', 'twitter:title', nextTitle);

    html = replaceMeta(html, 'name', 'description', nextDescription);
    html = replaceMeta(html, 'property', 'og:description', nextDescription);
    html = replaceMeta(html, 'name', 'twitter:description', nextDescription);

    await fs.writeFile(fullPath, html, 'utf8');
    console.log(`✓ ${code} updated`);
  }

  console.log('Done: localized OG titles/descriptions updated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
