"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { CalendarEvent, CalendarEventType } from "@/types";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ne", label: "NE" },
  { id: "ja", label: "JA" },
];

const DEFAULT_TYPES: CalendarEventType[] = [
  { id: "holiday", label: "Holiday", color: "#ef4444" },
  { id: "exam", label: "Exam", color: "#f59e0b" },
  { id: "event", label: "Event", color: "#10b981" },
  { id: "vacation", label: "Vacation", color: "#3b82f6" },
];

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  "#78716c", "#6b7280", "#047857",
];

export default function CalendarAdminPage() {
  const { getJson, getContent, saveJson, hasDraft, discardSectionDrafts, loadAllContent, isSuperadmin, seedSection } = useAdmin();
  const { toast } = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<CalendarEventType[]>(DEFAULT_TYPES);
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeFormId, setTypeFormId] = useState<string | null>(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [typeColor, setTypeColor] = useState("#3b82f6");

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const json = getJson("calendar", "calendar_types", "en");
    if (json?.types && Array.isArray(json.types) && (json.types as unknown[]).length) setEventTypes(json.types as CalendarEventType[]);
  }, [getJson]);

  useEffect(() => {
    for (const { id: l } of LOCALES) {
      const json = getJson("calendar", "calendar_events", l) as { events?: CalendarEvent[] };
      const arr = json?.events;
      if (arr?.length) { setEvents(arr); return; }
    }
    const fallback: CalendarEvent[] = [];
    for (let i = 1; i <= 30; i++) {
      const titleEn = getContent("calendar", `calendar_${i}_title`, "en");
      if (!titleEn) continue;
      fallback.push({
        id: i,
        title: {
          en: getContent("calendar", `calendar_${i}_title`, "en") || "",
          ne: getContent("calendar", `calendar_${i}_title`, "ne") || "",
          ja: getContent("calendar", `calendar_${i}_title`, "ja") || "",
        },
        type: getContent("calendar", `calendar_${i}_type`, "en") || "event",
        date: getContent("calendar", `calendar_${i}_date`, "en") || "",
        description: {
          en: getContent("calendar", `calendar_${i}_description`, "en") || "",
          ne: getContent("calendar", `calendar_${i}_description`, "ne") || "",
          ja: getContent("calendar", `calendar_${i}_description`, "ja") || "",
        },
      });
    }
    if (fallback.length) setEvents(fallback);
  }, [getJson]);

  const getTypeLabel = (typeId: string) => eventTypes.find((t) => t.id === typeId)?.label || typeId;
  const getTypeColor = (typeId: string) => eventTypes.find((t) => t.id === typeId)?.color || "#6b7280";

  const saveEventTypes = async (types: CalendarEventType[]) => {
    for (const { id: l } of LOCALES) {
      await saveJson("calendar", "calendar_types", l, { types });
    }
    setEventTypes(types);
  };

  const openAddType = () => {
    setTypeFormId(null);
    setTypeLabel("");
    setTypeColor("#3b82f6");
    setShowTypeForm(true);
  };

  const openEditType = (t: CalendarEventType) => {
    setTypeFormId(t.id);
    setTypeLabel(t.label);
    setTypeColor(t.color);
    setShowTypeForm(true);
  };

  const handleSaveType = () => {
    const label = typeLabel.trim();
    if (!label) return;
    const id = typeFormId || label.toLowerCase().replace(/\s+/g, "_");
    if (!typeFormId && eventTypes.some((t) => t.id === id)) {
      toast("error", "A type with this ID already exists");
      return;
    }
    const updated = typeFormId
      ? eventTypes.map((t) => (t.id === typeFormId ? { ...t, label, color: typeColor } : t))
      : [...eventTypes, { id, label, color: typeColor }];
    saveEventTypes(updated);
    setShowTypeForm(false);
    toast("success", typeFormId ? "Type updated" : "Type added");
  };

  const handleDeleteType = (typeId: string) => {
    if (!confirm(`Delete type "${getTypeLabel(typeId)}"? Events of this type will keep their type ID.`)) return;
    saveEventTypes(eventTypes.filter((t) => t.id !== typeId));
    toast("success", "Type deleted");
  };

  const handleSaveEvents = async (updated: CalendarEvent[]) => {
    setSaving(true);
    const toSave = syncing
      ? updated.map((e) => ({
          ...e,
          title: { en: e.title[lang] ?? "", ne: e.title[lang] ?? "", ja: e.title[lang] ?? "" },
          description: e.description
            ? { en: e.description[lang] ?? "", ne: e.description[lang] ?? "", ja: e.description[lang] ?? "" }
            : undefined,
        }))
      : updated;
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("calendar", "calendar_events", l, { events: toSave });
      }
      setEvents(toSave);
      setEditingId(null);
      toast("success", "Calendar events saved!");
    } catch (e) {
      toast("error", "Failed to save calendar events");
    }
    setSaving(false);
  };

  const handleAdd = () => {
    const maxId = events.reduce((max, e) => Math.max(max, e.id), 0);
    const newEvent: CalendarEvent = {
      id: maxId + 1,
      title: { en: "", ne: "", ja: "" },
      type: eventTypes[0]?.id || "event",
      date: new Date().toISOString().slice(0, 10),
    };
    setEvents((prev) => [...prev, newEvent]);
    setEditingId(newEvent.id);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Remove this event?")) return;
    handleSaveEvents(events.filter((e) => e.id !== id));
  };

  const updateEvent = (id: number, patch: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const updateEventLang = (id: number, field: "title" | "description", value: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: {
                ...((e as unknown as Record<string, Record<Locale, string>>)[field] || { en: "", ne: "", ja: "" }),
                [lang]: value,
              },
            }
          : e
      )
    );
  };

  const hasD = hasDraft("calendar", "calendar_events", lang);

  return (
    <AdminGuard>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* STICKY HEADER */}
        <div className="shrink-0 bg-white border-b border-border px-6 pt-4 pb-3 space-y-3 z-10 shadow-sm">
          {/* Row 1: Title + action buttons */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground">Calendar Events</h1>
              <p className="text-[10px] text-muted">Manage events &amp; their types</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAdd}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
                + Add Event
              </button>
              <button onClick={() => handleSaveEvents(events)} disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save All"}
              </button>
              {isSuperadmin && (
                <button onClick={async () => { const r = await seedSection("calendar"); toast(r.error ? "error" : "success", r.error || `Seeded ${r.count} rows`); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5 transition-colors">
                  Seed Defaults
                </button>
              )}
              <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("calendar"); toast("success", "Drafts discarded"); setDiscarding(false); window.location.reload(); }}
                disabled={discarding}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50 transition-colors">
                Discard Drafts
              </button>
            </div>
          </div>

          {/* Row 2: Language + Sync */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-50 rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
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

          {/* Row 3: Event Types Management */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Event Types</span>
              {!showTypeForm && (
                <button onClick={openAddType}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  + Add Type
                </button>
              )}
            </div>

            {/* Type list */}
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((t) => (
                <div key={t.id}
                  className="flex items-center gap-1.5 bg-gray-50 rounded-lg border border-border px-2 py-1">
                  <span className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                  <button onClick={() => openEditType(t)}
                    className="text-[9px] text-muted hover:text-primary px-1" title="Edit type">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {eventTypes.length > 1 && (
                    <button onClick={() => handleDeleteType(t.id)}
                      className="text-[9px] text-muted hover:text-red-500 px-0.5" title="Remove type">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add/Edit type form */}
            {showTypeForm && (
              <div className="mt-2 flex items-center gap-2 flex-wrap p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <input type="text" value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)}
                  placeholder="Type name (e.g. Holiday)"
                  className="px-2 py-1 rounded border border-border text-xs w-36 focus:border-primary outline-none" />
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <input type="color" value={typeColor} onChange={(e) => setTypeColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-border p-0" />
                  </div>
                  <div className="flex gap-0.5">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setTypeColor(c)}
                        className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-125 ${typeColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveType}
                  className="px-2 py-1 rounded text-[10px] font-bold bg-primary text-white hover:bg-primary-dark transition-colors">
                  {typeFormId ? "Update" : "Add"}
                </button>
                <button onClick={() => setShowTypeForm(false)}
                  className="px-2 py-1 rounded text-[10px] font-semibold text-muted hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Draft banner */}
          {hasD && (
            <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
              Draft pending &mdash; publish to make changes visible on the site.
            </div>
          )}
        </div>

        {/* SCROLLABLE EVENT LIST */}
        <div className="flex-1 overflow-y-auto p-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-8 text-center max-w-3xl mx-auto">
              <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-muted italic mb-3">No events added yet.</p>
              <button onClick={handleAdd}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors">
                + Add Your First Event
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-w-3xl mx-auto">
              {events.map((event) => {
                const isEditing = editingId === event.id;
                const typeColor = getTypeColor(event.type);
                return (
                  <div key={event.id}
                    className={`bg-white rounded-xl border transition-colors ${isEditing ? "border-primary shadow-md" : "border-border hover:border-primary/30"}`}>
                    {/* Compact view */}
                    {!isEditing ? (
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: typeColor }} />
                        <div className="flex-1 min-w-0 grid grid-cols-4 gap-3">
                          <div className="col-span-2">
                            <p className="text-xs font-semibold text-foreground truncate">{event.title[lang] || event.title.en || "(untitled)"}</p>
                            {event.description?.[lang] && (
                              <p className="text-[10px] text-muted truncate">{event.description[lang]}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-muted">{event.date || "—"}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: typeColor }}>
                              {getTypeLabel(event.type)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingId(event.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(event.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit mode */
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: typeColor }} />
                          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Edit Event #{event.id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-muted mb-0.5">Title ({lang.toUpperCase()})</label>
                            <input type="text" value={event.title[lang] || ""}
                              onChange={(e) => updateEventLang(event.id, "title", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                              placeholder={`Event title in ${lang}`} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted mb-0.5">Date</label>
                            <input type="date" value={event.date}
                              onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted mb-0.5">Type</label>
                            <select value={event.type}
                              onChange={(e) => updateEvent(event.id, { type: e.target.value })}
                              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none bg-white">
                              {eventTypes.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-muted mb-0.5">Description ({lang.toUpperCase()}) (&ldquo;optional)</label>
                            <textarea value={event.description?.[lang] || ""}
                              onChange={(e) => updateEventLang(event.id, "description", e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y"
                              placeholder={`Optional description in ${lang}`} />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-border">
                          <button onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-lg text-[10px] font-semibold text-muted hover:text-foreground hover:bg-gray-100 transition-colors">
                            Cancel
                          </button>
                          <button onClick={() => handleSaveEvents(events)}
                            className="px-3 py-1 rounded-lg text-[10px] font-bold bg-primary text-white hover:bg-primary-dark transition-colors">
                            Save All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom add button */}
              <div className="text-center pt-2">
                <button onClick={handleAdd}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-colors">
                  + Add Another Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
