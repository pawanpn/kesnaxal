"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { supabase } from "@/lib/supabase/client";

type Locale = "en" | "ne" | "ja";
type AlertColor = "red" | "yellow" | "blue" | "green" | "orange";

interface TickerMessage {
  id: string;
  text: Record<Locale, string>;
}

interface TickerConfig {
  active: boolean;
  color: AlertColor;
  messages: TickerMessage[];
  schedule?: {
    enabled: boolean;
    startDate: string;
    endDate: string;
  };
}

const COLOR_CLASSES: Record<AlertColor, { bg: string; text: string; badge: string }> = {
  red: { bg: "bg-red-600", text: "text-white", badge: "bg-white/20 text-white" },
  yellow: { bg: "bg-yellow-400", text: "text-black", badge: "bg-black/10 text-black" },
  blue: { bg: "bg-blue-600", text: "text-white", badge: "bg-white/20 text-white" },
  green: { bg: "bg-green-600", text: "text-white", badge: "bg-white/20 text-white" },
  orange: { bg: "bg-orange-500", text: "text-white", badge: "bg-white/20 text-white" },
};

const DEFAULT_MESSAGES = [
  "Admissions open for Academic Year 2083! Apply online or visit our campus.",
  "First Term Examinations commence from Jestha 11, 2083.",
  "Annual Sports Meet 2083: Registration closes on Baisakh 25.",
];

export default function BreakingNews() {
  const { locale } = useLocale();
  const [config, setConfig] = useState<TickerConfig | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await supabase
          .from("site_content")
          .select("content_json")
          .eq("section", "alerts")
          .eq("content_key", "ticker_config")
          .eq("locale", "en")
          .eq("status", "published")
          .maybeSingle();

        if (data?.content_json) {
          const parsed = data.content_json as { data?: TickerConfig };
          if (parsed?.data) {
            setConfig(parsed.data);
            setLoaded(true);
            return;
          }
        }

        // Fallback to old format
        const { data: oldData } = await supabase
          .from("site_content")
          .select("content_text, content_json")
          .eq("section", "alerts")
          .eq("content_key", "breaking_news_active")
          .eq("locale", "en")
          .eq("status", "published")
          .maybeSingle();

        const { data: textData } = await supabase
          .from("site_content")
          .select("content_text")
          .eq("section", "alerts")
          .eq("content_key", "breaking_news_text")
          .eq("locale", "en")
          .eq("status", "published")
          .maybeSingle();

        if (oldData) {
          const activeJson = oldData.content_json as { active?: boolean } | null;
          const isActive = activeJson?.active || oldData.content_text === "true";
          const text = textData?.content_text || "";

          setConfig({
            active: isActive,
            color: "red",
            messages: text ? [{ id: "1", text: { en: text, ne: text, ja: text } }] : [],
          });
        }
      } catch (e) {
        console.error("BreakingNews load error:", e);
      }
      setLoaded(true);
    }
    loadConfig();
  }, []);

  // Check schedule
  const isScheduleActive = (): boolean => {
    if (!config?.schedule?.enabled) return true;
    const now = new Date();
    const start = config.schedule.startDate ? new Date(config.schedule.startDate) : null;
    const end = config.schedule.endDate ? new Date(config.schedule.endDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  // Get messages for current locale
  const getMessages = (): string[] => {
    if (!config || !config.active || !isScheduleActive()) return [];
    return config.messages
      .map(m => m.text[locale as Locale] || m.text.en || "")
      .filter(Boolean);
  };

  const messages = loaded ? getMessages() : [];
  const showDefault = loaded && (!config || !config.active);

  // Rotate messages
  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(p => (p + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages.length]);

  // Don't show if no messages and not default
  if (loaded && messages.length === 0 && !showDefault) return null;
  if (!loaded) return null;

  const displayMessages = messages.length > 0 ? messages : DEFAULT_MESSAGES;
  const colorClass = COLOR_CLASSES[config?.color || "red"];

  return (
    <div className={`${colorClass.bg} ${colorClass.text} overflow-hidden`}>
      <div className="container-custom flex items-center gap-3 py-2">
        <span className={`shrink-0 ${colorClass.badge} text-xs font-bold px-3 py-0.5 rounded-full animate-pulse uppercase tracking-wider`}>
          BREAKING
        </span>
        <div className="overflow-hidden flex-1">
          <p
            key={currentIndex}
            className="text-sm whitespace-nowrap animate-slidein"
          >
            {displayMessages[currentIndex % displayMessages.length]}
          </p>
        </div>
        {displayMessages.length > 1 && (
          <div className="flex gap-1 shrink-0">
            {displayMessages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex % displayMessages.length ? "bg-white scale-125" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
