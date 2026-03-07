const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.cleaned.txt');
const outputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.reader.txt');

let text = fs.readFileSync(inputPath, 'utf8');

const literalReplacements = [
  ['11:211', '11:2-11'],
  ['9:2527', '9:25-27'],
  ['1226. ayetler', '12-26. ayetler'],
  ['1517, 12, 13', '15-17, 12, 13'],
  ['Yetmiş hafta 490 gün2300 günden', 'Yetmiş hafta 490 gün 2300 günden'],
  ['inandığıtapınağın', 'inandığı tapınağın'],
  ['süresindenbahsedildiğinin', 'süresinden bahsedildiğinin'],
  ['dışındaRomalılar', 'dışında Romalılar'],
  ['papalığınniteliklerini', 'papalığın niteliklerini'],
  ['varlığıkarşılamaya', 'varlığı karşılamaya'],
  ['içinutancı', 'için utancı'],
  ['şöyle dedi:”', 'şöyle dedi: “'],
  ['öngörülmüştür:”', 'öngörülmüştür: “'],
];

for (const [from, to] of literalReplacements) {
  text = text.replaceAll(from, to);
}

text = text
  // Improve spacing around inline notes and common reference prefixes.
  .replace(/([A-Za-zÇĞİÖŞÜçğıöşüÂÊÎÔÛâêîôû])(\d{1,2})(?=\s+[A-ZÇĞİÖŞÜ“\[])/g, '$1 $2')
  .replace(/(\b\d{1,2})\s*Bkz\s*\.\s*/g, '$1 Bkz. ')
  .replace(/\bBkz\s*\.\s*/g, 'Bkz. ')
  // Add a space after closing punctuation where words were merged.
  .replace(/([”\)\]])([A-Za-zÇĞİÖŞÜçğıöşüÂÊÎÔÛâêîôû])/g, '$1 $2')
  // Clean a few OCR-like quote spacing issues.
  .replace(/([A-Za-zÇĞİÖŞÜçğıöşüÂÊÎÔÛâêîôû]):”/g, '$1: “')
  .replace(/:”/g, ': “')
  .replace(/:\s+”\s+'/g, ': “')
  .replace(/\s+”/g, '”')
  // Remove trailing whitespace.
  .split('\n')
  .map((line) => line.replace(/[ \t]+$/g, ''))
  .join('\n');

fs.writeFileSync(outputPath, text, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
