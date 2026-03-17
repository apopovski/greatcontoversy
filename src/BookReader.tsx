
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './BookReader.css';
import { MdMenu, MdTranslate, MdSearch, MdDarkMode, MdLightMode, MdContentCopy, MdShare, MdClose, MdMoreVert, MdBookmarkBorder, MdBookmark, MdDownload, MdCheckCircle, MdPrivacyTip, MdHeadphones, MdPlayArrow, MdFavorite } from 'react-icons/md';
import { FaFacebookF, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { IoMdMail } from 'react-icons/io';
import AudioPlayer, { AUDIO_AVAILABLE_LANGUAGE_FOLDERS } from './components/AudioPlayer';
import { LANGUAGE_NAMES } from './utils/language';
import { trackEvent, trackPageView, getAnalyticsConsentStatus, setAnalyticsConsent } from './utils/analytics';

type TocEntry = { title: string; href: string };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type BookContentProps = {
  loading: boolean;
  isDesktop: boolean;
  pageWidth: number;
  textSize: number;
  displayedHtml: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  copyrightText: string;
  lang: string;
  chapterIdx: number;
};

const BookContent = React.memo(function BookContent({
  loading,
  isDesktop,
  pageWidth,
  textSize,
  displayedHtml,
  contentRef,
  copyrightText,
  lang,
  chapterIdx,
}: BookContentProps & {
}) {
  const developerCredit = getDeveloperCreditText(lang);

  if (loading) {
    return (
      <main className="reader-main">
        <div>Loading…</div>
      </main>
    );
  }

  const wrapperStyle: React.CSSProperties = {
    width: isDesktop ? `${pageWidth}px` : '100%',
    fontSize: `${textSize}px`,
    position: 'relative',
  };

  return (
    <main className="reader-main">
      <div className="reader-wrapper" style={wrapperStyle}>
        <div className="reader-content-layout">
          <div className="reader-book-content">
            <div ref={contentRef} className="reader-book-html" dangerouslySetInnerHTML={{ __html: displayedHtml }} />
          </div>
        </div>
        <footer className="reader-footer">
          <div className="reader-footer-inner">
            {copyrightText}
            {' · '}
            <a href="https://github.com/apopovski" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
              {developerCredit}
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}, (prev, next) => (
  prev.loading === next.loading &&
  prev.isDesktop === next.isDesktop &&
  prev.pageWidth === next.pageWidth &&
  prev.textSize === next.textSize &&
  prev.displayedHtml === next.displayedHtml &&
  prev.contentRef === next.contentRef &&
  prev.copyrightText === next.copyrightText
));

const AMHARIC_FOLDER = 'Amharic - Ellen G. White';
const AMHARIC_SOURCE_PATH = '/book-content/txt/Amharic.rtf';
const CHINESE_FOLDER = 'Chinese - Ellen G. White';
const CHINESE_SOURCE_PATH = '/book-content/txt/GC-Chinese.txt';
const KOREAN_FOLDER = 'Korean - Ellen G. White';
const KOREAN_SOURCE_PATH = '/book-content/html/GC Koren.txt';
const JAPANESE_FOLDER = 'Japanese - Ellen G. White';
const JAPANESE_SOURCE_PATH = '/book-content/html/Japanese.txt';
const SERBIAN_FOLDER = 'Serbian - Ellen G. White';
const SERBIAN_SOURCE_PATH = '/book-content/txt/GC-Serbian.txt';
const FARSI_FOLDER = 'Farsi - Ellen G. White';
const FARSI_SOURCE_PATH = '/book-content/txt/GC-Farsi.txt';
const AFRIKAANS_FOLDER = 'Afrikaans - Ellen G. White';
const AFRIKAANS_SOURCE_PATH = '/book-content/txt/GC-Afrikaans.txt';
const HINDI_FOLDER = 'Hindi - Ellen G. White';
const HINDI_SOURCE_PATH = '/book-content/txt/GC-Hindi.txt';
const BENGALI_FOLDER = 'Bengali - Ellen G. White';
const BENGALI_SOURCE_PATH = '/book-content/txt/GC-Bengali.txt';
const INDONESIAN_FOLDER = 'Indonesian - Ellen G. White';
const INDONESIAN_SOURCE_PATH = '/book-content/txt/GC-Indonesian.txt';
const MALAY_FOLDER = 'Kontroversi Besar - Ellen G. White';
const MALAY_SOURCE_PATH = '/book-content/txt/GC-Indonesian.txt';
const DUTCH_FOLDER = 'De Grote Strijd - Ellen G. White';
const URDU_FOLDER = 'Urdu - Ellen G. White';
const URDU_SOURCE_PATH = '/book-content/txt/GC-Urdu.txt';
const FRENCH_FOLDER = 'French - Ellen G. White';
const POLISH_FOLDER = 'Wielki boj - Ellen G. White';
const ALBANIAN_FOLDER = 'Beteja e Madhe - Ellen G. White';
const ALBANIAN_SOURCE_PATH = '/book-content/txt/GC-Albanian.txt';
const HUNGARIAN_FOLDER = 'A nagy küzdelem - Ellen G. White';
const GREEK_FOLDER = 'Η Μεγάλη Διαμάχη - Ellen G. White';
const POLISH_QUESTIONS_EMAIL = 'office@fzz.pl';
const POLISH_PRINT_ORDER_EMAIL = 'marketing@fzz.pl';
const STRIPE_DONATE_URL = 'https://donate.stripe.com/4gM4gt6Vqb1s4w4e7Kd3i00';
const DEFAULT_CONTACT_WHATSAPP_NUMBER = '19562447002';
const CONTACT_WHATSAPP_NUMBERS: Record<string, string> = {
  'Der grosse Kampf - Ellen G. White': '4915753992703',
};
const CONTACT_WHATSAPP_DISPLAY_NUMBERS: Record<string, string> = {
  'Der grosse Kampf - Ellen G. White': '+49 157 53992703',
};
const DEVELOPER_LINK = 'https://github.com/apopovski';
const DEVELOPER_BY_LABELS: Record<string, string> = {
  en: 'Developed by',
  es: 'Desarrollado por',
  de: 'Entwickelt von',
  it: 'Sviluppato da',
  nl: 'Ontwikkeld door',
  da: 'Udviklet af',
  no: 'Utviklet av',
  pt: 'Desenvolvido por',
  sm: 'Atiaʻe e',
  et: 'Arendaja',
  ro: 'Dezvoltat de',
  hr: 'Razvio',
  bg: 'Разработено от',
  sk: 'Vyvinul',
  cs: 'Vyvinul',
  uk: 'Розроблено',
  ru: 'Разработано',
  pl: 'Opracowane przez',
  ar: 'تطوير',
  am: 'የተገነባው በ',
  zh: '开发者',
  ko: '개발',
  ja: '開発',
  sr: 'Развио',
  fa: 'توسعه توسط',
  af: 'Ontwikkel deur',
  hi: 'द्वारा विकसित',
  bn: 'ডেভেলপ করেছেন',
  id: 'Dikembangkan oleh',
  ms: 'Dibangunkan oleh',
  ur: 'تیار کردہ از',
  fr: 'Développé par',
  sq: 'Zhvilluar nga',
  hu: 'Fejlesztette',
  el: 'Ανάπτυξη από',
};
const DEVELOPER_NAME = 'Aleksandar Popovski';
const CONTACT_WHATSAPP_LABELS: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'Contact on WhatsApp',
  'El Conflicto de los Siglos - Ellen G. White': 'Contactar por WhatsApp',
  'Der grosse Kampf - Ellen G. White': 'Kontakt per WhatsApp',
  'Il gran conflitto - Ellen G. White': 'Contatta su WhatsApp',
  [DUTCH_FOLDER]: 'Contact via WhatsApp',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Kontakt på WhatsApp',
  'Mot historiens klimaks - Ellen G. White': 'Kontakt på WhatsApp',
  'O Grande Conflito - Ellen G. White': 'Contato no WhatsApp',
  'O Le Finauga Tele - Ellen G. White': 'Contact on WhatsApp',
  'Suur Voitlus - Ellen G. White': 'Võta ühendust WhatsAppis',
  'Tragedia veacurilor - Ellen G. White': 'Contact pe WhatsApp',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Kontakt na WhatsAppu',
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': 'Контакт в WhatsApp',
  'Velke drama veku - Ellen G. White': 'Kontakt na WhatsApp',
  'Velky spor vekov - Ellen G. White': 'Kontakt na WhatsApp',
  "Vielika borot'ba - Ellen G. White": 'Зв’язатися у WhatsApp',
  "Vielikaia bor'ba - Ellen G. White": 'Связаться в WhatsApp',
  'Wielki boj - Ellen G. White': 'Kontakt przez WhatsApp',
  "alSra` al`Zym - Ellen G. White": 'تواصل عبر واتساب',
  [AMHARIC_FOLDER]: 'በWhatsApp ያግኙን',
  [CHINESE_FOLDER]: '通过 WhatsApp 联系',
  [KOREAN_FOLDER]: 'WhatsApp으로 문의',
  [JAPANESE_FOLDER]: 'WhatsAppで連絡',
  [SERBIAN_FOLDER]: 'Kontaktirajte preko WhatsApp-а',
  [FARSI_FOLDER]: 'ارتباط از طریق واتساپ',
  [AFRIKAANS_FOLDER]: 'Kontak op WhatsApp',
  [HINDI_FOLDER]: 'WhatsApp पर संपर्क करें',
  [BENGALI_FOLDER]: 'WhatsApp-এ যোগাযোগ করুন',
  [INDONESIAN_FOLDER]: 'Hubungi lewat WhatsApp',
  [MALAY_FOLDER]: 'Hubungi di WhatsApp',
  [URDU_FOLDER]: 'واٹس ایپ پر رابطہ کریں',
  [FRENCH_FOLDER]: 'Contact sur WhatsApp',
  [ALBANIAN_FOLDER]: 'Kontakto në WhatsApp',
  [HUNGARIAN_FOLDER]: 'Kapcsolat WhatsAppon',
  [GREEK_FOLDER]: 'Επικοινωνία στο WhatsApp',
};

const DESKTOP_WIDTH_MIN = 640;
const DESKTOP_WIDTH_MAX = 820;
const DESKTOP_WIDTH_RECOMMENDED_MIN = 680;
const DESKTOP_WIDTH_RECOMMENDED_MAX = 760;

function getRecommendedDesktopWidth(viewportWidth: number) {
  const target = Math.round(viewportWidth * 0.67);
  return Math.max(
    DESKTOP_WIDTH_RECOMMENDED_MIN,
    Math.min(DESKTOP_WIDTH_RECOMMENDED_MAX, target)
  );
}

type DesktopWidthPreset = 'small' | 'medium' | 'wide';

function getDesktopWidthPresets(viewportWidth: number, limit: number) {
  const boundedLimit = Math.max(DESKTOP_WIDTH_MIN, Math.min(DESKTOP_WIDTH_MAX, limit));
  // Screen-size adaptive baseline:
  // keep small around ~48% of viewport (within configured bounds),
  // but always leave enough room for meaningful jumps to medium/wide.
  const adaptiveSmall = Math.round(viewportWidth * 0.48);
  const small = Math.max(
    DESKTOP_WIDTH_MIN,
    Math.min(Math.max(DESKTOP_WIDTH_MIN, boundedLimit - 120), adaptiveSmall)
  );
  const available = Math.max(0, boundedLimit - small);
  // Keep increments in a 1 : 1.5 ratio:
  // small -> medium = d, medium -> wide = 1.5d
  // total available span = 2.5d => d = available / 2.5
  const firstIncrement = available / 2.5;
  const medium = Math.max(
    small,
    Math.min(boundedLimit, small + Math.round(firstIncrement))
  );
  const wide = boundedLimit;

  return { small, medium, wide };
}

const LANGUAGE_FOLDERS = [
  'The Great Controversy - Ellen G. White 2',
  'El Conflicto de los Siglos - Ellen G. White',
  'Der grosse Kampf - Ellen G. White',
  'Il gran conflitto - Ellen G. White',
  DUTCH_FOLDER,
  'MOD EN BEDRE FREMTID - Ellen G. White',
  'Mot historiens klimaks - Ellen G. White',
  'O Grande Conflito - Ellen G. White',
  'O Le Finauga Tele - Ellen G. White',
  'Suur Voitlus - Ellen G. White',
  'Tragedia veacurilor - Ellen G. White',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White",
  'Velke drama veku - Ellen G. White',
  'Velky spor vekov - Ellen G. White',
  "Vielika borot'ba - Ellen G. White",
  "Vielikaia bor'ba - Ellen G. White",
  'Wielki boj - Ellen G. White',
  "alSra` al`Zym - Ellen G. White",
  AMHARIC_FOLDER,
  CHINESE_FOLDER,
  KOREAN_FOLDER,
  JAPANESE_FOLDER,
  SERBIAN_FOLDER,
  FARSI_FOLDER,
  AFRIKAANS_FOLDER,
  HINDI_FOLDER,
  BENGALI_FOLDER,
  INDONESIAN_FOLDER,
  MALAY_FOLDER,
  URDU_FOLDER,
  FRENCH_FOLDER,
  ALBANIAN_FOLDER,
  HUNGARIAN_FOLDER,
  GREEK_FOLDER,
];

const LANGUAGE_ABBREV: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'en',
  'El Conflicto de los Siglos - Ellen G. White': 'es',
  'Der grosse Kampf - Ellen G. White': 'de',
  'Il gran conflitto - Ellen G. White': 'it',
  [DUTCH_FOLDER]: 'nl',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'da',
  'Mot historiens klimaks - Ellen G. White': 'no',
  'O Grande Conflito - Ellen G. White': 'pt',
  'O Le Finauga Tele - Ellen G. White': 'sm',
  'Suur Voitlus - Ellen G. White': 'et',
  'Tragedia veacurilor - Ellen G. White': 'ro',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'hr',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'bg',
  'Velke drama veku - Ellen G. White': 'sk',
  'Velky spor vekov - Ellen G. White': 'cs',
  "Vielika borot'ba - Ellen G. White": 'uk',
  "Vielikaia bor'ba - Ellen G. White": 'ru',
  'Wielki boj - Ellen G. White': 'pl',
  "alSra` al`Zym - Ellen G. White": 'ar',
  [AMHARIC_FOLDER]: 'am',
  [CHINESE_FOLDER]: 'zh',
  [KOREAN_FOLDER]: 'ko',
  [JAPANESE_FOLDER]: 'ja',
  [SERBIAN_FOLDER]: 'sr',
  [FARSI_FOLDER]: 'fa',
  [AFRIKAANS_FOLDER]: 'af',
  [HINDI_FOLDER]: 'hi',
  [BENGALI_FOLDER]: 'bn',
  [INDONESIAN_FOLDER]: 'id',
  [MALAY_FOLDER]: 'ms',
  [URDU_FOLDER]: 'ur',
  [FRENCH_FOLDER]: 'fr',
  [ALBANIAN_FOLDER]: 'sq',
  [HUNGARIAN_FOLDER]: 'hu',
  [GREEK_FOLDER]: 'el',
};

const CONTACT_WHATSAPP_AUTO_MESSAGES: Record<string, string> = {
  en: 'Hi, I would like to connect.',
  es: 'Hola, me gustaría conectar.',
  de: 'Hallo, ich möchte gerne Kontakt aufnehmen.',
  it: 'Ciao, vorrei mettermi in contatto.',
  nl: 'Hallo, ik wil graag contact opnemen.',
  da: 'Hej, jeg vil gerne komme i kontakt.',
  no: 'Hei, jeg vil gjerne ta kontakt.',
  pt: 'Olá, gostaria de entrar em contato.',
  sm: 'Talofa, ou te fia fesootaʻi.',
  et: 'Tere, sooviksin ühendust võtta.',
  ro: 'Bună, aș dori să iau legătura.',
  hr: 'Bok, želio bih stupiti u kontakt.',
  bg: 'Здравейте, бих искал да се свържа.',
  sk: 'Ahoj, rád by som sa spojil.',
  cs: 'Ahoj, rád bych se spojil.',
  uk: 'Привіт, я хотів(ла) б звʼязатися.',
  ru: 'Здравствуйте, я хотел(а) бы связаться.',
  pl: 'Cześć, chciałbym/chciałabym się skontaktować.',
  ar: 'مرحبًا، أود التواصل.',
  am: 'ሰላም፣ መገናኘት እፈልጋለሁ።',
  zh: '你好，我想联系你。',
  ko: '안녕하세요, 연락하고 싶습니다.',
  ja: 'こんにちは、連絡を取りたいです。',
  sr: 'Здраво, желео/желела бих да ступим у контакт.',
  fa: 'سلام، مایلم ارتباط برقرار کنم.',
  af: 'Hallo, ek wil graag kontak maak.',
  hi: 'नमस्ते, मैं संपर्क करना चाहता/चाहती हूँ।',
  bn: 'হ্যালো, আমি যোগাযোগ করতে চাই।',
  id: 'Halo, saya ingin terhubung.',
  ms: 'Hai, saya ingin berhubung.',
  ur: 'ہیلو، میں رابطہ کرنا چاہتا/چاہتی ہوں۔',
  fr: 'Bonjour, je souhaite entrer en contact.',
  sq: 'Përshëndetje, do të doja të lidhesha.',
  hu: 'Szia, szeretnék kapcsolatba lépni.',
  el: 'Γεια σας, θα ήθελα να επικοινωνήσω.',
};

const BOOK_TITLE_OVERRIDES: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'The Great Controversy',
  'El Conflicto de los Siglos - Ellen G. White': 'El Conflicto de los Siglos',
  'Der grosse Kampf - Ellen G. White': 'Der große Kampf',
  'Il gran conflitto - Ellen G. White': 'Il gran conflitto',
  [DUTCH_FOLDER]: 'De Grote Strijd',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Mod en bedre fremtid',
  'Mot historiens klimaks - Ellen G. White': 'Mot historiens klimaks',
  'O Grande Conflito - Ellen G. White': 'O Grande Conflito',
  'O Le Finauga Tele - Ellen G. White': 'O Le Finauga Tele',
  'Suur Voitlus - Ellen G. White': 'Suur Võitlus',
  'Tragedia veacurilor - Ellen G. White': 'Tragedia veacurilor',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Velika borba između Krista i Sotone',
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': 'Великата борба между Христос и Сатана',
  'Velke drama veku - Ellen G. White': 'Veľké drama vekov',
  'Velky spor vekov - Ellen G. White': 'Velký spor věků',
  "Vielika borot'ba - Ellen G. White": 'Велика боротьба',
  "Vielikaia bor'ba - Ellen G. White": 'Великая борьба',
  'Wielki boj - Ellen G. White': 'Wielki bój',
  "alSra` al`Zym - Ellen G. White": 'الصراع العظيم',
  [AMHARIC_FOLDER]: 'ታላቁ ተጋድሎ',
  [CHINESE_FOLDER]: '善恶之争',
  [KOREAN_FOLDER]: '각 시대의 대쟁투',
  [JAPANESE_FOLDER]: '各時代の大争闘',
  [SERBIAN_FOLDER]: 'Велика борба између Христа и Сотоне',
  [FARSI_FOLDER]: 'نبرد عظیم',
  [AFRIKAANS_FOLDER]: 'Die Groot Stryd',
  [HINDI_FOLDER]: 'महान संघर्ष',
  [BENGALI_FOLDER]: 'মহা বিবাদ',
  [INDONESIAN_FOLDER]: 'Kemenangan Akhir',
  [MALAY_FOLDER]: 'Kontroversi Besar',
  [URDU_FOLDER]: 'عظیم کشمکش',
  [FRENCH_FOLDER]: 'La Tragédie des Siècles',
  [ALBANIAN_FOLDER]: 'Beteja e Madhe',
  [HUNGARIAN_FOLDER]: 'A nagy küzdelem',
  [GREEK_FOLDER]: 'Η Μεγάλη Διαμάχη',
};

const META_TAGLINES: Record<string, string> = {
  en: 'Cosmic conflict between good and evil',
  es: 'Conflicto cósmico entre el bien y el mal',
  de: 'Kosmischer Konflikt zwischen Gut und Böse',
  it: 'Conflitto cosmico tra il bene e il male',
  nl: 'Kosmisch conflict tussen goed en kwaad',
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
  ko: '선과 악 사이의 우주적 대쟁투',
  ja: '善と悪の間の宇宙的争闘',
  sr: 'Космички сукоб између добра и зла',
  fa: 'نبرد کیهانی میان خیر و شر',
  af: 'Kosmiese konflik tussen goed en kwaad',
  hi: 'अच्छाई और बुराई के बीच ब्रह्मांडीय संघर्ष',
  bn: 'ভাল ও মন্দের মধ্যে মহাজাগতিক সংঘর্ষ',
  id: 'Konflik kosmik antara yang baik dan yang jahat',
  ms: 'Konflik kosmik antara yang baik dan yang jahat',
  ur: 'نیکی اور بدی کے درمیان کائناتی کشمکش',
  fr: 'Conflit cosmique entre le bien et le mal',
  sq: 'Konflikt kozmik ndërmjet së mirës dhe së keqes',
  hu: 'Kozmikus küzdelem a jó és a rossz között',
  el: 'Κοσμική σύγκρουση ανάμεσα στο καλό και το κακό',
};

const getBookTitleFromFolder = (folder: string) =>
  BOOK_TITLE_OVERRIDES[folder] || (folder || '').split(' - Ellen')[0].trim();

