import { useState } from "react";
import { Chapter } from "../data/book";

export function useSearch(chapters: Chapter[]) {
  const [query, setQuery] = useState("");
  const results = query
    ? chapters
        .map((c, idx) => ({ ...c, idx }))
        .filter(c =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.text.toLowerCase().includes(query.toLowerCase())
        )
    : [];
  return { query, setQuery, results };
}
