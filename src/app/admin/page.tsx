"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import { siteConfig } from "@/constants/siteConfig";

type Locale = "en" | "ne" | "ja";

interface SectionStats {
  section: string;
  label: string;
  href: string;
  published: number;
  drafts: number;
}

export default function AdminDashboard() {
  const { draftCount, publishedContent, draftContent, loadAllContent } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();

  const [appCount, setAppCount] = useState<number | null>(null);
  const [appStatusCounts, setAppStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { count, data } = await supabase
          .from("career_applications")
          .select("id, status", { count: "exact" });
        setAppCount(count ?? 0);
        const statuses: Record<string, number> = {};
        data?.forEach((r: { status: string }) => {
          statuses[r.status] = (statuses[r.status] || 0) + 1;
        });
        setAppStatusCounts(statuses);
      } catch { /* ignore */ }
    };
    fetchApps();
  }, []);

  const sectionStats: SectionStats[] = useMemo(() => {
    const sections: Record<string, { label: string; href: string }> = {
      global: { label: "Global Settings", href: "/admin/content/global" },
      homepage: { label: "Homepage", href: "/admin/content/homepage" },
      news: { label: "News Articles", href: "/admin/news" },
      alerts: { label: "Alerts & Breaking", href: "/admin/content/news-alerts" },
      academics: { label: "Academic Hub", href: "/admin/content/academics" },
      staff: { label: "Team Manager", href: "/admin/content/staff" },
      careers: { label: "Career Manager", href: "/admin/content/careers" },
      notices: { label: "Notices", href: "/admin/content/notices" },
      calendar: { label: "Calendar", href: "/admin/content/calendar" },
      gallery: { label: "Gallery", href: "/admin/content/gallery" },
      footer: { label: "Footer", href: "/admin/content/footer" },
    };

    const stats: SectionStats[] = [];
    const pubCounts: Record<string, number> = {};
    const draftCounts: Record<string, number> = {};

    publishedContent.forEach((_, k) => {
      const sec = k.split("::")[0];
      if (sec) pubCounts[sec] = (pubCounts[sec] || 0) + 1;
    });
    draftContent.forEach((_, k) => {
      const sec = k.split("::")[0];
      if (sec) draftCounts[sec] = (draftCounts[sec] || 0) + 1;
    });

    Object.entries(sections).forEach(([key, val]) => {
      stats.push({
        section: key,
        label: val.label,
        href: val.href,
        published: pubCounts[key] || 0,
        drafts: draftCounts[key] || 0,
      });
    });

    return stats.sort((a, b) => (b.drafts + b.published) - (a.drafts + a.published));
  }, [publishedContent, draftContent]);

  const newsCount = siteConfig.newsArticles?.length || 0;
  const noticeCount = siteConfig.notices?.length || 0;
  const vacancyCount = siteConfig.jobVacancies?.length || 0;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted mt-0.5">Website overview & content status</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/admin/publish")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5">
                Review & Publish
              </button>
              <button onClick={() => router.push("/")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted hover:text-foreground hover:bg-white">
                View Site
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button onClick={() => router.push("/admin/news")}
              className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{newsCount}</p>
                  <p className="text-xs text-muted">News Articles</p>
                </div>
              </div>
              {(() => {
                const ns = sectionStats.find((s) => s.section === "news");
                return (
                  <div className="flex items-center gap-2 text-[10px]">
                    {ns && ns.drafts > 0 && <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">{ns.drafts} draft{ns.drafts !== 1 ? "s" : ""}</span>}
                    {ns && ns.published > 0 && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{ns.published} published</span>}
                    {(!ns || (ns.drafts === 0 && ns.published === 0)) && <span className="text-muted">Not seeded</span>}
                  </div>
                );
              })()}
            </button>

            <button onClick={() => router.push("/admin/content/notices")}
              className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{noticeCount}</p>
                  <p className="text-xs text-muted">Notices</p>
                </div>
              </div>
              {(() => {
                const ns = sectionStats.find((s) => s.section === "notices");
                return (
                  <div className="flex items-center gap-2 text-[10px]">
                    {ns && ns.drafts > 0 && <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">{ns.drafts} draft{ns.drafts !== 1 ? "s" : ""}</span>}
                    {ns && ns.published > 0 && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{ns.published} published</span>}
                    {(!ns || (ns.drafts === 0 && ns.published === 0)) && <span className="text-muted">Not seeded</span>}
                  </div>
                );
              })()}
            </button>

            <button onClick={() => router.push("/admin/content/careers")}
              className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{vacancyCount}</p>
                  <p className="text-xs text-muted">Job Vacancies</p>
                </div>
              </div>
              {appCount !== null && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">{appCount} applications</span>
                  {appStatusCounts.pending > 0 && <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">{appStatusCounts.pending} pending</span>}
                </div>
              )}
            </button>

            <button onClick={() => router.push("/admin/career-applications")}
              className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{appCount ?? "..."}</p>
                  <p className="text-xs text-muted">Applications</p>
                </div>
              </div>
              {appCount !== null && (
                <div className="flex items-center gap-2 text-[10px]">
                  {Object.entries(appStatusCounts).map(([k, v]) => (
                    <span key={k} className={`px-1.5 py-0.5 rounded capitalize font-medium ${
                      k === "pending" ? "bg-yellow-100 text-yellow-700" :
                      k === "reviewed" ? "bg-blue-100 text-blue-700" :
                      k === "shortlisted" ? "bg-green-100 text-green-700" :
                      k === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{k}: {v}</span>
                  ))}
                </div>
              )}
            </button>
          </div>

          {/* Content Sections Status */}
          <div className="bg-white rounded-xl border border-border overflow-hidden mb-8">
            <div className="px-5 py-3 border-b border-border bg-surface/50">
              <h2 className="font-heading font-bold text-sm text-foreground">Content Section Status</h2>
              <p className="text-[10px] text-muted mt-0.5">Published vs. Draft rows per section in Supabase</p>
            </div>
            <div className="divide-y divide-border">
              {sectionStats.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs text-muted">No content in database yet.</p>
                </div>
              )}
              {sectionStats.map((s) => (
                <button key={s.section} onClick={() => router.push(s.href)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${s.drafts > 0 ? "bg-yellow-500" : s.published > 0 ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-xs font-medium text-foreground">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.published > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-600 font-medium">{s.published} published</span>}
                    {s.drafts > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-50 text-yellow-600 font-medium">{s.drafts} drafts</span>}
                    {s.published === 0 && s.drafts === 0 && <span className="text-[10px] text-muted italic">empty</span>}
                    <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Total Content Rows</p>
              <p className="text-xl font-bold text-foreground">{publishedContent.size + draftContent.size}</p>
              <p className="text-[10px] text-muted">{draftContent.size} drafts · {publishedContent.size} published</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Draft Changes</p>
              <p className="text-xl font-bold text-foreground">{draftCount}</p>
              <p className="text-[10px] text-muted">Pending review</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Calendar Events</p>
              <p className="text-xl font-bold text-foreground">{siteConfig.calendarEvents?.length || 0}</p>
              <p className="text-[10px] text-muted">From siteConfig</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Gallery Images</p>
              <p className="text-xl font-bold text-foreground">{siteConfig.gallery?.images?.length || 0}</p>
              <p className="text-[10px] text-muted">From siteConfig</p>
            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
