"use client";

import { useState, useEffect, useMemo } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { CalendarEvent, CalendarEventType } from "@/types";

type Locale = "en" | "ne" | "ja";
type SortKey = "date" | "type" | "title";

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

function emptyEvent(maxId: number, defaultType: string): CalendarEvent {
  return {
    id: maxId + 1,
    title: { en: "", ne: "", ja: "" },
    type: defaultType || "event",
    date: new Date().toISOString().slice(0, 10),
    endDate: "",
    description: { en: "", ne: "", ja: "" },
  };
}

export default function CalendarAdminPage() {
  const { getJson, getContent, saveJson, hasDraft, loadAllContent } = useAdmin();
  const { toast } = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<CalendarEventType[]>(DEFAULT_TYPES);
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Left panel state
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Right panel — editing
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Type management
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeFormId, setTypeFormId] = useState<string | null>(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [typeColor, setTypeColor] = useState("#3b82f6");

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const json = getJson("calendar", "calendar_types", "en");
    if (json?.types && Array.isArray(json.types) && (json.types as unknown[]).length)
      setEventTypes(json.types as CalendarEventType[]);
  }, [getJson]);

  useEffect(() => {
    for (const { id: l } of LOCALES) {
      const json = getJson("calendar", "calendar_events", l) as { events?: CalendarEvent[] };
      if (json?.events?.length) { setEvents(json.events); return; }
    }
    // Fallback old format
    const fallback: CalendarEvent[] = [];
    for (let i = 1; i <= 30; i++) {
      const titleEn = getContent("calendar", `calendar_${i}_title`, "en");
      if (!titleEn) continue;
      fallback.push({
        id: i,
        title: { en: titleEn, ne: getContent("calendar", `calendar_${i}_title`, "ne") || "", ja: getContent("calendar", `calendar_${i}_title`, "ja") || "" },
        type: getContent("calendar", `calendar_${i}_type`, "en") || "event",
        date: getContent("calendar", `calendar_${i}_date`, "en") || "",
        description: { en: getContent("calendar", `calendar_${i}_description`, "en") || "", ne: getContent("calendar", `calendar_${i}_description`, "ne") || "", ja: getContent("calendar", `calendar_${i}_description`, "ja") || "" },
      });
    }
    if (fallback.length) setEvents(fallback);
  }, [getJson, getContent]);

  const getTypeLabel = (typeId: string) => eventTypes.find((t) => t.id === typeId)?.label || typeId;
  const getTypeColor = (typeId: string) => eventTypes.find((t) => t.id === typeId)?.color || "#6b7280";

  // Sorted + filtered events
  const displayEvents = useMemo(() => {
    let result = [...events];
    if (filterType !== "all") result = result.filter((e) => e.type === filterType);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((e) =>
        (e.title[lang] || e.title.en || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortKey === "date") return (a.date || "").localeCompare(b.date || "");
      if (sortKey === "type") return a.type.localeCompare(b.type);
      if (sortKey === "title") return (a.title[lang] || a.title.en || "").localeCompare(b.title[lang] || b.title.en || "");
      return 0;
    });
    return result;
  }, [events, filterType, searchText, sortKey, lang]);

  const saveEventTypes = async (types: CalendarEventType[]) => {
    for (const { id: l } of LOCALES) await saveJson("calendar", "calendar_types", l, { types });
    setEventTypes(types);
  };

  const handleSaveEvents = async (updated: CalendarEvent[]) => {
    setSaving(true);
    const toSave = syncing
      ? updated.map((e) => ({
          ...e,
          title: { en: e.title[lang] ?? "", ne: e.title[lang] ?? "", ja: e.title[lang] ?? "" },
          description: e.description ? { en: e.description[lang] ?? "", ne: e.description[lang] ?? "", ja: e.description[lang] ?? "" } : undefined,
        }))
      : updated;
    try {
      for (const { id: l } of LOCALES) await saveJson("calendar", "calendar_events", l, { events: toSave });
      setEvents(toSave);
      toast("success", "Calendar saved!");
    } catch { toast("error", "Failed to save"); }
    setSaving(false);
  };

  const handleAddNew = () => {
    const maxId = events.reduce((max, e) => Math.max(max, e.id), 0);
    const newEv = emptyEvent(maxId, eventTypes[0]?.id || "event");
    setEditingEvent(newEv);
    setIsNew(true);
    setSelectedId(null);
  };

  const handleSelectEvent = (ev: CalendarEvent) => {
    setEditingEvent({ ...ev });
    setSelectedId(ev.id);
    setIsNew(false);
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    if (!editingEvent.title.en.trim()) { toast("error", "English title required"); return; }
    const updated = isNew
      ? [...events, editingEvent]
      : events.map((e) => (e.id === editingEvent.id ? editingEvent : e));
    await handleSaveEvents(updated);
    setSelectedId(editingEvent.id);
    setIsNew(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this event?")) return;
    const updated = events.filter((e) => e.id !== id);
    await handleSaveEvents(updated);
    if (selectedId === id) { setEditingEvent(null); setSelectedId(null); }
  };

  const handleCancelEdit = () => {
    if (isNew) { setEditingEvent(null); setSelectedId(null); setIsNew(false); }
    else if (selectedId !== null) {
      const orig = events.find((e) => e.id === selectedId);
      if (orig) setEditingEvent({ ...orig });
    }
  };

  const updateField = (field: keyof CalendarEvent, value: string) => {
    if (!editingEvent) return;
    const localeFields = ["title", "description"];
    if (localeFields.includes(field)) {
      setEditingEvent({ ...editingEvent, [field]: { ...(editingEvent[field] as Record<Locale, string>), [lang]: value } });
    } else {
      setEditingEvent({ ...editingEvent, [field]: value });
    }
  };

  // Type form
  const openAddType = () => { setTypeFormId(null); setTypeLabel(""); setTypeColor("#3b82f6"); setShowTypeForm(true); };
  const openEditType = (t: CalendarEventType) => { setTypeFormId(t.id); setTypeLabel(t.label); setTypeColor(t.color); setShowTypeForm(true); };
  const handleSaveType = () => {
    const label = typeLabel.trim();
    if (!label) return;
    const id = typeFormId || label.toLowerCase().replace(/\s+/g, "_");
    if (!typeFormId && eventTypes.some((t) => t.id === id)) { toast("error", "Type already exists"); return; }
    const updated = typeFormId
      ? eventTypes.map((t) => (t.id === typeFormId ? { ...t, label, color: typeColor } : t))
      : [...eventTypes, { id, label, color: typeColor }];
    saveEventTypes(updated);
    setShowTypeForm(false);
    toast("success", typeFormId ? "Type updated" : "Type added");
  };

  const formatDateRange = (ev: CalendarEvent) => {
    if (!ev.date) return "—";
    if (!ev.endDate || ev.endDate === ev.date) return ev.date;
    return `${ev.date} → ${ev.endDate}`;
  };

  const hasD = hasDraft("calendar", "calendar_events", lang);

  return (
    <AdminGuard>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-border px-6 pt-4 pb-3 z-10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground">Calendar Events</h1>
              <p className="text-[10px] text-muted">{events.length} events · Manage events &amp; types</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-gray-50 rounded-lg border border-border p-0.5">
                {LOCALES.map((l) => (
                  <button key={l.id} onClick={() => setLang(l.id)}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer">
                <button type="button" onClick={() => setSyncing(!syncing)}
                  className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${syncing ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${syncing ? "translate-x-3" : ""}`} />
                </button>
                Sync
              </label>
              <button onClick={handleAddNew}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
                + Add Event
              </button>
              <button onClick={() => handleSaveEvents(events)} disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>

          {/* Event Types */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">Types:</span>
            {eventTypes.map((t) => (
              <div key={t.id} className="flex items-center gap-1 bg-gray-50 rounded-lg border border-border px-2 py-0.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] font-medium">{t.label}</span>
                <button onClick={() => openEditType(t)} className="text-muted hover:text-primary ml-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {eventTypes.length > 1 && (
                  <button onClick={() => { if (confirm(`Delete "${t.label}"?`)) saveEventTypes(eventTypes.filter((x) => x.id !== t.id)); }} className="text-muted hover:text-red-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {!showTypeForm && (
              <button onClick={openAddType} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20">
                + Add Type
              </button>
            )}
            {showTypeForm && (
              <div className="flex items-center gap-2 flex-wrap p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <input type="text" value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)}
                  placeholder="Type name" className="px-2 py-1 rounded border border-border text-xs w-28 focus:border-primary outline-none" />
                <input type="color" value={typeColor} onChange={(e) => setTypeColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-border" />
                <div className="flex gap-0.5">
                  {PRESET_COLORS.slice(0, 9).map((c) => (
                    <button key={c} onClick={() => setTypeColor(c)}
                      className={`w-4 h-4 rounded-full border-2 ${typeColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button onClick={handleSaveType} className="px-2 py-1 rounded text-[10px] font-bold bg-primary text-white">{typeFormId ? "Update" : "Add"}</button>
                <button onClick={() => setShowTypeForm(false)} className="px-2 py-1 rounded text-[10px] text-muted hover:text-foreground">Cancel</button>
              </div>
            )}
          </div>

          {hasD && (
            <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
              Draft pending — publish to make changes live.
            </div>
          )}
        </div>

        {/* Main Content — Left/Right Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT — Event List */}
          <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
            {/* Sort + Filter */}
            <div className="shrink-0 px-4 py-2 bg-surface border-b border-border flex items-center gap-2 flex-wrap">
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search events..."
                className="px-2 py-1 rounded border border-border text-xs focus:border-primary outline-none w-36" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 rounded border border-border text-xs focus:border-primary outline-none bg-white">
                <option value="all">All Types</option>
                {eventTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <div className="flex gap-1 ml-auto">
                <span className="text-[10px] text-muted self-center">Sort:</span>
                {(["date", "type", "title"] as SortKey[]).map((k) => (
                  <button key={k} onClick={() => setSortKey(k)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${sortKey === k ? "bg-primary text-white" : "bg-white border border-border text-muted hover:border-primary/30"}`}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {displayEvents.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted">
                  No events found. Click &quot;+ Add Event&quot; to create one.
                </div>
              ) : displayEvents.map((ev) => {
                const tc = getTypeColor(ev.type);
                const isSelected = selectedId === ev.id;
                return (
                  <div key={ev.id}
                    onClick={() => handleSelectEvent(ev)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}
                  >
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: tc }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {ev.title[lang] || ev.title.en || "(untitled)"}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">{formatDateRange(ev)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: tc }}>
                        {getTypeLabel(ev.type)}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                        className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 px-4 py-2 bg-surface border-t border-border text-center">
              <button onClick={handleAddNew}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-colors">
                + Add Another Event
              </button>
            </div>
          </div>

          {/* RIGHT — Edit Panel */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            {editingEvent ? (
              <>
                <div className="shrink-0 px-5 py-3 bg-surface border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-heading font-bold text-foreground">
                    {isNew ? "Add New Event" : `Edit Event #${editingEvent.id}`}
                  </h2>
                  <button onClick={handleCancelEdit} className="text-xs text-muted hover:text-foreground">Cancel</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Title ({lang.toUpperCase()}) *
                    </label>
                    <input type="text"
                      value={(editingEvent.title as Record<Locale, string>)[lang] || ""}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                      placeholder={`Event title in ${lang.toUpperCase()}`} />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Event Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {eventTypes.map((t) => (
                        <button key={t.id} type="button"
                          onClick={() => setEditingEvent({ ...editingEvent, type: t.id })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${editingEvent.type === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/30"}`}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Start Date *</label>
                      <input type="date" value={editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        End Date <span className="text-muted font-normal">(optional)</span>
                      </label>
                      <input type="date" value={editingEvent.endDate || ""}
                        onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                        min={editingEvent.date}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                    </div>
                  </div>

                  {/* Duration info */}
                  {editingEvent.endDate && editingEvent.endDate !== editingEvent.date && editingEvent.date && (
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                      Duration: {Math.ceil((new Date(editingEvent.endDate).getTime() - new Date(editingEvent.date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Description ({lang.toUpperCase()}) <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={(editingEvent.description as Record<Locale, string> | undefined)?.[lang] || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none resize-y"
                      placeholder={`Description in ${lang.toUpperCase()}`} />
                  </div>
                </div>

                <div className="shrink-0 px-5 py-3 bg-surface border-t border-border flex gap-2">
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? "Saving..." : isNew ? "Add Event" : "Save Changes"}
                  </button>
                  <button onClick={handleCancelEdit}
                    className="py-2 px-4 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                    Cancel
                  </button>
                  {!isNew && (
                    <button onClick={() => handleDelete(editingEvent.id)}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                      Delete
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-muted">Select an event to edit</p>
                  <p className="text-xs text-muted mt-1">or click &quot;+ Add Event&quot; to create a new one</p>
                  <button onClick={handleAddNew}
                    className="mt-4 px-5 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
                    + Add Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
