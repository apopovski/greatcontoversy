import React, { useEffect, useRef, useState } from 'react';
import MinimizedAudioBar from './MinimizedAudioBar';
import './AudioPlayer.css';
import { LANGUAGE_NAMES } from '../utils/language';

type PlayerLabels = {
  loadingAudio: string;
  untitledChapter: string;
  source: string;
  copied: string;
  copyUrl: string;
  minimizePlayer: string;
  previousChapter: string;
  rewind15: string;
  playPause: string;
  forward15: string;
  nextChapter: string;
  left: string;
  audioBy: string;
  openPlayer: string;
  back15Seconds: string;
  forward15Seconds: string;
  changeSpeed: string;
  audioProgress: string;
  play: string;
  pause: string;
  hidePlayer: string;
  continuePlay: string;
};

const DEFAULT_PLAYER_LABELS: PlayerLabels = {
  loadingAudio: 'Loading audio…',
  untitledChapter: 'Untitled Chapter',
  source: 'Source',
  copied: 'Copied',
  copyUrl: 'Copy URL',
  minimizePlayer: 'Minimize player',
  previousChapter: 'Previous chapter',
  rewind15: 'Rewind 15',
  playPause: 'Play/Pause',
  forward15: 'Forward 15',
  nextChapter: 'Next chapter',
  left: 'left',
  audioBy: 'Audio by',
  openPlayer: 'Open player',
  back15Seconds: 'Back 15 seconds',
  forward15Seconds: 'Forward 15 seconds',
  changeSpeed: 'Change speed',
  audioProgress: 'Audio progress',
  play: 'Play',
  pause: 'Pause',
  hidePlayer: 'Hide player',
  continuePlay: 'Continue play',
};

