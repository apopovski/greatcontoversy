const fs = require('fs');
const s = fs.readFileSync('src/BookReader.tsx', 'utf8');
const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('`') || lines[i].includes('/')) {
    // print lines that include backtick or slash for inspection
    console.log((i + 1) + ': ' + lines[i]);
  }
}
console.log('done');
