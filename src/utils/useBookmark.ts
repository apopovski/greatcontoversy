import { useState } from "react";

const KEY = "book-bookmark";

export function useBookmark() {
  const [bookmark, setBookmark] = useState<number | null>(() => {
    const saved = localStorage.getItem(KEY);
    return saved ? Number(saved) : null;
  });
  function saveBookmark(idx: number) {
    setBookmark(idx);
    localStorage.setItem(KEY, String(idx));
  }
  return { bookmark, saveBookmark };
}
