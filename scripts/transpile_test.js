const fs = require('fs');
const ts = require('typescript');
const esbuild = require('esbuild');
const s = fs.readFileSync('src/BookReader.tsx','utf8');
const out = ts.transpileModule(s, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ESNext } }).outputText;
fs.writeFileSync('scripts/_out.js', out, 'utf8');
try{
  esbuild.transformSync(out, { loader: 'js' });
  console.log('esbuild ok on transpiled output');
}catch(e){
  console.error('esbuild error on transpiled output:', e.message);
}
