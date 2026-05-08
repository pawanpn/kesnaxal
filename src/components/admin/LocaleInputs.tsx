"use client";

import { useAutoTranslate } from "@/lib/autoTranslate";

type Locale = "en" | "ne" | "ja";

interface LocaleInputsProps {
  values: Record<Locale, string>;
  onChange: (locale: Locale, value: string) => void;
  sourceLocale: Locale;
  autoTranslate: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "url" | "email";
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

export default function LocaleInputs({
  values, onChange, sourceLocale, autoTranslate, placeholder, multiline, rows = 2, type = "text",
}: LocaleInputsProps) {
  const { translateAll } = useAutoTranslate();

  const handleChange = (locale: Locale, value: string) => {
    onChange(locale, value);
    if (autoTranslate && locale === sourceLocale && value.trim()) {
      translateAll(value, sourceLocale, (targetLocale, translated) => {
        onChange(targetLocale, translated);
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
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
  );
}
