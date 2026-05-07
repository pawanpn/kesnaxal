"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import { translations, locales } from "@/translations";
import type { Locale, Translations } from "@/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  locales: typeof locales;
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

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        t: translations[locale],
        locales,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}
