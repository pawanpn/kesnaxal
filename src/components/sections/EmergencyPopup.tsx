"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { sanitizeHtml } from "@/lib/sanitize";

export default function EmergencyPopup() {
  const { locale } = useLocale();
  const { emergency: em } = useDynamicContent();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!em.active || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [em.active, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!em.active || dismissed) return null;

  const title = em.title[locale] || em.title.en || "Emergency Alert";
  const message = em.message[locale] || em.message.en || "";

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadein">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-red-500 animate-scalein">
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h2 className="text-white font-heading font-bold text-lg">{title}</h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <div
                className="text-sm text-foreground leading-relaxed prose-custom"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
              />
            </div>
            <div className="px-6 pb-5 flex justify-end">
              <button
                onClick={handleDismiss}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
