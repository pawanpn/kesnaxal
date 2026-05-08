"use client";

import { useCallback, useRef } from "react";

type Locale = "en" | "ne" | "ja";

const LOCALES: Locale[] = ["en", "ne", "ja"];

const API = "https://api.mymemory.translated.net/get";

// In-memory cache for translations
const cache = new Map<string, string>();

function cacheKey(text: string, from: Locale, to: Locale): string {
  return `${from}→${to}:${text}`;
}

export async function translateText(text: string, from: Locale, to: Locale): Promise<string> {
  if (!text.trim()) return "";
  if (from === to) return text;

  const key = cacheKey(text, from, to);
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `${API}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText || text;
    cache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

/** Translate text to all other locales at once — returns the translated map */
export async function translateToAll(text: string, from: Locale): Promise<Partial<Record<Locale, string>>> {
  if (!text.trim()) return {};
  const targets = LOCALES.filter((l) => l !== from);
  const results: Partial<Record<Locale, string>> = {};
  for (const to of targets) {
    results[to] = await translateText(text, from, to);
  }
  return results;
}

/** Hook for manual translate button — trigger translate, get results */
export function useTranslateField() {
  const translating = useRef(false);

  const handleTranslate = useCallback(
    async (text: string, from: Locale, onResult: (locale: Locale, translated: string) => void): Promise<boolean> => {
      if (!text.trim() || translating.current) return false;
      translating.current = true;
      try {
        const results = await translateToAll(text, from);
        for (const [loc, val] of Object.entries(results)) {
          if (val) onResult(loc as Locale, val);
        }
        return true;
      } catch {
        return false;
      } finally {
        translating.current = false;
      }
    },
    []
  );

  return { handleTranslate };
}
