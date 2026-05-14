"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { CalendarEvent } from "@/types";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ne", label: "NE" },
  { id: "ja", label: "JA" },
];

const TYPES = [
  { value: "holiday", label: "Holiday" },
  { value: "exam", label: "Exam" },
  { value: "event", label: "Event" },
  { value: "vacation", label: "Vacation" },
] as const;

const TYPE_BADGE: Record<CalendarEvent["type"], string> = {
  holiday: "bg-red-100 text-red-700",
  exam: "bg-amber-100 text-amber-700",
  event: "bg-green-100 text-green-700",
  vacation: "bg-blue-100 text-blue-700",
};

export default function CalendarAdminPage() {
  const { getJson, getContent, saveJson, hasDraft, discardSectionDrafts, loadAllContent, isSuperadmin, seedSection } = useAdmin();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    for (const { id: l } of LOCALES) {
      const json = getJson("calendar", "calendar_events", l);
      const arr = json?.events as CalendarEvent[] | undefined;
      if (arr?.length) { setEvents(arr); return; }
    }
    const fallback: CalendarEvent[] = [];
    for (let id = 1; id <= 20; id++) {
      const titleEn = getContent("calendar", `calendar_${id}_title`, "en");
      if (!titleEn) continue;
      fallback.push({
        id,
        title: {
          en: titleEn,
          ne: getContent("calendar", `calendar_${id}_title`, "ne"),
          ja: getContent("calendar", `calendar_${id}_title`, "ja"),
        },
        type: (getContent("calendar", `calendar_${id}_type`, "en") as CalendarEvent["type"]) || "event",
        date: getContent("calendar", `calendar_${id}_date`, "en"),
        description: {
          en: getContent("calendar", `calendar_${id}_desc`, "en"),
          ne: getContent("calendar", `calendar_${id}_desc`, "ne"),
          ja: getContent("calendar", `calendar_${id}_desc`, "ja"),
        },
      });
    }
    if (fallback.length) setEvents(fallback);
  }, [getJson, getContent]);

  const handleSave = async (updated: CalendarEvent[]) => {
    setSaving(true);
    const toSave = syncing
      ? updated.map((e) => ({
          ...e,
          title: { en: e.title[lang], ne: e.title[lang], ja: e.title[lang] },
          description: e.description
            ? { en: e.description[lang], ne: e.description[lang], ja: e.description[lang] }
            : undefined,
        }))
      : updated;
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("calendar", "calendar_events", l, { events: toSave });
      }
      setEvents(toSave);
      toast("success", "Calendar events saved!");
    } catch (e) {
      toast("error", "Failed to save calendar events");
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const handleChange = (i: number, field: "title" | "description", value: string) => {
    setEvents((prev) =>
      prev.map((e, idx) =>
        idx === i
          ? { ...e, [field]: { ...(e[field] || { en: "", ne: "", ja: "" }), [lang]: value } }
          : e
      )
    );
  };

  const handleAdd = () => {
    const maxId = events.reduce((max, e) => Math.max(max, e.id), 0);
    setEvents((prev) => [
      ...prev,
      { id: maxId + 1, title: { en: "", ne: "", ja: "" }, type: "event" as const, date: "" },
    ]);
  };

  const handleDelete = (i: number) => {
    if (!confirm("Remove this event?")) return;
    handleSave(events.filter((_, idx) => idx !== i));
  };

  const hasD = hasDraft("calendar", "calendar_events", lang);

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Calendar Events</h1>
            <p className="text-xs text-muted mt-1">Manage school holidays, exams, events, and vacations</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAdd}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
              + Add Event
            </button>
            <button onClick={() => handleSave(events)} disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save All"}
            </button>
            {isSuperadmin && (
              <button onClick={async () => { const r = await seedSection("calendar"); toast(r.error ? "error" : "success", r.error || `Seeded ${r.count} rows`); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5">
                Seed Defaults
              </button>
            )}
            <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("calendar"); toast("success", "Drafts discarded"); setDiscarding(false); window.location.reload(); }}
              disabled={discarding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
              Discard Drafts
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
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
          {syncing && (
            <span className="text-[10px] text-blue-600">copies to all languages on save</span>
          )}
        </div>

        {hasD && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — publish to make changes visible on the site.
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center max-w-4xl">
            <p className="text-xs text-muted italic">No events added yet. Click &quot;+ Add Event&quot; to begin.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {events.map((event, i) => (
              <div key={event.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">
                        Title ({lang.toUpperCase()})
                      </label>
                      <input type="text" value={event.title[lang]}
                        onChange={(e) => handleChange(i, "title", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                        placeholder={`Event title in ${lang}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Date</label>
                      <input type="date" value={event.date}
                        onChange={(e) => setEvents((prev) => prev.map((ev, idx) => idx === i ? { ...ev, date: e.target.value } : ev))}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Type</label>
                      <select value={event.type}
                        onChange={(e) => setEvents((prev) => prev.map((ev, idx) => idx === i ? { ...ev, type: e.target.value as CalendarEvent["type"] } : ev))}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none bg-white">
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${TYPE_BADGE[event.type]}`}>
                          {event.type.toUpperCase()}
                        </span>
                        <label className="text-[10px] font-semibold text-muted">
                          Description ({lang.toUpperCase()})
                        </label>
                      </div>
                      <textarea value={event.description?.[lang] || ""}
                        onChange={(e) => handleChange(i, "description", e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y"
                        placeholder={`Optional description in ${lang}`} />
                    </div>
                  </div>

                  <button onClick={() => handleDelete(i)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 mt-1" title="Remove">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