const PLAYER_LABELS_BY_CODE: Record<string, Partial<PlayerLabels>> = {
  es: { loadingAudio: 'Cargando audio…', untitledChapter: 'Capítulo sin título', source: 'Fuente', copied: 'Copiado', copyUrl: 'Copiar URL', minimizePlayer: 'Minimizar reproductor', previousChapter: 'Capítulo anterior', rewind15: 'Retroceder 15', playPause: 'Reproducir/Pausar', forward15: 'Adelantar 15', nextChapter: 'Capítulo siguiente', left: 'restante', audioBy: 'Audio por', openPlayer: 'Abrir reproductor', back15Seconds: 'Retroceder 15 segundos', forward15Seconds: 'Adelantar 15 segundos', changeSpeed: 'Cambiar velocidad', audioProgress: 'Progreso de audio', play: 'Reproducir', pause: 'Pausar', continuePlay: 'Reproducción continua' },
  de: { loadingAudio: 'Audio wird geladen…', untitledChapter: 'Kapitel ohne Titel', source: 'Quelle', copied: 'Kopiert', copyUrl: 'URL kopieren', minimizePlayer: 'Player minimieren', previousChapter: 'Vorheriges Kapitel', rewind15: '15 zurück', playPause: 'Wiedergabe/Pause', forward15: '15 vor', nextChapter: 'Nächstes Kapitel', left: 'übrig', audioBy: 'Audio von', openPlayer: 'Player öffnen', back15Seconds: '15 Sekunden zurück', forward15Seconds: '15 Sekunden vor', changeSpeed: 'Geschwindigkeit ändern', audioProgress: 'Audio-Fortschritt', play: 'Wiedergabe', pause: 'Pause', continuePlay: 'Kontinuierliche Wiedergabe' },
  it: { loadingAudio: 'Caricamento audio…', untitledChapter: 'Capitolo senza titolo', source: 'Fonte', copied: 'Copiato', copyUrl: 'Copia URL', minimizePlayer: 'Riduci lettore', previousChapter: 'Capitolo precedente', rewind15: 'Indietro 15', playPause: 'Riproduci/Pausa', forward15: 'Avanti 15', nextChapter: 'Capitolo successivo', left: 'rimanenti', audioBy: 'Audio di', openPlayer: 'Apri lettore', back15Seconds: 'Indietro di 15 secondi', forward15Seconds: 'Avanti di 15 secondi', changeSpeed: 'Cambia velocità', audioProgress: 'Progresso audio', play: 'Riproduci', pause: 'Pausa', continuePlay: 'Riproduzione continua' },
  pt: { loadingAudio: 'Carregando áudio…', untitledChapter: 'Capítulo sem título', source: 'Fonte', copied: 'Copiado', copyUrl: 'Copiar URL', minimizePlayer: 'Minimizar player', previousChapter: 'Capítulo anterior', rewind15: 'Voltar 15', playPause: 'Reproduzir/Pausar', forward15: 'Avançar 15', nextChapter: 'Próximo capítulo', left: 'restantes', audioBy: 'Áudio por', openPlayer: 'Abrir player', back15Seconds: 'Voltar 15 segundos', forward15Seconds: 'Avançar 15 segundos', changeSpeed: 'Alterar velocidade', audioProgress: 'Progresso do áudio', play: 'Reproduzir', pause: 'Pausar', continuePlay: 'Reprodução contínua' },
  fr: { loadingAudio: 'Chargement audio…', untitledChapter: 'Chapitre sans titre', source: 'Source', copied: 'Copié', copyUrl: 'Copier l’URL', minimizePlayer: 'Réduire le lecteur', previousChapter: 'Chapitre précédent', rewind15: 'Reculer 15', playPause: 'Lecture/Pause', forward15: 'Avancer 15', nextChapter: 'Chapitre suivant', left: 'restantes', audioBy: 'Audio par', openPlayer: 'Ouvrir le lecteur', back15Seconds: 'Reculer de 15 secondes', forward15Seconds: 'Avancer de 15 secondes', changeSpeed: 'Changer la vitesse', audioProgress: 'Progression audio', play: 'Lecture', pause: 'Pause', continuePlay: 'Lecture continue' },
  ar: { loadingAudio: 'جارٍ تحميل الصوت…', untitledChapter: 'فصل بدون عنوان', source: 'المصدر', copied: 'تم النسخ', copyUrl: 'نسخ الرابط', minimizePlayer: 'تصغير المشغل', previousChapter: 'الفصل السابق', rewind15: 'رجوع 15', playPause: 'تشغيل/إيقاف', forward15: 'تقديم 15', nextChapter: 'الفصل التالي', left: 'متبقي', audioBy: 'الصوت بواسطة', openPlayer: 'فتح المشغل', back15Seconds: 'رجوع 15 ثانية', forward15Seconds: 'تقديم 15 ثانية', changeSpeed: 'تغيير السرعة', audioProgress: 'تقدم الصوت', play: 'تشغيل', pause: 'إيقاف', continuePlay: 'تشغيل مستمر' },
  zh: { loadingAudio: '正在加载音频…', untitledChapter: '未命名章节', source: '来源', copied: '已复制', copyUrl: '复制链接', minimizePlayer: '最小化播放器', previousChapter: '上一章', rewind15: '后退15秒', playPause: '播放/暂停', forward15: '前进15秒', nextChapter: '下一章', left: '剩余', audioBy: '音频来源', openPlayer: '打开播放器', back15Seconds: '后退15秒', forward15Seconds: '前进15秒', changeSpeed: '调整速度', audioProgress: '音频进度', play: '播放', pause: '暂停' },
  ko: { loadingAudio: '오디오 로딩 중…', untitledChapter: '제목 없는 장', source: '출처', copied: '복사됨', copyUrl: 'URL 복사', minimizePlayer: '플레이어 최소화', previousChapter: '이전 장', rewind15: '15초 뒤로', playPause: '재생/일시정지', forward15: '15초 앞으로', nextChapter: '다음 장', left: '남음', audioBy: '오디오 제공', openPlayer: '플레이어 열기', back15Seconds: '15초 뒤로', forward15Seconds: '15초 앞으로', changeSpeed: '속도 변경', audioProgress: '오디오 진행', play: '재생', pause: '일시정지' },
  ja: { loadingAudio: '音声を読み込み中…', untitledChapter: '無題の章', source: 'ソース', copied: 'コピーしました', copyUrl: 'URLをコピー', minimizePlayer: 'プレーヤーを最小化', previousChapter: '前の章', rewind15: '15秒戻す', playPause: '再生/一時停止', forward15: '15秒進む', nextChapter: '次の章', left: '残り', audioBy: '音声提供', openPlayer: 'プレーヤーを開く', back15Seconds: '15秒戻す', forward15Seconds: '15秒進む', changeSpeed: '速度変更', audioProgress: '音声の進行', play: '再生', pause: '一時停止' },
  ru: { loadingAudio: 'Загрузка аудио…', untitledChapter: 'Глава без названия', source: 'Источник', copied: 'Скопировано', copyUrl: 'Копировать URL', minimizePlayer: 'Свернуть плеер', previousChapter: 'Предыдущая глава', rewind15: 'Назад 15', playPause: 'Воспроизвести/Пауза', forward15: 'Вперёд 15', nextChapter: 'Следующая глава', left: 'осталось', audioBy: 'Аудио от', openPlayer: 'Открыть плеер', back15Seconds: 'Назад на 15 секунд', forward15Seconds: 'Вперёд на 15 секунд', changeSpeed: 'Изменить скорость', audioProgress: 'Прогресс аудио', play: 'Воспроизвести', pause: 'Пауза' },
  uk: { loadingAudio: 'Завантаження аудіо…', untitledChapter: 'Розділ без назви', source: 'Джерело', copied: 'Скопійовано', copyUrl: 'Копіювати URL', minimizePlayer: 'Згорнути плеєр', previousChapter: 'Попередній розділ', rewind15: 'Назад 15', playPause: 'Відтворити/Пауза', forward15: 'Вперед 15', nextChapter: 'Наступний розділ', left: 'залишилось', audioBy: 'Аудіо від', openPlayer: 'Відкрити плеєр', back15Seconds: 'Назад на 15 секунд', forward15Seconds: 'Вперед на 15 секунд', changeSpeed: 'Змінити швидкість', audioProgress: 'Прогрес аудіо', play: 'Відтворити', pause: 'Пауза' },
  pl: { loadingAudio: 'Ładowanie audio…', untitledChapter: 'Rozdział bez tytułu', source: 'Źródło', copied: 'Skopiowano', copyUrl: 'Kopiuj URL', minimizePlayer: 'Zminimalizuj odtwarzacz', previousChapter: 'Poprzedni rozdział', rewind15: 'Cofnij 15', playPause: 'Odtwórz/Pauza', forward15: 'Przewiń 15', nextChapter: 'Następny rozdział', left: 'pozostało', audioBy: 'Audio od', openPlayer: 'Otwórz odtwarzacz', back15Seconds: 'Cofnij 15 sekund', forward15Seconds: 'Przewiń 15 sekund', changeSpeed: 'Zmień prędkość', audioProgress: 'Postęp audio', play: 'Odtwórz', pause: 'Pauza' },
  da: { loadingAudio: 'Indlæser lyd…', untitledChapter: 'Kapitel uden titel', source: 'Kilde', copied: 'Kopieret', copyUrl: 'Kopiér URL', minimizePlayer: 'Minimer afspiller', previousChapter: 'Forrige kapitel', rewind15: 'Tilbage 15', playPause: 'Afspil/Pause', forward15: 'Frem 15', nextChapter: 'Næste kapitel', left: 'tilbage', audioBy: 'Lyd af', openPlayer: 'Åbn afspiller', back15Seconds: 'Tilbage 15 sekunder', forward15Seconds: 'Frem 15 sekunder', changeSpeed: 'Skift hastighed', audioProgress: 'Lydfremdrift', play: 'Afspil', pause: 'Pause', hidePlayer: 'Skjul afspiller', continuePlay: 'Fortsæt afspilning' },
  no: { loadingAudio: 'Laster lyd…', untitledChapter: 'Kapittel uten tittel', source: 'Kilde', copied: 'Kopiert', copyUrl: 'Kopier URL', minimizePlayer: 'Minimer spiller', previousChapter: 'Forrige kapittel', rewind15: 'Tilbake 15', playPause: 'Spill av/Pause', forward15: 'Frem 15', nextChapter: 'Neste kapittel', left: 'igjen', audioBy: 'Lyd av', openPlayer: 'Åpne spiller', back15Seconds: 'Tilbake 15 sekunder', forward15Seconds: 'Frem 15 sekunder', changeSpeed: 'Endre hastighet', audioProgress: 'Lydfremdrift', play: 'Spill av', pause: 'Pause', hidePlayer: 'Skjul spiller', continuePlay: 'Fortsett avspilling' },
  sm: { loadingAudio: 'O loʼo uta leo…', untitledChapter: 'Mataupu e leai se ulutala', source: 'Punaoa', copied: 'Ua kopi', copyUrl: 'Kopi URL', minimizePlayer: 'Faʼaitiiti le player', previousChapter: 'Mataupu muamua', rewind15: 'Toe 15', playPause: 'Ta/Pau', forward15: 'Luma 15', nextChapter: 'Mataupu sosoʻo', left: 'o totoe', audioBy: 'Leo e', openPlayer: 'Tatala player', back15Seconds: 'Toe 15 sekone', forward15Seconds: 'Luma 15 sekone', changeSpeed: 'Sui saoasaoa', audioProgress: 'Alualu i luma leo', play: 'Ta', pause: 'Pau', hidePlayer: 'Natia player', continuePlay: 'Faʻaauau ta' },
  et: { loadingAudio: 'Heli laadimine…', untitledChapter: 'Pealkirjata peatükk', source: 'Allikas', copied: 'Kopeeritud', copyUrl: 'Kopeeri URL', minimizePlayer: 'Minimeeri mängija', previousChapter: 'Eelmine peatükk', rewind15: 'Tagasi 15', playPause: 'Esita/Paus', forward15: 'Edasi 15', nextChapter: 'Järgmine peatükk', left: 'jäänud', audioBy: 'Audio autor', openPlayer: 'Ava mängija', back15Seconds: 'Tagasi 15 sekundit', forward15Seconds: 'Edasi 15 sekundit', changeSpeed: 'Muuda kiirust', audioProgress: 'Heli edenemine', play: 'Esita', pause: 'Paus', hidePlayer: 'Peida mängija', continuePlay: 'Jätka esitust' },
  ro: { loadingAudio: 'Se încarcă audio…', untitledChapter: 'Capitol fără titlu', source: 'Sursă', copied: 'Copiat', copyUrl: 'Copiază URL', minimizePlayer: 'Minimizează playerul', previousChapter: 'Capitolul anterior', rewind15: 'Înapoi 15', playPause: 'Redare/Pauză', forward15: 'Înainte 15', nextChapter: 'Capitolul următor', left: 'rămas', audioBy: 'Audio de', openPlayer: 'Deschide playerul', back15Seconds: 'Înapoi 15 secunde', forward15Seconds: 'Înainte 15 secunde', changeSpeed: 'Schimbă viteza', audioProgress: 'Progres audio', play: 'Redare', pause: 'Pauză', hidePlayer: 'Ascunde playerul', continuePlay: 'Redare continuă' },
  hr: { loadingAudio: 'Učitavanje zvuka…', untitledChapter: 'Poglavlje bez naslova', source: 'Izvor', copied: 'Kopirano', copyUrl: 'Kopiraj URL', minimizePlayer: 'Minimiziraj reproduktor', previousChapter: 'Prethodno poglavlje', rewind15: 'Natrag 15', playPause: 'Reproduciraj/Pauza', forward15: 'Naprijed 15', nextChapter: 'Sljedeće poglavlje', left: 'preostalo', audioBy: 'Audio od', openPlayer: 'Otvori reproduktor', back15Seconds: 'Natrag 15 sekundi', forward15Seconds: 'Naprijed 15 sekundi', changeSpeed: 'Promijeni brzinu', audioProgress: 'Napredak zvuka', play: 'Reproduciraj', pause: 'Pauza', hidePlayer: 'Sakrij reproduktor', continuePlay: 'Nastavi reprodukciju' },
  bg: { loadingAudio: 'Зареждане на аудио…', untitledChapter: 'Глава без заглавие', source: 'Източник', copied: 'Копирано', copyUrl: 'Копирай URL', minimizePlayer: 'Минимизирай плейъра', previousChapter: 'Предишна глава', rewind15: 'Назад 15', playPause: 'Пуск/Пауза', forward15: 'Напред 15', nextChapter: 'Следваща глава', left: 'остава', audioBy: 'Аудио от', openPlayer: 'Отвори плейъра', back15Seconds: 'Назад 15 секунди', forward15Seconds: 'Напред 15 секунди', changeSpeed: 'Смени скоростта', audioProgress: 'Прогрес на аудио', play: 'Пусни', pause: 'Пауза', hidePlayer: 'Скрий плейъра', continuePlay: 'Непрекъснато възпроизвеждане' },
  sk: { loadingAudio: 'Načítava sa audio…', untitledChapter: 'Kapitola bez názvu', source: 'Zdroj', copied: 'Skopírované', copyUrl: 'Kopírovať URL', minimizePlayer: 'Minimalizovať prehrávač', previousChapter: 'Predchádzajúca kapitola', rewind15: 'Späť 15', playPause: 'Prehrať/Pauza', forward15: 'Dopredu 15', nextChapter: 'Ďalšia kapitola', left: 'zostáva', audioBy: 'Audio od', openPlayer: 'Otvoriť prehrávač', back15Seconds: 'Späť o 15 sekúnd', forward15Seconds: 'Dopredu o 15 sekúnd', changeSpeed: 'Zmeniť rýchlosť', audioProgress: 'Priebeh audia', play: 'Prehrať', pause: 'Pauza', hidePlayer: 'Skryť prehrávač', continuePlay: 'Pokračovať v prehrávaní' },
  cs: { loadingAudio: 'Načítání audia…', untitledChapter: 'Kapitola bez názvu', source: 'Zdroj', copied: 'Zkopírováno', copyUrl: 'Kopírovat URL', minimizePlayer: 'Minimalizovat přehrávač', previousChapter: 'Předchozí kapitola', rewind15: 'Zpět 15', playPause: 'Přehrát/Pauza', forward15: 'Vpřed 15', nextChapter: 'Další kapitola', left: 'zbývá', audioBy: 'Audio od', openPlayer: 'Otevřít přehrávač', back15Seconds: 'Zpět o 15 sekund', forward15Seconds: 'Vpřed o 15 sekund', changeSpeed: 'Změnit rychlost', audioProgress: 'Průběh audia', play: 'Přehrát', pause: 'Pauza', hidePlayer: 'Skrýt přehrávač', continuePlay: 'Pokračovat v přehrávání' },
  fa: { loadingAudio: 'در حال بارگذاری صوت…', untitledChapter: 'فصل بدون عنوان', source: 'منبع', copied: 'کپی شد', copyUrl: 'کپی URL', minimizePlayer: 'کوچک کردن پخش‌کننده', previousChapter: 'فصل قبلی', rewind15: '۱۵ ثانیه عقب', playPause: 'پخش/توقف', forward15: '۱۵ ثانیه جلو', nextChapter: 'فصل بعدی', left: 'باقی‌مانده', audioBy: 'صوت توسط', openPlayer: 'باز کردن پخش‌کننده', back15Seconds: '۱۵ ثانیه عقب', forward15Seconds: '۱۵ ثانیه جلو', changeSpeed: 'تغییر سرعت', audioProgress: 'پیشرفت صوت', play: 'پخش', pause: 'توقف', hidePlayer: 'پنهان کردن پخش‌کننده', continuePlay: 'پخش پیوسته' },
  af: { loadingAudio: 'Laai oudio…', untitledChapter: 'Hoofstuk sonder titel', source: 'Bron', copied: 'Gekopieer', copyUrl: 'Kopieer URL', minimizePlayer: 'Minimaliseer speler', previousChapter: 'Vorige hoofstuk', rewind15: 'Terug 15', playPause: 'Speel/Pouse', forward15: 'Vorentoe 15', nextChapter: 'Volgende hoofstuk', left: 'oor', audioBy: 'Oudio deur', openPlayer: 'Open speler', back15Seconds: 'Terug 15 sekondes', forward15Seconds: 'Vorentoe 15 sekondes', changeSpeed: 'Verander spoed', audioProgress: 'Oudio-vordering', play: 'Speel', pause: 'Pouse', hidePlayer: 'Versteek speler', continuePlay: 'Gaan voort met speel' },
  sr: { loadingAudio: 'Учитавање аудио записа…', untitledChapter: 'Поглавље без наслова', source: 'Извор', copied: 'Копирано', copyUrl: 'Копирај URL', minimizePlayer: 'Умањи плејер', previousChapter: 'Претходно поглавље', rewind15: 'Назад 15', playPause: 'Пусти/Пауза', forward15: 'Напред 15', nextChapter: 'Следеће поглавље', left: 'преостало', audioBy: 'Аудио од', openPlayer: 'Отвори плејер', back15Seconds: 'Назад 15 секунди', forward15Seconds: 'Напред 15 секунди', changeSpeed: 'Промени брзину', audioProgress: 'Напредак аудио записа', play: 'Пусти', pause: 'Пауза', hidePlayer: 'Сакриј плејер', continuePlay: 'Настави репродукцију' },
  sl: { loadingAudio: 'Nalaganje zvoka…', untitledChapter: 'Poglavje brez naslova', source: 'Vir', copied: 'Kopirano', copyUrl: 'Kopiraj URL', minimizePlayer: 'Pomanjšaj predvajalnik', previousChapter: 'Prejšnje poglavje', rewind15: 'Nazaj 15', playPause: 'Predvajaj/Pavza', forward15: 'Naprej 15', nextChapter: 'Naslednje poglavje', left: 'preostalo', audioBy: 'Zvok od', openPlayer: 'Odpri predvajalnik', back15Seconds: 'Nazaj 15 sekund', forward15Seconds: 'Naprej 15 sekund', changeSpeed: 'Spremeni hitrost', audioProgress: 'Napredek zvoka', play: 'Predvajaj', pause: 'Pavza', hidePlayer: 'Skrij predvajalnik', continuePlay: 'Nadaljuj predvajanje' },
  am: { loadingAudio: 'ድምፅ በመጫን ላይ…', untitledChapter: 'ርዕስ የሌለው ምዕራፍ', source: 'ምንጭ', copied: 'ተቀድቷል', copyUrl: 'URL ቅዳ', minimizePlayer: 'አጫዋቹን አነስ', previousChapter: 'ያለፈው ምዕራፍ', rewind15: '15 ተመለስ', playPause: 'አጫውት/አቁም', forward15: '15 ወደፊት', nextChapter: 'ቀጣይ ምዕራፍ', left: 'ቀሪ', audioBy: 'ድምፅ በ', openPlayer: 'አጫዋች ክፈት', back15Seconds: '15 ሰከንድ ተመለስ', forward15Seconds: '15 ሰከንድ ወደፊት', changeSpeed: 'ፍጥነት ቀይር', audioProgress: 'የድምፅ ሂደት', play: 'አጫውት', pause: 'አቁም', hidePlayer: 'አጫዋቹን ደብቅ', continuePlay: 'ቀጥል አጫውት' },
  tr: {},
  hi: { loadingAudio: 'ऑडियो लोड हो रहा है…', untitledChapter: 'बिना शीर्षक अध्याय', source: 'स्रोत', copied: 'कॉपी किया गया', copyUrl: 'URL कॉपी करें', minimizePlayer: 'प्लेयर छोटा करें', previousChapter: 'पिछला अध्याय', rewind15: '15 सेकंड पीछे', playPause: 'चलाएँ/रोकें', forward15: '15 सेकंड आगे', nextChapter: 'अगला अध्याय', left: 'शेष', audioBy: 'ऑडियो द्वारा', openPlayer: 'प्लेयर खोलें', back15Seconds: '15 सेकंड पीछे', forward15Seconds: '15 सेकंड आगे', changeSpeed: 'गति बदलें', audioProgress: 'ऑडियो प्रगति', play: 'चलाएँ', pause: 'रोकें' },
  bn: { loadingAudio: 'অডিও লোড হচ্ছে…', untitledChapter: 'শিরোনামহীন অধ্যায়', source: 'উৎস', copied: 'কপি হয়েছে', copyUrl: 'URL কপি করুন', minimizePlayer: 'প্লেয়ার মিনিমাইজ করুন', previousChapter: 'পূর্ববর্তী অধ্যায়', rewind15: '১৫ সেকেন্ড পিছনে', playPause: 'চালান/থামান', forward15: '১৫ সেকেন্ড সামনে', nextChapter: 'পরবর্তী অধ্যায়', left: 'বাকি', audioBy: 'অডিও', openPlayer: 'প্লেয়ার খুলুন', back15Seconds: '১৫ সেকেন্ড পিছনে', forward15Seconds: '১৫ সেকেন্ড সামনে', changeSpeed: 'গতি পরিবর্তন', audioProgress: 'অডিও অগ্রগতি', play: 'চালান', pause: 'থামান' },
  id: { loadingAudio: 'Memuat audio…', untitledChapter: 'Bab tanpa judul', source: 'Sumber', copied: 'Disalin', copyUrl: 'Salin URL', minimizePlayer: 'Minimalkan pemutar', previousChapter: 'Bab sebelumnya', rewind15: 'Mundur 15', playPause: 'Putar/Jeda', forward15: 'Maju 15', nextChapter: 'Bab berikutnya', left: 'tersisa', audioBy: 'Audio oleh', openPlayer: 'Buka pemutar', back15Seconds: 'Mundur 15 detik', forward15Seconds: 'Maju 15 detik', changeSpeed: 'Ubah kecepatan', audioProgress: 'Progres audio', play: 'Putar', pause: 'Jeda' },
  ur: { loadingAudio: 'آڈیو لوڈ ہو رہا ہے…', untitledChapter: 'بلا عنوان باب', source: 'ذریعہ', copied: 'کاپی ہو گیا', copyUrl: 'URL کاپی کریں', minimizePlayer: 'پلیئر منیمائز کریں', previousChapter: 'پچھلا باب', rewind15: '15 پیچھے', playPause: 'چلائیں/روکیں', forward15: '15 آگے', nextChapter: 'اگلا باب', left: 'باقی', audioBy: 'آڈیو از', openPlayer: 'پلیئر کھولیں', back15Seconds: '15 سیکنڈ پیچھے', forward15Seconds: '15 سیکنڈ آگے', changeSpeed: 'رفتار بدلیں', audioProgress: 'آڈیو پیش رفت', play: 'چلائیں', pause: 'روکیں' },
  sq: { loadingAudio: 'Duke ngarkuar audion…', untitledChapter: 'Kapitull pa titull', source: 'Burimi', copied: 'U kopjua', copyUrl: 'Kopjo URL', minimizePlayer: 'Minimizo player-in', previousChapter: 'Kapitulli i mëparshëm', rewind15: 'Mbrapa 15', playPause: 'Luaj/Pusho', forward15: 'Përpara 15', nextChapter: 'Kapitulli tjetër', left: 'mbetur', audioBy: 'Audio nga', openPlayer: 'Hap player-in', back15Seconds: 'Mbrapa 15 sekonda', forward15Seconds: 'Përpara 15 sekonda', changeSpeed: 'Ndrysho shpejtësinë', audioProgress: 'Progresi i audios', play: 'Luaj', pause: 'Pusho' },
};