const LANGUAGE_URL_NAMES: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'English',
  'El Conflicto de los Siglos - Ellen G. White': 'Español',
  'Der grosse Kampf - Ellen G. White': 'Deutsch',
  'Il gran conflitto - Ellen G. White': 'Italiano',
  [DUTCH_FOLDER]: 'Nederlands',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Dansk',
  'Mot historiens klimaks - Ellen G. White': 'Norsk',
  'O Grande Conflito - Ellen G. White': 'Português',
  'O Le Finauga Tele - Ellen G. White': 'Gagana Samoa',
  'Suur Voitlus - Ellen G. White': 'Eesti',
  'Tragedia veacurilor - Ellen G. White': 'Română',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Hrvatski',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'Български',
  'Velke drama veku - Ellen G. White': 'Slovenčina',
  'Velky spor vekov - Ellen G. White': 'Čeština',
  "Vielika borot'ba - Ellen G. White": 'Українська',
  "Vielikaia bor'ba - Ellen G. White": 'Русский',
  'Wielki boj - Ellen G. White': 'Polski',
  "alSra` al`Zym - Ellen G. White": 'العربية',
  [AMHARIC_FOLDER]: 'አማርኛ',
  [CHINESE_FOLDER]: '中文',
  [KOREAN_FOLDER]: '한국어',
  [JAPANESE_FOLDER]: '日本語',
  [SERBIAN_FOLDER]: 'Српски',
  [FARSI_FOLDER]: 'فارسی',
  [AFRIKAANS_FOLDER]: 'Afrikaans',
  [HINDI_FOLDER]: 'हिन्दी',
  [BENGALI_FOLDER]: 'বাংলা',
  [INDONESIAN_FOLDER]: 'Bahasa Indonesia',
  [MALAY_FOLDER]: 'Bahasa Melayu',
  [URDU_FOLDER]: 'اردو',
  [FRENCH_FOLDER]: 'Français',
  [ALBANIAN_FOLDER]: 'Shqip',
  [HUNGARIAN_FOLDER]: 'Magyar',
  [GREEK_FOLDER]: 'Ελληνικά',
};

function getLanguageMenuLabel(folder: string) {
  const englishName = (LANGUAGE_NAMES[folder] || '').trim();
  const localName = (LANGUAGE_URL_NAMES[folder] || '').trim();

  if (!englishName && !localName) return folder;
  if (!englishName) return localName;
  if (!localName) return englishName;
  if (englishName.localeCompare(localName, undefined, { sensitivity: 'base' }) === 0) {
    return englishName;
  }
  return `${englishName} — ${localName}`;
}

const LANGUAGE_CHAPTER_LABELS: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'Chapter',
  'El Conflicto de los Siglos - Ellen G. White': 'Capítulo',
  'Der grosse Kampf - Ellen G. White': 'Kapitel',
  'Il gran conflitto - Ellen G. White': 'Capitolo',
  [DUTCH_FOLDER]: 'Hoofdstuk',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Kapitel',
  'Mot historiens klimaks - Ellen G. White': 'Kapittel',
  'O Grande Conflito - Ellen G. White': 'Capítulo',
  'O Le Finauga Tele - Ellen G. White': 'Mataupu',
  'Suur Voitlus - Ellen G. White': 'Peatükk',
  'Tragedia veacurilor - Ellen G. White': 'Capitol',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Poglavlje',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'Glava',
  'Velke drama veku - Ellen G. White': 'Kapitola',
  'Velky spor vekov - Ellen G. White': 'Kapitola',
  "Vielika borot'ba - Ellen G. White": 'Rozdil',
  "Vielikaia bor'ba - Ellen G. White": 'Glava',
  'Wielki boj - Ellen G. White': 'Rozdział',
  "alSra` al`Zym - Ellen G. White": 'الفصل',
  [AMHARIC_FOLDER]: 'ምዕራፍ',
  [CHINESE_FOLDER]: '章',
  [KOREAN_FOLDER]: '장',
  [JAPANESE_FOLDER]: '章',
  [SERBIAN_FOLDER]: 'Поглавље',
  [FARSI_FOLDER]: 'فصل',
  [AFRIKAANS_FOLDER]: 'Hoofstuk',
  [HINDI_FOLDER]: 'पाठ',
  [BENGALI_FOLDER]: 'অধ্যায়',
  [INDONESIAN_FOLDER]: 'Bab',
  [MALAY_FOLDER]: 'Bab',
  [URDU_FOLDER]: 'باب',
  [FRENCH_FOLDER]: 'Chapitre',
  [ALBANIAN_FOLDER]: 'Kapitulli',
  [HUNGARIAN_FOLDER]: 'Fejezet',
  [GREEK_FOLDER]: 'Κεφάλαιο',
};

const LANGUAGE_CONTENTS_LABELS: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'Contents',
  'El Conflicto de los Siglos - Ellen G. White': 'Contenido',
  'Der grosse Kampf - Ellen G. White': 'Inhalt',
  'Il gran conflitto - Ellen G. White': 'Indice',
  [DUTCH_FOLDER]: 'Inhoud',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Indhold',
  'Mot historiens klimaks - Ellen G. White': 'Innhold',
  'O Grande Conflito - Ellen G. White': 'Conteúdo',
  'O Le Finauga Tele - Ellen G. White': 'Mataupu',
  'Suur Voitlus - Ellen G. White': 'Sisukord',
  'Tragedia veacurilor - Ellen G. White': 'Cuprins',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Sadržaj',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'Съдържание',
  'Velke drama veku - Ellen G. White': 'Obsah',
  'Velky spor vekov - Ellen G. White': 'Obsah',
  "Vielika borot'ba - Ellen G. White": 'Зміст',
  "Vielikaia bor'ba - Ellen G. White": 'Содержание',
  'Wielki boj - Ellen G. White': 'Spis treści',
  "alSra` al`Zym - Ellen G. White": 'المحتويات',
  [AMHARIC_FOLDER]: 'ይዘት',
  [CHINESE_FOLDER]: '目录',
  [KOREAN_FOLDER]: '목차',
  [JAPANESE_FOLDER]: '目次',
  [SERBIAN_FOLDER]: 'Садржај',
  [FARSI_FOLDER]: 'فهرست',
  [AFRIKAANS_FOLDER]: 'Inhoud',
  [HINDI_FOLDER]: 'विषय सूची',
  [BENGALI_FOLDER]: 'সূচিপত্র',
  [INDONESIAN_FOLDER]: 'Daftar Isi',
  [MALAY_FOLDER]: 'Kandungan',
  [URDU_FOLDER]: 'فہرست',
  [FRENCH_FOLDER]: 'Sommaire',
  [ALBANIAN_FOLDER]: 'Përmbajtja',
  [HUNGARIAN_FOLDER]: 'Tartalomjegyzék',
  [GREEK_FOLDER]: 'Περιεχόμενα',
};

const LANGUAGE_CONTINUE_LABELS: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'Continue',
  'El Conflicto de los Siglos - Ellen G. White': 'Continuar',
  'Der grosse Kampf - Ellen G. White': 'Weiter',
  'Il gran conflitto - Ellen G. White': 'Continua',
  [DUTCH_FOLDER]: 'Verder',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Fortsæt',
  'Mot historiens klimaks - Ellen G. White': 'Fortsett',
  'O Grande Conflito - Ellen G. White': 'Continuar',
  'O Le Finauga Tele - Ellen G. White': 'Fa‘aauau',
  'Suur Voitlus - Ellen G. White': 'Jätka',
  'Tragedia veacurilor - Ellen G. White': 'Continuă',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Nastavi',
  "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White": 'Продължи',
  'Velke drama veku - Ellen G. White': 'Pokračovať',
  'Velky spor vekov - Ellen G. White': 'Pokračovat',
  "Vielika borot'ba - Ellen G. White": 'Продовжити',
  "Vielikaia bor'ba - Ellen G. White": 'Продолжить',
  'Wielki boj - Ellen G. White': 'Kontynuuj',
  "alSra` al`Zym - Ellen G. White": 'متابعة',
  [AMHARIC_FOLDER]: 'ቀጥል',
  [CHINESE_FOLDER]: '继续',
  [KOREAN_FOLDER]: '계속',
  [JAPANESE_FOLDER]: '続ける',
  [SERBIAN_FOLDER]: 'Настави',
  [FARSI_FOLDER]: 'ادامه',
  [AFRIKAANS_FOLDER]: 'Gaan voort',
  [HINDI_FOLDER]: 'जारी रखें',
  [BENGALI_FOLDER]: 'চালিয়ে যান',
  [INDONESIAN_FOLDER]: 'Lanjutkan',
  [MALAY_FOLDER]: 'Teruskan',
  [URDU_FOLDER]: 'جاری رکھیں',
  [FRENCH_FOLDER]: 'Continuer',
  [ALBANIAN_FOLDER]: 'Vazhdo',
  [HUNGARIAN_FOLDER]: 'Folytatás',
  [GREEK_FOLDER]: 'Συνέχεια',
};

const HERO_COPY: Record<string, {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  startReading: string;
  chooseLanguage: string;
  availability: string;
}> = {
  en: {
    line1: 'Empires have risen.',
    line2: 'Truth has been suppressed.',
    line3: 'Prophecy has been fulfilled.',
    line4: 'What comes next?',
    startReading: 'Start Reading',
    chooseLanguage: 'Choose Language',
    availability: 'Available in 30 Languages • Read Worldwide',
  },
  es: {
    line1: 'Los imperios se han levantado.',
    line2: 'La verdad ha sido suprimida.',
    line3: 'La profecía se ha cumplido.',
    line4: '¿Qué viene después?',
    startReading: 'Comenzar a leer',
    chooseLanguage: 'Elegir idioma',
    availability: 'Disponible en 30 idiomas • Se lee en todo el mundo',
  },
  de: {
    line1: 'Reiche sind aufgestiegen.',
    line2: 'Die Wahrheit wurde unterdrückt.',
    line3: 'Die Prophetie hat sich erfüllt.',
    line4: 'Was kommt als Nächstes?',
    startReading: 'Jetzt lesen',
    chooseLanguage: 'Sprache wählen',
    availability: 'In 30 Sprachen verfügbar • Weltweit gelesen',
  },
  it: {
    line1: 'Gli imperi sono sorti.',
    line2: 'La verità è stata soppressa.',
    line3: 'La profezia si è adempiuta.',
    line4: 'Cosa viene dopo?',
    startReading: 'Inizia a leggere',
    chooseLanguage: 'Scegli lingua',
    availability: 'Disponibile in 30 lingue • Letto in tutto il mondo',
  },
  nl: {
    line1: 'Rijken zijn opgekomen.',
    line2: 'De waarheid is onderdrukt.',
    line3: 'De profetie is vervuld.',
    line4: 'Wat komt hierna?',
    startReading: 'Begin met lezen',
    chooseLanguage: 'Kies taal',
    availability: 'Beschikbaar in vele talen • Wereldwijd gelezen',
  },
  da: {
    line1: 'Imperier er rejst.',
    line2: 'Sandheden er blevet undertrykt.',
    line3: 'Profetien er blevet opfyldt.',
    line4: 'Hvad kommer nu?',
    startReading: 'Begynd at læse',
    chooseLanguage: 'Vælg sprog',
    availability: 'Tilgængelig på 30 sprog • Læses verden over',
  },
  no: {
    line1: 'Imperier har reist seg.',
    line2: 'Sannheten har blitt undertrykt.',
    line3: 'Profetien har blitt oppfylt.',
    line4: 'Hva kommer nå?',
    startReading: 'Start lesingen',
    chooseLanguage: 'Velg språk',
    availability: 'Tilgjengelig på 30 språk • Lest over hele verden',
  },
  pt: {
    line1: 'Impérios se levantaram.',
    line2: 'A verdade foi suprimida.',
    line3: 'A profecia se cumpriu.',
    line4: 'O que vem a seguir?',
    startReading: 'Começar a ler',
    chooseLanguage: 'Escolher idioma',
    availability: 'Disponível em 30 idiomas • Lido no mundo todo',
  },
  sm: {
    line1: 'Ua tulaʻi emepaea.',
    line2: 'Ua taofia le upu moni.',
    line3: 'Ua taunuu valoaga.',
    line4: 'O le ā le isi mea?',
    startReading: 'Amata Faitau',
    chooseLanguage: 'Filifili Gagana',
    availability: 'E avanoa i gagana e 30 • Faitau i le lalolagi atoa',
  },
  et: {
    line1: 'Impeeriumid on tõusnud.',
    line2: 'Tõde on maha surutud.',
    line3: 'Prohvetikuulutus on täitunud.',
    line4: 'Mis tuleb järgmiseks?',
    startReading: 'Alusta lugemist',
    chooseLanguage: 'Vali keel',
    availability: 'Saadaval 30 keeles • Loetakse kogu maailmas',
  },
  ro: {
    line1: 'Imperiile s-au ridicat.',
    line2: 'Adevărul a fost suprimat.',
    line3: 'Profeția s-a împlinit.',
    line4: 'Ce urmează?',
    startReading: 'Începe citirea',
    chooseLanguage: 'Alege limba',
    availability: 'Disponibil în 30 de limbi • Citit în întreaga lume',
  },
  hr: {
    line1: 'Carstva su se uzdigla.',
    line2: 'Istina je bila potisnuta.',
    line3: 'Proročanstvo se ispunilo.',
    line4: 'Što slijedi?',
    startReading: 'Počni čitati',
    chooseLanguage: 'Odaberi jezik',
    availability: 'Dostupno na 30 jezika • Čita se širom svijeta',
  },
  bg: {
    line1: 'Империи се издигнаха.',
    line2: 'Истината беше потискана.',
    line3: 'Пророчеството се изпълни.',
    line4: 'Какво следва?',
    startReading: 'Започни да четеш',
    chooseLanguage: 'Избери език',
    availability: 'Налична на 30 езика • Чете се по целия свят',
  },
  sk: {
    line1: 'Ríše povstali.',
    line2: 'Pravda bola potláčaná.',
    line3: 'Proroctvo sa naplnilo.',
    line4: 'Čo príde ďalej?',
    startReading: 'Začať čítať',
    chooseLanguage: 'Vybrať jazyk',
    availability: 'Dostupné v 30 jazykoch • Čítané po celom svete',
  },
  cs: {
    line1: 'Říše povstaly.',
    line2: 'Pravda byla potlačena.',
    line3: 'Proroctví se naplnilo.',
    line4: 'Co přijde dál?',
    startReading: 'Začít číst',
    chooseLanguage: 'Vybrat jazyk',
    availability: 'Dostupné ve 30 jazycích • Čteno po celém světě',
  },
  uk: {
    line1: 'Імперії постали.',
    line2: 'Правду було пригнічено.',
    line3: 'Пророцтво здійснилося.',
    line4: 'Що далі?',
    startReading: 'Почати читати',
    chooseLanguage: 'Обрати мову',
    availability: 'Доступно 30 мовами • Читають у всьому світі',
  },
  ru: {
    line1: 'Империи поднимались.',
    line2: 'Истина подавлялась.',
    line3: 'Пророчество исполнилось.',
    line4: 'Что дальше?',
    startReading: 'Начать чтение',
    chooseLanguage: 'Выбрать язык',
    availability: 'Доступно на 30 языках • Читают по всему миру',
  },
  pl: {
    line1: 'Imperia powstały.',
    line2: 'Prawda była tłumiona.',
    line3: 'Proroctwo się wypełniło.',
    line4: 'Co dalej?',
    startReading: 'Rozpocznij czytanie',
    chooseLanguage: 'Wybierz język',
    availability: 'Dostępne w 30 językach • Czytane na całym świecie',
  },
  ar: {
    line1: 'قامت إمبراطوريات.',
    line2: 'قُمِعت الحقيقة.',
    line3: 'تحققت النبوءة.',
    line4: 'ماذا بعد؟',
    startReading: 'ابدأ القراءة',
    chooseLanguage: 'اختر اللغة',
    availability: 'متاح بـ30 لغة • يُقرأ حول العالم',
  },
  am: {
    line1: 'ንጉሳት ተነሱ።',
    line2: 'እውነት ተገፋች።',
    line3: 'ትንቢት ተፈጸመ።',
    line4: 'ቀጣይ ምንድን ነው?',
    startReading: 'ማንበብ ጀምር',
    chooseLanguage: 'ቋንቋ ምረጥ',
    availability: 'በ30 ቋንቋዎች ይገኛል • በዓለም አቀፍ ይነበባል',
  },
  zh: {
    line1: '帝国曾兴起。',
    line2: '真理曾被压制。',
    line3: '预言已经应验。',
    line4: '接下来会发生什么？',
    startReading: '开始阅读',
    chooseLanguage: '选择语言',
    availability: '提供30种语言 • 全球阅读',
  },
  ko: {
    line1: '제국들이 일어났습니다.',
    line2: '진리는 억눌렸습니다.',
    line3: '예언은 성취되었습니다.',
    line4: '다음은 무엇일까요?',
    startReading: '읽기 시작',
    chooseLanguage: '언어 선택',
    availability: '30개 언어 제공 • 전 세계에서 읽습니다',
  },
  ja: {
    line1: '帝国は興り、',
    line2: '真理は抑えられ、',
    line3: '預言は成就しました。',
    line4: '次に何が来るのか？',
    startReading: '読み始める',
    chooseLanguage: '言語を選ぶ',
    availability: '30言語で提供 • 世界中で読まれています',
  },
  sr: {
    line1: 'Царства су се уздизала.',
    line2: 'Истина је била потискивана.',
    line3: 'Пророштво се испунило.',
    line4: 'Шта следи?',
    startReading: 'Почни читање',
    chooseLanguage: 'Изабери језик',
    availability: 'Доступно на 30 језика • Чита се широм света',
  },
  fa: {
    line1: 'امپراتوری‌ها برخاسته‌اند.',
    line2: 'حقیقت سرکوب شده است.',
    line3: 'نبوت تحقق یافته است.',
    line4: 'بعد چه می‌آید؟',
    startReading: 'شروع مطالعه',
    chooseLanguage: 'انتخاب زبان',
    availability: 'در ۳۰ زبان موجود است • در سراسر جهان خوانده می‌شود',
  },
  af: {
    line1: 'Ryke het opgestaan.',
    line2: 'Die waarheid is onderdruk.',
    line3: 'Profesie is vervul.',
    line4: 'Wat kom volgende?',
    startReading: 'Begin lees',
    chooseLanguage: 'Kies taal',
    availability: 'Beskikbaar in 30 tale • Wêreldwyd gelees',
  },
  hi: {
    line1: 'साम्राज्य उठे हैं।',
    line2: 'सत्य दबाया गया है।',
    line3: 'भविष्यवाणी पूरी हो चुकी है।',
    line4: 'अब आगे क्या?',
    startReading: 'पढ़ना शुरू करें',
    chooseLanguage: 'भाषा चुनें',
    availability: '30 भाषाओं में उपलब्ध • दुनिया भर में पढ़ी जाती है',
  },
  bn: {
    line1: 'সাম্রাজ্য উঠেছে।',
    line2: 'সত্যকে দমন করা হয়েছে।',
    line3: 'ভবিষ্যদ্বাণী পূর্ণ হয়েছে।',
    line4: 'এরপর কী?',
    startReading: 'পড়া শুরু করুন',
    chooseLanguage: 'ভাষা বেছে নিন',
    availability: '৩০টি ভাষায় উপলভ্য • বিশ্বজুড়ে পড়া হয়',
  },
  id: {
    line1: 'Kerajaan telah bangkit.',
    line2: 'Kebenaran telah ditekan.',
    line3: 'Nubuat telah digenapi.',
    line4: 'Apa yang berikutnya?',
    startReading: 'Mulai membaca',
    chooseLanguage: 'Pilih bahasa',
    availability: 'Tersedia dalam 30 bahasa • Dibaca di seluruh dunia',
  },
  ur: {
    line1: 'سلطنتیں اُبھری ہیں۔',
    line2: 'سچائی دبائی گئی ہے۔',
    line3: 'پیشگوئی پوری ہو چکی ہے۔',
    line4: 'اب آگے کیا؟',
    startReading: 'مطالعہ شروع کریں',
    chooseLanguage: 'زبان منتخب کریں',
    availability: '30 زبانوں میں دستیاب • دنیا بھر میں پڑھی جاتی ہے',
  },
  fr: {
    line1: 'Des empires se sont levés.',
    line2: 'La vérité a été étouffée.',
    line3: 'La prophétie s’est accomplie.',
    line4: 'Que vient-il ensuite ?',
    startReading: 'Commencer la lecture',
    chooseLanguage: 'Choisir la langue',
    availability: 'Disponible en 30 langues • Lu dans le monde entier',
  },
  sq: {
    line1: 'Perandori janë ngritur.',
    line2: 'E vërteta është shtypur.',
    line3: 'Profecia është përmbushur.',
    line4: 'Çfarë vjen më pas?',
    startReading: 'Fillo leximin',
    chooseLanguage: 'Zgjidh gjuhën',
    availability: 'Në dispozicion në 31 gjuhë • Lexohet në mbarë botën',
  },
  hu: {
    line1: 'Birodalmak emelkedtek fel.',
    line2: 'Az igazságot elnyomták.',
    line3: 'A prófécia beteljesedett.',
    line4: 'Mi következik ezután?',
    startReading: 'Olvasás indítása',
    chooseLanguage: 'Nyelv kiválasztása',
    availability: '31 nyelven elérhető • Világszerte olvassák',
  },
  el: {
    line1: 'Αυτοκρατορίες υψώθηκαν.',
    line2: 'Η αλήθεια καταπνίγηκε.',
    line3: 'Η προφητεία εκπληρώθηκε.',
    line4: 'Τι ακολουθεί τώρα;',
    startReading: 'Έναρξη ανάγνωσης',
    chooseLanguage: 'Επιλογή γλώσσας',
    availability: 'Διαθέσιμο σε πολλές γλώσσες • Διαβάζεται παγκοσμίως',
  },
};

