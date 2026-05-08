"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";

export default function NewsAlertsPage() {
  const { getContent, getJson, saveContent, saveJson, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();

  const [breakingNews, setBreakingNews] = useState("");
  const [breakingActive, setBreakingActive] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState("");
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    setBreakingNews(getContent("news", "breaking_news_text", "en"));
    const breakingMeta = getJson("news", "breaking_news_active", "en");
    setBreakingActive((breakingMeta as { active?: boolean })?.active || false);

    setEmergencyTitle(getContent("news", "emergency_title", "en"));
    setEmergencyMsg(getContent("news", "emergency_message", "en"));
    const emergencyMeta = getJson("news", "emergency_active", "en");
    setEmergencyActive((emergencyMeta as { active?: boolean })?.active || false);
  }, []);

  const handleToggleSave = async (key: string, active: boolean) => {
    setSaving(key);
    await saveJson("news", key, "en", { active });
    setSaving(null);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">News & Alerts</h1>
            <p className="text-xs text-muted mt-1">Manage breaking news ticker and emergency popup</p>
          </div>
          <button
            onClick={async () => { setDiscarding(true); await discardSectionDrafts("news"); setDiscarding(false); window.location.reload(); }}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50"
          >
            Discard Drafts
          </button>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Breaking News */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Breaking News Ticker</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-muted">{breakingActive ? "ON" : "OFF"}</span>
                <button
                  onClick={() => { setBreakingActive(!breakingActive); handleToggleSave("breaking_news_active", !breakingActive); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${breakingActive ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${breakingActive ? "translate-x-5" : ""}`} />
                </button>
              </label>
            </div>
            <textarea
              value={breakingNews}
              onChange={(e) => setBreakingNews(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y mb-2"
              placeholder="Breaking news headline..."
            />
            <button
              onClick={async () => { setSaving("breaking_news_text"); await saveContent("news", "breaking_news_text", "en", breakingNews); await saveContent("news", "breaking_news_text", "ne", breakingNews); setSaving(null); }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark"
            >
              {saving === "breaking_news_text" ? "Saving..." : "Save News"}
            </button>
            {hasDraft("news", "breaking_news_text", "en") && (
              <span className="ml-2 text-xs text-yellow-600">Draft pending</span>
            )}
          </div>

          {/* Emergency Popup */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Emergency Pop-up</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-muted">{emergencyActive ? "ON" : "OFF"}</span>
                <button
                  onClick={() => { setEmergencyActive(!emergencyActive); handleToggleSave("emergency_active", !emergencyActive); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${emergencyActive ? "bg-accent" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emergencyActive ? "translate-x-5" : ""}`} />
                </button>
              </label>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={emergencyTitle}
                onChange={(e) => setEmergencyTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Emergency title..."
              />
              <textarea
                value={emergencyMsg}
                onChange={(e) => setEmergencyMsg(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                placeholder="Emergency message..."
              />
            </div>
            <button
              onClick={async () => { setSaving("emergency"); await saveContent("news", "emergency_title", "en", emergencyTitle); await saveContent("news", "emergency_message", "en", emergencyMsg); setSaving(null); }}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark"
            >
              {saving === "emergency" ? "Saving..." : "Save Pop-up"}
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
