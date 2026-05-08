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
    return text; // fallback to original text
  }
}

export function useAutoTranslate() {
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const translateAll = useCallback(
    async (text: string, fromLocale: Locale, onTranslated: (locale: Locale, translated: string) => void) => {
      if (!text.trim()) return;

      const targets = LOCALES.filter((l) => l !== fromLocale);

      for (const to of targets) {
        const timerKey = `${fromLocale}→${to}`;
        const existing = timers.current.get(timerKey);
        if (existing) clearTimeout(existing);

        timers.current.set(
          timerKey,
          setTimeout(async () => {
            const translated = await translateText(text, fromLocale, to);
            onTranslated(to, translated);
          }, 400)
        );
      }
    },
    []
  );

  return { translateAll };
}