const COPY_TOAST_LABELS: Record<string, string> = {
  en: 'Copied',
  es: 'Copiado',
  de: 'Kopiert',
  it: 'Copiato',
  nl: 'Gekopieerd',
  da: 'Kopieret',
  no: 'Kopiert',
  pt: 'Copiado',
  sm: 'Ua kopi',
  et: 'Kopeeritud',
  ro: 'Copiat',
  hr: 'Kopirano',
  bg: 'Копирано',
  sk: 'Skopírované',
  cs: 'Zkopírováno',
  uk: 'Скопійовано',
  ru: 'Скопировано',
  pl: 'Skopiowano',
  ar: 'تم النسخ',
  am: 'ተቀድቷል',
  zh: '已复制',
  ko: '복사됨',
  ja: 'コピーしました',
  sr: 'Копирано',
  fa: 'کپی شد',
  af: 'Gekopieer',
  hi: 'कॉपी किया गया',
  bn: 'কপি হয়েছে',
  id: 'Disalin',
  ur: 'کاپی ہو گیا',
  fr: 'Copié',
  sq: 'U kopjua',
  hu: 'Kimásolva',
  el: 'Αντιγράφηκε',
};

const AUDIO_AVAILABLE_LABELS: Record<string, string> = {
  en: 'Audio available',
  es: 'Audio disponible',
  de: 'Audio verfügbar',
  it: 'Audio disponibile',
  nl: 'Audio beschikbaar',
  da: 'Lyd tilgængelig',
  no: 'Lyd tilgjengelig',
  pt: 'Áudio disponível',
  sm: 'E avanoa le leo',
  et: 'Heli saadaval',
  ro: 'Audio disponibil',
  hr: 'Audio dostupan',
  bg: 'Налично аудио',
  sk: 'Dostupné audio',
  cs: 'Dostupné audio',
  uk: 'Доступне аудіо',
  ru: 'Аудио доступно',
  pl: 'Dostępne audio',
  ar: 'الصوت متاح',
  am: 'ድምጽ ይገኛል',
  zh: '有音频',
  ko: '오디오 사용 가능',
  ja: '音声あり',
  sr: 'Аудио доступан',
  fa: 'صوت در دسترس است',
  af: 'Klank beskikbaar',
  hi: 'ऑडियो उपलब्ध',
  bn: 'অডিও উপলভ্য',
  id: 'Audio tersedia',
  ur: 'آڈیو دستیاب ہے',
  fr: 'Audio disponible',
  sq: 'Audio i disponuesh',
  hu: 'Hanganyag elérhető',
  el: 'Διαθέσιμο ηχητικό',
};

function getAudioAvailableLabel(folder: string) {
  const code = (LANGUAGE_ABBREV[folder] || 'en').toLowerCase();
  return AUDIO_AVAILABLE_LABELS[code] || AUDIO_AVAILABLE_LABELS.en;
}

function getDeveloperCreditText(folder: string) {
  const code = (LANGUAGE_ABBREV[folder] || 'en').toLowerCase();
  const prefix = DEVELOPER_BY_LABELS[code] || DEVELOPER_BY_LABELS.en;
  return `${prefix} ${DEVELOPER_NAME}`;
}

function getContactWhatsAppNumber(folder: string) {
  return CONTACT_WHATSAPP_NUMBERS[folder] || DEFAULT_CONTACT_WHATSAPP_NUMBER;
}

function getContactWhatsAppDisplayNumber(folder: string) {
  return CONTACT_WHATSAPP_DISPLAY_NUMBERS[folder] || `+${getContactWhatsAppNumber(folder)}`;
}

function getContactWhatsAppAutoMessage(folder: string) {
  const code = (LANGUAGE_ABBREV[folder] || 'en').toLowerCase();
  return CONTACT_WHATSAPP_AUTO_MESSAGES[code] || CONTACT_WHATSAPP_AUTO_MESSAGES.en;
}

const COPYRIGHTS: Record<string, string> = {
  // Use the localized book title (derived from the language folder) as the copyright holder.
  ...Object.fromEntries(LANGUAGE_FOLDERS.map(f => [f, `© 2026 ${getBookTitleFromFolder(f)}`]))
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function slugify(input: string) {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function slugifyAscii(input: string) {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function transliterateForRoute(input: string) {
  const map: Record<string, string> = {
    А: 'A', а: 'a', Б: 'B', б: 'b', В: 'V', в: 'v', Г: 'G', г: 'g',
    Д: 'D', д: 'd', Ђ: 'Dj', ђ: 'dj', Е: 'E', е: 'e', Ё: 'E', ё: 'e',
    Ж: 'Zh', ж: 'zh', З: 'Z', з: 'z', И: 'I', и: 'i', Й: 'I', й: 'i',
    Ј: 'J', ј: 'j', К: 'K', к: 'k', Л: 'L', л: 'l', Љ: 'Lj', љ: 'lj',
    М: 'M', м: 'm', Н: 'N', н: 'n', Њ: 'Nj', њ: 'nj', О: 'O', о: 'o',
    П: 'P', п: 'p', Р: 'R', р: 'r', С: 'S', с: 's', Т: 'T', т: 't',
    Ћ: 'C', ћ: 'c', У: 'U', у: 'u', Ф: 'F', ф: 'f', Х: 'H', х: 'h',
    Ц: 'C', ц: 'c', Ч: 'Ch', ч: 'ch', Џ: 'Dz', џ: 'dz', Ш: 'Sh', ш: 'sh',
    Ы: 'Y', ы: 'y', Э: 'E', э: 'e', Ю: 'Yu', ю: 'yu', Я: 'Ya', я: 'ya',
    Ь: '', ь: '', Ъ: '', ъ: 'a', І: 'I', і: 'i', Ї: 'Yi', ї: 'yi',
    Є: 'Ye', є: 'ye', Ґ: 'G', ґ: 'g',
  };

  return Array.from(input || '').map((ch) => map[ch] ?? ch).join('');
}

function getChapterNumber(title: string) {
  const t = (title || '').trim();
  const m = t.match(/\bchapter\s+(\d+)\b/i);
  if (m && m[1]) return Number(m[1]);
  const n = t.match(/^(\d{1,3})\s*[—–-]/);
  if (n && n[1]) return Number(n[1]);
  return null;
}

function stripChapterPrefix(title: string) {
  return (title || '')
    .replace(/^\s*chapter\s+\d+\s*[-—–:]*\s*/i, '')
    .replace(/^\s*\d{1,3}\s*[—–:-]\s*/i, '')
    .trim();
}

const ROUTE_CHAPTER_PREFIX_OVERRIDES: Record<string, string> = {
  sr: 'poglavlje',
  ar: 'alfasl',
  fa: 'fasl',
  am: 'meiraf',
  zh: 'zhang',
  ko: 'jang',
  ja: 'sho',
  hi: 'paath',
  bn: 'oddhay',
  ur: 'bab',
};

function getChapterRoutePrefix(langKey: string) {
  const code = (LANGUAGE_ABBREV[langKey] || '').toLowerCase();
  const forcedPrefix = ROUTE_CHAPTER_PREFIX_OVERRIDES[code];
  if (forcedPrefix) return forcedPrefix;
  const localized = (LANGUAGE_CHAPTER_LABELS[langKey] || 'Chapter').trim();
  const transliterated = transliterateForRoute(localized);
  return slugifyAscii(transliterated) || slugify(localized) || 'chapter';
}

function getChapterRouteSlug(langKey: string, chapterTitle: string, chapterNumber: number) {
  const prefix = getChapterRoutePrefix(langKey);
  const stripped = stripChapterPrefix(chapterTitle);
  const transliteratedTitle = transliterateForRoute(stripped || chapterTitle || '')
    .replace(new RegExp(`^\\s*${prefix}\\s+[ivxlcdm\\d]+\\s*[-—–:]*\\s*`, 'i'), '')
    .replace(/^\s*[ivxlcdm\d]+\s*[-—–:]+\s*/i, '')
    .trim();
  const titleSlug = slugifyAscii(transliteratedTitle);
  return titleSlug || `${prefix}-${chapterNumber}`;
}

const LANG_SLUG_TO_FOLDER: Record<string, string> = Object.fromEntries(
  LANGUAGE_FOLDERS.flatMap((folder) => {
    const localized = LANGUAGE_URL_NAMES[folder] || LANGUAGE_NAMES[folder] || getBookTitleFromFolder(folder) || folder;
    const nameSlug = slugifyAscii(localized);
    const abbrSlug = (LANGUAGE_ABBREV[folder] || '').toLowerCase();
    return [
      nameSlug ? [nameSlug, folder] : null,
      abbrSlug ? [abbrSlug, folder] : null,
    ].filter(Boolean) as Array<[string, string]>;
  })
);

// Accept commonly used Serbian country-style slug alias.
LANG_SLUG_TO_FOLDER.rs = SERBIAN_FOLDER;

const LANG_ABBREV_TO_FOLDER: Record<string, string> = Object.fromEntries(
  Object.entries(LANGUAGE_ABBREV).map(([folder, code]) => [String(code || '').toLowerCase(), folder])
);

function getInitialLanguageFolder() {
  const path = (window.location.pathname || '/').trim();
  const firstSeg = path.match(/^\/([^/]+)/)?.[1]?.toLowerCase();
  if (firstSeg && LANG_SLUG_TO_FOLDER[firstSeg]) {
    return LANG_SLUG_TO_FOLDER[firstSeg];
  }

  const preferred = (Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language]
  )
    .map((v) => String(v || '').trim().toLowerCase())
    .filter(Boolean);

  for (const locale of preferred) {
    const base = locale.split('-')[0];
    const candidates = [locale, base];

    // Norwegian browser locales are commonly nb/nn; map them to our no folder.
    if (base === 'nb' || base === 'nn') candidates.push('no');

    for (const code of candidates) {
      const folder = LANG_ABBREV_TO_FOLDER[code];
      if (folder) return folder;
    }
  }

  return LANGUAGE_FOLDERS[0];
}

function getHighlightedHtml(html: string, q: string | null) {
  if (!q) return html || '';
  try {
    const esc = escapeRegExp(q);
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    // Remove any <style> and external stylesheet links from the fragment to avoid
    // ebook styles leaking into the app UI when we inject the HTML.
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());
    // Also strip inline styles, classes and event handlers from all nodes so
    // the ebook's CSS/JS can't change layout or selection behaviour.
    doc.querySelectorAll('*').forEach((el) => {
      if ((el as Element).hasAttribute('style')) (el as Element).removeAttribute('style');
      if ((el as Element).hasAttribute('class')) (el as Element).removeAttribute('class');
      // remove inline event handlers
      Array.from((el as Element).attributes).forEach((a) => {
        if (a.name.startsWith('on')) (el as Element).removeAttribute(a.name);
      });
    });
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null as any);
    let n = walker.nextNode();
    while (n) {
      const t = n as Text;
      const text = t.nodeValue || '';
      const frag = doc.createDocumentFragment();
      let last = 0;
      const r = new RegExp(esc, 'gi');
      let m: RegExpExecArray | null;
      while ((m = r.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
        const mark = doc.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (r.lastIndex === m.index) r.lastIndex++;
      }
      if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
      if (frag.childNodes.length) t.parentNode?.replaceChild(frag, t);
      n = walker.nextNode();
    }
    return doc.body.innerHTML;
  } catch {
    return html || '';
  }
}

function addParagraphIds(html: string, chapterNumber: number) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    const paragraphs = doc.querySelectorAll('p, blockquote');
    paragraphs.forEach((el, idx) => {
      if (!el.id) {
        el.id = `gc-p-${chapterNumber}-${idx + 1}`;
      }
    });
    return doc.body.innerHTML;
  } catch {
    return html || '';
  }
}

function extractExternalReadLinkFromChapterHtml(html: string) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    const anchor = doc.querySelector('a[href*="text.egwwritings.org/read/"]') as HTMLAnchorElement | null;
    if (!anchor) return null;
    const href = (anchor.getAttribute('href') || '').trim();
    if (!href) return null;
    const title = (doc.querySelector('h1,h2,h3')?.textContent || '').trim();
    return { href, title };
  } catch {
    return null;
  }
}

function extractEgwReadableChapterHtml(rawHtml: string, fallbackTitle: string, preferredTitle?: string | null) {
  try {
    const doc = new DOMParser().parseFromString(rawHtml || '', 'text/html');

    let title = (preferredTitle || '').trim();
    if (!title) {
      title = (doc.querySelector('h1')?.textContent || '').trim();
    }
    if (!title) {
      const t = (doc.querySelector('title')?.textContent || '').trim();
      title = t.split('|')[0]?.trim() || '';
    }
    if (!title) title = fallbackTitle || 'Kapitulli';

    const contentRoot = doc.querySelector('#r-pl');
    if (!contentRoot) return '';

    const blocks = Array.from(contentRoot.querySelectorAll('p.para, blockquote')) as HTMLElement[];
    const paras = blocks
      .map((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.refCode, .anchor-link, .page-break').forEach((n) => n.remove());
        const txt = (clone.textContent || '').replace(/\s+/g, ' ').trim();
        if (!txt) return '';
        return `<p>${escapeHtml(txt)}</p>`;
      })
      .filter(Boolean);

    if (!paras.length) return '';
    return `<div><h2 class="chapterhead">${escapeHtml(title)}</h2>${paras.join('')}</div>`;
  } catch {
    return '';
  }
}

function findAppendixChapterIndex(entries: TocEntry[]) {
  if (!Array.isArray(entries) || !entries.length) return -1;
  const appendixPatterns = [
    /\bappendix\b/i,
    /\bappendice\b/i,
    /\banexo\b/i,
    /\bannex\b/i,
    /\banhang\b/i,
    /\bprilog\b/i,
    /\bдодаток\b/i,
    /\bприложение\b/i,
    /\b附录\b/i,
  ];

  const idx = entries.findIndex((e) => appendixPatterns.some((re) => re.test((e?.title || '').trim())));
  return idx;
}

function cleanParagraphRefsAndLinkAppendix(
  html: string,
  appendixPath: string | null,
  isAppendixChapter: boolean
) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    const blocks = Array.from(doc.querySelectorAll('p, blockquote'));
    const appendixWordRe = /\b(appendix|appendice|appendixen|anexo|annex|anhang|prilog|додаток|приложение)\b|附录/iu;

    blocks.forEach((el) => {
      const text = el.textContent || '';

      // Remove bracketed page markers like [447] from displayed paragraph text.
      if (/\[\d{1,4}\]/.test(text)) {
        el.innerHTML = (el.innerHTML || '').replace(/\s*\[(\d{1,4})\]/g, '');
      }

      // In non-appendix chapters, convert "(see Appendix)" into a deep link
      // to the matching page marker inside the appendix chapter.
      if (!isAppendixChapter && appendixPath) {
        const pageMatch = text.match(/\[(\d{1,4})\]/);
        const hasAppendixParen = /\([^)]*\)/.test(text) && appendixWordRe.test(text);

        if (pageMatch && pageMatch[1] && hasAppendixParen) {
          const pageNum = pageMatch[1];
          const target = `${appendixPath}#app-page-${pageNum}`;

          // Link appendix keyword inside the first parenthetical appendix reference,
          // preserving localized surrounding text (e.g., "see", "voir", etc.).
          if (!el.querySelector(`a[href="${target}"]`)) {
            el.innerHTML = (el.innerHTML || '').replace(/\(([^)]*)\)/u, (full, inner) => {
              if (!appendixWordRe.test(inner)) return full;
              const linkedInner = String(inner).replace(appendixWordRe, (w: string) => `<a href="${target}">${w}</a>`);
              return `(${linkedInner})`;
            });
          }
        }
      }

      // In appendix chapter, inject anchors for "Page N" so links can land correctly.
      if (isAppendixChapter) {
        const pg = (el.textContent || '').match(/\bpage\s+(\d{1,4})\b/i);
        if (pg && pg[1]) {
          const anchorId = `app-page-${pg[1]}`;
          if (!doc.getElementById(anchorId)) {
            const anchor = doc.createElement('span');
            anchor.id = anchorId;
            anchor.setAttribute('aria-hidden', 'true');
            el.prepend(anchor);
          }
        }
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html || '';
  }
}

function applyDropcap(html: string, langKey: string, chapterIndex: number, toc: TocEntry[]) {
  try {
    const name = LANGUAGE_NAMES[langKey] || '';
    // Do not apply dropcap for Arabic/Chinese languages
    // (RTL and CJK layouts often need custom typography handling)
    if (name.toLowerCase() === 'arabic' || name.toLowerCase() === 'farsi' || name.toLowerCase() === 'persian' || name.toLowerCase() === 'urdu' || langKey === CHINESE_FOLDER || langKey === JAPANESE_FOLDER || langKey === FARSI_FOLDER || langKey === HINDI_FOLDER || langKey === BENGALI_FOLDER || langKey === URDU_FOLDER) return html;
    if (typeof chapterIndex !== 'number' || chapterIndex < 0) return html;
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    // Strip any styles or stylesheet links from the parsed chapter to avoid
    // overriding the main app styles when we insert the processed HTML.
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());
    // Also sanitize inline styles/classes/event handlers so the imported HTML
    // cannot prevent selection or shift layout.
    // Remove inline styles and event handlers, but preserve our markup classes
    // that are used for highlighting (`search-highlight`) and the dropcap.
    doc.querySelectorAll('*').forEach((el) => {
      if ((el as Element).hasAttribute('style')) (el as Element).removeAttribute('style');
      if ((el as Element).hasAttribute('class')) {
        const cls = ((el as Element).getAttribute('class') || '').split(/\s+/);
        const isHighlight = el.tagName === 'MARK' && cls.includes('search-highlight');
        const isDropcap = el.tagName === 'SPAN' && cls.includes('dropcap');
        if (!isHighlight && !isDropcap) (el as Element).removeAttribute('class');
      }
      Array.from((el as Element).attributes).forEach((a) => {
        if (a.name.startsWith('on')) (el as Element).removeAttribute(a.name);
      });
    });
    // Prefer the first paragraph (or blockquote) after the chapter heading
    let p: Element | null = null;
    const heading = doc.body.querySelector('h1,h2,h3,h4,h5,h6');
    // If the chapter heading indicates meta sections like "Information about this Book",
    // "Introduction", "Preface/Foreword", or "Appendix", do not apply the visual dropcap.
    if (heading) {
      const ht = (heading.textContent || '').trim();
      if (/information\s+about.*book/i.test(ht) || /^\s*introduction\b/i.test(ht) || /\b(preface|foreword|appendix)\b/i.test(ht)) return html;
    }
    // Also check the TOC entry (if provided) for Preface/Introduction/Appendix and skip
    if (Array.isArray(toc) && toc[chapterIndex] && /^(?:\s*(?:preface|introduction|foreword|appendix)\b)/i.test((toc[chapterIndex].title || '').trim())) {
      return html;
    }
    if (heading) {
      // If transformChapterHeading wrapped the heading, prefer the wrapper's
      // next sibling; otherwise start from heading.nextElementSibling. Skip
      // any interim .chapter-heading wrappers so we land on the real content.
      let sib: Element | null = null;
      if (heading.parentElement && (heading.parentElement as Element).classList.contains('chapter-heading')) {
        sib = heading.parentElement.nextElementSibling as Element | null;
      } else {
        sib = heading.nextElementSibling as Element | null;
      }
      while (sib) {
        if ((sib as Element).classList && (sib as Element).classList.contains('chapter-heading')) {
          sib = sib.nextElementSibling as Element | null;
          continue;
        }
        if (/^P$/i.test(sib.tagName) || /^BLOCKQUOTE$/i.test(sib.tagName) || (sib.tagName === 'DIV' && sib.textContent && sib.textContent.trim().length)) {
          p = sib;
          break;
        }
        sib = sib.nextElementSibling as Element | null;
      }
    }
    // fallback: prefer a real paragraph or blockquote; only if none exist
    // pick a div that isn't the chapter-heading wrapper.
    if (!p) p = doc.body.querySelector('p, blockquote');
    if (!p) p = doc.body.querySelector('div:not(.chapter-heading)');
    if (!p) return html;
    const walker = doc.createTreeWalker(p, NodeFilter.SHOW_TEXT, null as any);
    let tn = walker.nextNode();
    while (tn) {
      const txt = tn.nodeValue || '';
      const trimmed = txt.replace(/^\s+/, '');
      if (trimmed.length) {
        // Preserve an initial opening quote as part of the dropcap if present
        const quoteChars = ['"', '“', '”', '«', '»', '\u2018', '\u2019', '\u201E'];
        let take = 1;
        if (quoteChars.includes(trimmed[0]) && trimmed.length >= 2) take = 2;
        const leading = txt.match(/^\s*/)?.[0] || '';
        const drop = txt.substr(leading.length, take);
        const rest = txt.substr(leading.length + take);
        const frag = doc.createDocumentFragment();
        const span = doc.createElement('span');
        // Insert a stylized dropcap span (CSS will render it to span up to ~3 lines)
        span.className = 'dropcap';
        span.textContent = drop;
        frag.appendChild(doc.createTextNode(leading));
        frag.appendChild(span);
        if (rest.length) frag.appendChild(doc.createTextNode(rest));
        tn.parentNode?.replaceChild(frag, tn);
        break;
      }
      tn = walker.nextNode();
    }
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

function transformChapterHeading(html: string) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    // If we've previously wrapped headings into a .chapter-heading, convert
    // them back into a single heading like "Chapter 4—The Waldenses" so the
    // original inline style is restored.
    const wrappers = Array.from(doc.body.querySelectorAll('.chapter-heading'));
    if (wrappers.length) {
      wrappers.forEach((wrapper) => {
        const numEl = wrapper.querySelector('.chapter-number');
        const titleEl = wrapper.querySelector('.chapter-title');
        let level = 'h2';
        if (titleEl && (titleEl.tagName || '').match(/^H[1-6]$/i)) level = titleEl.tagName.toLowerCase();
        const heading = doc.createElement(level);
        heading.className = 'chapterhead';
        const numText = (numEl && (numEl.textContent || '').trim()) || '';
        const titleText = (titleEl && (titleEl.textContent || '').trim()) || '';
        if (numText && titleText) {
          // Normalize label to title-case "Chapter N" then a dash and the title.
          // Wrap the "Chapter N" portion in a span so we can style it separately
          // (unbold the label while keeping the title bold).
          const normalizedNum = numText.replace(/^CHAPTER\s*/i, 'Chapter ');
          const numSpan = doc.createElement('span');
          numSpan.className = 'chapter-num-inline';
          numSpan.textContent = normalizedNum;
          heading.appendChild(numSpan);
          const sep = doc.createElement('span');
          sep.className = 'chapter-sep-inline';
          sep.textContent = ' — ';
          heading.appendChild(sep);
          const titleSpan = doc.createElement('span');
          titleSpan.className = 'chapter-title-inline';
          titleSpan.textContent = titleText;
          heading.appendChild(titleSpan);
        } else if (titleText) {
          heading.textContent = titleText;
        } else {
          heading.textContent = (wrapper.textContent || '').trim();
        }
        wrapper.parentNode?.replaceChild(heading, wrapper);
      });
      return doc.body.innerHTML;
    }
    // No wrapper present — nothing to transform.
    return html;
  } catch {
    return html;
  }
}

