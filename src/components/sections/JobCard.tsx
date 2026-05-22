"use client";

import Badge from "@/components/ui/Badge";
import { resolveJob } from "@/lib/translate";
import type { JobVacancy, Translations, Locale } from "@/types";

function formatDateLocale(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ne: "ne-NP",
    ja: "ja-JP",
  };
  return date.toLocaleDateString(localeMap[locale] || "en-US", options);
}

function safeFormatDate(dateStr: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  if (!dateStr || dateStr.trim() === "") return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return formatDateLocale(d, locale, options);
}

interface JobCardProps {
  job: JobVacancy;
  isSelected: boolean;
  locale: Locale;
  t: Translations;
  onToggleDetails: (job: JobVacancy) => void;
  onApply: (job: JobVacancy) => void;
}

export default function JobCard({ job, isSelected, locale, t, onToggleDetails, onApply }: JobCardProps) {
  const resolved = resolveJob(job, locale);
  const catEn = job.category.en;

  const addedOnStr = safeFormatDate(job.addedOn, locale, { day: "numeric", month: "short", year: "numeric" });
  const expiresOnStr = safeFormatDate(job.expiresOn, locale, { day: "numeric", month: "short", year: "numeric" });
  const isExpired = job.expiresOn && job.expiresOn.trim() !== "" && !isNaN(new Date(job.expiresOn).getTime())
    ? new Date(job.expiresOn) < new Date()
    : false;

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all duration-300 p-6 ${
        isSelected
          ? "border-primary shadow-lg"
          : "border-border hover:border-primary/30 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-heading font-bold text-base lg:text-lg text-foreground">
              {resolved.title}
            </h3>
            <Badge
              variant={
                catEn === "Teaching" ? "primary" : catEn === "Administration" ? "accent" : "secondary"
              }
            >
              {resolved.category}
            </Badge>
          </div>
          <p className="text-xs text-muted mb-3">{resolved.level}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            {addedOnStr && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.careers.addedOn} {addedOnStr}
              </span>
            )}
            {expiresOnStr && (
              <span className={`flex items-center gap-1.5 font-semibold ${isExpired ? "text-accent" : "text-orange-600"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.careers.expiresOn} {expiresOnStr}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.vacancies} {job.vacancies === 1 ? t.careers.vacancy : t.careers.vacancies}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleDetails(job)}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-all"
          >
            {isSelected ? t.careers.hideDetails : t.careers.viewDetails}
          </button>
          <button
            onClick={() => onApply(job)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            {t.careers.apply}
          </button>
        </div>
      </div>
    </div>
  );
}
