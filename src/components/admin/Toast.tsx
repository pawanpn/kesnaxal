"use client";

import { useToast, type Toast } from "@/context/ToastContext";

const ICONS: Record<string, string> = {
  success: "M5 13l4 4L19 7",
  error: "M6 18L18 6M6 6l12 12",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z",
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
};

const COLORS: Record<string, string> = {
  success: "border-green-400 bg-green-50 text-green-800",
  error: "border-red-400 bg-red-50 text-red-800",
  warning: "border-amber-400 bg-amber-50 text-amber-800",
  info: "border-blue-400 bg-blue-50 text-blue-800",
};

function ToastItem({ t }: { t: Toast }) {
  const { dismiss } = useToast();
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-sm transition-all duration-300 ${
        t.exiting ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"
      } ${COLORS[t.type]}`}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[t.type]} />
      </svg>
      <p className="text-xs font-medium flex-1">{t.message}</p>
      <button onClick={() => dismiss(t.id)} className="shrink-0 w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
