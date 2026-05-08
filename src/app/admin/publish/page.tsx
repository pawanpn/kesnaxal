"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { SiteContentRow } from "@/context/AdminContext";

export default function PublishReviewPage() {
  const { draftContent, publishAll, discardAllDrafts, discardSectionDrafts, loadAllContent, draftCount } = useAdmin();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [result, setResult] = useState<{ type: "publish" | "discard"; count: number } | null>(null);

  useEffect(() => {
    loadAllContent();
  }, []);

  const drafts: SiteContentRow[] = [];
  draftContent.forEach((row) => drafts.push(row));
  drafts.sort((a, b) => (a.section + a.content_key).localeCompare(b.section + b.content_key));

  // Group by section
  const sectionGroups = drafts.reduce<Record<string, SiteContentRow[]>>((acc, row) => {
    if (!acc[row.section]) acc[row.section] = [];
    acc[row.section].push(row);
    return acc;
  }, {});

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { count } = await publishAll();
      setResult({ type: "publish", count });
      toast("success", `Published ${count} change${count !== 1 ? "s" : ""}`);
    } catch (e) {
      toast("error", "Failed to publish");
      console.error("Publish failed:", e);
    }
    setPublishing(false);
  };

  const handleDiscardAll = async () => {
    if (!confirm("Are you sure? This will discard ALL draft changes permanently.")) return;
    setDiscarding(true);
    try {
      const { count } = await discardAllDrafts();
      setResult({ type: "discard", count });
      toast("success", "Drafts discarded");
    } catch (e) {
      toast("error", "Failed to discard drafts");
      console.error("Discard failed:", e);
    }
    setDiscarding(false);
  };

  const handleDiscardSection = async (section: string) => {
    if (!confirm(`Discard all draft changes in "${section}"?`)) return;
    await discardSectionDrafts(section);
    toast("success", "Drafts discarded");
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Review & Publish</h1>
            <p className="text-xs text-muted mt-1">Review changes before going live. Drafts are only visible in Preview Mode.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardAll}
              disabled={discarding || draftCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {discarding ? "Discarding..." : "Discard All"}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || draftCount === 0}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {publishing ? "Publishing..." : `Go Live (${draftCount})`}
            </button>
          </div>
        </div>

        {/* Result banner */}
        {result && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            result.type === "publish" ? "bg-green-50 border border-green-200 text-green-700" : "bg-accent/10 border border-accent/20 text-accent"
          }`}>
            {result.type === "publish"
              ? `Published ${result.count} change${result.count !== 1 ? "s" : ""} to production.`
              : `Discarded ${result.count} draft${result.count !== 1 ? "s" : ""}.`}
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
            <p className="text-xs text-muted mt-1">All content is published. Edit content to create new drafts.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sectionGroups).map(([section, items]) => (
              <div key={section} className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">{section}</h3>
                    <span className="text-xs text-muted">({items.length} draft{items.length !== 1 ? "s" : ""})</span>
                  </div>
                  <button
                    onClick={() => handleDiscardSection(section)}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    Discard Section
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.content_key}</p>
                        <p className="text-[10px] text-muted">Locale: {item.locale}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted">
                          {new Date(item.updated_at as string).toLocaleDateString()} {new Date(item.updated_at as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {item.content_text && (
                          <p className="text-xs text-muted mt-0.5 truncate max-w-xs">
                            {item.content_text.slice(0, 60)}{item.content_text.length > 60 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