function escapeHtml(input: string) {
  return (input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DUTCH_EXTERNAL_CHAPTERS: Array<{ title: string; href: string }> = [
  { title: 'Voorwoord', href: 'https://text.egwwritings.org/read/11453.7' },
  { title: 'Inleiding', href: 'https://text.egwwritings.org/read/11453.24' },
  { title: 'Hoofdstuk 1 — De Verwoesting van Jeruzalem', href: 'https://text.egwwritings.org/read/11453.69' },
  { title: 'Hoofdstuk 2 — Vervolging in de Eerste Eeuwen', href: 'https://text.egwwritings.org/read/11453.165' },
  { title: 'Hoofdstuk 3 — De Afval', href: 'https://text.egwwritings.org/read/11453.210' },
  { title: 'Hoofdstuk 4 — De Waldenzen', href: 'https://text.egwwritings.org/read/11453.273' },
  { title: 'Hoofdstuk 5 — Johannes Wycliffe', href: 'https://text.egwwritings.org/read/11453.358' },
  { title: 'Hoofdstuk 6 — Huss en Jerome', href: 'https://text.egwwritings.org/read/11453.443' },
  { title: 'Hoofdstuk 7 — Luthers Afscheiding van Rome', href: 'https://text.egwwritings.org/read/11453.563' },
  { title: 'Hoofdstuk 8 — Luther voor de Rijksdag', href: 'https://text.egwwritings.org/read/11453.688' },
  { title: 'Hoofdstuk 9 — De Zwitserse Hervormer', href: 'https://text.egwwritings.org/read/11453.816' },
  { title: 'Hoofdstuk 10 — Voortgang van de Hervorming in Duitschland', href: 'https://text.egwwritings.org/read/11453.882' },
  { title: 'Hoofdstuk 11 — Protest van de Vorsten', href: 'https://text.egwwritings.org/read/11453.948' },
  { title: 'Hoofdstuk 12 — De Hervorming in Frankrijk', href: 'https://text.egwwritings.org/read/11453.1019' },
  { title: 'Hoofdstuk 13 — In de Nederlanden en Skandinavië', href: 'https://text.egwwritings.org/read/11453.1143' },
  { title: 'Hoofdstuk 14 — Latere Engelse Hervormers', href: 'https://text.egwwritings.org/read/11453.1181' },
  { title: 'Hoofdstuk 15 — De Bijbel en de Franse Revolutie', href: 'https://text.egwwritings.org/read/11453.1280' },
  { title: 'Hoofdstuk 16 — De Pelgrimvaders', href: 'https://text.egwwritings.org/read/11453.1397' },
  { title: 'Hoofdstuk 17 — Voorlopers van de Morgen', href: 'https://text.egwwritings.org/read/11453.1449' },
  { title: 'Hoofdstuk 18 — Een Amerikaanse Hervormer', href: 'https://text.egwwritings.org/read/11453.1538' },
  { title: 'Hoofdstuk 19 — Licht in de Duisternis', href: 'https://text.egwwritings.org/read/11453.1655' },
  { title: 'Hoofdstuk 20 — Een Grote Godsdienstige Opwekking', href: 'https://text.egwwritings.org/read/11453.1710' },
  { title: 'Hoofdstuk 21 — Een Waarschuwing Verworpen', href: 'https://text.egwwritings.org/read/11453.1803' },
  { title: 'Hoofdstuk 22 — Profetieen Vervuld', href: 'https://text.egwwritings.org/read/11453.1883' },
  { title: 'Hoofdstuk 23 — Wat is het Heiligdom?', href: 'https://text.egwwritings.org/read/11453.1967' },
  { title: 'Hoofdstuk 24 — In het Heilige der Heiligen', href: 'https://text.egwwritings.org/read/11453.2037' },
  { title: 'Hoofdstuk 25 — Gods Wet Onveranderlik', href: 'https://text.egwwritings.org/read/11453.2081' },
  { title: 'Hoofdstuk 26 — Een Hervormingswerk', href: 'https://text.egwwritings.org/read/11453.2167' },
  { title: 'Hoofdstuk 27 — Opwekkingen in de Laatste Tijd', href: 'https://text.egwwritings.org/read/11453.2216' },
  { title: 'Hoofdstuk 28 — Het Onderzoekend Oordeel', href: 'https://text.egwwritings.org/read/11453.2303' },
  { title: 'Hoofdstuk 29 — De Oorsprong van het Kwaad', href: 'https://text.egwwritings.org/read/11453.2366' },
  { title: 'Hoofdstuk 30 — Vijandschap tussen de Mens en Satan', href: 'https://text.egwwritings.org/read/11453.2428' },
  { title: 'Hoofdstuk 31 — Het Werk van Boze Geesten', href: 'https://text.egwwritings.org/read/11453.2459' },
  { title: 'Hoofdstuk 32 — Strikken van de Satan', href: 'https://text.egwwritings.org/read/11453.2492' },
  { title: 'Hoofdstuk 33 — Het Eerste Grote Bedrog', href: 'https://text.egwwritings.org/read/11453.2561' },
  { title: 'Hoofdstuk 34 — Spiritualisme', href: 'https://text.egwwritings.org/read/11453.2658' },
  { title: 'Hoofdstuk 35 — Doeleinden van het Pausdom', href: 'https://text.egwwritings.org/read/11453.2709' },
  { title: 'Hoofdstuk 36 — De Naderende Strijd', href: 'https://text.egwwritings.org/read/11453.2806' },
  { title: 'Hoofdstuk 37 — De Schriften een Bron van Veiligheid', href: 'https://text.egwwritings.org/read/11453.2858' },
  { title: 'Hoofdstuk 38 — De Laatste Waarschuwing', href: 'https://text.egwwritings.org/read/11453.2907' },
  { title: 'Hoofdstuk 39 — “De Tijd der Benauwdheid”', href: 'https://text.egwwritings.org/read/11453.2951' },
  { title: 'Hoofdstuk 40 — Gods Volk Verlost', href: 'https://text.egwwritings.org/read/11453.3055' },
  { title: 'Hoofdstuk 41 — Verwoesting van de Aarde', href: 'https://text.egwwritings.org/read/11453.3136' },
  { title: 'Hoofdstuk 42 — Het Einde van de Strijd', href: 'https://text.egwwritings.org/read/11453.3181' },
  { title: 'Aanhangsel', href: 'https://text.egwwritings.org/read/11453.3268' },
  { title: 'Algemene aantekeningen', href: 'https://text.egwwritings.org/read/11453.3269' },
  { title: 'De katholieke encyclopedie', href: 'https://text.egwwritings.org/read/11453.3271' },
  { title: 'Biografiese aantekeningen', href: 'https://text.egwwritings.org/read/11453.3385' },
];

function buildExternalChapterBook(entries: Array<{ title: string; href: string }>, linkLabel: string) {
  const toc = entries.map((entry, idx) => ({ title: entry.title, href: `#external-ch-${idx + 1}` }));
  const chapterIds = toc.map((entry) => entry.href.replace(/^#/, ''));
  const chapterHtml = entries.map((entry, idx) => {
    const chapterId = chapterIds[idx];
    return `<div id="${chapterId}"><h2 class="chapterhead">${escapeHtml(entry.title)}</h2><p><a href="${escapeHtml(entry.href)}" target="_blank" rel="noreferrer">${escapeHtml(linkLabel)}</a></p></div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

const EXTERNAL_HYDRATION_LANGS = new Set<string>([DUTCH_FOLDER]);

function parseAmharicBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterHeading = /^\s*ምዕራፍ\s+(\S+)\s*[-—–]\s*(.+?)\s*$/u;
  const normalizeAmharicTitle = (s: string) =>
    (s || '')
      .replace(/^\s*[-:]+\s*/u, '')
      .replace(/\s*[-:]+\s*$/gu, '')
      .replace(/[*]+.*$/u, '')
      .replace(/\s*[-—–]\s*/gu, '—')
      .replace(/\s+/gu, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];

  let introLines: string[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(chapterHeading);
    if (match) {
      pushCurrent();
      chapterCount += 1;
      const chapterNo = (match[1] || '').trim();
      const chapterTitle = (match[2] || '').trim();
      current = {
        id: `amh-ch-${chapterCount}`,
        title: normalizeAmharicTitle(`ምዕራፍ ${chapterNo}—${chapterTitle}`),
        lines: [],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  pushCurrent();

  const introClean = introLines.join('\n').trim();
  if (introClean) {
    sections.unshift({
      id: 'amh-intro',
      title: 'መቅድም',
      lines: introLines,
    });
  }

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) {
        flush();
      } else {
        buf.push(t);
      }
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const headingTag = s.id === 'amh-intro' ? 'h2' : 'h2';
    const heading = `<${headingTag} class="chapterhead">${escapeHtml(s.title)}</${headingTag}>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseChineseBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterHeading = /^\s*第\s*([0-9０-９]{1,3}|[一二三四五六七八九十百千〇零两兩]{1,6})\s*章\s*[—–\-：:]?\s*(.*?)\s*$/;
  const gcsMarker = /\bGCS\s*\d+(?:\.\d+)?\b/gi;
  const normalizeChineseTitle = (chapterNo: string, chapterTail: string) => {
    const tail = (chapterTail || '')
      .replace(/[*]+.*$/u, '')
      .replace(/^\s*[-—–:：]+\s*/u, '')
      .replace(/\s+/gu, ' ')
      .trim();
    return tail ? `第${(chapterNo || '').trim()}章 ${tail}` : `第${(chapterNo || '').trim()}章`;
  };

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];

  let introLines: string[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(chapterHeading);
    if (match) {
      pushCurrent();
      chapterCount += 1;
      const chapterNo = (match[1] || '').trim();
      const chapterTail = (match[2] || '').trim();
      current = {
        id: `zh-ch-${chapterCount}`,
        title: normalizeChineseTitle(chapterNo, chapterTail),
        lines: [],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  pushCurrent();

  const introClean = introLines.join('\n').trim();
  if (introClean) {
    sections.unshift({
      id: 'zh-intro',
      title: '引言',
      lines: introLines,
    });
  }

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf
        .join(' ')
        .replace(gcsMarker, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) {
        flush();
      } else {
        buf.push(t);
      }
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseKoreanBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const chapterHeading = /^\s*(\d{1,3})\s*장\s*[—–\-:]\s*(.+?)\s*$/u;

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let introLines: string[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const normalizeKoreanTitle = (chapterNo: string, chapterTail: string) => {
    const tail = (chapterTail || '')
      .replace(/^\s*[-—–:]+\s*/u, '')
      .replace(/\s+/gu, ' ')
      .trim();
    return tail ? `${chapterNo} 장 — ${tail}` : `${chapterNo} 장`;
  };

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const m = trimmed.match(chapterHeading);
    if (m) {
      pushCurrent();
      chapterCount += 1;
      current = {
        id: `ko-ch-${chapterCount}`,
        title: normalizeKoreanTitle((m[1] || '').trim(), (m[2] || '').trim()),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
    else introLines.push(line);
  }
  pushCurrent();

  // Trim leading empty lines and remove duplicate book title line from intro.
  while (introLines.length && !introLines[0].trim()) introLines.shift();
  if (introLines[0]?.trim() === '각 시대의 대쟁투') introLines.shift();

  const prefaceIdx = introLines.findIndex((ln) => /^\s*저자의\s*서문\s*$/u.test((ln || '').trim()));
  let introTitle = '서문';
  if (prefaceIdx >= 0) {
    introTitle = '저자의 서문';
    introLines.splice(prefaceIdx, 1);
  }

  const introClean = introLines.join('\n').trim();
  if (introClean) {
    sections.unshift({
      id: 'ko-intro',
      title: introTitle,
      lines: introLines,
    });
  }

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseJapaneseBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const chapterHeading = /^\s*第\s*([0-9０-９一二三四五六七八九十百千〇零]{1,8})\s*章\s*[—–\-:：]\s*(.*?)\s*$/u;

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let introLines: string[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const normalizeJapaneseTitle = (chapterNo: string, chapterTail: string) => {
    const tail = (chapterTail || '')
      .replace(/^\s*[-—–:：]+\s*/u, '')
      .replace(/\s+/gu, ' ')
      .trim();
    return tail ? `第${chapterNo}章—${tail}` : `第${chapterNo}章`;
  };

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const m = trimmed.match(chapterHeading);
    if (m) {
      pushCurrent();
      chapterCount += 1;
      current = {
        id: `ja-ch-${chapterCount}`,
        title: normalizeJapaneseTitle((m[1] || '').trim(), (m[2] || '').trim()),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
    else introLines.push(line);
  }
  pushCurrent();

  while (introLines.length && !introLines[0].trim()) introLines.shift();
  if (introLines[0]?.trim() === '各時代の大争闘') introLines.shift();

  let introTitle = 'まえがき';
  const prefaceIdx = introLines.findIndex((ln) => /^\s*まえがき\s*$/u.test((ln || '').trim()));
  if (prefaceIdx >= 0) {
    introTitle = 'まえがき';
    introLines.splice(prefaceIdx, 1);
  }

  const introClean = introLines.join('\n').trim();
  if (introClean) {
    sections.unshift({
      id: 'ja-intro',
      title: introTitle,
      lines: introLines,
    });
  }

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseSerbianBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterHeading = /^\s*Поглавље\s+([IVXLCDM]+|\d+)\s*[—–\-:]\s*(.*?)\s*$/i;
  const normalizeSerbianTitle = (s: string) =>
    (s || '')
      .replace(/^\s*Поглавље\s+/iu, 'Поглавље ')
      .replace(/\s*[-—–:]\s*/gu, ' — ')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/gu, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterHeading);
    if (match) {
      pushCurrent();
      chapterCount += 1;
      current = {
        id: `sr-ch-${chapterCount}`,
        title: normalizeSerbianTitle(trimmed),
        lines: [],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseFarsiBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeFarsiTitle = (s: string) =>
    (s || '')
      .replace(/^\s*(\d{1,3})\s*[—–:-]\s*/, '$1—')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let chapterCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      chapterCount += 1;
      current = {
        id: `fa-ch-${chapterCount}`,
        title: normalizeFarsiTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseAfrikaansBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeAfrikaansTitle = (s: string) =>
    (s || '')
      .replace(/^\s*hoofstuk\s+/i, 'Hoofstuk ')
      .replace(/^\s*inleiding\s*$/i, 'Inleiding')
      .replace(/\*.*$/, '')
      .replace(/\s*[—–-]\s*/g, '—')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let sectionCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      sectionCount += 1;
      current = {
        id: `af-ch-${sectionCount}`,
        title: normalizeAfrikaansTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseHindiBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeHindiTitle = (s: string) =>
    (s || '')
      .replace(/^\s*[-:]+\s*/, '')
      .replace(/\s*[-:]+\s*$/g, '')
      .replace(/^\s*पाठ\s*([०-९0-9]+)\s*[-—–:]?\s*/u, 'पाठ $1 - ')
      .replace(/^\s*पाठ\s*([०-९0-9]+)\s*-\s*/u, 'पाठ $1 - ')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let sectionCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      sectionCount += 1;
      current = {
        id: `hi-ch-${sectionCount}`,
        title: normalizeHindiTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseBengaliBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeBengaliTitle = (s: string) =>
    (s || '')
      .replace(/^\s*[-:]+\s*/, '')
      .replace(/\s*[-:]+\s*$/g, '')
      .replace(/\s*[—–-]\s*/g, ' - ')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let sectionCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      sectionCount += 1;
      current = {
        id: `bn-ch-${sectionCount}`,
        title: normalizeBengaliTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseIndonesianBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeIndonesianTitle = (s: string) =>
    (s || '')
      .replace(/^\s*[-:]+\s*/, '')
      .replace(/\s*[-:]+\s*$/g, '')
      .replace(/\s*[—–-]\s*/g, '—')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let sectionCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      sectionCount += 1;
      current = {
        id: `id-ch-${sectionCount}`,
        title: normalizeIndonesianTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

function parseUrduBook(raw: string): { toc: TocEntry[]; chapterIds: string[]; chapterHtml: string[] } {
  const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
  const chapterMarker = /^\s*@@CHAPTER@@\s*(.+?)\s*$/;
  const normalizeUrduTitle = (s: string) =>
    (s || '')
      .replace(/^\s*[-:]+\s*/, '')
      .replace(/\s*[-:]+\s*$/g, '')
      .replace(/\s*[—–-]\s*/g, ' - ')
      .replace(/[*]+.*$/u, '')
      .replace(/\s+/g, ' ')
      .trim();

  type Section = { id: string; title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let sectionCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(chapterMarker);
    if (match) {
      pushCurrent();
      sectionCount += 1;
      current = {
        id: `ur-ch-${sectionCount}`,
        title: normalizeUrduTitle(match[1] || ''),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }
  pushCurrent();

  const toParagraphs = (sectionLines: string[]) => {
    const paras: string[] = [];
    let buf: string[] = [];
    const flush = () => {
      const t = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (t) paras.push(`<p>${escapeHtml(t)}</p>`);
      buf = [];
    };

    sectionLines.forEach((ln) => {
      const t = (ln || '').trim();
      if (!t) flush();
      else buf.push(t);
    });
    flush();
    return paras.join('\n');
  };

  const toc: TocEntry[] = sections.map((s) => ({ title: s.title, href: `#${s.id}` }));
  const chapterIds = sections.map((s) => s.id);
  const chapterHtml = sections.map((s) => {
    const heading = `<h2 class="chapterhead">${escapeHtml(s.title)}</h2>`;
    const body = toParagraphs(s.lines);
    return `<div id="${s.id}">\n${heading}\n${body}\n</div>`;
  });

  return { toc, chapterIds, chapterHtml };
}

export default function BookReader() {
  const FORCE_MINIMIZED_PLAYER = true;
  type ReaderBookmark = { lang: string; chapterIdx: number; ts: number };
  type SearchResult = {
    idx: number;
    occ: number;
    paragraphIdx?: number;
    paragraphId?: string;
    snippet?: string;
  };
  // --- SEARCH & SHARE POPUP STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchIdx, setSearchIdx] = useState(0);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [pendingScroll, setPendingScroll] = useState<SearchResult | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);
  const [sharePopupPos, setSharePopupPos] = useState({ top: 0, left: 0 });

  // --- AUDIO STATE ---
  const [audioMinimized, setAudioMinimized] = useState(false);
  const [audioUserExpanded, setAudioUserExpanded] = useState(false);
  const [audioAutoPlayRequest, setAudioAutoPlayRequest] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioHidden, setAudioHidden] = useState(false);
  const [audioContinuePlay, setAudioContinuePlay] = useState(false);

  // --- MAIN APP STATE ---
  const [lang, setLang] = useState(() => getInitialLanguageFolder());
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [bookDoc, setBookDoc] = useState<Document | null>(null);
  const [chapterIds, setChapterIds] = useState<string[]>([]);
  const chapterCache = useRef<Map<number, string>>(new Map());
  const plainTextCache = useRef<Map<number, string>>(new Map());
  const albanianInFlight = useRef<Set<number>>(new Set());
  const [chapterIdx, setChapterIdx] = useState(0);
  const [audioChapterIdx, setAudioChapterIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [externalChapterHydrating, setExternalChapterHydrating] = useState(false);
  const [, setChapterCacheVersion] = useState(0);
  const [pageWidth, setPageWidth] = useState(() => {
    const saved = localStorage.getItem('reader-page-width');
    if (saved) {
      const n = Number(saved);
      if (!Number.isNaN(n)) {
        return Math.max(DESKTOP_WIDTH_MIN, Math.min(DESKTOP_WIDTH_MAX, n));
      }
    }
    return getRecommendedDesktopWidth(window.innerWidth || 1280);
  });
  const [desktopWidthLimit, setDesktopWidthLimit] = useState(() =>
    Math.max(DESKTOP_WIDTH_MIN, Math.min(DESKTOP_WIDTH_MAX, (window.innerWidth || 1280) - 48))
  );
  const [desktopWidthPreset, setDesktopWidthPreset] = useState<DesktopWidthPreset>(() => {
    const saved = localStorage.getItem('reader-width-preset');
    return saved === 'small' || saved === 'medium' || saved === 'wide' ? saved : 'small';
  });
  const [textSize, setTextSize] = useState(() => {
    const v = localStorage.getItem('reader-text-size');
    return v ? Number(v) : 18;
  });
  const [isDesktop, setIsDesktop] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [chapterReadPercent, setChapterReadPercent] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copyToastPos, setCopyToastPos] = useState({ top: 0, left: 0 });
  const [analyticsConsentStatus, setAnalyticsConsentStatus] = useState<'granted' | 'denied' | 'unknown'>(() => getAnalyticsConsentStatus());
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [bookmark, setBookmark] = useState<ReaderBookmark | null>(() => {
    try {
      const raw = localStorage.getItem('reader-bookmark');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ReaderBookmark;
      if (!parsed || typeof parsed.lang !== 'string' || typeof parsed.chapterIdx !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  });
  const [showOpeningToc, setShowOpeningToc] = useState(() => {
    // Show the TOC page only on the root route (/) or language-only routes (/{lang}).
    // If navigating via a deep link (chapter route) or a paragraph hash, don't force the TOC.
    const path = window.location.pathname || '/';
    const hasHashFragment = !!(window.location.hash && window.location.hash.startsWith('#gc-p-'));
    if (hasHashFragment) return false;

    const isRoot = path === '/' || path === '';
    if (isRoot) return true;

    const m = path.match(/^\/([^/]+)\/?$/);
    if (m) {
      const slug = decodeURIComponent(m[1] || '').toLowerCase();
      if (LANG_SLUG_TO_FOLDER[slug]) return true;
    }

    // Any route with 2+ segments should be treated as a deep link.
    return false;
  });
  const sharePopupRef = useRef<HTMLDivElement | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const isSelectingRef = useRef(false);
  const pendingChapterIdxRef = useRef<number | null>(null);
  const pendingChapterNumberRef = useRef<number | null>(null);
  const copyToastTimerRef = useRef<number | null>(null);
  const lastSelectionRectRef = useRef<DOMRect | null>(null);

  // theme state: keep in React state so UI updates immediately when toggled
  const [isDark, setIsDark] = useState(() => localStorage.getItem('reader-dark') === '1');

  const contentRef = useRef<HTMLDivElement | null>(null);
  const langBtnRef = useRef<HTMLButtonElement | null>(null);
  const burgerBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchBtnRef = useRef<HTMLButtonElement | null>(null);
  const shareBtnRef = useRef<HTMLButtonElement | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const getPlayableAudioChapterIndex = (targetIdx: number) => {
    if (!toc.length) return 0;
    const clamped = Math.max(0, Math.min(toc.length - 1, targetIdx));
    const hasChapterNumber = (idx: number) => {
      const title = (toc[idx]?.title || '').trim();
      return getChapterNumber(title) !== null;
    };

    if (hasChapterNumber(clamped)) return clamped;

    for (let i = clamped + 1; i < toc.length; i++) {
      if (hasChapterNumber(i)) return i;
    }

    return clamped;
  };

  // Handlers for next/prev chapter in the player.
  // Audio chapter navigation is intentionally independent from reading chapter navigation.
  const handleNextChapter = (autoPlay = false) => {
    if (audioChapterIdx < toc.length - 1) {
      const nextIdx = getPlayableAudioChapterIndex(audioChapterIdx + 1);
      setAudioChapterIdx(nextIdx);
      if (autoPlay) setAudioAutoPlayRequest((v) => v + 1);
    }
  };
  const handlePrevChapter = (autoPlay = false) => {
    if (audioChapterIdx > 0) {
      const prevIdx = getPlayableAudioChapterIndex(audioChapterIdx - 1);
      setAudioChapterIdx(prevIdx);
      if (autoPlay) setAudioAutoPlayRequest((v) => v + 1);
    }
  };
  const audioChapterTitle = toc[audioChapterIdx]?.title || '';

  useEffect(() => {
    if (!toc.length) {
      setAudioChapterIdx(0);
      return;
    }
    if (audioChapterIdx >= toc.length || getChapterNumber((toc[audioChapterIdx]?.title || '').trim()) === null) {
      setAudioChapterIdx(getPlayableAudioChapterIndex(Math.max(0, Math.min(audioChapterIdx, toc.length - 1))));
    }
  }, [toc, audioChapterIdx]);

  // --- Minimized audio bar and auto-next logic ---
  // Auto-minimize audio bar on scroll (mobile)
  useEffect(() => {
    if (FORCE_MINIMIZED_PLAYER) {
      setAudioMinimized(true);
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (audioUserExpanded) {
            ticking = false;
            return;
          }
          const y = window.scrollY;
          if (y > 120) setAudioMinimized(true);
          else setAudioMinimized(false);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [audioUserExpanded, FORCE_MINIMIZED_PLAYER]);

  // --- Minimized audio bar and auto-next logic ---

  const clearTempHighlights = () => {
    const contentEl = contentRef.current;
    if (!contentEl) return;
    contentEl.querySelectorAll('span.user-highlight-temp').forEach((el) => {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
    });
  };

  const applyPersistentHighlight = (range: Range) => {
    clearTempHighlights();
    const common = range.commonAncestorContainer;
    const root = common.nodeType === Node.ELEMENT_NODE ? (common as Element) : (common.parentElement || null);
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node: Node) => {
        const text = node.nodeValue || '';
        if (!text.trim()) return NodeFilter.FILTER_REJECT;
        try {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        } catch {
          return NodeFilter.FILTER_REJECT;
        }
      },
    } as any);

    const nodes: Text[] = [];
    let n = walker.nextNode();
    while (n) {
      nodes.push(n as Text);
      n = walker.nextNode();
    }
    nodes.forEach((textNode) => {
      const fullText = textNode.nodeValue || '';
      if (!fullText) return;
      let startOffset = 0;
      let endOffset = fullText.length;
      if (textNode === range.startContainer) startOffset = range.startOffset;
      if (textNode === range.endContainer) endOffset = range.endOffset;
      if (startOffset === endOffset) return;

      let nodeToWrap = textNode;
      if (endOffset < nodeToWrap.length) {
        nodeToWrap.splitText(endOffset);
      }
      if (startOffset > 0) {
        nodeToWrap = nodeToWrap.splitText(startOffset);
      }
      const span = document.createElement('span');
      span.className = 'user-highlight user-highlight-temp';
      span.textContent = nodeToWrap.nodeValue || '';
      nodeToWrap.parentNode?.replaceChild(span, nodeToWrap);
    });
  };

  const [langPanelStyle, setLangPanelStyle] = useState<React.CSSProperties | null>(null);
  const [searchPanelStyle, setSearchPanelStyle] = useState<React.CSSProperties | null>(null);
  const [sharePanelStyle, setSharePanelStyle] = useState<React.CSSProperties | null>(null);
  const [morePanelStyle, setMorePanelStyle] = useState<React.CSSProperties | null>(null);
  const desktopWidthPresets = useMemo(
    () => getDesktopWidthPresets(window.innerWidth || 1280, desktopWidthLimit),
    [desktopWidthLimit]
  );
  const desktopPresetOrder: DesktopWidthPreset[] = ['small', 'medium', 'wide'];
  const currentDesktopPresetIndex = Math.max(0, desktopPresetOrder.indexOf(desktopWidthPreset));
  const canDecreaseDesktopWidth = currentDesktopPresetIndex > 0;
  const canIncreaseDesktopWidth = currentDesktopPresetIndex < desktopPresetOrder.length - 1;
  const widthIndicatorPercent =
    desktopWidthPreset === 'small' ? 20 : desktopWidthPreset === 'medium' ? 52 : 100;

  const changeDesktopWidthPreset = (direction: 'decrease' | 'increase') => {
    setDesktopWidthPreset((prev) => {
      const idx = Math.max(0, desktopPresetOrder.indexOf(prev));
      const nextIdx = direction === 'decrease'
        ? Math.max(0, idx - 1)
        : Math.min(desktopPresetOrder.length - 1, idx + 1);
      return desktopPresetOrder[nextIdx];
    });
  };

  const getAnchoredPanelStyle = (btn: HTMLButtonElement | null, preferredWidth = 260): React.CSSProperties => {
    const viewportWidth = window.innerWidth;
    const margin = 12;
    const maxAllowed = Math.max(160, viewportWidth - margin * 2);
    const width = Math.min(preferredWidth, maxAllowed);

    if (!btn) {
      return {
        position: 'fixed',
        top: 72,
        left: margin,
        width,
        maxWidth: `calc(100vw - ${margin * 2}px)`,
        zIndex: 9999,
      };
    }

    const r = btn.getBoundingClientRect();
    let left = r.left;
    if (left + width + margin > viewportWidth) left = viewportWidth - width - margin;
    if (left < margin) left = margin;

    return {
      position: 'fixed',
      top: r.bottom + 8,
      left,
      width,
      maxWidth: `calc(100vw - ${margin * 2}px)`,
      zIndex: 9999,
    };
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width:900px)');
    const fn = () => setIsDesktop(!!mq.matches);
    fn();
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, []);

  useEffect(() => {
    const updateDesktopWidth = () => {
      const limit = Math.max(
        DESKTOP_WIDTH_MIN,
        Math.min(DESKTOP_WIDTH_MAX, window.innerWidth - 48)
      );
      setDesktopWidthLimit(limit);
      const presets = getDesktopWidthPresets(window.innerWidth || 1280, limit);
      setPageWidth(presets[desktopWidthPreset]);
    };

    updateDesktopWidth();
    window.addEventListener('resize', updateDesktopWidth);
    return () => window.removeEventListener('resize', updateDesktopWidth);
  }, [desktopWidthPreset]);

  useEffect(() => {
    localStorage.setItem('reader-width-preset', desktopWidthPreset);
    setPageWidth(desktopWidthPresets[desktopWidthPreset]);
  }, [desktopWidthPreset, desktopWidthPresets]);

  useEffect(() => {
    localStorage.setItem('reader-page-width', String(pageWidth));
  }, [pageWidth]);

  useEffect(() => {
    if (showOpeningToc || loading) {
      setChapterReadPercent(0);
      return;
    }

    let ticking = false;
    const headerOffset = 64;

    const updateProgress = () => {
      ticking = false;
      const el = contentRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const chapterTop = scrollTop + rect.top;
      const chapterHeight = Math.max(el.scrollHeight, rect.height, 1);
      const chapterBottom = chapterTop + chapterHeight;
      const viewportBottom = scrollTop + window.innerHeight;

      // Snap to 100% when the viewport reaches the chapter end.
      // This avoids values like 98–99% at absolute bottom due to header offset math.
      if (viewportBottom >= chapterBottom - 2) {
        setChapterReadPercent(100);
        return;
      }

      const readingLineY = scrollTop + headerOffset;

      const raw = ((readingLineY - chapterTop) / Math.max(1, chapterBottom - chapterTop)) * 100;
      const clamped = Math.max(0, Math.min(100, Math.round(raw)));
      setChapterReadPercent(clamped);
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [chapterIdx, showOpeningToc, loading]);

  useEffect(() => {
    if (!showShareMenu) return;
    const onDown = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node | null;
      if (target && shareMenuRef.current?.contains(target)) return;
      if (target && shareBtnRef.current?.contains(target)) return;
      setShowShareMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [showShareMenu]);

  useEffect(() => {
    if (!showLangMenu) return;
    const onDown = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node | null;
      if (target && langMenuRef.current?.contains(target)) return;
      if (target && langBtnRef.current?.contains(target)) return;
      setShowLangMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [showLangMenu]);

  useEffect(() => {
    if (!showMoreMenu) return;
    const onDown = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node | null;
      if (target && moreMenuRef.current?.contains(target)) return;
      if (target && moreBtnRef.current?.contains(target)) return;
      setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [showMoreMenu]);

  // Parse path-based routes like /lang/en/chapter/23 on initial load
  useEffect(() => {
    const parsePath = (path: string) => {
      // Language-only format: /{lang} - show TOC menu
      let m = path.match(/^\/([^/]+)\/?$/i);
      if (m) {
        const abbr = decodeURIComponent(m[1] || '').toLowerCase();
        const folder = LANG_SLUG_TO_FOLDER[abbr];
        if (folder) return { folder, idx: null, num: null, showToc: true };
      }
      // New format: /{lang}/{label}-{num}/{slug} or /{lang}/{label}-{num}
      m = path.match(/^\/([^/]+)\/[^/]+-(\d+)(?:\/([^/]+))?(?:\/)?$/i);
      if (m) {
        const abbr = decodeURIComponent(m[1] || '').toLowerCase();
        const num = Math.max(1, parseInt(m[2], 10));
        const idx = Math.max(0, num - 1);
        const folder = LANG_SLUG_TO_FOLDER[abbr];
        if (!folder) return null;
        return { folder, idx, num, showToc: false };
      }
      // Backward compatible: /{lang}/chapter/{num}-{slug}
      m = path.match(/^\/([^/]+)\/chapter\/(\d+)(?:-([^/]+))?(?:\/)?$/i);
      if (!m) return null;
      const abbr = decodeURIComponent(m[1] || '').toLowerCase();
      const num = Math.max(1, parseInt(m[2], 10));
      const idx = Math.max(0, num - 1);
      const folder = LANG_SLUG_TO_FOLDER[abbr];
      if (!folder) return null;
      return { folder, idx, num, showToc: false };
    };

    const parsed = parsePath(window.location.pathname);
    if (parsed) {
      if (parsed.idx !== null) {
        pendingChapterIdxRef.current = parsed.idx;
        pendingChapterNumberRef.current = parsed.num ?? null;
      }
      setLang(parsed.folder);
      setShowOpeningToc(parsed.showToc ?? false);
    }

    const onPop = () => {
      const p = parsePath(window.location.pathname);
      if (p) {
        if (p.idx !== null) {
          pendingChapterIdxRef.current = p.idx;
          pendingChapterNumberRef.current = p.num ?? null;
        }
        setLang(p.folder);
        setShowOpeningToc(p.showToc ?? false);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Persist theme preference and apply to document element
  useEffect(() => {
    try {
      localStorage.setItem('reader-dark', isDark ? '1' : '0');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors in strict environments
    }
  }, [isDark]);

  // Handle RTL for Arabic and other RTL languages
  useEffect(() => {
    const isArabic = lang && lang.toLowerCase().includes('alsra');
    const isFarsi = lang === FARSI_FOLDER;
    const isUrdu = lang === URDU_FOLDER;
    const isRTL = isArabic || isFarsi || isUrdu;
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [lang]);

  // Remove auto-highlight and share popup on selection end: restore standard selection behavior.
  // The share/copy popup will only be shown when the user explicitly triggers it (e.g., via a button in the UI).

  // Track selection gesture state to avoid fighting user selection changes
  useEffect(() => {
    const onDown = (ev: PointerEvent) => {
      const target = ev.target as Node | null;
      if (target && contentRef.current?.contains(target)) {
        isSelectingRef.current = true;
      }
    };
    const onUp = () => {
      isSelectingRef.current = false;
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Copy selected text to clipboard (include title + link)
  const handleCopy = async () => {
    try {
      const bookTitle = getBookTitleFromFolder(lang);
      const abbr = (LANGUAGE_ABBREV[lang] || '').toLowerCase();
      const chapterTitle = toc[chapterIdx]?.title || '';
      const chapterNumber = getChapterNumber(chapterTitle) ?? (chapterIdx + 1);
      const chapterPrefix = getChapterRoutePrefix(lang);
      const chapterSlug = getChapterRouteSlug(lang, chapterTitle, chapterNumber);
      const chapterPath = showOpeningToc
        ? `/${abbr}`
        : `/${abbr}/${chapterPrefix}-${chapterNumber}/${chapterSlug}`;
      const baseUrl = `${window.location.origin}${chapterPath}`;
      const url = selectedAnchorId ? `${baseUrl}#${selectedAnchorId}` : window.location.href;
      const payloadText = `${selectedText}${selectedText ? '\n\n' : ''}${bookTitle}\n${url}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payloadText);
      } else {
        // Fallback for older browsers / non-https contexts
        const ta = document.createElement('textarea');
        ta.value = payloadText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShowSharePopup(false);
      // restore iOS touch callout when popup closed
      try {
        if (contentRef.current && (contentRef.current as any).style) {
          (contentRef.current as any).style.webkitTouchCallout = '';
        }
      } catch {}
      window.getSelection()?.removeAllRanges();
      if (lastSelectionRectRef.current) {
        const r = lastSelectionRectRef.current;
        setCopyToastPos({
          top: r.top + window.scrollY - 40,
          left: r.left + window.scrollX + Math.max(r.width / 2, 0),
        });
      } else {
        setCopyToastPos({
          top: Math.max(16, window.scrollY + 16),
          left: Math.max(16, window.innerWidth / 2),
        });
      }
      setShowCopyToast(true);
      if (copyToastTimerRef.current) window.clearTimeout(copyToastTimerRef.current);
      copyToastTimerRef.current = window.setTimeout(() => setShowCopyToast(false), 1600);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Ensure the original selection stays visible while interacting with the popup
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (!sel || !selectionRangeRef.current) return;
    try {
      sel.removeAllRanges();
      sel.addRange(selectionRangeRef.current.cloneRange());
    } catch {
      // ignore
    }
  };

  // Keep the highlight visible when the popup appears/re-renders
  useEffect(() => {
    if (showSharePopup && selectedText && selectionRangeRef.current) {
      restoreSelection();
    }
  }, [showSharePopup, selectedText]);

  // Keep share popup near selected text while scrolling/resizing so it stays in viewport
  useEffect(() => {
    if (!showSharePopup) return;

    const reposition = () => {
      let rect: DOMRect | null = null;
      try {
        rect = selectionRangeRef.current?.getBoundingClientRect?.() || null;
      } catch {
        rect = null;
      }

      if (rect) {
        const isIOS = typeof navigator !== 'undefined' && /iP(ad|hone|od)/i.test(navigator.userAgent || '');
        const nativeOffset = isIOS ? 110 : 56;
        setSharePopupPos({
          top: rect.top - nativeOffset,
          left: rect.left + Math.max(rect.width / 2, 0),
        });
        lastSelectionRectRef.current = rect;
      }
    };

    reposition();
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition);
      window.removeEventListener('resize', reposition);
    };
  }, [showSharePopup]);

  // Show a lightweight share popup when the user selects text, but do NOT
  // alter the browser selection or apply persistent highlights. This preserves
  // the standard selection visuals while providing a white share modal.
  useEffect(() => {
    const onPointerUp = (ev?: Event) => {
      try {
        const sel = window.getSelection();
        const txt = sel ? (sel.toString() || '').trim() : '';
        const anchor = sel?.anchorNode || null;
        if (!txt || !anchor || !contentRef.current?.contains(anchor)) return;
        const range = sel!.rangeCount ? sel!.getRangeAt(0) : null;
        if (!range) return;

        // Determine an anchor id for linking back to the paragraph
        const containerEl = (range.startContainer as Element)?.nodeType === Node.ELEMENT_NODE
          ? (range.startContainer as Element)
          : (range.startContainer.parentElement || null);
        const blockEl = containerEl?.closest?.('p, blockquote') || containerEl?.closest?.('[id]') || null;
        let anchorId: string | null = null;
        if (blockEl && (blockEl as Element).id) anchorId = (blockEl as Element).id;
        if (!anchorId && contentRef.current) {
          const blocks = Array.from(contentRef.current.querySelectorAll('p, blockquote')) as HTMLElement[];
          const idx = blockEl ? blocks.indexOf(blockEl as HTMLElement) : -1;
          const fallbackIdx = idx >= 0 ? idx + 1 : Math.max(1, blocks.length);
          anchorId = `gc-p-${chapterIdx + 1}-${fallbackIdx}`;
          if (blockEl && !(blockEl as Element).id) (blockEl as Element).id = anchorId;
        }

        const rect = range.getBoundingClientRect();
        lastSelectionRectRef.current = rect;
        selectionRangeRef.current = range.cloneRange();
        setSelectedText(txt);
        setSelectedAnchorId(anchorId);
        // Adjust popup vertical offset to avoid iOS native selection menu overlapping
        const isIOS = typeof navigator !== 'undefined' && /iP(ad|hone|od)/i.test(navigator.userAgent || '');
        // Increase offset slightly so our popup sits above the iOS native menu.
        const nativeOffset = isIOS ? 110 : 56; // iOS native menu can occupy more space
        setSharePopupPos({
          top: rect.top - nativeOffset,
          left: rect.left + Math.max(rect.width / 2, 0),
        });
        setShowSharePopup(true);
        // Temporarily disable iOS native touch callout so the app popup is used
        try {
          if (isIOS && contentRef.current && (contentRef.current as any).style) {
            (contentRef.current as any).style.webkitTouchCallout = 'none';
          }
        } catch {}
        // Do NOT call applyPersistentHighlight — preserve native selection visuals
      } catch {
        // ignore
      }
    };

    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);
    return () => {
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
    };
  }, [chapterIdx]);

  // Note: selectionchange handling removed to prevent flashing on mobile/desktop.

  // Close share popup when clicking outside content and the popup
  useEffect(() => {
    if (!showSharePopup) return;
    const onDown = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node | null;
      if (target && sharePopupRef.current?.contains(target)) return;
      if (target && contentRef.current?.contains(target)) return;
      setShowSharePopup(false);
      setSelectedAnchorId(null);
      // restore iOS touch callout when popup closed
      try {
        if (contentRef.current && (contentRef.current as any).style) {
          (contentRef.current as any).style.webkitTouchCallout = '';
        }
      } catch {}
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [showSharePopup]);

  // Share on social media
  const handleShare = (platform: string) => {
    const bookTitle = getBookTitleFromFolder(lang);
    const text = `"${selectedText}" — ${bookTitle}`;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const url = selectedAnchorId ? `${baseUrl}#${selectedAnchorId}` : window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(bookTitle)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'native':
        if (navigator.share) {
          // Some share targets (like Messages on iOS) ignore `text` when `url` is present.
          // Put everything into `text` and omit `url` so the quote always appears.
          const payloadText = `${selectedText}${selectedText ? '\n\n' : ''}${bookTitle}\n${url}`;
          navigator.share({ title: bookTitle, text: payloadText })
            .catch(err => console.log('Share cancelled:', err));
          setShowSharePopup(false);
          // restore iOS touch callout when popup closed
          try {
            if (contentRef.current && (contentRef.current as any).style) {
              (contentRef.current as any).style.webkitTouchCallout = '';
            }
          } catch {}
          window.getSelection()?.removeAllRanges();
          return;
        }
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=720,height=520');
      setShowSharePopup(false);
      // restore iOS touch callout when popup closed
      try {
        if (contentRef.current && (contentRef.current as any).style) {
          (contentRef.current as any).style.webkitTouchCallout = '';
        }
      } catch {}
      window.getSelection()?.removeAllRanges();
    }
  };

  // Clear persistent highlights when chapter or language changes
  useEffect(() => {
    clearTempHighlights();
    selectionRangeRef.current = null;
    setSelectedAnchorId(null);
  }, [chapterIdx, lang]);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) window.clearTimeout(copyToastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const checkInstalled = () => {
      const standaloneMedia = window.matchMedia?.('(display-mode: standalone)');
      const standaloneIOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      const installed = Boolean(standaloneMedia?.matches || standaloneIOS);
      setIsAppInstalled(installed);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    checkInstalled();

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'gc_analytics_consent') {
        setAnalyticsConsentStatus(getAnalyticsConsentStatus());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;
    try {
      await installPromptEvent.prompt();
      await installPromptEvent.userChoice;
    } catch {
      // no-op
    } finally {
      setInstallPromptEvent(null);
      setShowMoreMenu(false);
    }
  };

  const handleShareApp = (platform: string) => {
    const bookTitle = getBookTitleFromFolder(lang) || (lang || '').split(' - Ellen')[0].trim() || 'The Great Controversy';
    const url = `${window.location.origin}${window.location.pathname}`;
    const text = `${bookTitle} — ${url}`;

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(bookTitle)}&body=${encodeURIComponent(text)}`;
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title: bookTitle, text: bookTitle, url })
            .catch(() => null);
          return;
        }
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=720,height=520');
    }
  };

  const handleWhatsAppContact = () => {
    const localizedTitle = getBookTitleFromFolder(lang) || 'The Great Controversy';
    const localizedMessage = getContactWhatsAppAutoMessage(lang);
    const text = `${localizedTitle} — "${localizedMessage}"`;
    const whatsappNumber = getContactWhatsAppNumber(lang);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowMoreMenu(false);
  };

  const openPolishQuestionsEmail = () => {
    const subject = 'Pytanie dotyczące książki Wielki bój';
    window.location.href = `mailto:${POLISH_QUESTIONS_EMAIL}?subject=${encodeURIComponent(subject)}`;
    setShowMoreMenu(false);
  };

  const openPolishPrintOrderEmail = () => {
    const subject = 'Zamówienie drukowanego egzemplarza książki Wielki bój';
    window.location.href = `mailto:${POLISH_PRINT_ORDER_EMAIL}?subject=${encodeURIComponent(subject)}`;
    setShowMoreMenu(false);
  };

  const handleStripeDonate = () => {
    window.open(STRIPE_DONATE_URL, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
    setShowMoreMenu(false);
  };


  useEffect(() => {
    // When language changes, clear previous content immediately and try to
    // load the selected language folder's index.html. We try a couple of
    // URL formats (encoded and raw) because some language folder names
    // contain characters that can be tricky when served from the dev server.
    setLoading(true);
    setToc([]);
    setChapterIds([]);
    setBookDoc(null);
    chapterCache.current.clear();
    plainTextCache.current.clear();
    setChapterIdx(0);

    const tryFetch = async (paths: string[]) => {
      for (const p of paths) {
        try {
          const r = await fetch(p);
          if (!r.ok) continue;
          const html = await r.text();

          // Some hosts (Netlify with Pretty URLs / path normalization) may
          // respond to "/.../index.html" with a small "Document moved" page.
          // If we parse that as a book, the TOC will be empty.
          const moved = /<title>\s*document moved\s*<\/title>/i.test(html) || /document moved permanently/i.test(html);
          if (moved) continue;

          return html;
        } catch (e) {
          // continue to next candidate
        }
      }
      throw new Error('Not found');
    };

    if (lang === DUTCH_FOLDER) {
      const parsed = buildExternalChapterBook(DUTCH_EXTERNAL_CHAPTERS, 'Lees brontekst');
      setToc(parsed.toc);
      setChapterIds(parsed.chapterIds);
      setBookDoc(null);

      chapterCache.current.clear();
      plainTextCache.current.clear();
      parsed.chapterHtml.forEach((html, i) => {
        chapterCache.current.set(i, html);
        plainTextCache.current.set(i, html.replace(/<[^>]+>/g, ' '));
      });

      const desiredNumber = pendingChapterNumberRef.current;
      const desiredIdx = pendingChapterIdxRef.current;
      if (typeof desiredNumber === 'number') {
        const matchIdx = parsed.toc.findIndex((entry) => getChapterNumber(entry.title) === desiredNumber);
        setChapterIdx(matchIdx >= 0 ? matchIdx : 0);
      } else if (typeof desiredIdx === 'number' && desiredIdx >= 0 && desiredIdx < parsed.chapterIds.length) {
        setChapterIdx(desiredIdx);
      } else {
        setChapterIdx(0);
      }

      pendingChapterIdxRef.current = null;
      pendingChapterNumberRef.current = null;
      setLoading(false);
      return;
    }

    if (lang === AMHARIC_FOLDER || lang === CHINESE_FOLDER || lang === KOREAN_FOLDER || lang === JAPANESE_FOLDER || lang === SERBIAN_FOLDER || lang === FARSI_FOLDER || lang === AFRIKAANS_FOLDER || lang === HINDI_FOLDER || lang === BENGALI_FOLDER || lang === INDONESIAN_FOLDER || lang === MALAY_FOLDER || lang === URDU_FOLDER || lang === ALBANIAN_FOLDER) {
      const sourcePath =
        lang === AMHARIC_FOLDER
          ? AMHARIC_SOURCE_PATH
          : lang === CHINESE_FOLDER
            ? CHINESE_SOURCE_PATH
            : lang === KOREAN_FOLDER
              ? KOREAN_SOURCE_PATH
              : lang === JAPANESE_FOLDER
                ? JAPANESE_SOURCE_PATH
            : lang === SERBIAN_FOLDER
              ? SERBIAN_SOURCE_PATH
              : lang === FARSI_FOLDER
                ? FARSI_SOURCE_PATH
                : lang === AFRIKAANS_FOLDER
                  ? AFRIKAANS_SOURCE_PATH
                  : lang === HINDI_FOLDER
                    ? HINDI_SOURCE_PATH
                    : lang === BENGALI_FOLDER
                      ? BENGALI_SOURCE_PATH
                      : lang === INDONESIAN_FOLDER
                        ? INDONESIAN_SOURCE_PATH
                        : lang === MALAY_FOLDER
                          ? MALAY_SOURCE_PATH
                        : lang === URDU_FOLDER
                          ? URDU_SOURCE_PATH
                          : ALBANIAN_SOURCE_PATH;
      fetch(sourcePath)
        .then((r) => {
          if (!r.ok) throw new Error('Source file missing');
          return r.text();
        })
        .then((raw) => {
          const parsed =
            lang === AMHARIC_FOLDER
              ? parseAmharicBook(raw)
              : lang === CHINESE_FOLDER
                ? parseChineseBook(raw)
                : lang === KOREAN_FOLDER
                  ? parseKoreanBook(raw)
                  : lang === JAPANESE_FOLDER
                    ? parseJapaneseBook(raw)
                : lang === SERBIAN_FOLDER
                  ? parseSerbianBook(raw)
                  : lang === FARSI_FOLDER
                    ? parseFarsiBook(raw)
                    : lang === AFRIKAANS_FOLDER
                      ? parseAfrikaansBook(raw)
                      : lang === HINDI_FOLDER
                        ? parseHindiBook(raw)
                        : lang === BENGALI_FOLDER
                          ? parseBengaliBook(raw)
                          : lang === INDONESIAN_FOLDER
                            ? parseIndonesianBook(raw)
                            : lang === MALAY_FOLDER
                              ? parseIndonesianBook(raw)
                            : lang === URDU_FOLDER
                              ? parseUrduBook(raw)
                              : parseIndonesianBook(raw);
          setToc(parsed.toc);
          setChapterIds(parsed.chapterIds);
          setBookDoc(null);

          chapterCache.current.clear();
          plainTextCache.current.clear();
          parsed.chapterHtml.forEach((html, i) => {
            chapterCache.current.set(i, html);
            plainTextCache.current.set(i, html.replace(/<[^>]+>/g, ' '));
          });

          let defaultIdx = 0;
          const desiredNumber = pendingChapterNumberRef.current;
          const desiredIdx = pendingChapterIdxRef.current;
          if (typeof desiredNumber === 'number') {
            const idxFromNum = Math.max(0, Math.min(parsed.chapterIds.length - 1, desiredNumber - 1));
            setChapterIdx(idxFromNum);
          } else if (typeof desiredIdx === 'number' && desiredIdx >= 0 && desiredIdx < parsed.chapterIds.length) {
            setChapterIdx(desiredIdx);
          } else {
            setChapterIdx(defaultIdx);
          }

          pendingChapterIdxRef.current = null;
          pendingChapterNumberRef.current = null;
          setLoading(false);
        })
        .catch(() => {
          setToc([]);
          setChapterIds([]);
          setBookDoc(null);
          chapterCache.current.clear();
          plainTextCache.current.clear();
          setLoading(false);
        });
      return;
    }

    const encodedBase = `/book-content/html/${encodeURIComponent(lang)}`;
    const rawBase = `/book-content/html/${lang}`;
    const candidates = [
      // Most common
      `${encodedBase}/index.html`,
      `${encodedBase}/`,
      // Fallback for tricky characters / dev-server quirks
      `${rawBase}/index.html`,
      `${rawBase}/`,
    ];

    tryFetch(candidates)
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Try several strategies to locate a table-of-contents
        let tocRoot: Element | null = doc.querySelector('nav[type="toc"]') || doc.querySelector('nav.toc') || doc.querySelector('.toc') || doc.querySelector('#toc') || doc.querySelector('ol');
        const entries: TocEntry[] = [];
        const isInfoPage = (t: string) => /^\s*information\s+about.*book/i.test(t.trim());
        const sanitizeTocTitle = (t: string) => {
          const s = (t || '').replace(/\s+/g, ' ').trim();
          if (!s) return '';
          // Drop entries that are only punctuation/symbols (e.g. "*", "**", "•").
          if (/^[\p{P}\p{S}\s]+$/u.test(s)) return '';
          // Keep entries that contain at least one letter or number from any script.
          if (!/[\p{L}\p{N}]/u.test(s)) return '';
          return s;
        };
        const shouldSkipToc = (t: string) => {
          const s = sanitizeTocTitle(t);
          if (!s) return true;
          // Skip footnote/endnote markers that can leak into TOC fallback scans
          // (e.g. "1", "2", "[12]", "12.") in some source HTML files.
          if (/^[\[(]?\d{1,4}(?:[\].,:;\-]\d{0,4})?[\])\.]?$/u.test(s)) return true;
          if (/^(?:n(?:ote)?\s*)?\d{1,4}$/iu.test(s)) return true;
          if (isInfoPage(s)) return true;
          if (/^\s*(?:preface|foreword)\b/i.test(s)) return true;
          // Language-specific exclusions (Spanish titles)
          const langName = (LANGUAGE_NAMES[lang] || '').toLowerCase();
          if (langName.includes('span')) {
            // "Información sobre este libro" / "Información sobre el libro"
            if (/^\s*(?:informaci[oó]n\s+sobre(?:\s+este|\s+el)?\s+libro)\b/i.test(s)) return true;
            // "Prefacio" or "Prólogo"
            if (/^\s*(?:prefacio|pr[oó]logo)\b/i.test(s)) return true;
          }
          // Do NOT skip Introduction — show it in contents
          return false;
        };
        if (tocRoot) {
          tocRoot.querySelectorAll('a').forEach((a) => {
            const href = a.getAttribute('href') || '';
            const title = sanitizeTocTitle(a.textContent || '');
            if (href && title && !shouldSkipToc(title)) entries.push({ title, href });
          });
        }
        // Fallback: collect anchors that reference in-page ids and point to existing elements
        if (!entries.length || entries.length < 3) {
          const seen = new Set<string>();
          const all = Array.from(doc.querySelectorAll('a[href]'));
          all.forEach((a) => {
            const href = a.getAttribute('href') || '';
            if (!href.startsWith('#')) return;
            const id = href.replace(/^#/, '');
            if (!id) return;
            if (!doc.getElementById(id)) return;
            const title = sanitizeTocTitle(a.textContent || '');
            if (!title) return;
            if (shouldSkipToc(title)) return;
            if (seen.has(href)) return;
            seen.add(href);
            entries.push({ title, href });
          });
        }
        // Additional fallback: extract chapters from h2 headings if TOC is still sparse
        if (entries.length < 3) {
          const headings = Array.from(doc.querySelectorAll('h2.chapterhead, h2[class*="chapter"]'));
          const fallbackEntries: TocEntry[] = [];
          headings.forEach((h) => {
            const title = sanitizeTocTitle(h.textContent || '');
            if (!title || shouldSkipToc(title)) return;
            // Find the parent element with an id
            let el: Element | null = h;
            while (el && !el.id) {
              el = el.parentElement;
            }
            if (el && el.id) {
              fallbackEntries.push({ title, href: `#${el.id}` });
            }
          });
          if (fallbackEntries.length > entries.length) {
            entries.length = 0;
            entries.push(...fallbackEntries);
          }
        }
        
        // Filter TOC to start from Introduction onwards - hide everything before it
        const introductionIdx = entries.findIndex((e) => /\bintroduction\b/i.test(e.title));
        let filteredEntries = introductionIdx >= 0 ? entries.slice(introductionIdx) : entries;
        
        // Remove unwanted pages for German language
        if (lang === 'Der grosse Kampf - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            const chNum = getChapterNumber(title);
            
            // Remove "Informationen zu diesem Buch" and "Vorwort"
            if (/informationen|vorwort/i.test(title)) return false;
            
            // Remove specific pages
            if (/untreue\s+und\s+abfall/i.test(title)) return false;
            
            // Remove chapters 2, 3, and 4
            if (chNum === 2 || chNum === 3 || chNum === 4) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Italian language
        if (lang === 'Il gran conflitto - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Informazioni su questo libro" and "Prefazione"
            if (/informazioni|prefazione/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Portuguese language
        if (lang === 'O Grande Conflito - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Informações sobre este livro"
            if (/informações/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Samoan language
        if (lang === 'O Le Finauga Tele - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "UPU TOMUA"
            if (/upu\s+tomua/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Croatian language
        if (lang === 'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Predgovor"
            if (/predgovor/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Bulgarian language
        if (lang === "VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White") {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Предговоръ"
            if (/предговор/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Romanian language
        if (lang === 'Tragedia veacurilor - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Informații despre această carte"
            if (/informații.*despre/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Czech language
        if (lang === 'Velky spor vekov - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Předmluva"
            if (/předmluva/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Russian language
        if (lang === "Vielikaia bor'ba - Ellen G. White") {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Информация об этой книге" and "Предисловие"
            if (/информация.*об|предисловие/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Polish language
        if (lang === 'Wielki boj - Ellen G. White') {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "Wprowadzenie do wydania XV"
            if (/wprowadzenie.*do.*wydania/i.test(title)) return false;
            
            return true;
          });
        }
        
        // Remove unwanted pages for Arabic language
        if (lang === "alSra` al`Zym - Ellen G. White") {
          filteredEntries = filteredEntries.filter((e) => {
            const title = e.title || '';
            
            // Remove "المقدمة"
            if (/المقدمة/.test(title)) return false;
            
            return true;
          });
        }
        
        filteredEntries = filteredEntries.filter((e) => {
          const title = sanitizeTocTitle(e.title || '');
          return Boolean(title && !shouldSkipToc(title));
        }).map((e) => ({ ...e, title: sanitizeTocTitle(e.title || '') }));

        setToc(filteredEntries);
        
        // Choose a sensible default chapter to show first.
        // Always start at the first visible chapter (Introduction or first available)
        let defaultIdx = 0;
        const desiredNumber = pendingChapterNumberRef.current;
        const desiredIdx = pendingChapterIdxRef.current;
        if (typeof desiredNumber === 'number') {
          const matchIdx = filteredEntries.findIndex((e) => getChapterNumber(e.title) === desiredNumber);
          if (matchIdx >= 0) setChapterIdx(matchIdx);
          else if (typeof desiredIdx === 'number' && desiredIdx >= 0 && desiredIdx < filteredEntries.length) setChapterIdx(desiredIdx);
          else setChapterIdx(defaultIdx);
        } else if (typeof desiredIdx === 'number' && desiredIdx >= 0 && desiredIdx < filteredEntries.length) {
          setChapterIdx(desiredIdx);
        } else {
          setChapterIdx(defaultIdx);
        }
        pendingChapterIdxRef.current = null;
        pendingChapterNumberRef.current = null;
        // Store chapter IDs and parsed doc for lazy extraction
        const ids = filteredEntries.map((e) => e.href.replace(/^#/, ''));
        setChapterIds(ids);
        setBookDoc(doc);
        chapterCache.current.clear();
        plainTextCache.current.clear();
        setLoading(false);
        // Prefetch remaining chapters in idle time
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            ids.forEach((id, i) => {
              if (i === defaultIdx) return; // already rendered
              extractChapterHtml(doc, id, entries);
            });
          }, { timeout: 2000 });
        }
      })
      .catch(() => {
        // failed to load selected language — leave chapters empty so the UI
        // clearly indicates content isn't available rather than silently
        // showing the previous language's content.
        setToc([]);
        setChapterIds([]);
        setBookDoc(null);
        chapterCache.current.clear();
        plainTextCache.current.clear();
        setLoading(false);
      });
  }, [lang]);

  // Keep path in sync with current language/chapter
  useEffect(() => {
    if (!chapterIds.length) return;
    // Use short language code (ISO 639-1) for URLs
    const abbr = (LANGUAGE_ABBREV[lang] || '').toLowerCase();

     // Contents view: keep a stable language-only route so the opening page is linkable.
    if (showOpeningToc) {
      const path = abbr ? `/${abbr}` : '/';
      if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
      }
      trackPageView(path);
      return;
    }

    const chapterTitle = toc[chapterIdx]?.title || '';
    const chapterNumber = getChapterNumber(chapterTitle) ?? (chapterIdx + 1);
    const chapterRoutePrefix = getChapterRoutePrefix(lang);
    const strippedTitle = stripChapterPrefix(chapterTitle);
    const slug = getChapterRouteSlug(lang, chapterTitle, chapterNumber);
    const path = `/${abbr}/${chapterRoutePrefix}-${chapterNumber}/${slug}`;
    if (window.location.pathname !== path) {
      window.history.replaceState({}, '', path);
    }

    trackPageView(path);
    trackEvent('chapter_open', {
      language: abbr,
      language_name: LANGUAGE_NAMES[lang] || lang,
      chapter_number: chapterNumber,
      chapter_title: strippedTitle || chapterTitle || `Chapter ${chapterNumber}`,
      path,
    });
  }, [lang, chapterIdx, chapterIds.length, toc, showOpeningToc]);

  // Lazily extract and cache chapter HTML from the stored document
  function extractChapterHtml(doc: Document, id: string, entries: TocEntry[]): string {
    const el = doc.getElementById(id);
    if (!el) return '';
    let node: Element | null = el;
    let acc = '';
    while (node) {
      acc += node.outerHTML;
      const next = node.nextElementSibling;
      if (next && entries.some((en) => en.href.replace(/^#/, '') === next.id)) break;
      node = node.nextElementSibling;
    }
    return acc;
  }

  // Get chapter HTML, using cache or extracting on-demand
  function getChapterHtml(idx: number): string {
    if (chapterCache.current.has(idx)) return chapterCache.current.get(idx)!;
    if (!bookDoc || !chapterIds[idx]) return '';
    const html = extractChapterHtml(bookDoc, chapterIds[idx], toc);
    chapterCache.current.set(idx, html);
    return html;
  }

  // Get plain-text version of chapter for search (cached)
  function getChapterText(idx: number): string {
    if (plainTextCache.current.has(idx)) return plainTextCache.current.get(idx)!;
    const html = getChapterHtml(idx);
    const text = html.replace(/<[^>]+>/g, ' ');
    plainTextCache.current.set(idx, text);
    return text;
  }

  // Hydrate link-only chapters (Albanian + Malay EGW links) so users can read full text
  // directly inside this app instead of being sent off-site.
  useEffect(() => {
    const supportsExternalHydration = EXTERNAL_HYDRATION_LANGS.has(lang);
    if (!supportsExternalHydration || !chapterIds.length) return;
    if (chapterIdx < 0 || chapterIdx >= chapterIds.length) return;

    const id = chapterIds[chapterIdx];
    if (!id) return;

    const currentCached = chapterCache.current.get(chapterIdx) || (bookDoc ? extractChapterHtml(bookDoc, id, toc) : '');
    const external = extractExternalReadLinkFromChapterHtml(currentCached);
    if (!external) {
      setExternalChapterHydrating(false);
      return;
    }
    if (albanianInFlight.current.has(chapterIdx)) {
      setExternalChapterHydrating(true);
      return;
    }

    let cancelled = false;
    albanianInFlight.current.add(chapterIdx);
    setExternalChapterHydrating(true);

    fetch(external.href)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch external chapter');
        return res.text();
      })
      .then((raw) => {
        if (cancelled) return;
        const fallbackTitle = external.title || toc[chapterIdx]?.title || `${LANGUAGE_CHAPTER_LABELS[lang] || 'Chapter'} ${chapterIdx + 1}`;
        const preferredTitle = lang === DUTCH_FOLDER ? fallbackTitle : null;
        const hydrated = extractEgwReadableChapterHtml(raw, fallbackTitle, preferredTitle);
        if (!hydrated) return;
        chapterCache.current.set(chapterIdx, hydrated);
        plainTextCache.current.set(chapterIdx, hydrated.replace(/<[^>]+>/g, ' '));
        setChapterCacheVersion((v) => v + 1);
      })
      .catch(() => {
        // Keep the existing link-only fallback if remote fetch fails.
      })
      .finally(() => {
        albanianInFlight.current.delete(chapterIdx);
        if (!cancelled) setExternalChapterHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, chapterIdx, chapterIds, bookDoc, toc]);

  function parseSearchQuery(rawInput: string) {
    const raw = (rawInput || '').trim();
    let exact = false;
    let query = raw;
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      query = raw.slice(1, -1).trim();
      exact = true;
    }

    if (exact) {
      return {
        raw,
        query,
        exact,
        isAnd: false,
        terms: query ? [query] : [],
      };
    }

    const andTerms = raw
      .split('&')
      .map((p) => p.trim())
      .filter(Boolean);

    if (andTerms.length >= 2) {
      return {
        raw,
        query: raw,
        exact: false,
        isAnd: true,
        terms: andTerms,
      };
    }

    return {
      raw,
      query,
      exact: false,
      isAnd: false,
      terms: query ? [query] : [],
    };
  }

  function scrollToParagraphResult(result: SearchResult) {
    const el = contentRef.current;
    if (!el) return false;

    if (result.paragraphId) {
      const targetById = document.getElementById(result.paragraphId);
      if (targetById) {
        try { targetById.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { targetById.scrollIntoView(); }
        return true;
      }
    }

    if (typeof result.paragraphIdx === 'number') {
      const blocks = Array.from(el.querySelectorAll('p, blockquote')) as HTMLElement[];
      const target = blocks[result.paragraphIdx];
      if (target) {
        try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { target.scrollIntoView(); }
        return true;
      }
    }

    return false;
  }

  function runSearch() {
    // Support exact-phrase searches when the user wraps the query in
    // quotes (single or double). E.g. "the Lord" will only match that
    // exact phrase (word-boundary delimited), while unquoted queries
    // remain fuzzy/case-insensitive substring matches.
    const parsedQuery = parseSearchQuery(searchQuery);
    const { query, exact, isAnd, terms } = parsedQuery;
    if (!query) {
      setSearchResults([]);
      setHighlighted(null);
      setPendingScroll(null);
      return;
    }

    const results: SearchResult[] = [];

    if (isAnd) {
      const loweredTerms = terms.map((t) => t.toLocaleLowerCase());
      for (let idx = 0; idx < chapterIds.length; idx++) {
        const chapterHtml = getChapterHtml(idx);
        const doc = new DOMParser().parseFromString(chapterHtml || '', 'text/html');
        const blocks = Array.from(doc.body.querySelectorAll('p, blockquote'));
        blocks.forEach((block, pIdx) => {
          const txt = ((block.textContent || '').replace(/\s+/g, ' ').trim());
          if (!txt) return;
          const lowered = txt.toLocaleLowerCase();
          const hasAll = loweredTerms.every((term) => lowered.includes(term));
          if (!hasAll) return;
          const paragraphId = (block as HTMLElement).id || `gc-p-${idx + 1}-${pIdx + 1}`;
          results.push({
            idx,
            occ: 0,
            paragraphIdx: pIdx,
            paragraphId,
            snippet: txt,
          });
        });
      }
    } else {
      const esc = escapeRegExp(query);
      for (let idx = 0; idx < chapterIds.length; idx++) {
        const text = getChapterText(idx);
        let m: RegExpExecArray | null;
        let occ = 0;
        const pattern = exact ? `\\b${esc}\\b` : esc;
        const runner = new RegExp(pattern, 'gi');
        while ((m = runner.exec(text)) !== null) {
          results.push({ idx, occ });
          occ++;
          if (runner.lastIndex === m.index) runner.lastIndex++;
        }
      }
    }

    setSearchResults(results);
    if (results.length) {
      const first = results[0];
      setShowOpeningToc(false);
      setChapterIdx(first.idx);
      // In AND mode, results are paragraph-based and not a single phrase highlight.
      setHighlighted(isAnd ? null : query);
      setSearchIdx(0);
      setTimeout(() => {
        if (!scrollToParagraphResult(first)) {
          scrollToHighlight(first.occ || 0);
        }
      }, 200);
    } else {
      setHighlighted(null);
    }
  }

  function scrollToHighlight(occurrence = 0) {
    const el = contentRef.current;
    if (!el) return;
    const marks = el.querySelectorAll('.search-highlight');
    const m = marks[occurrence] as HTMLElement | undefined;
    if (m) {
      try {
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        m.scrollIntoView();
      }
      m.style.outline = '3px solid rgba(50,100,255,0.14)';
      setTimeout(() => {
        if (m) m.style.outline = '';
      }, 1200);
      return;
    }

    // Fallback: if marks are not present (sanitization or markup changed),
    // locate the nth occurrence of the highlighted query in the text nodes
    // and scroll the containing node into view.
    const hlQuery = (highlighted || '').trim();
    if (!hlQuery) return;
    try {
      const re = new RegExp(escapeRegExp(hlQuery), 'gi');
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null as any);
      let node: Node | null = walker.nextNode();
      let count = 0;
      while (node) {
        const txt = (node.nodeValue || '');
        let m2: RegExpExecArray | null;
        while ((m2 = re.exec(txt)) !== null) {
          if (count === occurrence) {
            // create a range around this match
            const range = document.createRange();
            range.setStart(node, m2.index);
            range.setEnd(node, m2.index + m2[0].length);
            const parent = range.startContainer.parentElement || (range.startContainer as any).parentNode as HTMLElement | null;
            if (parent) {
              try { parent.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { parent.scrollIntoView(); }
              parent.style.outline = '3px solid rgba(50,100,255,0.14)';
              setTimeout(() => { if (parent) parent.style.outline = ''; }, 1200);
            }
            range.detach?.();
            return;
          }
          count++;
          if (re.lastIndex === m2.index) re.lastIndex++;
        }
        node = walker.nextNode();
      }
    } catch {
      // ignore fallback errors
    }
  }

  useEffect(() => {
    if (!searchResults.length) return;
    const r = searchResults[Math.min(searchIdx, searchResults.length - 1)];
    if (r) {
      const parsedQuery = parseSearchQuery(searchQuery);
      setShowOpeningToc(false);
      setChapterIdx(r.idx);
      setHighlighted(parsedQuery.isAnd ? null : (parsedQuery.query || null));
      setTimeout(() => {
        if (!scrollToParagraphResult(r)) {
          scrollToHighlight(r.occ || 0);
        }
      }, 200);
    }
  }, [searchIdx, searchResults, searchQuery]);



  // When a click requests navigation to an occurrence we may need to wait
  // until the rendered HTML has been updated and highlights exist. Poll a
  // short while and then perform the scroll; this avoids race conditions
  // where scroll is attempted before marks are present in the DOM.
  useEffect(() => {
    if (pendingScroll === null) return;
    const el = contentRef.current;
    if (!el) return;
    const tryScroll = () => {
      // only attempt when the displayed chapter matches the pending target
      if (chapterIdx !== pendingScroll.idx) return false;
      if (scrollToParagraphResult(pendingScroll)) {
        setPendingScroll(null);
        return true;
      }
      const marks = el.querySelectorAll('.search-highlight');
      const occ = pendingScroll.occ || 0;
      if (marks.length > occ) {
        scrollToHighlight(occ);
        setPendingScroll(null);
        return true;
      }
      return false;
    };
    if (tryScroll()) return;
    const interval = setInterval(() => {
      if (tryScroll()) clearInterval(interval);
    }, 150);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      // final attempt only if chapter matches
      if (chapterIdx === pendingScroll.idx) {
        if (!scrollToParagraphResult(pendingScroll)) {
          scrollToHighlight(pendingScroll.occ || 0);
        }
      }
      setPendingScroll(null);
    }, 1200);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingScroll, chapterIdx, highlighted]);

  const currentHtmlRaw = getChapterHtml(chapterIdx);
  const isExternalHydrationLang = EXTERNAL_HYDRATION_LANGS.has(lang);
  const hasExternalPlaceholder = isExternalHydrationLang
    ? Boolean(extractExternalReadLinkFromChapterHtml(currentHtmlRaw))
    : false;
  const currentHtml = hasExternalPlaceholder
    ? '<div><p>Loading chapter…</p></div>'
    : currentHtmlRaw;
  const appendixChapterIdx = useMemo(() => findAppendixChapterIndex(toc), [toc]);
  const appendixPath = useMemo(() => {
    if (appendixChapterIdx < 0 || appendixChapterIdx >= toc.length) return null;
    const chapterTitle = toc[appendixChapterIdx]?.title || '';
    const chapterNumber = getChapterNumber(chapterTitle) ?? (appendixChapterIdx + 1);
    const chapterPrefix = getChapterRoutePrefix(lang);
    const chapterSlug = getChapterRouteSlug(lang, chapterTitle, chapterNumber);
    const abbr = (LANGUAGE_ABBREV[lang] || '').toLowerCase();
    return `/${abbr}/${chapterPrefix}-${chapterNumber}/${chapterSlug}`;
  }, [appendixChapterIdx, toc, lang]);
  // Avoid re-running expensive DOMParser work on every render when nothing
  // relevant changed. Pipeline the transforms so each step only re-computes
  // when its dependencies change.
  const highlightedHtml = useMemo(
    () => getHighlightedHtml(currentHtml, highlighted),
    [currentHtml, highlighted]
  );
  const appendixLinkedHtml = useMemo(
    () => cleanParagraphRefsAndLinkAppendix(highlightedHtml, appendixPath, chapterIdx === appendixChapterIdx),
    [highlightedHtml, appendixPath, chapterIdx, appendixChapterIdx]
  );
  const headingTransformedHtml = useMemo(
    () => transformChapterHeading(appendixLinkedHtml),
    [appendixLinkedHtml]
  );
  const htmlWithParagraphIds = useMemo(
    () => addParagraphIds(headingTransformedHtml, chapterIdx + 1),
    [headingTransformedHtml, chapterIdx]
  );
  const displayedHtml = useMemo(
    () => applyDropcap(htmlWithParagraphIds, lang, chapterIdx, toc),
    [htmlWithParagraphIds, lang, chapterIdx, toc]
  );

  // If URL has a paragraph hash, try to scroll it into view
  useEffect(() => {
    const hash = (window.location.hash || '').replace(/^#/, '');
    if (!hash) return;
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (el) {
        // Element found, scroll to it
        setTimeout(() => {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch {
            // Fallback: calculate position and scroll
            const rect = el.getBoundingClientRect();
            const scrollTop = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
            window.scrollTo({ top: scrollTop, behavior: 'smooth' });
          }
        }, 100);
      } else if (attempts < maxAttempts) {
        // Element not found yet, retry
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };
    
    // Start trying after initial render
    requestAnimationFrame(() => {
      setTimeout(tryScroll, 200);
    });
  }, [chapterIdx, displayedHtml]);

  // Derive a readable book title from language mapping/folder name.
  // This uses BOOK_TITLE_OVERRIDES (e.g. Chinese) when available.
  const displayTitle = getBookTitleFromFolder(lang);

  useEffect(() => {
    const localizedTitle = displayTitle || 'The Great Controversy';
    const languageName = LANGUAGE_NAMES[lang] || LANGUAGE_URL_NAMES[lang] || (LANGUAGE_ABBREV[lang] || 'en').toUpperCase();
    const abbr = (LANGUAGE_ABBREV[lang] || 'en').toLowerCase();
    const chapterTitle = (toc[chapterIdx]?.title || '').trim();
    const chapterNumber = getChapterNumber(chapterTitle) ?? (chapterIdx + 1);
    const cleanedChapterTitle = stripChapterPrefix(chapterTitle) || chapterTitle;
    const hasChapterView = !showOpeningToc && chapterIds.length > 0;

    const pageTitle = hasChapterView && cleanedChapterTitle
      ? `${cleanedChapterTitle} | ${localizedTitle}`
      : `${localizedTitle} | ${languageName}`;

    const localizedTagline = META_TAGLINES[abbr] || META_TAGLINES.en;
    const fallbackDescription = `${localizedTagline}.`;

    document.title = pageTitle;
    document.documentElement.setAttribute('lang', abbr);

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${window.location.pathname}`;

    const setMetaName = (name: string, content: string) => {
      let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const setMetaProperty = (property: string, content: string) => {
      let meta = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const setLink = (selector: string, rel: string, href: string, extra?: Record<string, string>) => {
      let link = document.head.querySelector(selector) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        document.head.appendChild(link);
      }
      link.setAttribute('rel', rel);
      link.setAttribute('href', href);
      if (extra) {
        Object.entries(extra).forEach(([k, v]) => link!.setAttribute(k, v));
      }
      return link;
    };

    setMetaName('description', fallbackDescription);
    setMetaName('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMetaProperty('og:title', pageTitle);
    setMetaProperty('og:description', fallbackDescription);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', hasChapterView ? 'article' : 'website');
    setMetaName('twitter:title', localizedTitle);
    setMetaName('twitter:description', fallbackDescription);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('apple-mobile-web-app-title', localizedTitle);

    setLink('link[rel="canonical"]', 'canonical', canonicalUrl);

    document.head.querySelectorAll('link[rel="alternate"][data-seo-alternate="1"]').forEach((node) => node.remove());
    LANGUAGE_FOLDERS.forEach((folder) => {
      const code = (LANGUAGE_ABBREV[folder] || '').toLowerCase();
      if (!code) return;
      const chapterRoutePrefix = getChapterRoutePrefix(folder);
      const path = hasChapterView
        ? `/${code}/${encodeURIComponent(chapterRoutePrefix)}-${chapterNumber}/chapter-${chapterNumber}`
        : `/${code}`;
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', `${origin}${path}`);
      link.setAttribute('data-seo-alternate', '1');
      document.head.appendChild(link);
    });

    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', `${origin}/`);
    xDefault.setAttribute('data-seo-alternate', '1');
    document.head.appendChild(xDefault);

    const jsonLdPayload: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'The Great Controversy',
          inLanguage: abbr,
          url: origin,
        },
        {
          '@type': 'Book',
          name: localizedTitle,
          inLanguage: abbr,
          url: canonicalUrl,
          author: {
            '@type': 'Person',
            name: 'Ellen G. White',
          },
        },
      ],
    };

    if (hasChapterView && cleanedChapterTitle) {
      (jsonLdPayload['@graph'] as Array<Record<string, unknown>>).push({
        '@type': 'Chapter',
        name: cleanedChapterTitle,
        inLanguage: abbr,
        isPartOf: {
          '@type': 'Book',
          name: localizedTitle,
          url: `${origin}/${abbr}`,
        },
        url: canonicalUrl,
      });
    }

    let jsonLd = document.head.querySelector('script[data-seo-jsonld="1"]') as HTMLScriptElement | null;
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.setAttribute('data-seo-jsonld', '1');
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(jsonLdPayload);
  }, [displayTitle, lang, chapterIdx, toc, showOpeningToc, chapterIds.length]);

  const contentsLabel = LANGUAGE_CONTENTS_LABELS[lang] || 'Contents';
  const tableOfContentsLabel = contentsLabel;
  const noContentsAvailableLabel = lang === CHINESE_FOLDER ? '暂无目录' : 'No contents available';
  const contactWhatsAppLabel = CONTACT_WHATSAPP_LABELS[lang] || 'Contact on WhatsApp';
  const contactWhatsAppWithNumberLabel = `${contactWhatsAppLabel}: ${getContactWhatsAppDisplayNumber(lang)}`;
  const isPolishContactLanguage = lang === POLISH_FOLDER;
  const contactQuestionsLabel = isPolishContactLanguage
    ? `Pytania: ${POLISH_QUESTIONS_EMAIL}`
    : contactWhatsAppLabel;
  const contactPrintOrderLabel = `Zamów drukowany egzemplarz: ${POLISH_PRINT_ORDER_EMAIL}`;
  const continueLabel = LANGUAGE_CONTINUE_LABELS[lang] || 'Continue';
  const hasLanguageAudio = AUDIO_AVAILABLE_LANGUAGE_FOLDERS.has(lang);
  const playChapterAudioLabel = 'Play chapter audio';
  const nowPlayingAudioLabel = 'Now playing audio chapter';
  const selectedAudioLabel = 'Audio chapter selected';
  const developerCredit = getDeveloperCreditText(lang);
  const isRtl = (lang || '').toLowerCase().includes('alsra') || lang === FARSI_FOLDER || lang === URDU_FOLDER;

  const languageMenuFolders = useMemo(() => {
    const englishFolder = 'The Great Controversy - Ellen G. White 2';
    const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

    const sortedRest = LANGUAGE_FOLDERS
      .filter((f) => f !== englishFolder)
      .sort((a, b) => {
        const aLabel = LANGUAGE_NAMES[a] || LANGUAGE_URL_NAMES[a] || a;
        const bLabel = LANGUAGE_NAMES[b] || LANGUAGE_URL_NAMES[b] || b;
        return collator.compare(aLabel, bLabel);
      });

    return LANGUAGE_FOLDERS.includes(englishFolder)
      ? [englishFolder, ...sortedRest]
      : sortedRest;
  }, []);

  const wrapperStyle: React.CSSProperties = {
    width: isDesktop ? `${pageWidth}px` : '100%',
    fontSize: `${textSize}px`,
    position: 'relative',
  };
  const isCurrentBookmarked =
    !showOpeningToc &&
    !!bookmark &&
    bookmark.lang === lang &&
    bookmark.chapterIdx === chapterIdx;
  const copyToastLabel = COPY_TOAST_LABELS[(LANGUAGE_ABBREV[lang] || 'en').toLowerCase()] || COPY_TOAST_LABELS.en;

  const openChapterAudioFromToc = (idx: number) => {
    const playableIdx = getPlayableAudioChapterIndex(idx);
    setAudioChapterIdx(playableIdx);
    setAudioUserExpanded(false);
    setAudioMinimized(true);
    setAudioHidden(false);
    setAudioAutoPlayRequest((v) => v + 1);
  };

  const handleBookmark = () => {
    if (showOpeningToc && bookmark) {
      if (bookmark.lang !== lang) {
        pendingChapterIdxRef.current = bookmark.chapterIdx;
        pendingChapterNumberRef.current = null;
        setLang(bookmark.lang);
      } else {
        setChapterIdx(bookmark.chapterIdx);
      }
      setShowOpeningToc(false);
      return;
    }

    if (isCurrentBookmarked) {
      localStorage.removeItem('reader-bookmark');
      setBookmark(null);
      return;
    }

    const next: ReaderBookmark = { lang, chapterIdx, ts: Date.now() };
    localStorage.setItem('reader-bookmark', JSON.stringify(next));
    setBookmark(next);
  };

  const decreaseTextSize = () => {
    setTextSize((s) => {
      const next = Math.max(12, s - 1);
      localStorage.setItem('reader-text-size', String(next));
      return next;
    });
  };

  const increaseTextSize = () => {
    setTextSize((s) => {
      const next = Math.min(36, s + 1);
      localStorage.setItem('reader-text-size', String(next));
      return next;
    });
  };

  return (
    <div className="reader-root">
      {/* Language title removed — header icons now indicate language */}
      <header className="reader-header-bar">
        <div className="reader-header-bar-inner" style={{ width: isDesktop ? `${pageWidth}px` : '100%' }}>
          <div className="reader-header-controls">
            {/* Localized book title on the left */}
            <div
              className="reader-header-title"
              style={{ fontWeight: 600 }}
              role="button"
              tabIndex={0}
              onClick={() => {
                setShowOpeningToc(true);
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch {
                  window.scrollTo(0, 0);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowOpeningToc(true);
                }
              }}
              aria-label={`Open contents for ${displayTitle}`}
            >
              {displayTitle}
            </div>
            {/* Chapter menu (burger) - leftmost */}
            <button
              className="reader-burger-icon"
              ref={burgerBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowSearch(false);
                setShowShareMenu(false);
                setShowLangMenu(false);
                setShowMoreMenu(false);
                setShowOpeningToc(true);
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch {
                  window.scrollTo(0, 0);
                }
              }}
              aria-label={contentsLabel}
            >
              <MdMenu size={28} />
            </button>

            {/* Spacer to push utilities to the right */}
            <div className="reader-right-controls" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Previous chapter button */}
              <button
                className="reader-prev-chapter"
                aria-label="Previous chapter"
                disabled={showOpeningToc || chapterIdx <= 0}
                onClick={() => {
                  if (showOpeningToc) return;
                  if (chapterIdx > 0) {
                    setChapterIdx(chapterIdx - 1);
                    scrollToTop();
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={isRtl ? '9 6 15 12 9 18' : '15 18 9 12 15 6'} />
                </svg>
              </button>

              {/* Next chapter button */}
              <button
                className="reader-next-chapter"
                aria-label="Next chapter"
                disabled={showOpeningToc || chapterIdx >= chapterIds.length - 1}
                onClick={() => {
                  if (showOpeningToc) return;
                  if (chapterIdx < chapterIds.length - 1) {
                    setChapterIdx(chapterIdx + 1);
                    scrollToTop();
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={isRtl ? '15 18 9 12 15 6' : '9 6 15 12 9 18'} />
                </svg>
              </button>
              {/* Content actions group */}
              <button
                className={`reader-bookmark-btn${isCurrentBookmarked ? ' active' : ''}`}
                aria-label={showOpeningToc && bookmark ? 'Go to bookmark' : isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
                title={showOpeningToc && bookmark ? 'Go to bookmark' : isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
                onClick={handleBookmark}
              >
                {isCurrentBookmarked ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
              </button>

              <button
                className="reader-search-icon"
                ref={searchBtnRef}
                onClick={() => {
                  const btn = searchBtnRef.current;
                  if (btn) {
                    const r = btn.getBoundingClientRect();
                    setSearchPanelStyle({ position: 'fixed', top: r.bottom + 8, left: r.left, minWidth: 320 });
                  }
                  setShowSearch(true);
                  setTimeout(() => {
                    const el = document.querySelector('.reader-search-input') as HTMLInputElement | null;
                    el?.focus();
                  }, 120);
                }}
                aria-label="Search"
              >
                <MdSearch size={24} />
              </button>

              <button
                ref={langBtnRef}
                className="reader-lang-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangPanelStyle(getAnchoredPanelStyle(langBtnRef.current, 260));
                  setShowLangMenu((v) => !v);
                }}
                aria-label="Language"
              >
                <MdTranslate size={26} />
              </button>

              <button
                className="reader-share-icon"
                ref={shareBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  const btn = shareBtnRef.current;
                  if (btn) {
                    const r = btn.getBoundingClientRect();
                    setSharePanelStyle({ position: 'fixed', top: r.bottom + 8, left: r.left, minWidth: 220 });
                  }
                  setShowShareMenu((v) => !v);
                }}
                aria-label="Share"
              >
                <MdShare size={22} />
              </button>

              <button
                className="reader-whatsapp-icon"
                onClick={isPolishContactLanguage ? openPolishQuestionsEmail : handleWhatsAppContact}
                aria-label={isPolishContactLanguage ? contactQuestionsLabel : contactWhatsAppWithNumberLabel}
                title={isPolishContactLanguage ? contactQuestionsLabel : contactWhatsAppWithNumberLabel}
              >
                {isPolishContactLanguage ? <IoMdMail size={22} /> : <FaWhatsapp size={22} />}
              </button>

              <button
                className="reader-donate-icon"
                onClick={handleStripeDonate}
                aria-label="Donate via Stripe"
                title="Donate"
              >
                <MdFavorite size={20} />
                <span>Donate</span>
              </button>

              {/* Mobile expand (More) menu */}
              <button
                className="reader-more-icon"
                ref={moreBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  const btn = moreBtnRef.current;
                  if (btn) {
                    const r = btn.getBoundingClientRect();
                    setMorePanelStyle({ position: 'fixed', top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right), minWidth: 220 });
                  }
                  setShowMoreMenu((v) => !v);
                }}
                aria-label="More"
              >
                <MdMoreVert size={22} />
              </button>

              {/* Appearance controls group */}
              <div className="reader-text-size-controls" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                <button
                  className="reader-text-size-btn"
                  aria-label="Decrease text size"
                  onClick={decreaseTextSize}
                >
                  A −
                </button>
                <button
                  className="reader-text-size-btn"
                  aria-label="Increase text size"
                  onClick={increaseTextSize}
                >
                  A +
                </button>
              </div>

              <button
                className="reader-darkmode-toggle"
                onClick={() => setIsDark((d) => !d)}
                aria-label="Toggle dark mode"
              >
                {isDark ? <MdDarkMode size={22} /> : <MdLightMode size={22} />}
              </button>
              {isDesktop && (
                <div className="reader-width-control" role="group" aria-label="Adjust content width">
                  <button
                    className="reader-width-arrow-btn"
                    aria-label="Decrease content width"
                    title="Decrease content width"
                    onClick={() => changeDesktopWidthPreset('decrease')}
                    disabled={!canDecreaseDesktopWidth}
                  >
                    ←
                  </button>
                  <div
                    className="reader-width-indicator"
                    aria-label={`Content width ${desktopWidthPreset}`}
                    title={`Content width ${desktopWidthPreset}`}
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
                      <polyline points="5,9 3,11 5,13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17,9 19,11 17,13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span
                      className="reader-width-indicator-active"
                      style={{ width: `${widthIndicatorPercent}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <button
                    className="reader-width-arrow-btn"
                    aria-label="Increase content width"
                    title="Increase content width"
                    onClick={() => changeDesktopWidthPreset('increase')}
                    disabled={!canIncreaseDesktopWidth}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showShareMenu && (
        <div
          ref={shareMenuRef}
          className="reader-share-dropdown"
          style={sharePanelStyle || undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleShareApp('facebook')} aria-label="Share on Facebook">
            <FaFacebookF size={16} />
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShareApp('twitter')} aria-label="Share on X (Twitter)">
            <FaXTwitter size={16} />
            <span>X (Twitter)</span>
          </button>
          {isPolishContactLanguage ? (
            <>
              <button onClick={openPolishQuestionsEmail} aria-label={contactQuestionsLabel}>
                <IoMdMail size={18} />
                <span>{contactQuestionsLabel}</span>
              </button>
              <button onClick={openPolishPrintOrderEmail} aria-label={contactPrintOrderLabel}>
                <IoMdMail size={18} />
                <span>{contactPrintOrderLabel}</span>
              </button>
            </>
          ) : (
            <button onClick={handleWhatsAppContact} aria-label={contactWhatsAppLabel}>
              <FaWhatsapp size={18} />
              <span>{contactWhatsAppLabel}</span>
            </button>
          )}
          <button onClick={() => handleShareApp('email')} aria-label="Share via Email">
            <IoMdMail size={18} />
            <span>Email</span>
          </button>
          <button onClick={handleStripeDonate} aria-label="Donate via Stripe">
            <MdFavorite size={18} />
            <span>Donate</span>
          </button>
        </div>
      )}

      {showMoreMenu && (
        <div
          ref={moreMenuRef}
          className="reader-share-dropdown"
          style={morePanelStyle || undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {!isAppInstalled && installPromptEvent && (
            <button onClick={handleInstallApp} aria-label="Install app">
              <MdDownload size={20} />
              <span>Install app</span>
            </button>
          )}
          {isAppInstalled && (
            <div className="reader-menu-status" aria-live="polite">
              <MdCheckCircle size={20} />
              <span>App installed</span>
            </div>
          )}
          <button
            onClick={() => {
              handleBookmark();
              setShowMoreMenu(false);
            }}
            aria-label={showOpeningToc && bookmark ? 'Go to bookmark' : isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
          >
            {isCurrentBookmarked ? <MdBookmark size={20} /> : <MdBookmarkBorder size={20} />}
            <span>{showOpeningToc && bookmark ? 'Go to bookmark' : isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark'}</span>
          </button>
          <button
            onClick={() => {
              setLangPanelStyle(getAnchoredPanelStyle(moreBtnRef.current, 260));
              setShowLangMenu(true);
              setShowMoreMenu(false);
            }}
            aria-label="Language"
          >
            <MdTranslate size={20} />
            <span>Language</span>
          </button>
          <button
            onClick={() => {
              setIsDark((d) => !d);
              setShowMoreMenu(false);
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            onClick={() => {
              const enable = analyticsConsentStatus !== 'granted';
              setAnalyticsConsent(enable);
              setAnalyticsConsentStatus(enable ? 'granted' : 'denied');
              setShowMoreMenu(false);
            }}
            aria-label="Privacy settings"
          >
            <MdPrivacyTip size={20} />
            <span>{analyticsConsentStatus === 'granted' ? 'Privacy: Analytics on' : 'Privacy: Analytics off'}</span>
          </button>
          <button onClick={() => handleShareApp('facebook')} aria-label="Share on Facebook">
            <FaFacebookF size={16} />
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShareApp('twitter')} aria-label="Share on X (Twitter)">
            <FaXTwitter size={16} />
            <span>X (Twitter)</span>
          </button>
          {isPolishContactLanguage ? (
            <>
              <button onClick={openPolishQuestionsEmail} aria-label={contactQuestionsLabel}>
                <IoMdMail size={18} />
                <span>{contactQuestionsLabel}</span>
              </button>
              <button onClick={openPolishPrintOrderEmail} aria-label={contactPrintOrderLabel}>
                <IoMdMail size={18} />
                <span>{contactPrintOrderLabel}</span>
              </button>
            </>
          ) : (
            <button onClick={handleWhatsAppContact} aria-label={contactWhatsAppLabel}>
              <FaWhatsapp size={18} />
              <span>{contactWhatsAppLabel}</span>
            </button>
          )}
          <button onClick={() => handleShareApp('email')} aria-label="Share via Email">
            <IoMdMail size={18} />
            <span>Email</span>
          </button>
          <button onClick={handleStripeDonate} aria-label="Donate via Stripe">
            <MdFavorite size={18} />
            <span>Donate</span>
          </button>
        </div>
      )}

      {showOpeningToc ? (
        <main className="reader-main">
          <div className="reader-wrapper" style={wrapperStyle}>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <>
                <section className="reader-opening-toc-inline" aria-label={tableOfContentsLabel}>
                  <div className="reader-opening-toc-inline-header">
                    <div className="reader-opening-toc-inline-titles">
                      <div className="reader-opening-subtitle">{contentsLabel}</div>
                    </div>
                    <div className="reader-opening-toc-inline-actions">
                      <button
                        className="reader-opening-continue"
                        onClick={() => {
                          setShowOpeningToc(false);
                          try {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } catch {
                            window.scrollTo(0, 0);
                          }
                        }}
                        aria-label={continueLabel}
                      >
                        {continueLabel}
                      </button>
                    </div>
                  </div>

                  <ul className="reader-toc-list reader-opening-toc-list">
                    {toc.length === 0 && <li className="reader-toc-empty">{noContentsAvailableLabel}</li>}
                    {toc.map((t, i) => {
                      const chapterNum = getChapterNumber(t.title);
                      const titleOnly = chapterNum ? stripChapterPrefix(t.title) : t.title;
                      const chapterLabel = LANGUAGE_CHAPTER_LABELS[lang] || 'Chapter';
                      const isActiveAudioChapter = hasLanguageAudio && i === audioChapterIdx;
                      return (
                        <li key={t.href}>
                          <div className="reader-toc-row">
                            <button
                              className={`reader-toc-item-btn ${i === chapterIdx ? 'active' : ''}`}
                              onClick={() => {
                                setChapterIdx(i);
                                setShowOpeningToc(false);
                                try {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                } catch {
                                  window.scrollTo(0, 0);
                                }
                              }}
                            >
                              {chapterNum && <span className="reader-toc-num">{chapterLabel} {chapterNum}</span>}
                              <span className={`reader-toc-title${chapterNum ? '' : ' full-title'}`}>{titleOnly}</span>
                            </button>
                            {hasLanguageAudio ? (
                              <button
                                type="button"
                                className={`reader-toc-audio-btn${isActiveAudioChapter ? ' is-selected' : ''}${isActiveAudioChapter && audioPlaying ? ' is-playing' : ''}`}
                                aria-label={isActiveAudioChapter ? (audioPlaying ? nowPlayingAudioLabel : selectedAudioLabel) : playChapterAudioLabel}
                                title={playChapterAudioLabel}
                                onClick={() => openChapterAudioFromToc(i)}
                              >
                                <MdPlayArrow size={16} />
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </>
            )}

            <footer className="reader-footer">
              <div className="reader-footer-inner">
                {COPYRIGHTS[lang] || `© ${getBookTitleFromFolder(lang) || LANGUAGE_NAMES[lang] || lang}`}
                {' · '}
                <a href={DEVELOPER_LINK} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {developerCredit}
                </a>
              </div>
            </footer>
          </div>
        </main>
      ) : (
            <BookContent
              loading={loading || externalChapterHydrating}
          isDesktop={isDesktop}
          pageWidth={pageWidth}
          textSize={textSize}
          displayedHtml={displayedHtml}
          contentRef={contentRef}
          copyrightText={(COPYRIGHTS[lang] || `© ${getBookTitleFromFolder(lang) || LANGUAGE_NAMES[lang] || lang}`)}
          lang={lang}
          chapterIdx={chapterIdx}
        />
      )}

      {audioHidden ? (
        <button
          className={`reader-audio-restore-btn${audioPlaying ? ' is-playing' : ''}`}
          onClick={() => setAudioHidden(false)}
          aria-label="Show player"
          title="Show player"
        >
          <MdHeadphones size={16} />
        </button>
      ) : null}

      <section
        className={`reader-audio-section${audioHidden ? ' is-hidden' : ''}`}
        aria-label="Chapter audio player"
        aria-hidden={audioHidden}
        style={{ width: isDesktop ? `${pageWidth}px` : 'calc(100vw - 16px)' }}
      >
        <AudioPlayer
          key={`audio-${lang}`}
          lang={lang}
          chapterIdx={audioChapterIdx}
          chapterTitle={audioChapterTitle}
          onNextChapter={handleNextChapter}
          onPrevChapter={handlePrevChapter}
          canNextChapter={audioChapterIdx < toc.length - 1}
          canPrevChapter={audioChapterIdx > 0}
          minimized={FORCE_MINIMIZED_PLAYER ? true : audioMinimized}
          autoPlayRequest={audioAutoPlayRequest}
          onPlayingChange={setAudioPlaying}
          continuePlay={audioContinuePlay}
          onToggleContinuePlay={() => setAudioContinuePlay((v) => !v)}
          onExpand={() => {
            if (FORCE_MINIMIZED_PLAYER) return;
            setAudioUserExpanded(true);
            setAudioMinimized(false);
          }}
          onMinimize={() => {
            if (FORCE_MINIMIZED_PLAYER) return;
            setAudioUserExpanded(false);
            setAudioMinimized(true);
          }}
          onHide={() => setAudioHidden(true)}
          containerWidth={isDesktop ? pageWidth : null}
        />
      </section>

      {showSearch && (
        <div className="reader-search-modal" onClick={() => setShowSearch(false)}>
          <div className="reader-search-card" onClick={(e) => e.stopPropagation()}>
            <div className="reader-search-bar">
              <input
                className="reader-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch();
                }}
                placeholder="Search in this language"
              />
              <button className="reader-search-close" onClick={() => setShowSearch(false)}>✕</button>
            </div>
            <div className="reader-search-results">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setSearchIdx((i) => Math.max(0, i - 1))}>Prev</button>
                <div style={{ minWidth: 80, textAlign: 'center' }}>{searchResults.length ? `${searchIdx + 1} / ${searchResults.length}` : '0 / 0'}</div>
                <button onClick={() => setSearchIdx((i) => Math.min((searchResults.length - 1) || 0, i + 1))}>Next</button>
                <button onClick={() => runSearch()}>Search</button>
              </div>
              {/* Render simple snippets for results */}
              {searchResults.length === 0 && <div className="reader-search-noresults">No results</div>}
              {searchResults.map((r, i) => {
                const parsed = parseSearchQuery(searchQuery);
                const displayQ = parsed.query;
                const text = getChapterText(r.idx);
                const snippet = (() => {
                  if (r.snippet) return r.snippet;
                  const idx = (() => {
                    let found = 0;
                    const re = new RegExp(escapeRegExp(displayQ), 'gi');
                    let m: RegExpExecArray | null;
                    while ((m = re.exec(text)) !== null) {
                      if (found === r.occ) return m.index;
                      found++;
                      if (re.lastIndex === m.index) re.lastIndex++;
                    }
                    return -1;
                  })();
                  return idx >= 0
                    ? text.substr(Math.max(0, idx - 40), Math.min(220, text.length - idx + 40))
                    : text.substr(0, 220);
                })();

                const highlightedSnippetHtml = (() => {
                  const safe = escapeHtml(snippet);
                  const terms = parsed.isAnd ? parsed.terms : (displayQ ? [displayQ] : []);
                  if (!terms.length) return safe;
                  let html = safe;
                  terms
                    .slice()
                    .sort((a, b) => b.length - a.length)
                    .forEach((term) => {
                      if (!term) return;
                      html = html.replace(new RegExp(escapeRegExp(term), 'gi'), (m) => `<mark class=\"search-highlight\">${m}</mark>`);
                    });
                  return html;
                })();

                return (
                  <button
                    key={`${r.idx}-${r.occ}-${r.paragraphIdx ?? 'x'}-${i}`}
                    className="reader-search-result"
                    onClick={() => {
                        // close search modal so the book content is visible,
                        // then navigate to the chapter and request a scroll to the matched paragraph/occurrence
                        setShowSearch(false);
                      setShowOpeningToc(false);
                        setChapterIdx(r.idx);
                        setSearchIdx(i);
                        if (parsed.isAnd) {
                          setHighlighted(null);
                        } else {
                          // ensure highlights are enabled for phrase/single-term searches
                          setHighlighted(displayQ || null);
                        }
                        // defer actual scrolling until the rendered HTML contains the target
                        setPendingScroll({
                          idx: r.idx,
                          occ: r.occ,
                          paragraphIdx: r.paragraphIdx,
                          paragraphId: r.paragraphId,
                        });
                      }}
                  >
                    {/* Chapter label: show the TOC title when available, fallback to Chapter N */}
                    <div className="reader-search-chapter">
                      {toc && toc[r.idx] && toc[r.idx].title ? toc[r.idx].title : `Chapter ${r.idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'inherit' }} dangerouslySetInnerHTML={{ __html: highlightedSnippetHtml }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showLangMenu && (
        <div
          ref={langMenuRef}
          className="reader-lang-panel"
          style={langPanelStyle || undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            {languageMenuFolders.map((f) => (
              <li key={f}>
                <button
                  disabled={f === lang}
                  onClick={() => {
                    setLang(f);
                    setChapterIdx(0);
                    setAudioChapterIdx(0);
                    setAudioPlaying(false);
                    setShowLangMenu(false);
                  }}
                >
                  <span>{getLanguageMenuLabel(f)}</span>
                  {AUDIO_AVAILABLE_LANGUAGE_FOLDERS.has(f) ? (
                    <span className="reader-lang-audio-icon" aria-label={getAudioAvailableLabel(f)} title={getAudioAvailableLabel(f)}>
                      <MdHeadphones size={16} />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Text selection share popup */}
      {showSharePopup && (
        <div
          ref={sharePopupRef}
          className="reader-share-popup"
          style={(() => {
            // Clamp popup position to viewport
            const width = 260; // estimated popup width
            const margin = 8;
            let left = sharePopupPos.left;
            let top = sharePopupPos.top;
            if (typeof window !== 'undefined') {
              const maxLeft = window.innerWidth - width / 2 - margin;
              const minLeft = width / 2 + margin;
              if (left > maxLeft) left = maxLeft;
              if (left < minLeft) left = minLeft;
              // Clamp top if needed (optional, for very small screens)
              const minTop = margin;
              const maxTop = window.innerHeight - 60;
              if (top < minTop) top = minTop;
              if (top > maxTop) top = maxTop;
            }
            return {
              position: 'fixed',
                  top: `${top}px`,
                  left: `${left}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 10000,
                  background: isDark ? '#23243a' : '#fff',
                  color: isDark ? '#ffe066' : '#23235a',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 8,
                  padding: '6px'
                };
          })()}
          onMouseDown={e => { restoreSelection(); e.stopPropagation(); e.preventDefault(); }}
          onTouchStart={e => { restoreSelection(); e.stopPropagation(); e.preventDefault(); }}
          onMouseEnter={restoreSelection}
        >
          <div className="reader-share-popup-content">
            <button 
              onClick={handleCopy}
              aria-label="Copy text"
              title="Copy"
            >
              <MdContentCopy size={18} />
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button 
                onClick={() => handleShare('native')}
                aria-label="Share"
                title="Share"
              >
                <MdShare size={18} />
              </button>
            )}
            <button 
              onClick={() => handleShare('facebook')}
              aria-label="Share on Facebook"
              title="Facebook"
            >
              <FaFacebookF size={16} />
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              aria-label="Share on X/Twitter"
              title="X (Twitter)"
            >
              <FaXTwitter size={16} />
            </button>
            <button 
              onClick={() => handleShare('whatsapp')}
              aria-label="Share on WhatsApp"
              title="WhatsApp"
            >
              <FaWhatsapp size={18} />
            </button>
            <button 
              onClick={() => handleShare('email')}
              aria-label="Share via Email"
              title="Email"
            >
              <IoMdMail size={18} />
            </button>
            <button 
              onClick={() => {
                setShowSharePopup(false);
                // restore iOS touch callout when popup closed
                try {
                  if (contentRef.current && (contentRef.current as any).style) {
                    (contentRef.current as any).style.webkitTouchCallout = '';
                  }
                } catch {}
                window.getSelection()?.removeAllRanges();
              }}
              aria-label="Close"
              title="Close"
              className="reader-share-close"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>
      )}
      {showCopyToast && (
        <div
          className="reader-share-feedback reader-share-feedback-near"
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: `${copyToastPos.top}px`,
            left: `${copyToastPos.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 10001,
          }}
        >
          {copyToastLabel}
        </div>
      )}
      {!showOpeningToc && !loading && (
        <div
          className="reader-scroll-percent"
          aria-label={`Chapter read ${chapterReadPercent}%`}
          title={`Chapter read ${chapterReadPercent}%`}
        >
          {chapterReadPercent}%
        </div>
      )}
    </div>
  );
    }