const PLAYER_META_TOGGLE_LABELS: Record<string, Pick<PlayerLabels, 'hidePlayer' | 'continuePlay'>> = {
  en: { hidePlayer: 'Hide player', continuePlay: 'Continue play' },
  es: { hidePlayer: 'Ocultar reproductor', continuePlay: 'Reproducción continua' },
  de: { hidePlayer: 'Player ausblenden', continuePlay: 'Kontinuierliche Wiedergabe' },
  it: { hidePlayer: 'Nascondi lettore', continuePlay: 'Riproduzione continua' },
  da: { hidePlayer: 'Skjul afspiller', continuePlay: 'Fortsæt afspilning' },
  no: { hidePlayer: 'Skjul spiller', continuePlay: 'Fortsett avspilling' },
  pt: { hidePlayer: 'Ocultar player', continuePlay: 'Reprodução contínua' },
  sm: { hidePlayer: 'Natia player', continuePlay: 'Faʻaauau ta' },
  et: { hidePlayer: 'Peida mängija', continuePlay: 'Jätka esitust' },
  ro: { hidePlayer: 'Ascunde playerul', continuePlay: 'Redare continuă' },
  hr: { hidePlayer: 'Sakrij reproduktor', continuePlay: 'Nastavi reprodukciju' },
  bg: { hidePlayer: 'Скрий плейъра', continuePlay: 'Непрекъснато възпроизвеждане' },
  sk: { hidePlayer: 'Skryť prehrávač', continuePlay: 'Pokračovať v prehrávaní' },
  cs: { hidePlayer: 'Skrýt přehrávač', continuePlay: 'Pokračovat v přehrávání' },
  uk: { hidePlayer: 'Сховати плеєр', continuePlay: 'Безперервне відтворення' },
  ru: { hidePlayer: 'Скрыть плеер', continuePlay: 'Непрерывное воспроизведение' },
  pl: { hidePlayer: 'Ukryj odtwarzacz', continuePlay: 'Odtwarzanie ciągłe' },
  ar: { hidePlayer: 'إخفاء المشغل', continuePlay: 'تشغيل مستمر' },
  am: { hidePlayer: 'አጫዋቹን ደብቅ', continuePlay: 'ቀጥል አጫውት' },
  zh: { hidePlayer: '隐藏播放器', continuePlay: '连续播放' },
  ko: { hidePlayer: '플레이어 숨기기', continuePlay: '연속 재생' },
  ja: { hidePlayer: 'プレーヤーを非表示', continuePlay: '連続再生' },
  sr: { hidePlayer: 'Сакриј плејер', continuePlay: 'Настави репродукцију' },
  fa: { hidePlayer: 'پنهان کردن پخش‌کننده', continuePlay: 'پخش پیوسته' },
  af: { hidePlayer: 'Versteek speler', continuePlay: 'Gaan voort met speel' },
  hi: { hidePlayer: 'प्लेयर छिपाएँ', continuePlay: 'लगातार चलाएँ' },
  bn: { hidePlayer: 'প্লেয়ার লুকান', continuePlay: 'অবিরাম চালান' },
  id: { hidePlayer: 'Sembunyikan pemutar', continuePlay: 'Lanjutkan pemutaran' },
  ur: { hidePlayer: 'پلیئر چھپائیں', continuePlay: 'مسلسل چلائیں' },
  fr: { hidePlayer: 'Masquer le lecteur', continuePlay: 'Lecture continue' },
  sq: { hidePlayer: 'Fshihe player-in', continuePlay: 'Vazhdo riprodhimin' },
  sl: { hidePlayer: 'Skrij predvajalnik', continuePlay: 'Nadaljuj predvajanje' },
};

