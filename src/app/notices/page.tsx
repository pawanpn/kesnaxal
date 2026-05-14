"use client";

import { useState } from "react";
import PageHero from "@/components/ui/PageHero";
import Badge from "@/components/ui/Badge";
import { useLocale } from "@/hooks/useLocale";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { resolveContent } from "@/lib/translate";

function formatDate(dateStr: string, locale: string): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ne: "ne-NP",
    ja: "ja-JP",
  };
  return new Date(dateStr).toLocaleDateString(localeMap[locale] || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isNew(dateStr: string): boolean {
  const noticeDate = new Date(dateStr);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return noticeDate > threeDaysAgo;
}

function priorityBorder(priority: string): string {
  switch (priority) {
    case "high": return "border-l-accent";
    case "normal": return "border-l-secondary";
    default: return "border-l-muted";
  }
}

export default function NoticesPage() {
  const { locale, t } = useLocale();
  const { notices } = useDynamicContent();
  const [filter, setFilter] = useState<"all" | "high" | "normal" | "low">("all");

  const sorted = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = filter === "all" ? sorted : sorted.filter((n) => n.priority === filter);

  const filterOptions: { value: "all" | "high" | "normal" | "low"; label: string; color: string }[] = [
    { value: "all", label: t.sections.All || "All", color: "bg-primary" },
    { value: "high", label: t.badges.important || "Important", color: "bg-accent" },
    { value: "normal", label: t.sections.NoticeBoard || "Normal", color: "bg-secondary" },
    { value: "low", label: "General", color: "bg-muted" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero pageKey="notices" />

      <section className="py-12 lg:py-16">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-heading font-bold text-primary">{t.sections.NoticeBoard}</h2>
            </div>
            <div className="flex gap-1.5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === opt.value
                      ? `${opt.color} text-white shadow-sm`
                      : "bg-surface text-muted hover:bg-surface-dark"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-border">
              <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted text-sm">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.filter(Boolean).map((notice) => (
                <div
                  key={notice.id}
                  className={`bg-white rounded-xl p-5 lg:p-6 border-l-4 ${priorityBorder(notice.priority)} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-heading font-bold text-foreground text-base lg:text-lg">
                          {resolveContent(notice.title, locale)}
                        </h3>
                        {isNew(notice.date) && (
                          <Badge variant="primary">
                            {t.badges.new}
                          </Badge>
                        )}
                        {notice.priority === "high" && (
                          <Badge variant="accent">
                            {t.badges.important}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        {resolveContent(notice.content, locale)}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-muted whitespace-nowrap text-right">
                      <svg className="w-3.5 h-3.5 inline-block mr-1 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(notice.date, locale)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-xs text-muted mt-8">
              {filtered.length} {filtered.length === 1 ? "notice" : "notices"} {filter !== "all" ? `(${filter})` : ""}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
