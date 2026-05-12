"use client";

import { useState, useEffect, useMemo } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { SiteContentRow } from "@/context/AdminContext";

const SECTION_LABELS: Record<string, string> = {
  global: "School Info & Contact",
  gallery: "Gallery",
  careers: "Job Vacancies",
  hero: "Homepage Hero",
  school: "School Details",
  news: "News & Alerts",
  staff: "Staff Members",
  events: "Upcoming Events",
  academics: "Academic Programs",
  testimonials: "Testimonials",
  footer: "Footer",
  calendar: "Calendar",
  notices: "Notices",
  contact: "Contact",
};

const KEY_LABELS: Record<string, string> = {
  logo_url: "School Logo",
  schoolName: "School Name",
  motto: "Motto / Tagline",
  principalName: "Principal Name",
  principalMessage: "Principal Message",
  phone: "Primary Phone",
  phone2: "Secondary Phone",
  email: "Email Address",
  admissionsEmail: "Admissions Email",
  address: "Full Address",
  mapEmbedUrl: "Google Maps Embed URL",
  social_links: "Social Media Links",
  opening_hours: "Operating Hours",
  gallery_images: "Gallery Images",
  job_vacancies: "Job Vacancies",
  news_articles: "News Articles",
  staff_members: "Staff Members",
};

function formatContentValue(key: string, text: string | null): string {
  if (!text) return "—";
  try {
    const parsed = JSON.parse(text);
    if (key === "gallery_images" && parsed.images) {
      const cats = parsed.categories?.length ? `${parsed.categories.length} categories` : "";
      return `${parsed.images.length} images${cats ? `, ${cats}` : ""}`;
    }
    if (key === "job_vacancies" && parsed.vacancies) {
      return `${parsed.vacancies.length} job listing${parsed.vacancies.length !== 1 ? "s" : ""}`;
    }
    if (key === "social_links" && parsed.links) {
      return `${parsed.links.length} social link${parsed.links.length !== 1 ? "s" : ""}`;
    }
    if (key === "staff_members" && parsed.members) {
      return `${parsed.members.length} staff member${parsed.members.length !== 1 ? "s" : ""}`;
    }
    if (key === "opening_hours" && parsed.hours) {
      return `${parsed.hours.length} hour entr${parsed.hours.length !== 1 ? "ies" : "y"}`;
    }
    if (key === "news_articles" && parsed.articles) {
      return `${parsed.articles.length} article${parsed.articles.length !== 1 ? "s" : ""}`;
    }
    return "(updated)";
  } catch {
    if (text.startsWith("http")) {
      if (text.includes("google.com/maps/embed")) return "Map embed link (updated)";
      if (text.includes("lh3.googleusercontent.com") || text.includes("supabase")) return "Image file (updated)";
      return "Link (updated)";
    }
    if (text.length > 60) return text.slice(0, 60) + "...";
    return text;
  }
}

function hasMeaningfulChange(key: string, oldVal: string | null, newVal: string | null): boolean {
  if (oldVal === newVal) return false;
  if (oldVal === null && newVal !== null) return true;
  if (oldVal !== null && newVal === null) return true;
  return true;
}

