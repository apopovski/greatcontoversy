const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.txt');
const outputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.cleaned.txt');

const input = fs.readFileSync(inputPath, 'utf8');

const output = input
  // Separate inline footnote numbers from preceding text.
  .replace(/([A-Za-zÇĞİÖŞÜçğıöşüÂÊÎÔÛâêîôû0-9”’»\)\]])(\d{1,2})(?=[A-Za-zÇĞİÖŞÜçğıöşüÂÊÎÔÛâêîôû“"'\(\[])/g, '$1 $2 ')
  // Normalize the most common footnote prefix spacing.
  .replace(/\bBkz\s*\.\s*/g, 'Bkz. ')
  // Remove accidental double spaces created during normalization.
  .replace(/ {2,}/g, ' ')
  // Trim trailing spaces on lines while preserving blank lines.
  .split('\n')
  .map((line) => line.replace(/[ \t]+$/g, ''))
  .join('\n');

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
