const fs = require('fs');
const s = fs.readFileSync('src/BookReader.tsx', 'utf8');
const lines = s.split('\n');
for (let i=0;i<lines.length;i++){
  if (/\bdiv\s*>/.test(lines[i])) console.log((i+1)+': '+lines[i]);
  if (lines[i].trim()==='div >') console.log('exact div > at '+(i+1));
}
console.log('done');
