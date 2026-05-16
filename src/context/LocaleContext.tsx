"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import { translations, locales } from "@/translations";
import type { Locale, Translations } from "@/types";
import {
  translateText as _translateText,
  translateToAll as _translateToAll,
  useTranslateField,
} from "@/lib/autoTranslate";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  locales: typeof locales;
  translateText: (text: string, from: Locale, to: Locale) => Promise<string>;
  translateToAll: (text: string, from: Locale) => Promise<Partial<Record<Locale, string>>>;
  handleTranslate?: (
    text: string,
    from: Locale,
    onResult: (locale: Locale, translated: string) => void
  ) => Promise<boolean>;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);
  const { handleTranslate } = useTranslateField();

  const translateText = useCallback(
    (text: string, from: Locale, to: Locale) => _translateText(text, from, to),
    []
  );

  const translateToAll = useCallback(
    (text: string, from: Locale) => _translateToAll(text, from),
    []
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        t: translations[locale],
        locales,
        translateText,
        translateToAll,
        handleTranslate,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}