type Props = {
  lang: string;
  chapterIdx: number;
  chapterTitle?: string;
  onNextChapter?: (autoPlay?: boolean) => void;
  onPrevChapter?: (autoPlay?: boolean) => void;
  canNextChapter?: boolean;
  canPrevChapter?: boolean;
  minimized?: boolean;
  autoPlayRequest?: number;
  onPlayingChange?: (playing: boolean) => void;
  onExpand?: () => void;
  onMinimize?: () => void;
  onHide?: () => void;
  continuePlay?: boolean;
  onToggleContinuePlay?: () => void;
  containerWidth?: number | null;
};

type AudioManifestTrack = {
  chapterIdx: number;
  code?: string;
  title?: string;
  url: string;
};

type AudioManifest = {
  bookLanguageFolder?: string;
  bookLanguageName?: string;
  source?: {
    name?: string;
    url?: string;
    licenseSummary?: string;
    termsUrl?: string;
  };
  tracks?: AudioManifestTrack[];
};

type Attribution = {
  name: string;
  url: string;
  licenseSummary?: string;
};

type AudioSourceKind =
  | 'english-manifest'
  | 'multilang-manifest'
  | 'remote-directory'
  | 'source-page'
  | 'local-index';

const ENGLISH_FOLDER = 'The Great Controversy - Ellen G. White 2';
const ENGLISH_MANIFEST_PATH = '/book-content/audio-manifests/gc-english.json';
const MULTILANG_MANIFEST_PATH = '/book-content/audio-manifests/gc-multilang.json';
const MULTILANG_EXTRA_MANIFEST_PATH = '/book-content/audio-manifests/gc-multilang-extra.json';

