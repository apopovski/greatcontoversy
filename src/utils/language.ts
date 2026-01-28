import { book } from "../data/book";

export function getDefaultLanguage(): string {
  const lang = navigator.language.split("-")[0];
  return book[lang] ? lang : "en";
}

export function getAvailableLanguages(): string[] {
  return Object.keys(book);
}
