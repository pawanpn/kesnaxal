"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { translateToAll } from "@/lib/autoTranslate";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase/client";

type Locale = "en" | "ne" | "ja";
type AlertColor = "red" | "yellow" | "blue" | "green" | "orange";
type AlertType = "info" | "warning" | "danger" | "success";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const COLOR_OPTIONS: { value: AlertColor; label: string; bg: string; text: string }[] = [
  { value: "red", label: "Red", bg: "bg-red-500", text: "text-white" },
  { value: "yellow", label: "Yellow", bg: "bg-yellow-400", text: "text-black" },
  { value: "blue", label: "Blue", bg: "bg-blue-600", text: "text-white" },
  { value: "green", label: "Green", bg: "bg-green-600", text: "text-white" },
  { value: "orange", label: "Orange", bg: "bg-orange-500", text: "text-white" },
];

const ALERT_TYPES: { value: AlertType; label: string; icon: string; bg: string }[] = [
  { value: "info", label: "Info", icon: "ℹ️", bg: "bg-blue-50 border-blue-200" },
  { value: "warning", label: "Warning", icon: "⚠️", bg: "bg-yellow-50 border-yellow-200" },
  { value: "danger", label: "Danger", icon: "🚨", bg: "bg-red-50 border-red-200" },
  { value: "success", label: "Success", icon: "✅", bg: "bg-green-50 border-green-200" },
];

interface TickerMessage {
  id: string;
  text: Record<Locale, string>;
}