export default function PublishReviewPage() {
  const { draftContent, publishedContent, publishAll, publishSelectedDrafts, discardAllDrafts, discardSectionDrafts, loadAllContent, draftCount } = useAdmin();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ type: "publish" | "discard"; count: number } | null>(null);

  useEffect(() => {
    loadAllContent();
  }, []);

  const drafts: SiteContentRow[] = useMemo(() => {
    const arr: SiteContentRow[] = [];
    draftContent.forEach((row) => arr.push(row));
    arr.sort((a, b) => {
      const sec = (a.section + a.content_key).localeCompare(b.section + b.content_key);
      if (sec !== 0) return sec;
      return a.locale.localeCompare(b.locale);
    });
    return arr;
  }, [draftContent]);

  const sectionGroups = useMemo(() => {
    return drafts.reduce<Record<string, SiteContentRow[]>>((acc, row) => {
      if (!acc[row.section]) acc[row.section] = [];
      acc[row.section].push(row);
      return acc;
    }, {});
  }, [drafts]);

  const getPublishedText = (section: string, key: string, locale: string): string | null => {
    for (const [, row] of publishedContent) {
      if (row.section === section && row.content_key === key && row.locale === locale) {
        return row.content_text;
      }
    }
    return null;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (items: SiteContentRow[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = items.every((i) => next.has(i.id));
      if (allSelected) {
        items.forEach((i) => next.delete(i.id));
      } else {
        items.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  const handlePublishSelected = async () => {
    if (selectedIds.size === 0) return;
    setPublishing(true);
    try {
      const { count } = await publishSelectedDrafts([...selectedIds]);
      setSelectedIds(new Set());
      setResult({ type: "publish", count });
      toast("success", `Published ${count} change${count !== 1 ? "s" : ""}`);
    } catch {
      toast("error", "Failed to publish");
    }
    setPublishing(false);
  };

  const handlePublishAll = async () => {
    setPublishing(true);
    try {
      const { count } = await publishAll();
      setSelectedIds(new Set());
      setResult({ type: "publish", count });
      toast("success", `Published ${count} changes`);
    } catch {
      toast("error", "Failed to publish");
    }
    setPublishing(false);
  };

  const handleDiscardAll = async () => {
    if (!confirm("Permanently discard ALL draft changes?")) return;
    setDiscarding(true);
    try {
      const { count } = await discardAllDrafts();
      setSelectedIds(new Set());
      setResult({ type: "discard", count });
      toast("success", "Drafts discarded");
    } catch {
      toast("error", "Failed to discard");
    }
    setDiscarding(false);
  };

  const handleDiscardSection = async (section: string) => {
    const label = SECTION_LABELS[section] || section;
    if (!confirm(`Discard ALL draft changes in "${label}"?`)) return;
    await discardSectionDrafts(section);
    setResult({ type: "discard", count: 0 });
    toast("success", "Section drafts discarded");
  };

  const LOCALE_LABELS: Record<string, string> = { en: "English", ne: "नेपाली", ja: "日本語" };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Review &amp; Publish</h1>
            <p className="text-xs text-muted mt-1">Review draft changes before making them live on the public site</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscardAll} disabled={discarding || draftCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed">
              {discarding ? "Discarding..." : "Discard All"}
            </button>
            <button onClick={handlePublishAll} disabled={publishing || draftCount === 0}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed">
              {publishing ? "Publishing..." : `Publish All (${draftCount})`}
            </button>
          </div>
        </div>

        {result && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            result.type === "publish" ? "bg-green-50 border border-green-200 text-green-700" : "bg-accent/10 border border-accent/20 text-accent"
          }`}>
            {result.type === "publish"
              ? `Published ${result.count} change${result.count !== 1 ? "s" : ""} to live site.`
              : `${result.count > 0 ? result.count : ""} drafts discarded.`}
          </div>
        )}

        {draftCount === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-foreground">No Draft Changes</h2>
            <p className="text-xs text-muted mt-1">All content is published and live. Edit any section to create new drafts for review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedIds.size > 0 && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <span className="text-xs font-semibold text-green-700">{selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected</span>
                <button onClick={handlePublishSelected} disabled={publishing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {publishing ? "Publishing..." : "Publish Selected"}
                </button>
              </div>
            )}

            {Object.entries(sectionGroups).map(([section, items]) => {
              const sectionLabel = SECTION_LABELS[section] || section;
              return (
                <div key={section} className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={items.every((i) => selectedIds.has(i.id))}
                        onChange={() => toggleSection(items)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <h3 className="font-heading font-bold text-sm text-foreground">{sectionLabel}</h3>
                      <span className="text-xs text-muted">({items.length})</span>
                    </label>
                    <button onClick={() => handleDiscardSection(section)}
                      className="text-xs text-accent hover:underline font-medium">Discard</button>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => {
                      const oldVal = getPublishedText(item.section, item.content_key, item.locale);
                      const isNew = oldVal === null;
                      const keyLabel = KEY_LABELS[item.content_key] || item.content_key;
                      const localeLabel = LOCALE_LABELS[item.locale] || item.locale;
                      const summary = formatContentValue(item.content_key, item.content_text);
                      const oldSummary = oldVal ? formatContentValue(item.content_key, oldVal) : null;

                      return (
                        <div key={item.id} onClick={() => toggleSelect(item.id)}
                          className={`px-5 py-3 transition-colors cursor-pointer ${
                            selectedIds.has(item.id) ? "bg-green-50/30" : "hover:bg-surface/50"
                          }`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="w-3.5 h-3.5 mt-1 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="text-sm font-semibold text-foreground">{keyLabel}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{localeLabel}</span>
                                {isNew ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">NEW</span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold">UPDATED</span>
                                )}
                              </div>

                              <div className="text-xs space-y-1.5">
                                {oldSummary && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1 rounded shrink-0 mt-0.5">Old</span>
                                    <span className="text-muted line-through">{oldSummary}</span>
                                  </div>
                                )}
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1 rounded shrink-0 mt-0.5">New</span>
                                  <span className="text-foreground font-medium">{summary}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-muted mt-2">
                                {new Date(item.updated_at as string).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
