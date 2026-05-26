"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { supabase } from "@/lib/supabase/client";

type Locale = "en" | "ne" | "ja";
type AlertType = "info" | "warning" | "danger" | "success";

interface EmergencyConfig {
  active: boolean;
  type: AlertType;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  image?: string;
  closable: boolean;
  closeText: Record<Locale, string>;
}

const TYPE_STYLES: Record<AlertType, { border: string; icon: string; bg: string; titleColor: string }> = {
  info: { border: "border-blue-300", icon: "ℹ️", bg: "bg-blue-50", titleColor: "text-blue-800" },
  warning: { border: "border-yellow-400", icon: "⚠️", bg: "bg-yellow-50", titleColor: "text-yellow-800" },
  danger: { border: "border-red-400", icon: "🚨", bg: "bg-red-50", titleColor: "text-red-800" },
  success: { border: "border-green-400", icon: "✅", bg: "bg-green-50", titleColor: "text-green-800" },
};

export default function EmergencyPopup() {
  const { locale } = useLocale();
  const [config, setConfig] = useState<EmergencyConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        // Try new format first
        const { data } = await supabase
          .from("site_content")
          .select("content_json")
          .eq("section", "alerts")
          .eq("content_key", "emergency_config")
          .eq("locale", "en")
          .eq("status", "published")
          .maybeSingle();

        if (data?.content_json) {
          const parsed = data.content_json as { data?: EmergencyConfig };
          if (parsed?.data) {
            setConfig(parsed.data);
            setLoaded(true);
            return;
          }
        }

        // Fallback to old format
        const { data: activeData } = await supabase
          .from("site_content")
          .select("content_text, content_json")
          .eq("section", "alerts")
          .eq("content_key", "emergency_active")
          .eq("locale", "en")
          .eq("status", "published")
          .maybeSingle();

        if (activeData) {
          const activeJson = activeData.content_json as { active?: boolean } | null;
          const isActive = activeJson?.active || activeData.content_text === "true";

          if (isActive) {
            const title: Record<Locale, string> = { en: "", ne: "", ja: "" };
            const message: Record<Locale, string> = { en: "", ne: "", ja: "" };

            for (const l of ["en", "ne", "ja"] as Locale[]) {
              const { data: tData } = await supabase
                .from("site_content")
                .select("content_text")
                .eq("section", "alerts")
                .eq("content_key", "emergency_title")
                .eq("locale", l)
                .eq("status", "published")
                .maybeSingle();
              title[l] = tData?.content_text || "";

              const { data: mData } = await supabase
                .from("site_content")
                .select("content_text")
                .eq("section", "alerts")
                .eq("content_key", "emergency_message")
                .eq("locale", l)
                .eq("status", "published")
                .maybeSingle();
              message[l] = mData?.content_text || "";
            }

            setConfig({
              active: true,
              type: "warning",
              title,
              message,
              closable: true,
              closeText: { en: "Close", ne: "बन्द गर्नुहोस्", ja: "閉じる" },
            });
          }
        }
      } catch (e) {
        console.error("EmergencyPopup load error:", e);
      }
      setLoaded(true);
    }
    loadConfig();
  }, []);

  if (!loaded || !config || !config.active || dismissed) return null;

  const loc = (locale as Locale) || "en";
  const title = config.title[loc] || config.title.en || "";
  const message = config.message[loc] || config.message.en || "";
  const closeText = config.closeText[loc] || config.closeText.en || "Close";

  if (!title && !message) return null;

  const style = TYPE_STYLES[config.type] || TYPE_STYLES.warning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 ${style.border} overflow-hidden`}>
        {/* Header */}
        <div className={`${style.bg} px-6 py-4 flex items-start gap-3`}>
          <span className="text-2xl shrink-0 mt-0.5">{style.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className={`font-heading font-bold text-lg ${style.titleColor}`}>{title}</h3>
          </div>
        </div>

        {/* Image */}
        {config.image && (
          <div className="px-6 pt-4">
            <img
              src={config.image}
              alt="Alert"
              className="w-full rounded-lg object-cover max-h-48"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="px-6 py-4">
            <p className="text-sm text-foreground leading-relaxed">{message}</p>
          </div>
        )}

        {/* Close Button */}
        {config.closable && (
          <div className="px-6 pb-5">
            <button
              onClick={() => setDismissed(true)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              {closeText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
