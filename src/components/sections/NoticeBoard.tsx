"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLocale } from "@/hooks/useLocale";
import { resolveContent } from "@/lib/translate";
import type { Notice } from "@/types";

export default function NoticeBoard() {
  const { locale, t } = useLocale();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/notices.json")
      .then((res) => res.json())
      .then((data: Notice[]) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotices(sorted.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isNew = (dateStr: string) => {
    const noticeDate = new Date(dateStr);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return noticeDate > threeDaysAgo;
  };

  const priorityBorder = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-accent";
      case "normal": return "border-l-secondary";
      default: return "border-l-muted";
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title={t.sections.NoticeBoard} />
          <Link href="/notices" className="text-sm text-primary font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            {t.common.viewAll}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-lg p-4 h-20" />)}</div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className={`bg-white rounded-lg p-4 lg:p-5 border-l-4 ${priorityBorder(notice.priority)} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm lg:text-base">{resolveContent(notice.title, locale)}</h3>
                      {isNew(notice.date) && <span className="shrink-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{t.badges.new}</span>}
                      {notice.priority === "high" && <span className="shrink-0 bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{t.badges.important}</span>}
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{resolveContent(notice.content, locale)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted whitespace-nowrap">
                    {new Date(notice.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
