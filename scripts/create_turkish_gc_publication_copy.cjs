/* global __dirname, process */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.reader.txt');
const outputPath = path.join(__dirname, '..', 'data', 'turkish_gc_chapters_15_42.publication.txt');

let text = fs.readFileSync(inputPath, 'utf8');

const replacements = [
  ['G öçm en', 'Göçmen'],
  ['göçm enleri', 'göçmenleri'],
  ['am aç', 'amaç'],
  ['Am erikan', 'Amerikan'],
  ['D ünya', 'Dünya'],
  ['A m erikan', 'Amerikan'],
  ['N ew England', 'New England'],
  ['N ew', 'New'],
  ['M aine', 'Maine'],
  ['H ampshire', 'Hampshire'],
  ['C onnecticut', 'Connecticut'],
  ['m eydana', 'meydana'],
  ['olm alarına', 'olmalarına'],
  ['rağm en', 'rağmen'],
  ['zam anda', 'zamanda'],
  ['zam an', 'zaman'],
  ['yönetim e', 'yönetime'],
  ['Süleym an’ın', 'Süleyman’ın'],
  ['M ezm ur', 'Mezmur'],
  ['M atta', 'Matta'],
  ['D aniel', 'Daniel'],
  ['M arkos', 'Markos'],
  ['Rom alılar', 'Romalılar'],
  ['Y asanın', 'Yasanın'],
  ['Ç ölde', 'Çölde'],
  ['M ısır’dan', 'Mısır’dan'],
  ['Ç ıkış', 'Çıkış'],
  ['U nvanları', 'Unvanları'],
  ['Kutsal K itap', 'Kutsal Kitap'],
  ['T ü m', 'Tüm'],
  ['im an', 'iman'],
  ['Şim di', 'Şimdi'],
  ['tahm in', 'tahmin'],
  ['tam am ı', 'tamamı'],
  ['bir kısm ı', 'bir kısmı'],
  ['kısm ı', 'kısmı'],
  ['kısm ının', 'kısmının'],
  ['anlam ında', 'anlamında'],
  ['anlam ına', 'anlamına'],
  ['aşam asında', 'aşamasında'],
  ['arındırm ak', 'arındırmak'],
  ['bilim inde', 'biliminde'],
  ['çevirile rinde', 'çevirilerinde'],
  ['tanıdıkruhlar', 'tanıdık ruhlar'],
  ['ifadesibulunmaz', 'ifadesi bulunmaz'],
  ['Kaynakayetler', 'Kaynak ayetler'],
  ['Elçilerinİşler i', 'Elçilerin İşleri'],
  ['Yaraılış', 'Yaratılış'],
  ['Y ahve', 'Yahve'],
  ['Yahve” nin', 'Yahve”nin'],
  ['Kendisi’ ni', 'Kendisi’ni'],
  ['sözüklerdir', 'sözcüklerdir'],
  ['K M ’de', 'KM’de'],
  ['K Mmetnine', 'KM metnine'],
  ['KKve', 'KK ve'],
  ['K Mçevirisinde', 'KM çevirisinde'],
  ['Ö nceki d ipn otta', 'Önceki dipnotta'],
  ['Günüm üzde', 'Günümüzde'],
  ['Yedin ci-Gün', 'Yedinci-Gün'],
  ['İbranice’de “yakm ak”', 'İbranice’de “yakmak”'],
  ['saraf” kökünden türeyen bu sözcük, Kutsal K itap’ta', 'saraf” kökünden türeyen bu sözcük, Kutsal Kitap’ta'],
  ['H ristiyan', 'Hristiyan'],
  ['K atolik', 'Katolik'],
  ['dilim izde', 'dilimizde'],
  ['R A B”', 'R A B”'],
  ['[K M ]', '[KM]'],
  ['[K K ]', '[KK]'],
  ['[K İ]', '[Kİ]'],
  ['[K İ ]', '[Kİ]'],
  ['[K M', '[KM'],
  ['[K K', '[KK'],
  ['B k z .', 'Bkz.'],
  ['Bkz .', 'Bkz.'],
];

for (const [from, to] of replacements) {
  text = text.replaceAll(from, to);
}

text = text
  .replace(/\b(\d(?:\s+\d){1,8})\b/g, (match) => match.replace(/\s+/g, ''))
  .replace(/(\d)\s*:\s*(\d)/g, '$1:$2')
  .replace(/(\d)\s*-\s*(\d)/g, '$1-$2')
  .replace(/(\d)\s*\.\s*(?=[A-ZÇĞİÖŞÜ])/g, '$1. ')
  .replace(/\bOzaman\b/g, 'O zaman')
  .replace(/\bOgünü\b/g, 'O günü')
  .replace(/\bOgün\b/g, 'O gün')
  .replace(/\bOda\b/g, 'O da')
  .replace(/\bOher\b/g, 'O her')
  .replace(/\bObizden\b/g, 'O bizden')
  .replace(/\bOson\b/g, 'O son')
  .replace(/\bOşu\b/g, 'O şu')
  .replace(/\bIsa\b/g, 'İsa')
  .replace(/\bİbranice’de kullanılan ifadesi, Türkçe’de “Yasaya ve tanıklığa” şeklinde bir anlam verir, nitekim KM’de/gu, 'İbranice’de kullanılan ifadesi, Türkçe’de “Yasaya ve tanıklığa” şeklinde bir anlam verir, nitekim KM’de')
  .replace(/\bayetlerine ve\b/g, 'ayetlerine ve')
  .replace(/\b([A-ZÇĞİÖŞÜ])\s+([a-zçğıöşüâêîôû]{2,})\b/g, (match, first, rest) => {
    return first === 'O' ? match : `${first}${rest}`;
  })
  .replace(/\b([a-zçğıöşüâêîôû]{2,})\s+([a-zçğıöşüâêîôû]{2,})\b/g, (match, left, right) => {
    const joinedCandidates = new Set([
      'amaç',
      'zamanda',
      'meydana',
      'olmalarına',
      'rağmen',
      'yönetime',
      'dilimizde',
      'göçmenleri',
      'tamamı',
      'kısmı',
      'anlamında',
      'anlamına',
      'aşamasında',
      'arındırmak',
      'tahmin',
    ]);
    const joined = `${left}${right}`;
    return joinedCandidates.has(joined) ? joined : match;
  })
  .replace(/ {2,}/g, ' ')
  .split('\n')
  .map((line) => line.replace(/[ \t]+$/g, ''))
  .join('\n');

fs.writeFileSync(outputPath, text, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
