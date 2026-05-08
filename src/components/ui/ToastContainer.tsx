"use client";

import { useToast } from "@/context/ToastContext";

const typeStyles: Record<string, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  warning: "bg-yellow-500 text-black",
  info: "bg-blue-600",
};

const typeIcons: Record<string, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-white text-xs font-medium transition-all duration-300 max-w-sm cursor-pointer ${
            typeStyles[t.type] || "bg-gray-700"
          } ${t.exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
        >
          <span className="text-sm font-bold">{typeIcons[t.type] || ""}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
