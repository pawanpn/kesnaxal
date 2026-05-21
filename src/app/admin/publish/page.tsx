"use client";

import { useState, useEffect, useMemo } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import type { SiteContentRow } from "@/context/AdminContext";

const SECTION_LABELS: Record<string, string> = {
  global: "School Info & Contact",
  gallery: "Gallery",
  careers: "Job Vacancies",
  hero: "Homepage Hero",
  school: "School Details",
  news: "News & Alerts",
  staff: "Team Members",
  events: "Upcoming Events",
  academics: "Academic Programs",
  testimonials: "Testimonials",
  footer: "Footer",
  calendar: "Calendar",
  notices: "Notice Board",
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
  gallery_images: "Gallery Images & Categories",
  gallery_subtitle: "Gallery Subtitle",
  job_vacancies: "Job Vacancies",
  news_articles: "News Articles",
  staff_members: "Team Members",
  notices_list: "Notice Board",
};

// Keys that should be merged across locales (same content)
const MERGE_LOCALES_KEYS = ["job_vacancies", "staff_members", "gallery_images", "news_articles", "notices_list"];

function summarizeJson(key: string, text: string | null): string {
  if (!text) return "—";
  try {
    const parsed = JSON.parse(text);
    if (key === "gallery_images") {
      const imgCount = parsed.images?.length || 0;
      const catCount = parsed.categories?.length || 0;
      return `${imgCount} images, ${catCount} categories`;
    }
    if (key === "job_vacancies") {
      const count = parsed.vacancies?.length || 0;
      return `${count} job listing${count !== 1 ? "s" : ""}`;
    }
    if (key === "staff_members") {
      const count = parsed.members?.length || 0;
      return `${count} team member${count !== 1 ? "s" : ""}`;
    }
    if (key === "news_articles") {
      const count = parsed.articles?.length || 0;
      return `${count} article${count !== 1 ? "s" : ""}`;
    }
    if (key === "notices_list") {
      const count = parsed.notices?.length || 0;
      return `${count} notice${count !== 1 ? "s" : ""}`;
    }
    return "(updated)";
  } catch {
    return text.length > 80 ? text.slice(0, 80) + "..." : text;
  }
}

function formatSimple(text: string | null): string {
  if (!text) return "—";
  if (text.startsWith("http")) {
    if (text.includes("google.com/maps/embed")) return "Map embed link (updated)";
    if (text.includes("supabase.co")) return "Image file (updated)";
    return "Link (updated)";
  }
  if (text.length > 80) return text.slice(0, 80) + "...";
  return text;
}

function describeChange(key: string, oldText: string | null, newText: string | null): string {
  if (!newText) return "—";
  const isJson = MERGE_LOCALES_KEYS.includes(key) || key === "social_links" || key === "opening_hours";
  if (isJson) {
    const newSum = summarizeJson(key, newText);
    if (!oldText) return newSum;
    const oldSum = summarizeJson(key, oldText);
    if (oldSum !== newSum) return `${oldSum} → ${newSum}`;
    return newSum;
  }
  return formatSimple(newText);
}

// Group items: merge same content_key across locales into one row
interface MergedItem {
  id: string; // use en locale id as primary
  ids: string[]; // all locale ids
  section: string;
  content_key: string;
  content_text: string | null;
  updated_at: string | null;
  isNew: boolean;
  isMerged: boolean; // true if locales merged
}