interface AlertBanner {
  id: string;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  type: AlertType;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

function emptyLocale(): Record<Locale, string> {
  return { en: "", ne: "", ja: "" };
}

async function saveAlertData(key: string, data: unknown) {
  const payload = { data };
  for (const locale of ["en", "ne", "ja"]) {
    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("section", "alerts")
      .eq("content_key", key)
      .eq("locale", locale)
      .maybeSingle();

    if (existing) {
      await supabase.from("site_content")
        .update({ content_json: payload, content_text: JSON.stringify(payload), status: "published", updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("site_content").insert({
        section: "alerts", content_key: key, locale,
        content_json: payload, content_text: JSON.stringify(payload), status: "published",
      });
    }
  }
}

async function loadAlertData(key: string): Promise<unknown> {
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("section", "alerts")
    .eq("content_key", key)
    .eq("locale", "en")
    .maybeSingle();
  return (data?.content_json as { data?: unknown })?.data ?? null;
}

export default function AlertsPage() {
  const { getContent, savePublishedContent, savePublishedJson } = useAdmin();
  const { toast } = useToast();
  const [translating, setTranslating] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ticker" | "emergency" | "banners">("ticker");

  // Breaking News Ticker
  const [tickerActive, setTickerActive] = useState(false);
  const [tickerColor, setTickerColor] = useState<AlertColor>("red");
  const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([
    { id: "1", text: emptyLocale() }
  ]);
  const [tickerSchedule, setTickerSchedule] = useState({ enabled: false, startDate: "", endDate: "" });
  const [showTickerPreview, setShowTickerPreview] = useState(false);

  // Emergency Popup
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState<AlertType>("warning");
  const [emergencyTitle, setEmergencyTitle] = useState<Record<Locale, string>>(emptyLocale());
  const [emergencyMsg, setEmergencyMsg] = useState<Record<Locale, string>>(emptyLocale());
  const [emergencyImage, setEmergencyImage] = useState("");
  const [emergencyClosable, setEmergencyClosable] = useState(true);
  const [emergencyCloseText, setEmergencyCloseText] = useState<Record<Locale, string>>({ en: "Close", ne: "बन्द गर्नुहोस्", ja: "閉じる" });
  const [showEmergencyPreview, setShowEmergencyPreview] = useState(false);

  // Alert Banners
  const [banners, setBanners] = useState<AlertBanner[]>([]);

  // Load data
  useEffect(() => {
    async function load() {
      // Load ticker
      const tickerData = await loadAlertData("ticker_config") as {
        active?: boolean; color?: AlertColor; messages?: TickerMessage[];
        schedule?: { enabled: boolean; startDate: string; endDate: string };
      } | null;
      if (tickerData) {
        setTickerActive(tickerData.active || false);
        setTickerColor(tickerData.color || "red");
        setTickerMessages(tickerData.messages || [{ id: "1", text: emptyLocale() }]);
        setTickerSchedule(tickerData.schedule || { enabled: false, startDate: "", endDate: "" });
      } else {
        // Fallback to old format
        const oldBn: Record<Locale, string> = { en: "", ne: "", ja: "" };
        LOCALES.forEach(({ id: l }) => { oldBn[l] = getContent("alerts", "breaking_news_text", l); });
        if (oldBn.en) setTickerMessages([{ id: "1", text: oldBn }]);
      }

      // Load emergency
      const emData = await loadAlertData("emergency_config") as {
        active?: boolean; type?: AlertType; title?: Record<Locale, string>;
        message?: Record<Locale, string>; image?: string; closable?: boolean;
        closeText?: Record<Locale, string>;
      } | null;
      if (emData) {
        setEmergencyActive(emData.active || false);
        setEmergencyType(emData.type || "warning");
        setEmergencyTitle(emData.title || emptyLocale());
        setEmergencyMsg(emData.message || emptyLocale());
        setEmergencyImage(emData.image || "");
        setEmergencyClosable(emData.closable !== false);
        setEmergencyCloseText(emData.closeText || { en: "Close", ne: "बन्द गर्नुहोस्", ja: "閉じる" });
      } else {
        // Fallback to old format
        const et: Record<Locale, string> = { en: "", ne: "", ja: "" };
        const em: Record<Locale, string> = { en: "", ne: "", ja: "" };
        LOCALES.forEach(({ id: l }) => {
          et[l] = getContent("alerts", "emergency_title", l);
          em[l] = getContent("alerts", "emergency_message", l);
        });
        setEmergencyTitle(et);
        setEmergencyMsg(em);
      }

      // Load banners
      const bannersData = await loadAlertData("alert_banners") as AlertBanner[] | null;
      if (Array.isArray(bannersData)) setBanners(bannersData);
    }
    load();
  }, [getContent]);

  // Save ticker
  const handleSaveTicker = async () => {
    setSaving("ticker");
    try {
      const config = { active: tickerActive, color: tickerColor, messages: tickerMessages, schedule: tickerSchedule };
      await saveAlertData("ticker_config", config);
      // Also save old format for backward compatibility
      await savePublishedContent("alerts", "breaking_news_text", "en", tickerMessages[0]?.text.en || "");
      await savePublishedJson("alerts", "breaking_news_active", "en", { active: tickerActive });
      toast("success", "Breaking news ticker saved!");
    } catch { toast("error", "Failed to save"); }
    setSaving(null);
  };

  // Save emergency
  const handleSaveEmergency = async () => {
    setSaving("emergency");
    try {
      const config = {
        active: emergencyActive, type: emergencyType,
        title: emergencyTitle, message: emergencyMsg,
        image: emergencyImage, closable: emergencyClosable, closeText: emergencyCloseText,
      };
      await saveAlertData("emergency_config", config);
      // Also save old format
      for (const l of ["en", "ne", "ja"] as Locale[]) {
        await savePublishedContent("alerts", "emergency_title", l, emergencyTitle[l]);
        await savePublishedContent("alerts", "emergency_message", l, sanitizeHtml(emergencyMsg[l]));
      }
      await savePublishedJson("alerts", "emergency_active", "en", { active: emergencyActive });
      toast("success", "Emergency popup saved!");
    } catch { toast("error", "Failed to save"); }
    setSaving(null);
  };

  // Save banners
  const handleSaveBanners = async () => {
    setSaving("banners");
    try {
      await saveAlertData("alert_banners", banners);
      toast("success", "Alert banners saved!");
    } catch { toast("error", "Failed to save"); }
    setSaving(null);
  };

  // Translate
  const handleTranslate = async (field: string, text: string, setter: (v: Record<Locale, string>) => void, current: Record<Locale, string>) => {
    if (!text.trim() || translating) return;
    setTranslating(field);
    try {
      const results = await translateToAll(text, "en");
      const updated = { ...current };
      for (const [l, v] of Object.entries(results)) if (v) updated[l as Locale] = v as string;
      setter(updated);
    } catch {}
    setTranslating(null);
  };

  // Add ticker message
  const addTickerMessage = () => {
    setTickerMessages(prev => [...prev, { id: Date.now().toString(), text: emptyLocale() }]);
  };

  const removeTickerMessage = (id: string) => {
    setTickerMessages(prev => prev.filter(m => m.id !== id));
  };

  const updateTickerMessage = (id: string, locale: Locale, value: string) => {
    setTickerMessages(prev => prev.map(m => m.id === id ? { ...m, text: { ...m.text, [locale]: value } } : m));
  };

  // Add banner
  const addBanner = () => {
    setBanners(prev => [...prev, {
      id: Date.now().toString(),
      title: emptyLocale(),
      message: emptyLocale(),
      type: "info",
      active: true,
      startDate: "",
      endDate: "",
    }]);
  };

  const removeBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));
  const updateBanner = (id: string, field: keyof AlertBanner, value: unknown) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  const updateBannerLocale = (id: string, field: "title" | "message", locale: Locale, value: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: { ...b[field], [locale]: value } } : b));
  };

  const selectedColor = COLOR_OPTIONS.find(c => c.value === tickerColor) || COLOR_OPTIONS[0];
  const selectedAlertType = ALERT_TYPES.find(t => t.value === emergencyType) || ALERT_TYPES[1];

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Alerts &amp; Breaking</h1>
            <p className="text-xs text-muted mt-1">Manage breaking news, emergency alerts and announcement banners</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6 max-w-md">
          {[
            { id: "ticker", label: "📢 Breaking Ticker" },
            { id: "emergency", label: "🚨 Emergency Popup" },
            { id: "banners", label: "📌 Alert Banners" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Breaking News Ticker */}
        {activeTab === "ticker" && (
          <div className="space-y-4 max-w-3xl">
            {/* Preview */}
            {showTickerPreview && (
              <div className={`${selectedColor.bg} ${selectedColor.text} rounded-xl overflow-hidden`}>
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="shrink-0 bg-white/20 text-xs font-bold px-3 py-0.5 rounded-full uppercase">BREAKING</span>
                  <p className="text-sm">{tickerMessages[0]?.text.en || "Your message here..."}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-sm text-foreground">Breaking News Ticker</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowTickerPreview(!showTickerPreview)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-border hover:bg-surface">
                    {showTickerPreview ? "Hide Preview" : "Preview"}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{tickerActive ? "ON" : "OFF"}</span>
                    <button onClick={() => setTickerActive(!tickerActive)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${tickerActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tickerActive ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Ticker Color</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => setTickerColor(c.value)}
                      className={`w-8 h-8 rounded-full ${c.bg} transition-all ${tickerColor === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"}`}
                      title={c.label} />
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-4 p-3 rounded-lg bg-surface border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setTickerSchedule(p => ({ ...p, enabled: !p.enabled }))}
                    className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${tickerSchedule.enabled ? "bg-primary" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${tickerSchedule.enabled ? "translate-x-3" : ""}`} />
                  </button>
                  <span className="text-xs font-semibold text-foreground">Schedule (Auto on/off)</span>
                </div>
                {tickerSchedule.enabled && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[10px] text-muted mb-1">Start Date & Time</label>
                      <input type="datetime-local" value={tickerSchedule.startDate}
                        onChange={e => setTickerSchedule(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted mb-1">End Date & Time</label>
                      <input type="datetime-local" value={tickerSchedule.endDate}
                        onChange={e => setTickerSchedule(p => ({ ...p, endDate: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider">Messages</label>
                  <button onClick={addTickerMessage}
                    className="px-2 py-1 rounded text-[10px] font-bold bg-primary text-white hover:bg-primary-dark">
                    + Add Message
                  </button>
                </div>
                <div className="space-y-3">
                  {tickerMessages.map((msg, idx) => (
                    <div key={msg.id} className="p-3 rounded-lg border border-border bg-surface/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-muted">Message {idx + 1}</span>
                        {tickerMessages.length > 1 && (
                          <button onClick={() => removeTickerMessage(msg.id)}
                            className="text-red-500 hover:text-red-700 text-[10px]">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {LOCALES.map(({ id: l }) => (
                          <div key={l}>
                            <label className="block text-[9px] text-muted mb-0.5">{l.toUpperCase()}</label>
                            <textarea value={msg.text[l] || ""}
                              onChange={e => updateTickerMessage(msg.id, l, e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 rounded border border-border text-[11px] focus:border-primary outline-none resize-none"
                              placeholder={`Message (${l.toUpperCase()})`} />
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleTranslate(`ticker_${msg.id}`, msg.text.en, (v) => { setTickerMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: { ...m.text, ne: v.ne || m.text.ne, ja: v.ja || m.text.ja } } : m)); }, msg.text)}
                        disabled={!msg.text.en.trim() || !!translating}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-border hover:bg-primary/5 disabled:opacity-30">
                        {translating === `ticker_${msg.id}` ? "Translating..." : "Auto-translate EN→NE,JA"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSaveTicker} disabled={saving === "ticker"}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                {saving === "ticker" ? "Saving..." : "Save Ticker"}
              </button>
            </div>
          </div>
        )}

        {/* Emergency Popup */}
        {activeTab === "emergency" && (
          <div className="space-y-4 max-w-3xl">
            {/* Preview */}
            {showEmergencyPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
                <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border-2 ${selectedAlertType.bg}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{selectedAlertType.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{emergencyTitle.en || "Emergency Title"}</h3>
                      <p className="text-sm text-muted mt-1">{emergencyMsg.en || "Emergency message here..."}</p>
                    </div>
                  </div>
                  {emergencyImage && (
                    <img src={emergencyImage} alt="alert" className="w-full rounded-lg mb-3 object-cover max-h-40" />
                  )}
                  {emergencyClosable && (
                    <button className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold">
                      {emergencyCloseText.en || "Close"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-sm text-foreground">Emergency Pop-up</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowEmergencyPreview(!showEmergencyPreview)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-border hover:bg-surface">
                    {showEmergencyPreview ? "Hide Preview" : "Preview"}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{emergencyActive ? "ON" : "OFF"}</span>
                    <button onClick={() => setEmergencyActive(!emergencyActive)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${emergencyActive ? "bg-red-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emergencyActive ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert Type */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Alert Type</label>
                <div className="flex gap-2">
                  {ALERT_TYPES.map(type => (
                    <button key={type.value} onClick={() => setEmergencyType(type.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${emergencyType === type.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/30"}`}>
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Title</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {LOCALES.map(({ id: l }) => (
                    <div key={l}>
                      <label className="block text-[9px] text-muted mb-0.5">{l.toUpperCase()}</label>
                      <input value={emergencyTitle[l] || ""}
                        onChange={e => setEmergencyTitle(p => ({ ...p, [l]: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                        placeholder={`Title (${l.toUpperCase()})`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleTranslate("em_title", emergencyTitle.en, setEmergencyTitle, emergencyTitle)}
                  disabled={!emergencyTitle.en.trim() || !!translating}
                  className="px-2 py-1 rounded text-[10px] border border-border hover:bg-primary/5 disabled:opacity-30">
                  {translating === "em_title" ? "Translating..." : "Auto-translate"}
                </button>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Message</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {LOCALES.map(({ id: l }) => (
                    <div key={l}>
                      <label className="block text-[9px] text-muted mb-0.5">{l.toUpperCase()}</label>
                      <textarea value={emergencyMsg[l] || ""}
                        onChange={e => setEmergencyMsg(p => ({ ...p, [l]: e.target.value }))}
                        rows={3}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-none"
                        placeholder={`Message (${l.toUpperCase()})`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleTranslate("em_msg", emergencyMsg.en, setEmergencyMsg, emergencyMsg)}
                  disabled={!emergencyMsg.en.trim() || !!translating}
                  className="px-2 py-1 rounded text-[10px] border border-border hover:bg-primary/5 disabled:opacity-30">
                  {translating === "em_msg" ? "Translating..." : "Auto-translate"}
                </button>
              </div>

              {/* Image */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Image URL (optional)</label>
                <input value={emergencyImage}
                  onChange={e => setEmergencyImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:border-primary outline-none"
                  placeholder="https://... (leave empty for no image)" />
              </div>

              {/* Close Button */}
              <div className="mb-5 p-3 rounded-lg bg-surface border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setEmergencyClosable(!emergencyClosable)}
                    className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${emergencyClosable ? "bg-primary" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${emergencyClosable ? "translate-x-3" : ""}`} />
                  </button>
                  <span className="text-xs font-semibold">Show Close Button</span>
                </div>
                {emergencyClosable && (
                  <div className="grid grid-cols-3 gap-2">
                    {LOCALES.map(({ id: l }) => (
                      <div key={l}>
                        <label className="block text-[9px] text-muted mb-0.5">Close Button Text ({l.toUpperCase()})</label>
                        <input value={emergencyCloseText[l] || ""}
                          onChange={e => setEmergencyCloseText(p => ({ ...p, [l]: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-border text-xs focus:border-primary outline-none"
                          placeholder="Close" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSaveEmergency} disabled={saving === "emergency"}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                {saving === "emergency" ? "Saving..." : "Save Popup"}
              </button>
            </div>
          </div>
        )}

        {/* Alert Banners */}
        {activeTab === "banners" && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">Add announcement banners (admission, holiday, exam schedule)</p>
              <button onClick={addBanner}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
                + Add Banner
              </button>
            </div>

            {banners.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center">
                <p className="text-sm text-muted">No banners yet. Click &quot;+ Add Banner&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner, idx) => {
                  const bType = ALERT_TYPES.find(t => t.value === banner.type) || ALERT_TYPES[0];
                  return (
                    <div key={banner.id} className={`bg-white rounded-xl border-2 p-5 ${banner.active ? "border-primary/20" : "border-border opacity-60"}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">Banner {idx + 1}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {banner.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateBanner(banner.id, "active", !banner.active)}
                            className={`w-8 h-4 rounded-full transition-colors relative ${banner.active ? "bg-green-500" : "bg-gray-300"}`}>
                            <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${banner.active ? "translate-x-4" : ""}`} />
                          </button>
                          <button onClick={() => removeBanner(banner.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="mb-3">
                        <label className="block text-[10px] text-muted mb-1">Banner Type</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {ALERT_TYPES.map(type => (
                            <button key={type.value} onClick={() => updateBanner(banner.id, "type", type.value)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border transition-all ${banner.type === type.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}>
                              {type.icon} {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="mb-3">
                        <label className="block text-[10px] text-muted mb-1">Title</label>
                        <div className="grid grid-cols-3 gap-2">
                          {LOCALES.map(({ id: l }) => (
                            <input key={l} value={banner.title[l] || ""}
                              onChange={e => updateBannerLocale(banner.id, "title", l, e.target.value)}
                              className="px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                              placeholder={`Title (${l.toUpperCase()})`} />
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="mb-3">
                        <label className="block text-[10px] text-muted mb-1">Message</label>
                        <div className="grid grid-cols-3 gap-2">
                          {LOCALES.map(({ id: l }) => (
                            <textarea key={l} value={banner.message[l] || ""}
                              onChange={e => updateBannerLocale(banner.id, "message", l, e.target.value)}
                              rows={2}
                              className="px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-none"
                              placeholder={`Message (${l.toUpperCase()})`} />
                          ))}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-muted mb-1">Show From</label>
                          <input type="date" value={banner.startDate || ""}
                            onChange={e => updateBanner(banner.id, "startDate", e.target.value)}
                            className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted mb-1">Show Until</label>
                          <input type="date" value={banner.endDate || ""}
                            onChange={e => updateBanner(banner.id, "endDate", e.target.value)}
                            className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={handleSaveBanners} disabled={saving === "banners"}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                  {saving === "banners" ? "Saving..." : "Save All Banners"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

