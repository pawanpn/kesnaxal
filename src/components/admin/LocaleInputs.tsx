"use client";

import { useState, useCallback } from "react";
import { translateToAll } from "@/lib/autoTranslate";

type Locale = "en" | "ne" | "ja";

interface LocaleInputsProps {
  values: Record<Locale, string>;
  onChange: (locale: Locale, value: string) => void;
  sourceLocale: Locale;
  syncAll: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "url" | "email";
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

export default function LocaleInputs({
  values, onChange, sourceLocale, syncAll, placeholder, multiline, rows = 2, type = "text",
}: LocaleInputsProps) {
  const [translating, setTranslating] = useState(false);

  const handleChange = (locale: Locale, value: string) => {
    if (syncAll && locale === sourceLocale) {
      LOCALES.forEach(({ id: l }) => onChange(l, value));
    } else {
      onChange(locale, value);
    }
  };

  const handleTranslate = useCallback(async () => {
    const sourceText = values[sourceLocale];
    if (!sourceText?.trim()) return;
    setTranslating(true);
    try {
      const results = await translateToAll(sourceText, sourceLocale);
      for (const [loc, val] of Object.entries(results)) {
        if (val) onChange(loc as Locale, val);
      }
    } catch { /* ignore */ }
    setTranslating(false);
  }, [values, sourceLocale, onChange]);

  return (
    <div className="flex gap-1.5 items-start">
      <div className="flex-1 grid grid-cols-3 gap-2">
        {LOCALES.map(({ id: l }) => (
          <div key={l} className="relative">
            <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
            {multiline ? (
              <textarea
                value={values[l] || ""}
                onChange={(e) => handleChange(l, e.target.value)}
                rows={rows}
                className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                placeholder={placeholder ? `${placeholder} (${l.toUpperCase()})` : undefined}
              />
            ) : (
              <input
                type={type}
                value={values[l] || ""}
                onChange={(e) => handleChange(l, e.target.value)}
                className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none"
                placeholder={placeholder ? `${placeholder} (${l.toUpperCase()})` : undefined}
              />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleTranslate}
        disabled={translating || !values[sourceLocale]?.trim()}
        title={`Translate ${sourceLocale.toUpperCase()} → others`}
        className="shrink-0 mt-1 p-1.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {translating ? (
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        )}
      </button>
    </div>
  );
}
