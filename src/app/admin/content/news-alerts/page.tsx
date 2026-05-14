"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { translateToAll } from "@/lib/autoTranslate";
import { sanitizeHtml } from "@/lib/sanitize";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

export default function AlertsPage() {
  const { getContent, getJson, saveContent, saveJson } = useAdmin();
  const { toast } = useToast();

  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [translating, setTranslating] = useState(false);

  // ── Breaking & Emergency ──
  const [breakingNews, setBreakingNews] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [breakingActive, setBreakingActive] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyMsg, setEmergencyMsg] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [alertSaving, setAlertSaving] = useState<string | null>(null);

  // Load breaking/emergency from DB
  useEffect(() => {
    const bn: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const et: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const em: Record<Locale, string> = { en: "", ne: "", ja: "" };
    LOCALES.forEach(({ id: l }) => {
      bn[l] = getContent("alerts", "breaking_news_text", l);
      et[l] = getContent("alerts", "emergency_title", l);
      em[l] = getContent("alerts", "emergency_message", l);
    });
    setBreakingNews(bn);
    setEmergencyTitle(et);
    setEmergencyMsg(em);
    const bm = getJson("alerts", "breaking_news_active", "en");
    setBreakingActive((bm as { active?: boolean })?.active || false);
    const emeta = getJson("alerts", "emergency_active", "en");
    setEmergencyActive((emeta as { active?: boolean })?.active || false);
  }, [getContent, getJson]);

  const handleTranslate = async (field: "breaking" | "emergency_title" | "emergency_msg") => {
    let text = "";
    if (field === "breaking") text = breakingNews[lang];
    else if (field === "emergency_title") text = emergencyTitle[lang];
    else if (field === "emergency_msg") text = emergencyMsg[lang];
    if (!text?.trim() || translating) return;

    setTranslating(true);
    try {
      const results = await translateToAll(text, lang);
      if (field === "breaking") {
        setBreakingNews((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      } else if (field === "emergency_title") {
        setEmergencyTitle((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      } else if (field === "emergency_msg") {
        setEmergencyMsg((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      }
    } catch {}
    setTranslating(false);
  };

  const handleToggleSave = async (key: string, active: boolean) => {
    try { await saveJson("alerts", key, "en", { active }); toast("success", "Saved"); } catch { toast("error", "Failed"); }
  };

  const handleSaveBreaking = async () => {
    setAlertSaving("breaking");
    try {
      for (const { id: l } of LOCALES) await saveContent("alerts", "breaking_news_text", l, syncing ? breakingNews[lang] : breakingNews[l]);
      toast("success", "Saved");
    } catch { toast("error", "Failed"); }
    setAlertSaving(null);
  };

  const handleSaveEmergency = async () => {
    setAlertSaving("emergency");
    try {
      for (const { id: l } of LOCALES) {
        await saveContent("alerts", "emergency_title", l, syncing ? emergencyTitle[lang] : emergencyTitle[l]);
        await saveContent("alerts", "emergency_message", l, sanitizeHtml(syncing ? emergencyMsg[lang] : emergencyMsg[l]));
      }
      toast("success", "Saved");
    } catch { toast("error", "Failed"); }
    setAlertSaving(null);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Alerts &amp; Breaking</h1>
            <p className="text-xs text-muted mt-1">Manage breaking news ticker and emergency pop-up alerts</p>
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
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Breaking News Ticker */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Breaking News Ticker</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-muted">{breakingActive ? "ON" : "OFF"}</span>
                <button onClick={() => { setBreakingActive(!breakingActive); handleToggleSave("breaking_news_active", !breakingActive); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${breakingActive ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${breakingActive ? "translate-x-5" : ""}`} />
                </button>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {LOCALES.map(({ id: l }) => (
                <div key={l} className="relative">
                  <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                  <textarea value={breakingNews[l] || ""}
                    onChange={(e) => setBreakingNews((p) => {
                      const n = { ...p, [l]: e.target.value };
                      if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value);
                      return n;
                    })} rows={2}
                    className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                    placeholder={`Breaking news (${l.toUpperCase()})`} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => handleTranslate("breaking")} disabled={translating || !breakingNews[lang]?.trim()}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">
                {translating ? <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> ...</> : "Translate"}
              </button>
            </div>
            <button onClick={handleSaveBreaking}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
              {alertSaving === "breaking" ? "Saving..." : "Save Ticker"}
            </button>
          </div>

          {/* Emergency Pop-up */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Emergency Pop-up</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-muted">{emergencyActive ? "ON" : "OFF"}</span>
                <button onClick={() => { setEmergencyActive(!emergencyActive); handleToggleSave("emergency_active", !emergencyActive); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${emergencyActive ? "bg-accent" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emergencyActive ? "translate-x-5" : ""}`} />
                </button>
              </label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {LOCALES.map(({ id: l }) => (
                  <div key={l} className="relative">
                    <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                    <input value={emergencyTitle[l] || ""}
                      onChange={(e) => setEmergencyTitle((p) => { const n = { ...p, [l]: e.target.value }; if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value); return n; })}
                      className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none" placeholder={`Title (${l.toUpperCase()})`} />
                  </div>
                ))}
              </div>
              <button onClick={() => handleTranslate("emergency_title")} disabled={translating || !emergencyTitle[lang]?.trim()}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">Translate</button>
              <div className="grid grid-cols-3 gap-2">
                {LOCALES.map(({ id: l }) => (
                  <div key={l} className="relative">
                    <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                    <textarea value={emergencyMsg[l] || ""}
                      onChange={(e) => setEmergencyMsg((p) => { const n = { ...p, [l]: e.target.value }; if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value); return n; })} rows={3}
                      className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y" placeholder={`Message (${l.toUpperCase()})`} />
                  </div>
                ))}
              </div>
              <button onClick={() => handleTranslate("emergency_msg")} disabled={translating || !emergencyMsg[lang]?.trim()}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">Translate</button>
            </div>
            <button onClick={handleSaveEmergency}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
              {alertSaving === "emergency" ? "Saving..." : "Save Pop-up"}
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