export default function PublishReviewPage() {
  const { draftContent, publishedContent, publishAll, publishSelectedDrafts, discardAllDrafts, discardSectionDrafts, loadAllContent, draftCount, contentReady, isAdmin } = useAdmin();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ type: "publish" | "discard"; count: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Career drafts from Supabase directly
  const [careerDrafts, setCareerDrafts] = useState<SiteContentRow[]>([]);
  const [publishingCareers, setPublishingCareers] = useState(false);

  useEffect(() => { loadAllContent(); fetchCareerDrafts(); }, []);

  const fetchCareerDrafts = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .eq("section", "careers")
      .eq("content_key", "job_vacancies")
      .eq("status", "draft");
    setCareerDrafts((data as SiteContentRow[]) || []);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllContent();
    await fetchCareerDrafts();
    setRefreshing(false);
  };

  // Publish career drafts
  const handlePublishCareerDrafts = async () => {
    setPublishingCareers(true);
    try {
      const enDraft = careerDrafts.find(d => d.locale === "en");
      if (!enDraft) { toast("error", "No draft found"); setPublishingCareers(false); return; }

      const payload = enDraft.content_json;

      for (const locale of ["en", "ne", "ja"]) {
        // Update published row
        const { data: existing } = await supabase
          .from("site_content")
          .select("id")
          .eq("section", "careers")
          .eq("content_key", "job_vacancies")
          .eq("locale", locale)
          .eq("status", "published")
          .maybeSingle();

        if (existing) {
          await supabase.from("site_content")
            .update({ content_json: payload, content_text: JSON.stringify(payload), updated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase.from("site_content").insert({
            section: "careers", content_key: "job_vacancies", locale,
            content_json: payload, content_text: JSON.stringify(payload), status: "published",
          });
        }

        // Delete draft row
        await supabase.from("site_content")
          .delete()
          .eq("section", "careers")
          .eq("content_key", "job_vacancies")
          .eq("locale", locale)
          .eq("status", "draft");
      }

      setCareerDrafts([]);
      toast("success", "Job vacancies published!");
    } catch (e) {
      toast("error", "Failed to publish careers");
    }
    setPublishingCareers(false);
  };

  // Discard career drafts
  const handleDiscardCareerDrafts = async () => {
    if (!confirm("Discard all draft job vacancies?")) return;
    await supabase.from("site_content")
      .delete()
      .eq("section", "careers")
      .eq("content_key", "job_vacancies")
      .eq("status", "draft");
    setCareerDrafts([]);
    toast("success", "Career drafts discarded");
  };

  const drafts: SiteContentRow[] = useMemo(() => {
    const arr: SiteContentRow[] = [];
    draftContent.forEach((row) => arr.push(row));
    arr.sort((a, b) => (a.section + a.content_key).localeCompare(b.section + b.content_key) || a.locale.localeCompare(b.locale));
    return arr;
  }, [draftContent]);

  // Group by section, then merge same key locales
  const sectionGroups = useMemo(() => {
    const groups: Record<string, MergedItem[]> = {};

    drafts.forEach((row) => {
      // Skip careers job_vacancies - handled separately
      if (row.section === "careers" && row.content_key === "job_vacancies") return;
      if (!groups[row.section]) groups[row.section] = [];

      if (MERGE_LOCALES_KEYS.includes(row.content_key)) {
        // Check if already added this key
        const existing = groups[row.section].find(i => i.content_key === row.content_key);
        if (existing) {
          existing.ids.push(row.id);
          return;
        }
        const oldText = getPublishedTextFn(publishedContent, row.section, row.content_key, "en");
        groups[row.section].push({
          id: row.id,
          ids: [row.id],
          section: row.section,
          content_key: row.content_key,
          content_text: row.content_text,
          updated_at: row.updated_at as string,
          isNew: oldText === null,
          isMerged: true,
        });
      } else {
        const oldText = getPublishedTextFn(publishedContent, row.section, row.content_key, row.locale);
        groups[row.section].push({
          id: row.id,
          ids: [row.id],
          section: row.section,
          content_key: row.content_key,
          content_text: row.content_text,
          updated_at: row.updated_at as string,
          isNew: oldText === null,
          isMerged: false,
        });
      }
    });

    return groups;
  }, [drafts, publishedContent]);

  const getPublishedText = (sec: string, key: string, loc: string): string | null => {
    return getPublishedTextFn(publishedContent, sec, key, loc);
  };

  const toggleSelect = (ids: string[]) => setSelectedIds((prev) => {
    const next = new Set(prev);
    const allSelected = ids.every(id => next.has(id));
    allSelected ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id));
    return next;
  });

  const toggleSection = (items: MergedItem[]) => setSelectedIds((prev) => {
    const next = new Set(prev);
    const allIds = items.flatMap(i => i.ids);
    const allSelected = allIds.every(id => next.has(id));
    allSelected ? allIds.forEach(id => next.delete(id)) : allIds.forEach(id => next.add(id));
    return next;
  });

  const handlePublishSelected = async () => {
    if (selectedIds.size === 0) return;
    setPublishing(true);
    try {
      const { count } = await publishSelectedDrafts([...selectedIds]);
      setSelectedIds(new Set());
      setResult({ type: "publish", count });
      toast("success", `Published ${count} change${count !== 1 ? "s" : ""}`);
    } catch { toast("error", "Failed to publish"); }
    setPublishing(false);
  };

  const handlePublishAll = async () => {
    setPublishing(true);
    try {
      const { count } = await publishAll();
      setSelectedIds(new Set());
      setResult({ type: "publish", count });
      toast("success", `Published ${count} changes`);
    } catch { toast("error", "Failed to publish"); }
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
    } catch { toast("error", "Failed to discard"); }
    setDiscarding(false);
  };

  const handleDiscardSection = async (section: string) => {
    const label = SECTION_LABELS[section] || section;
    if (!confirm(`Discard ALL draft changes in "${label}"?`)) return;
    await discardSectionDrafts(section);
    setResult({ type: "discard", count: 0 });
    toast("success", "Section drafts discarded");
  };

  const totalDrafts = draftCount + careerDrafts.length;

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
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${result.type === "publish" ? "bg-green-50 border border-green-200 text-green-700" : "bg-accent/10 border border-accent/20 text-accent"}`}>
            {result.type === "publish"
              ? `Published ${result.count} change${result.count !== 1 ? "s" : ""} to live site.`
              : `Drafts discarded.`}
          </div>
        )}

        {/* Database Overview */}
        {publishedContent.size > 0 && (
          <details className="mb-4 bg-white rounded-xl border border-border overflow-hidden max-w-4xl">
            <summary className="px-5 py-3 cursor-pointer hover:bg-surface/50 text-xs font-semibold text-foreground select-none">
              Database Content Overview ({publishedContent.size} published rows)
            </summary>
            <div className="px-5 py-3 border-t border-border grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {(() => {
                const counts: Record<string, number> = {};
                publishedContent.forEach((row) => {
                  const label = SECTION_LABELS[row.section] || row.section;
                  counts[label] = (counts[label] || 0) + 1;
                });
                return Object.entries(counts).sort(([, a], [, b]) => b - a).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between px-2 py-1.5 rounded bg-surface/50">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ));
              })()}
            </div>
          </details>
        )}

        {!contentReady || !isAdmin ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-xs text-muted mt-1">Loading draft changes...</p>
          </div>
        ) : totalDrafts === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-foreground">No Draft Changes</h2>
            <p className="text-xs text-muted mt-1">All content is published and live.</p>
            <button onClick={handleRefresh} disabled={refreshing}
              className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface disabled:opacity-50">
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {selectedIds.size > 0 && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <span className="text-xs font-semibold text-green-700">{selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected</span>
                <button onClick={handlePublishSelected} disabled={publishing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {publishing ? "Publishing..." : "Publish Selected"}
                </button>
              </div>
            )}

            {/* Career Drafts - Special section from direct Supabase */}
            {careerDrafts.length > 0 && (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-yellow-50 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <h3 className="font-heading font-bold text-sm text-foreground">Job Vacancies</h3>
                    <span className="text-xs text-muted">(1 draft)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleDiscardCareerDrafts} className="text-xs text-accent hover:underline font-medium">Discard</button>
                    <button
                      onClick={handlePublishCareerDrafts}
                      disabled={publishingCareers}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                      {publishingCareers ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-foreground">Job Vacancies</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold">UPDATED</span>
                  </div>
                  <p className="text-xs text-foreground">
                    {summarizeJson("job_vacancies", careerDrafts.find(d => d.locale === "en")?.content_text || null)}
                  </p>
                  <p className="text-[9px] text-muted mt-1">
                    {careerDrafts[0]?.updated_at ? new Date(careerDrafts[0].updated_at as string).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Other Drafts */}
            {Object.entries(sectionGroups).map(([section, items]) => {
              const sectionLabel = SECTION_LABELS[section] || section;
              const allIds = items.flatMap(i => i.ids);
              return (
                <div key={section} className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox"
                        checked={allIds.every(id => selectedIds.has(id))}
                        onChange={() => toggleSection(items)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <h3 className="font-heading font-bold text-sm text-foreground">{sectionLabel}</h3>
                      <span className="text-xs text-muted">({items.length})</span>
                    </label>
                    <button onClick={() => handleDiscardSection(section)} className="text-xs text-accent hover:underline font-medium">Discard</button>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => {
                      const oldVal = getPublishedText(item.section, item.content_key, "en");
                      const keyLabel = KEY_LABELS[item.content_key] || item.content_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      const desc = describeChange(item.content_key, oldVal, item.content_text);
                      const isSelected = item.ids.every(id => selectedIds.has(id));

                      return (
                        <div key={item.id} onClick={() => toggleSelect(item.ids)}
                          className={`px-5 py-3 transition-colors cursor-pointer ${isSelected ? "bg-green-50/30" : "hover:bg-surface/50"}`}>
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.ids)}
                              className="w-3.5 h-3.5 mt-1 rounded border-gray-300 text-primary focus:ring-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-semibold text-foreground">{keyLabel}</span>
                                {item.isMerged ? (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-surface text-muted">All languages</span>
                                ) : null}
                                {item.isNew ? (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">NEW</span>
                                ) : (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold">UPDATED</span>
                                )}
                              </div>
                              <p className="text-xs text-foreground">{desc}</p>
                              <p className="text-[9px] text-muted mt-1">
                                {item.updated_at ? new Date(item.updated_at).toLocaleString() : ""}
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

// Helper outside component to avoid closure issues
function getPublishedTextFn(publishedContent: Map<string, any>, sec: string, key: string, loc: string): string | null {
  for (const [, row] of publishedContent) {
    if (row.section === sec && row.content_key === key && row.locale === loc) return row.content_text;
  }
  return null;
}

