"use client";

import { useState, useEffect, useMemo } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { SiteContentRow } from "@/context/AdminContext";

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
    if (!confirm(`Discard ALL draft changes in "${section}"?`)) return;
    await discardSectionDrafts(section);
    setResult({ type: "discard", count: 0 });
    toast("success", "Section drafts discarded");
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Review & Publish</h1>
            <p className="text-xs text-muted mt-1">Review draft changes before publishing to the live site</p>
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
              ? `${result.count} change${result.count !== 1 ? "s" : ""} published to production.`
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
            <p className="text-xs text-muted mt-1">All content is published. Edit any section to create new drafts for review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected count bar */}
            {selectedIds.size > 0 && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <span className="text-xs font-semibold text-green-700">{selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected</span>
                <button onClick={handlePublishSelected} disabled={publishing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {publishing ? "Publishing..." : "Publish Selected"}
                </button>
              </div>
            )}

            {Object.entries(sectionGroups).map(([section, items]) => (
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
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">{section}</h3>
                    <span className="text-xs text-muted">({items.length})</span>
                  </label>
                  <button onClick={() => handleDiscardSection(section)}
                    className="text-xs text-accent hover:underline font-medium">Discard Section</button>
                </div>
                <div className="divide-y divide-border">
                  {items.map((item) => {
                    const oldVal = getPublishedText(item.section, item.content_key, item.locale);
                    const isNew = oldVal === null;
                    const hasChanged = oldVal !== item.content_text;
                    return (
                      <div key={item.id} className={`px-5 py-3 transition-colors ${selectedIds.has(item.id) ? "bg-green-50/30" : ""}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-semibold text-foreground">{item.content_key}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted uppercase">{item.locale}</span>
                              {isNew && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">NEW</span>}
                              {!isNew && hasChanged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold">MODIFIED</span>}
                            </div>

                            {/* Diff view */}
                            <div className="text-xs space-y-1">
                              {!isNew && (
                                <p className="text-muted line-through">
                                  <span className="text-[9px] font-semibold text-red-400 uppercase">Old:</span>{" "}
                                  {(oldVal || "").slice(0, 120)}{(oldVal && oldVal.length > 120) ? "..." : ""}
                                </p>
                              )}
                              <p className="text-foreground">
                                <span className="text-[9px] font-semibold text-green-600 uppercase">{isNew ? "New" : "New"}:</span>{" "}
                                {(item.content_text || "").slice(0, 120)}{(item.content_text && item.content_text.length > 120) ? "..." : ""}
                              </p>
                            </div>

                            <p className="text-[10px] text-muted mt-1">
                              {new Date(item.updated_at as string).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
