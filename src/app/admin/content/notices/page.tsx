"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/constants/siteConfig";
import { translateToAll } from "@/lib/autoTranslate";
import type { Notice } from "@/types";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  normal: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

function emptyNotice(): Notice {
  return {
    id: Date.now(),
    title: { en: "", ne: "", ja: "" },
    date: new Date().toISOString().split("T")[0],
    content: { en: "", ne: "", ja: "" },
    priority: "normal",
  };
}

export default function NoticesPage() {
  const { getJson, saveJson, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const { toast } = useToast();
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Notice>(emptyNotice());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const arr = LOCALES.reduce<Notice[]>((acc, { id: l }) => {
      if (acc.length) return acc;
      const json = getJson("notices", "notices_list", l);
      const data = json?.notices as Notice[] | undefined;
      return data?.length ? data : acc;
    }, [] as Notice[]);

    if (arr.length) {
      setNotices(arr);
    } else {
      setNotices([...(siteConfig.notices || [])]);
    }
  }, [getJson]);

  const handleSave = async (updated: Notice[]) => {
    setSaving(true);
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("notices", "notices_list", l, { notices: updated });
      }
      setNotices(updated);
      toast("success", "Notices saved as draft — publish from Review page");
    } catch {
      toast("error", "Failed to save notices");
    }
    setSaving(false);
  };

  const handleFormChange = (field: keyof Notice, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocaleChange = (field: "title" | "content", locale: Locale, value: string) => {
    setForm((prev) => {
      if (syncing) {
        return { ...prev, [field]: { en: value, ne: value, ja: value } };
      }
      return { ...prev, [field]: { ...prev[field], [locale]: value } };
    });
  };

  const handleAddOrUpdate = () => {
    if (!form.title[lang] && !form.title.en) return;
    let updated: Notice[];
    if (editingId !== null) {
      updated = notices.map((n) => (n.id === editingId ? { ...form, id: editingId } : n));
    } else {
      const maxId = notices.reduce((max, n) => Math.max(max, n.id), 0);
      updated = [form, ...notices];
    }
    handleSave(updated);
    setForm(emptyNotice());
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (notice: Notice) => {
    setForm({ ...notice });
    setEditingId(notice.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this notice?")) return;
    const updated = notices.filter((n) => n.id !== id);
    handleSave(updated);
    if (editingId === id) {
      setForm(emptyNotice());
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyNotice());
    setEditingId(null);
    setShowForm(false);
  };

  const handleTranslate = async (field: "title" | "content") => {
    const text = form[field][lang];
    if (!text?.trim() || translating) return;
    setTranslating(true);
    try {
      const results = await translateToAll(text, lang);
      setForm((prev) => {
        const updated = { ...prev[field] };
        for (const [loc, val] of Object.entries(results)) {
          if (val) updated[loc as Locale] = val;
        }
        return { ...prev, [field]: updated };
      });
    } catch {}
    setTranslating(false);
  };

  const sortedNotices = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Notice Board</h1>
            <p className="text-xs text-muted mt-1">Manage notices, circulars, and announcements</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
              <button type="button" onClick={() => setSyncing(!syncing)}
                className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${syncing ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${syncing ? "translate-x-3" : "translate-x-0"}`} />
              </button>
              Sync
            </label>
            <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("notices"); toast("success", "Drafts discarded"); setDiscarding(false); window.location.reload(); }}
              disabled={discarding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
              Discard
            </button>
          </div>
        </div>

        {hasDraft("notices", "notices_list", "en") && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — publish from Review page to make notices visible on the site.
          </div>
        )}

        {syncing && (
          <div className="mb-4 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 max-w-4xl">
            Sync ON — editing any locale copies to all. Toggle OFF for per-language editing.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-bold text-sm text-foreground">Notices ({notices.length})</h2>
                <button onClick={() => { setForm(emptyNotice()); setEditingId(null); setShowForm(true); }}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-600 text-white hover:bg-green-700">+ New</button>
              </div>
              {notices.length === 0 ? (
                <p className="text-xs text-muted italic">No notices yet. Click &quot;+ New&quot; to add one.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {sortedNotices.map((notice) => (
                    <div key={notice.id} className="p-3 rounded-lg bg-surface/50 border border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <button onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)} className="text-left w-full">
                            <p className="text-xs font-semibold text-foreground truncate">{notice.title[lang] || notice.title.en || "(Untitled)"}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-muted">{notice.date}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${PRIORITY_COLORS[notice.priority] || ""}`}>{notice.priority}</span>
                            </div>
                          </button>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleEdit(notice)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(notice.id)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {expandedId === notice.id && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[11px] text-muted whitespace-pre-wrap leading-relaxed">{notice.content[lang] || notice.content.en || "No content"}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {showForm ? (
              <div className="bg-white rounded-xl border border-border p-5">
                <h2 className="font-heading font-bold text-sm text-foreground mb-3">
                  {editingId !== null ? `Edit Notice (${lang.toUpperCase()})` : `Add Notice (${lang.toUpperCase()})`}
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                      <select value={form.priority}
                        onChange={(e) => handleFormChange("priority", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none bg-white">
                        <option value="normal">Normal</option>
                        <option value="high">High (Important)</option>
                        <option value="low">Low (General)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
                      <input type="date" value={form.date}
                        onChange={(e) => handleFormChange("date", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCALES.map((l) => (
                        <div key={l.id} className="relative">
                          <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                          <input type="text" value={form.title[l.id] || ""}
                            onChange={(e) => handleLocaleChange("title", l.id, e.target.value)}
                            className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none"
                            placeholder={`Title (${l.id.toUpperCase()})`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => handleTranslate("title")} disabled={translating || !form.title[lang]?.trim()}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        {translating ? (
                          <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> ...</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg> Translate</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Content</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCALES.map((l) => (
                        <div key={l.id} className="relative">
                          <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                          <textarea value={form.content[l.id] || ""}
                            onChange={(e) => handleLocaleChange("content", l.id, e.target.value)} rows={4}
                            className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                            placeholder={`Content (${l.id.toUpperCase()})`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => handleTranslate("content")} disabled={translating || !form.content[lang]?.trim()}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        {translating ? (
                          <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> ...</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg> Translate</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleAddOrUpdate}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                      {saving ? "Saving..." : editingId !== null ? "Update & Save Draft" : "Add & Save Draft"}
                    </button>
                    <button onClick={handleCancel}
                      className="py-2 px-4 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border p-8 flex items-center justify-center min-h-[300px]">
                <p className="text-xs text-muted">Select a notice to edit or click &quot;+ New&quot; to add one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
