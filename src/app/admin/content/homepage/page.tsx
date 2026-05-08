"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";

interface HomepageSection {
  id: string;
  title: string;
  type: "hero" | "events" | "testimonials" | "faq";
  keys: string[];
}

const sections: HomepageSection[] = [
  { id: "hero", title: "Hero Slider", type: "hero", keys: ["slide_0_title", "slide_0_subtitle", "slide_1_title", "slide_1_subtitle", "slide_2_title", "slide_2_subtitle"] },
  { id: "testimonials", title: "Testimonials", type: "testimonials", keys: ["testimonial_0_text", "testimonial_0_author", "testimonial_1_text", "testimonial_1_author"] },
  { id: "faq", title: "FAQs", type: "faq", keys: ["faq_0_q", "faq_0_a", "faq_1_q", "faq_1_a", "faq_2_q", "faq_2_a"] },
];

export default function HomepageManagerPage() {
  const { getContent, saveContent, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const [activeSection, setActiveSection] = useState("hero");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    const data: Record<string, string> = {};
    const active = sections.find((s) => s.id === activeSection);
    if (active) {
      active.keys.forEach((k) => {
        data[k] = getContent("homepage", k, "en") || "";
      });
    }
    setFormData(data);
  }, [activeSection]);

  const handleSave = async (key: string, value: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    await saveContent("homepage", key, "en", value);
    await saveContent("homepage", key, "ne", value);
    await saveContent("homepage", key, "ja", value);
    setSaving((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Homepage Manager</h1>
            <p className="text-xs text-muted mt-1">Manage hero slider, testimonials, and FAQ content</p>
          </div>
          <button
            onClick={async () => { setDiscarding(true); await discardSectionDrafts("homepage"); setDiscarding(false); window.location.reload(); }}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50"
          >
            Discard Drafts
          </button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6 max-w-md">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === s.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border p-6 max-w-2xl space-y-4">
          {sections.find((s) => s.id === activeSection)?.keys.map((key) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {key.replace(/_/g, " ").replace(/(\d)/g, " $1").replace(/\b\w/g, (l) => l.toUpperCase())}
                {hasDraft("homepage", key, "en") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />Draft
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <textarea
                  value={formData[key] || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                  rows={key.includes("_a") ? 3 : 2}
                  className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                />
                <button
                  onClick={() => handleSave(key, formData[key] || "")}
                  disabled={saving[key]}
                  className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving[key] ? "..." : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
