"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

export default function NewsAlertsPage() {
  const { getContent, getJson, saveContent, saveJson, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const { toast } = useToast();
  const [lang, setLang] = useState<Locale>("en");
  const [autoTranslate, setAutoTranslate] = useState(false);

  const [breakingNews, setBreakingNews] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [breakingActive, setBreakingActive] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyMsg, setEmergencyMsg] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const bn: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const et: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const em: Record<Locale, string> = { en: "", ne: "", ja: "" };
    LOCALES.forEach(({ id: l }) => {
      bn[l] = getContent("news", "breaking_news_text", l);
      et[l] = getContent("news", "emergency_title", l);
      em[l] = getContent("news", "emergency_message", l);
    });
    setBreakingNews(bn);
    setEmergencyTitle(et);
    setEmergencyMsg(em);
    const bm = getJson("news", "breaking_news_active", "en");
    setBreakingActive((bm as { active?: boolean })?.active || false);
    const emeta = getJson("news", "emergency_active", "en");
    setEmergencyActive((emeta as { active?: boolean })?.active || false);
  }, [getContent, getJson]);

  const handleToggleSave = async (key: string, active: boolean) => {
    setSaving(key);
    try {
      await saveJson("news", key, "en", { active });
      toast("success", "Saved successfully");
    } catch {
      toast("error", "Failed to save");
    }
    setSaving(null);
  };

  const handleSaveBreaking = async () => {
    setSaving("breaking_news_text");
    if (autoTranslate) {
      for (const { id: l } of LOCALES) {
        await saveContent("news", "breaking_news_text", l, breakingNews[lang]);
      }
    } else {
      for (const { id: l } of LOCALES) {
        await saveContent("news", "breaking_news_text", l, breakingNews[l]);
      }
    }
    setSaving(null);
  };

  const handleSaveEmergency = async () => {
    setSaving("emergency");
    if (autoTranslate) {
      for (const { id: l } of LOCALES) {
        await saveContent("news", "emergency_title", l, emergencyTitle[lang]);
        await saveContent("news", "emergency_message", l, emergencyMsg[lang]);
      }
    } else {
      for (const { id: l } of LOCALES) {
        await saveContent("news", "emergency_title", l, emergencyTitle[l]);
        await saveContent("news", "emergency_message", l, emergencyMsg[l]);
      }
    }
    setSaving(null);
  };

  const setBreaking = (l: Locale, val: string) => {
    setBreakingNews((p) => {
      const next = { ...p, [l]: val };
      if (autoTranslate) LOCALES.forEach(({ id: ll }) => { next[ll] = val; });
      return next;
    });
  };
  const setETitle = (l: Locale, val: string) => {
    setEmergencyTitle((p) => {
      const next = { ...p, [l]: val };
      if (autoTranslate) LOCALES.forEach(({ id: ll }) => { next[ll] = val; });
      return next;
    });
  };
  const setEMsg = (l: Locale, val: string) => {
    setEmergencyMsg((p) => {
      const next = { ...p, [l]: val };
      if (autoTranslate) LOCALES.forEach(({ id: ll }) => { next[ll] = val; });
      return next;
    });
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">News & Alerts</h1>
            <p className="text-xs text-muted mt-1">Manage breaking news ticker and emergency popup</p>
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
              <button onClick={() => setAutoTranslate(!autoTranslate)}
                className={`w-8 h-4 rounded-full transition-colors relative ${autoTranslate ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${autoTranslate ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              Auto
            </label>
            <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("news"); setDiscarding(false); window.location.reload(); }}
              disabled={discarding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
              Discard Drafts
            </button>
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Breaking News */}
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
                    onChange={(e) => setBreaking(l, e.target.value)} rows={2}
                    className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                    placeholder={`Breaking news (${l.toUpperCase()})`} />
                </div>
              ))}
            </div>
            <button onClick={handleSaveBreaking}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
              {saving === "breaking_news_text" ? "Saving..." : "Save News"}
            </button>
            {hasDraft("news", "breaking_news_text", "en") && <span className="ml-2 text-xs text-yellow-600">Draft pending</span>}
          </div>

          {/* Emergency Popup */}
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
                    <input type="text" value={emergencyTitle[l] || ""}
                      onChange={(e) => setETitle(l, e.target.value)}
                      className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none"
                      placeholder={`Title (${l.toUpperCase()})`} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LOCALES.map(({ id: l }) => (
                  <div key={l} className="relative">
                    <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                    <textarea value={emergencyMsg[l] || ""}
                      onChange={(e) => setEMsg(l, e.target.value)} rows={3}
                      className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                      placeholder={`Message (${l.toUpperCase()})`} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSaveEmergency}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
              {saving === "emergency" ? "Saving..." : "Save Pop-up"}
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
