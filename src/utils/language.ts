import { book } from "../data/book";

export function getDefaultLanguage(): string {
  const lang = navigator.language.split("-")[0];
  return book[lang] ? lang : "en";
}

export function getAvailableLanguages(): string[] {
  return Object.keys(book);
}

// Human-readable names for the language folders used by `BookReader.tsx`.
// Keep this list in sync with the language folder keys used in the reader.
export const LANGUAGE_NAMES: Record<string, string> = {
  'The Great Controversy - Ellen G. White 2': 'English',
  'El Conflicto de los Siglos - Ellen G. White': 'Spanish',
  'Der grosse Kampf - Ellen G. White': 'German',
  'Il gran conflitto - Ellen G. White': 'Italian',
  'MOD EN BEDRE FREMTID - Ellen G. White': 'Danish',
  'Mot historiens klimaks - Ellen G. White': 'Norwegian',
  'O Grande Conflito - Ellen G. White': 'Portuguese',
  'O Le Finauga Tele - Ellen G. White': 'Samoan',
  'Suur Voitlus - Ellen G. White': 'Estonian',
  'Tragedia veacurilor - Ellen G. White': 'Romanian',
  'VELIKA BORBA IZMEDU KRISTA I SOTONE - Ellen G. White': 'Hrvatski',
  'VIeLIKATA BORBA MIeZhDU KhRISTA i SATANA - Ellen G. White': 'Bulgarian',
  'Velke drama veku - Ellen G. White': 'Slovak',
  'Velky spor vekov - Ellen G. White': 'Czech',
  "Vielika borot'ba - Ellen G. White": 'Ukrainian',
  "Vielikaia bor'ba - Ellen G. White": 'Russian',
  'Wielki boj - Ellen G. White': 'Polish',
  "alSra` al`Zym - Ellen G. White": 'Arabic',
  'Amharic - Ellen G. White': 'Amharic',
  'Chinese - Ellen G. White': 'Chinese',
  'Japanese - Ellen G. White': 'Japanese',
  'Korean - Ellen G. White': 'Korean',
  'Serbian - Ellen G. White': 'Serbian',
  'Farsi - Ellen G. White': 'Farsi',
  'Afrikaans - Ellen G. White': 'Afrikaans',
  'Hindi - Ellen G. White': 'Hindi',
  'Bengali - Ellen G. White': 'Bengali',
  'Indonesian - Ellen G. White': 'Indonesian',
  'French - Ellen G. White': 'French',
};