const EWA_BASE = 'https://ellenwhiteaudio.org/audio';

type AudioSourceCandidate = {
  languageCodes: string[];
  bookCodes: string[];
  sourcePageUrl?: string;
};

const AUDIO_SOURCE_CANDIDATES: Record<string, AudioSourceCandidate> = {
  'The Great Controversy - Ellen G. White 2': { languageCodes: ['en'], bookCodes: ['gc'] },
  'El Conflicto de los Siglos - Ellen G. White': {
    languageCodes: ['sp', 'es'],
    bookCodes: ['gc', 'cs'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sp/el-conflicto-de-los-siglos-nueva-narracion/',
  },
  'Der grosse Kampf - Ellen G. White': { languageCodes: ['de'], bookCodes: ['gc', 'gk'] },
  'Il gran conflitto - Ellen G. White': {
    languageCodes: ['it'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/it/il-gran-conflitto/',
  },
  'MOD EN BEDRE FREMTID - Ellen G. White': { languageCodes: ['da'], bookCodes: ['gc', 'mbf'] },
  'Mot historiens klimaks - Ellen G. White': {
    languageCodes: ['no', 'nb'],
    bookCodes: ['gc', 'mhk'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/no/mot-historiens-klimaks-ai/',
  },
  'O Grande Conflito - Ellen G. White': {
    languageCodes: ['pt'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/pt/grande-conflito/',
  },
  'O Le Finauga Tele - Ellen G. White': { languageCodes: ['sm'], bookCodes: ['gc', 'ft'] },
  'Suur Voitlus - Ellen G. White': { languageCodes: ['et'], bookCodes: ['gc', 'sv'] },
  'Tragedia veacurilor - Ellen G. White': { languageCodes: ['ro'], bookCodes: ['gc', 'tv'] },
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': { languageCodes: ['hr'], bookCodes: ['gc', 'vb'] },
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': { languageCodes: ['bg'], bookCodes: ['gc', 'bc'] },
  'Velke drama veku - Ellen G. White': {
    languageCodes: ['sk'],
    bookCodes: ['gc', 'vdv', 'vsv'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sk/velky-spor-vekov-ai/',
  },
  'Velky spor vekov - Ellen G. White': { languageCodes: ['cs'], bookCodes: ['gc', 'vsv', 'vdv'] },
  "Vielika borot'ba - Ellen G. White": { languageCodes: ['uk'], bookCodes: ['gc', 'vb', 'вб'] },
  "Vielikaia bor'ba - Ellen G. White": {
    languageCodes: ['ru'],
    bookCodes: ['gc', 'vb', 'вб'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/ru/%d0%b2%d0%b5%d0%bb%d0%b8%d0%ba%d0%b0%d1%8f-%d0%b1%d0%be%d1%80%d1%8c%d0%b1%d0%b0/',
  },
  'Wielki boj - Ellen G. White': { languageCodes: ['pl'], bookCodes: ['gc', 'wb'] },
  "alSra` al`Zym - Ellen G. White": {
    languageCodes: ['ar'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/ar/ai-%d8%a7%d9%84%d8%b5%d8%b1%d8%a7%d8%b9-%d8%a7%d9%84%d8%b9%d8%b8%d9%8a%d9%85/',
  },
  'Amharic - Ellen G. White': { languageCodes: ['am'], bookCodes: ['gc'] },
  'Chinese - Ellen G. White': {
    languageCodes: ['cn', 'zh'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/cn/%e5%96%84%e6%81%b6%e4%b9%8b%e4%ba%89/',
  },
  'Japanese - Ellen G. White': { languageCodes: ['ja'], bookCodes: ['gc'] },
  'Korean - Ellen G. White': { languageCodes: ['kr', 'ko'], bookCodes: ['gc'] },
  'Serbian - Ellen G. White': {
    languageCodes: ['sr', 'rs'],
    bookCodes: ['gc', 'vb'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sr/velika-borba/',
  },
  'Farsi - Ellen G. White': { languageCodes: ['fa'], bookCodes: ['gc'] },
  'Afrikaans - Ellen G. White': { languageCodes: ['af'], bookCodes: ['gc'] },
  'Hindi - Ellen G. White': { languageCodes: ['hi'], bookCodes: ['gc'] },
  'Bengali - Ellen G. White': { languageCodes: ['bn'], bookCodes: ['gc'] },
  'Indonesian - Ellen G. White': { languageCodes: ['id'], bookCodes: ['gc'] },
  'Urdu - Ellen G. White': { languageCodes: ['ur'], bookCodes: ['gc'] },
  'French - Ellen G. White': {
    languageCodes: ['fr'],
    bookCodes: ['gc'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/fr/la-tragedie-des-siecles/',
  },
  'Beteja e Madhe - Ellen G. White': { languageCodes: ['sq'], bookCodes: ['gc', 'bz'] },
  'Veliki boj med Kristusom in Satanom - Ellen G. White': {
    languageCodes: ['sl'],
    bookCodes: ['gc', 'vb'],
    sourcePageUrl: 'https://ellenwhiteaudio.org/sl/veliki-boj-med-kristusom-in-satanom/',
  },
};

// Show language-menu audio badges only for folders with deterministic, known
// manifest-backed audio availability (to avoid false positives).
const MANIFEST_AUDIO_LANGUAGE_CODES = new Set<string>([
  'en',
  'ar',
  'sr',
  'sp',
  'fr',
  'pt',
  'cn',
  'it',
  'no',
  'ru',
  'sl',
  'sk',
]);

export const AUDIO_AVAILABLE_LANGUAGE_FOLDERS = new Set<string>(
  Object.entries(AUDIO_SOURCE_CANDIDATES)
    .filter(([, candidate]) =>
      candidate.languageCodes.some((code) => MANIFEST_AUDIO_LANGUAGE_CODES.has(code.trim().toLowerCase()))
    )
    .map(([folder]) => folder)
);

type DirectoryTrack = {
  order: number;
  name: string;
  url: string;
};

type MultiLangManifest = Record<string, AudioManifestTrack[]>;

function decodeLoose(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function inferTrackOrder(fileName: string) {
  const normalized = decodeLoose(fileName).replace(/[_]+/g, ' ').trim();
  const leading = normalized.match(/^[^\d]{0,8}(\d{1,3})(?:\D|$)/);
  if (leading) return Number(leading[1]);

  const generic = normalized.match(/(?:^|\D)(\d{1,3})(?:\D|$)/);
  if (generic) return Number(generic[1]);

  return Number.MAX_SAFE_INTEGER;
}

function pickDirectoryTrackForChapter(tracks: DirectoryTrack[], chapterIndex: number) {
  if (!tracks.length) return null;

  const byExact = tracks.find((t) => t.order === chapterIndex);
  if (byExact) return byExact;

  const byPlusOne = tracks.find((t) => t.order === chapterIndex + 1);
  if (byPlusOne) return byPlusOne;

  const sorted = [...tracks].sort((a, b) => {
    if (a.order === b.order) return a.name.localeCompare(b.name);
    return a.order - b.order;
  });

  if (chapterIndex >= 0 && chapterIndex < sorted.length) {
    return sorted[chapterIndex];
  }

  return null;
}

function pickTrackFromMultiLangManifest(
  manifest: MultiLangManifest | null,
  languageCodes: string[],
  chapterIndex: number,
) {
  if (!manifest) return null;

  for (const code of languageCodes) {
    const codeTracks = manifest[code];
    if (!codeTracks?.length) continue;

    const exact = codeTracks.find((t) => t.chapterIdx === chapterIndex);
    if (exact?.url) return exact;

    const asDirectoryTracks: DirectoryTrack[] = codeTracks.map((t) => ({
      order: t.chapterIdx,
      name: t.code || t.title || String(t.chapterIdx),
      url: t.url,
    }));

    const picked = pickDirectoryTrackForChapter(asDirectoryTracks, chapterIndex);
    if (picked?.url) {
      return {
        chapterIdx: picked.order,
        title: picked.name,
        url: picked.url,
      } satisfies AudioManifestTrack;
    }
  }

  return null;
}

function fmtTime(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ lang, chapterIdx, chapterTitle, onNextChapter, onPrevChapter, canNextChapter = true, canPrevChapter = true, minimized, autoPlayRequest = 0, onPlayingChange, onExpand, onMinimize, onHide, continuePlay = false, onToggleContinuePlay, containerWidth }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDev = import.meta.env.DEV;
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState<number>(() => Number(localStorage.getItem('audio-speed') || '1'));
  const [volume, setVolume] = useState<number>(() => Number(localStorage.getItem('audio-volume') || '1'));
  const [audioLang, setAudioLang] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [sourceKind, setSourceKind] = useState<AudioSourceKind | null>(null);
  const [copiedSource, setCopiedSource] = useState(false);
  const rawLanguageCode = (AUDIO_SOURCE_CANDIDATES[lang]?.languageCodes?.[0] || '').trim().toLowerCase();
  const normalizedLanguageCode = rawLanguageCode === 'sp' ? 'es' : rawLanguageCode === 'cn' ? 'zh' : rawLanguageCode === 'kr' ? 'ko' : rawLanguageCode === 'nb' ? 'no' : rawLanguageCode;
  const labels: PlayerLabels = {
    ...DEFAULT_PLAYER_LABELS,
    ...(PLAYER_LABELS_BY_CODE[normalizedLanguageCode] || {}),
    ...(PLAYER_META_TOGGLE_LABELS[normalizedLanguageCode] || {}),
  };

  // Load audio from manifest first, then fallback to local index.json if available
  useEffect(() => {
    let mounted = true;

    const fetchIndex = async (languageName: string) => {
      const base = `/book-content/audio/${encodeURIComponent(languageName)}`;
      try {
        const r = await fetch(`${base}/index.json`);
        if (!r.ok) return null;
        const list = await r.json() as string[];
        return { list, base };
      } catch (err) {
        console.error('[AudioPlayer] Local audio index fetch failed', err);
        return null;
      }
    };

    const fetchManifest = async (manifestPath: string) => {
      try {
        const r = await fetch(manifestPath);
        if (!r.ok) return null;
        return (await r.json()) as AudioManifest;
      } catch {
        return null;
      }
    };

    const fetchMultiLangManifest = async (manifestPath: string) => {
      try {
        const r = await fetch(manifestPath);
        if (!r.ok) return null;
        return (await r.json()) as MultiLangManifest;
      } catch {
        return null;
      }
    };

    const fetchDirectoryTracks = async (audioCode: string, bookCode: string) => {
      const dirUrl = `${EWA_BASE}/${encodeURIComponent(audioCode)}/${encodeURIComponent(bookCode)}/`;
      try {
        const r = await fetch(dirUrl);
        if (!r.ok) return null;
        const html = await r.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];

        const tracks: DirectoryTrack[] = anchors
          .map((a) => (a.getAttribute('href') || '').trim())
          .filter((href) => /\.mp3(?:$|\?)/i.test(href))
          .map((href) => {
            const absolute = new URL(href, dirUrl).toString();
            const fileName = decodeLoose(absolute.split('/').pop() || href);
            return {
              order: inferTrackOrder(fileName),
              name: fileName,
              url: absolute,
            };
          })
          .filter((t, idx, arr) => arr.findIndex((x) => x.url === t.url) === idx)
          .sort((a, b) => {
            if (a.order === b.order) return a.name.localeCompare(b.name);
            return a.order - b.order;
          });

        return tracks.length ? tracks : null;
      } catch {
        return null;
      }
    };

    const fetchBookPageTracks = async (pageUrl: string) => {
      try {
        const r = await fetch(pageUrl);
        if (!r.ok) return null;
        const html = await r.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const tracks: DirectoryTrack[] = [];
        const seen = new Set<string>();

        const pushUrl = (raw: string | null | undefined) => {
          const href = (raw || '').trim();
          if (!href || !/\.mp3(?:$|\?)/i.test(href)) return;
          let absolute = href;
          try {
            absolute = new URL(href, pageUrl).toString();
          } catch {
            return;
          }
          if (seen.has(absolute)) return;
          seen.add(absolute);

          const fileName = decodeLoose(absolute.split('/').pop() || href);
          tracks.push({
            order: inferTrackOrder(fileName),
            name: fileName,
            url: absolute,
          });
        };

        const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        anchors.forEach((a) => pushUrl(a.getAttribute('href')));

        // Some pages may expose audio links through data attributes.
        const anyNodes = Array.from(doc.querySelectorAll('*')) as HTMLElement[];
        anyNodes.forEach((el) => {
          pushUrl(el.getAttribute('data-src'));
          pushUrl(el.getAttribute('data-audio'));
          pushUrl(el.getAttribute('data-mp3'));
        });

        if (!tracks.length) return null;

        return tracks.sort((a, b) => {
          if (a.order === b.order) return a.name.localeCompare(b.name);
          return a.order - b.order;
        });
      } catch {
        return null;
      }
    };

    const resolveManifestPath = (langFolder: string, languageName: string) => {
      if (langFolder === ENGLISH_FOLDER) return ENGLISH_MANIFEST_PATH;
      if ((languageName || '').toLowerCase() === 'english') return ENGLISH_MANIFEST_PATH;
      return null;
    };

    const findTrackFromManifest = (manifest: AudioManifest | null, currentChapterIdx: number) => {
      if (!manifest?.tracks?.length) return null;
      return manifest.tracks.find((t) => t.chapterIdx === currentChapterIdx) || null;
    };

    const load = async () => {
      setLoadingAudio(true);
      setSrc(null);
      setAudioLang(null);
      setAttribution(null);
      setSourceKind(null);

      // Try to get the language name from LANGUAGE_NAMES mapping
      const mappedLang = LANGUAGE_NAMES[lang];

      // Use mapped name if available, otherwise use input directly
      const preferredLang = mappedLang || lang;

      // 1) Try manifest source for the selected language (currently English GC)
      const preferredManifestPath = resolveManifestPath(lang, preferredLang);

      if (preferredManifestPath) {
        const manifest = await fetchManifest(preferredManifestPath);
        const track = findTrackFromManifest(manifest, chapterIdx);
        if (mounted && track?.url) {
          setSrc(track.url);
          setAudioLang(manifest?.bookLanguageName || preferredLang);
          setSourceKind('english-manifest');
          setAttribution({
            name: manifest?.source?.name || 'EllenWhiteAudio.org',
            url: manifest?.source?.url || 'https://ellenwhiteaudio.org/great-controversy/',
            licenseSummary: manifest?.source?.licenseSummary,
          });
          setLoadingAudio(false);
          return;
        }
      }

      // 2) Try dynamic EllenWhiteAudio multilingual directories
      const sourceCandidates = AUDIO_SOURCE_CANDIDATES[lang];
      if (sourceCandidates) {
        const languageCodes = [...new Set(sourceCandidates.languageCodes.map((v) => v.trim().toLowerCase()).filter(Boolean))];
        const bookCodes = [...new Set(sourceCandidates.bookCodes.map((v) => v.trim().toLowerCase()).filter(Boolean))];

        // 2a) Deterministic local multilingual mapping (avoids runtime remote parsing/CORS fragility).
        const [multiLangManifest, extraMultiLangManifest] = await Promise.all([
          fetchMultiLangManifest(MULTILANG_MANIFEST_PATH),
          fetchMultiLangManifest(MULTILANG_EXTRA_MANIFEST_PATH),
        ]);
        const mergedManifest = {
          ...(multiLangManifest || {}),
          ...(extraMultiLangManifest || {}),
        } as MultiLangManifest;

        const staticTrack = pickTrackFromMultiLangManifest(mergedManifest, languageCodes, chapterIdx);
        if (mounted && staticTrack?.url) {
          setSrc(staticTrack.url);
          setAudioLang(preferredLang);
          setSourceKind('multilang-manifest');
          setAttribution({
            name: 'EllenWhiteAudio.org',
            url: sourceCandidates.sourcePageUrl || `https://ellenwhiteaudio.org/${languageCodes[0] === 'en' ? '' : languageCodes[0]}`,
            licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
          });
          setLoadingAudio(false);
          return;
        }

        // 2b) Runtime directory probing fallback.
        for (const languageCode of languageCodes) {
          for (const bookCode of bookCodes) {
            const tracks = await fetchDirectoryTracks(languageCode, bookCode);
            const chosen = pickDirectoryTrackForChapter(tracks || [], chapterIdx);
            if (mounted && chosen) {
              setSrc(chosen.url);
              setAudioLang(preferredLang);
              setSourceKind('remote-directory');
              setAttribution({
                name: 'EllenWhiteAudio.org',
                url: sourceCandidates.sourcePageUrl || `https://ellenwhiteaudio.org/${languageCode === 'en' ? '' : languageCode}`,
                licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
              });
              setLoadingAudio(false);
              return;
            }
          }
        }

        // 2c) Fallback: parse direct MP3 links from the canonical language book page.
        if (sourceCandidates.sourcePageUrl) {
          const pageTracks = await fetchBookPageTracks(sourceCandidates.sourcePageUrl);
          const chosen = pickDirectoryTrackForChapter(pageTracks || [], chapterIdx);
          if (mounted && chosen) {
            setSrc(chosen.url);
            setAudioLang(preferredLang);
            setSourceKind('source-page');
            setAttribution({
              name: 'EllenWhiteAudio.org',
              url: sourceCandidates.sourcePageUrl,
              licenseSummary: 'Used with attribution for non-commercial educational and ministry use.',
            });
            setLoadingAudio(false);
            return;
          }
        }
      }

      // 3) Fallback to local audio index support for selected language only
      let result = await fetchIndex(preferredLang);

      if (!mounted) return;

      if (result) {
        const pad = String(chapterIdx + 1).padStart(2, '0');
        const match = result.list.find((f) => f.startsWith(`GC-${pad}-`) || f.startsWith(`GC-${pad}`));
        setAudioLang(preferredLang);
        const newSrc = match ? `${result.base}/${encodeURIComponent(match)}` : null;
        setSrc(newSrc);
        setSourceKind(newSrc ? 'local-index' : null);
      } else {
        setAudioLang(null);
        setSrc(null);
        setSourceKind(null);
      }

      setLoadingAudio(false);
    };

    load();
    return () => { mounted = false; };
  }, [lang, chapterIdx]);

  // persist speed and volume
  useEffect(() => {
    try { localStorage.setItem('audio-speed', String(speed)); } catch {}
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);
  useEffect(() => { 
    try { localStorage.setItem('audio-volume', String(volume)); } catch {} 
    if (audioRef.current) audioRef.current.volume = volume; 
  }, [volume]);

  // attach events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => {
      setPlaying(true);
      onPlayingChange?.(true);
    };
    const onPause = () => {
      setPlaying(false);
      onPlayingChange?.(false);
    };
    const onTime = () => setTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      onPlayingChange?.(false);
      if (continuePlay && onNextChapter) onNextChapter(true);
    };
    const onError = (e: ErrorEvent) => { console.error('[AudioPlayer] Event: error', e); };

    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
    };
  }, [src, onNextChapter, onPlayingChange, continuePlay]);

  // resume saved position per lang+chapter
  useEffect(() => {
    if (!src) return;
    const languageName = LANGUAGE_NAMES[lang] || lang;
    const key = `audio-pos:${languageName}:${chapterIdx}`;
    const a = audioRef.current;
    const tryRestore = () => {
      try {
        const v = Number(localStorage.getItem(key) || '0');
        if (a && isFinite(v) && v > 2 && v < (a.duration || Infinity)) {
          a.currentTime = v;
        }
      } catch(e) {
        console.error('[AudioPlayer] Error restoring position', e);
      }
    };
    // wait for metadata
    const onMeta = () => {
      tryRestore();
    }
    a?.addEventListener('loadedmetadata', onMeta);
    tryRestore(); // Also try immediately in case metadata is already loaded
    return () => { a?.removeEventListener('loadedmetadata', onMeta); };
  }, [src, lang, chapterIdx]);

  // save position periodically
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) return;
    let t: number | null = null;
    const save = () => {
      if (a.currentTime > 0 && a.duration > 0) {
        const languageName = LANGUAGE_NAMES[lang] || lang;
        const key = `audio-pos:${languageName}:${chapterIdx}`;
        try { 
          localStorage.setItem(key, String(a.currentTime || 0)); 
          // console.log(`[AudioPlayer] Position saved for ${key}: ${a.currentTime}`);
        } catch {}
      }
    };
    t = window.setInterval(save, 3000);
    return () => { if (t) window.clearInterval(t); };
  }, [src, lang, chapterIdx]);

  // Request autoplay from external chapter actions (e.g., ToC play buttons).
  useEffect(() => {
    if (!autoPlayRequest || !src) return;
    const a = audioRef.current;
    if (!a) return;

    const playNow = async () => {
      try {
        await a.play();
      } catch (err) {
        console.error('[AudioPlayer] Autoplay request failed:', err);
      }
    };

    if (a.readyState >= 2) {
      void playNow();
      return;
    }

    const onCanPlay = () => {
      void playNow();
    };
    a.addEventListener('canplay', onCanPlay, { once: true });
    return () => {
      a.removeEventListener('canplay', onCanPlay);
    };
  }, [autoPlayRequest, src]);
  
  // toggle play/pause
  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) {
        await a.play();
      } else {
        a.pause();
      }
    } catch (err) {
      console.error('[AudioPlayer] Error in toggle play/pause:', err);
    }
  };

  const seekTo = (p: number) => {
    const a = audioRef.current; 
    if (!a) return; 
    a.currentTime = p;
  };

  const seekRelative = (deltaSeconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    const next = (a.currentTime || 0) + deltaSeconds;
    const max = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : Number.MAX_SAFE_INTEGER;
    a.currentTime = Math.max(0, Math.min(max, next));
  };

  const cycleSpeed = () => {
    setSpeed((prev) => {
      const currentIndex = SPEED_STEPS.findIndex((s) => Math.abs(s - prev) < 0.001);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % SPEED_STEPS.length : 1;
      return SPEED_STEPS[nextIndex];
    });
  };

  const copyCurrentSourceUrl = async () => {
    if (!src) return;
    try {
      if (!navigator?.clipboard?.writeText) return;
      await navigator.clipboard.writeText(src);
      setCopiedSource(true);
    } catch {
      setCopiedSource(false);
    }
  };

  useEffect(() => {
    if (!copiedSource) return;
    const timer = window.setTimeout(() => setCopiedSource(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedSource]);

  const displayAudioLang = audioLang || (LANGUAGE_NAMES[lang] || lang);
  const remainingTime = Math.max(0, duration - time);
  const sourceKindLabel = sourceKind
    ? sourceKind
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' · ')
    : null;

  if (loadingAudio) {
    return (
      <div className="audio-player modern-audio-player audio-unavailable">
        <div className="audio-unavailable-text">{labels.loadingAudio}</div>
      </div>
    );
  }

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata" />
      {minimized ? (
        <MinimizedAudioBar
          labels={labels}
          chapterTitle={chapterTitle}
          playing={playing}
          time={time}
          duration={duration}
          speed={speed}
          onToggle={toggle}
          onSeekRelative={seekRelative}
          onSeekTo={seekTo}
          onCycleSpeed={cycleSpeed}
          onPrevChapter={() => onPrevChapter?.(playing)}
          onNextChapter={() => onNextChapter?.(playing)}
          canPrevChapter={canPrevChapter}
          canNextChapter={canNextChapter}
          onExpand={onExpand || (() => {})}
          onHide={onHide}
          continuePlay={continuePlay}
          onToggleContinuePlay={onToggleContinuePlay}
          containerWidth={containerWidth}
        />
      ) : (
    <div className="audio-player modern-audio-player">
      <div className="audio-info">
        <div className="audio-chapter">
          <span className="audio-chapter-title">{chapterTitle || labels.untitledChapter}</span>
          <span className="audio-chapter-lang">{displayAudioLang}</span>
          {isDev && sourceKindLabel ? (
            <div className="audio-dev-row">
              <span className="audio-source-badge" title={`Audio source resolver: ${sourceKind}`}>
                {labels.source}: {sourceKindLabel}
              </span>
              <button
                type="button"
                className="audio-source-copy-btn"
                onClick={copyCurrentSourceUrl}
                title="Copy resolved audio URL"
              >
                {copiedSource ? labels.copied : labels.copyUrl}
              </button>
            </div>
          ) : null}
        </div>
        <div className="audio-top-actions">
          {onMinimize && (
            <button className="audio-minimize-btn" onClick={onMinimize} aria-label={labels.minimizePlayer} title={labels.minimizePlayer}>
              ─
            </button>
          )}
        </div>
      </div>
      <div className="audio-controls">
        <button className="audio-btn audio-btn-secondary" onClick={() => onPrevChapter?.(playing)} aria-label={labels.previousChapter} title={labels.previousChapter} disabled={!onPrevChapter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20L9 12l10-8v16z"/><path d="M5 19V5"/></svg>
        </button>
        <button className="audio-btn audio-rewind" onClick={() => seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - 15))} aria-label={labels.rewind15} title={labels.rewind15}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19l-9-7 9-7v14zM22 19l-9-7 9-7v14z"/></svg>
        </button>
        <button className="audio-btn audio-play" onClick={toggle} aria-label={labels.playPause} title={playing ? labels.pause : labels.play}>
          {playing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button className="audio-btn audio-forward" onClick={() => seekTo(Math.min(audioRef.current?.duration || 0, (audioRef.current?.currentTime || 0) + 15))} aria-label={labels.forward15} title={labels.forward15}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5l9 7-9 7V5zM2 5l9 7-9 7V5z"/></svg>
        </button>
        <button className="audio-btn audio-btn-secondary" onClick={() => onNextChapter?.(playing)} aria-label={labels.nextChapter} title={labels.nextChapter} disabled={!onNextChapter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4l10 8-10 8V4z"/><path d="M19 5v14"/></svg>
        </button>
      </div>
      <div className="audio-timeline-block">
        <div className="audio-timeline" onClick={(e) => {
          const el = e.currentTarget as HTMLElement; const rect = el.getBoundingClientRect(); const x = (e as React.MouseEvent).clientX - rect.left; const pct = x / rect.width; seekTo((audioRef.current?.duration || 0) * pct);
        }}>
          <div className="audio-progress" style={{ width: `${(duration ? (time / duration) : 0) * 100}%` }} />
        </div>
        <div className="audio-times audio-times-by-timeline">
          <span>{fmtTime(time)}</span>
          <span>-{fmtTime(remainingTime)} {labels.left}</span>
        </div>
      </div>
      <div className="audio-settings">
        <label className="audio-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <select value={String(speed)} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </label>
        <label className="audio-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <input type="range" min={0} max={1} step={0.01} value={String(volume)} onChange={(e) => setVolume(Number(e.target.value))} />
        </label>
        {src && <a className="audio-download" href={src} download target="_blank" rel="noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>}
        {onToggleContinuePlay ? (
          <button
            type="button"
            className={`audio-download${continuePlay ? ' is-active' : ''}`}
            onClick={onToggleContinuePlay}
            aria-label={labels.continuePlay}
            title={labels.continuePlay}
          >
            {labels.continuePlay}
          </button>
        ) : null}
      </div>
      {attribution && (
        <div className="audio-attribution">
          {labels.audioBy} <a href={attribution.url} target="_blank" rel="noreferrer">{attribution.name}</a>
          {attribution.licenseSummary ? <span> · {attribution.licenseSummary}</span> : null}
        </div>
      )}
    </div>
      )}
    </>
  );
}
