"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { siteConfig } from "@/constants/siteConfig";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "email";
  placeholder?: string;
  rows?: number;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface HourEntry {
  days: string;
  time: string;
}

const FIXED_FIELDS: Record<string, FieldDef[]> = {
  schoolInfo: [
    { key: "schoolName", label: "School Name", type: "text", placeholder: "Kathmandu English School" },
    { key: "motto", label: "Motto / Tagline", type: "text", placeholder: "Quality Education for a Better Future" },
    { key: "principalName", label: "Principal Name", type: "text", placeholder: "Dinesh Khatiwada" },
    { key: "principalMessage", label: "Principal Message", type: "textarea", rows: 3 },
  ],
  contactInfo: [
    { key: "phone", label: "Primary Phone", type: "text", placeholder: "014514369" },
    { key: "phone2", label: "Secondary Phone", type: "text", placeholder: "014514370" },
    { key: "email", label: "Email Address", type: "email", placeholder: "info@kes.edu.np" },
    { key: "address", label: "Full Address", type: "textarea", rows: 2, placeholder: "Naxal Sanogaucharan Mandev Marga, Kathmandu" },
  ],
};

function getFallbackValue(key: string): string {
  const { school, contact, social } = siteConfig;
  switch (key) {
    case "schoolName": return school.name;
    case "motto": return school.motto;
    case "principalName": return school.principal.name;
    case "principalMessage": return school.principal.message;
    case "phone": return contact.phone;
    case "phone2": return contact.phone2;
    case "email": return contact.email;
    case "address": return contact.address;
    default: return "";
  }
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: "facebook", url: "https://facebook.com/kesnepal" },
  { platform: "instagram", url: "https://instagram.com/kesnepal" },
  { platform: "twitter", url: "https://twitter.com/kesnepal" },
  { platform: "youtube", url: "https://youtube.com/@kesnepal" },
];

const DEFAULT_HOURS: HourEntry[] = [
  { days: "Sun-Fri", time: "9:00 AM - 4:00 PM" },
  { days: "Sat", time: "9:00 AM - 1:00 PM" },
];

export default function GlobalSettingsPage() {
  const {
    getContent,
    saveContent,
    getJson,
    saveJson,
    discardSectionDrafts,
    hasDraft,
    loadAllContent,
    deleteItem,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<string>("schoolInfo");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [discarding, setDiscarding] = useState(false);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialSaving, setSocialSaving] = useState(false);
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [hoursSaving, setHoursSaving] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    if (activeTab === "schoolInfo" || activeTab === "contactInfo") {
      const data: Record<string, string> = {};
      FIXED_FIELDS[activeTab]?.forEach((f) => {
        const dbVal = getContent("global", f.key, "en");
        data[f.key] = dbVal || getFallbackValue(f.key);
      });
      setFormData(data);
      setSaveStatus({});
    }
    if (activeTab === "socialLinks") {
      const json = getJson("global", "social_links", "en");
      const arr = json?.links as SocialLink[] | undefined;
      setSocialLinks(arr && arr.length > 0 ? arr : [...DEFAULT_SOCIAL_LINKS]);
    }
    if (activeTab === "openingHours") {
      const json = getJson("global", "opening_hours", "en");
      const arr = json?.hours as HourEntry[] | undefined;
      setHours(arr && arr.length > 0 ? arr : [...DEFAULT_HOURS]);
    }
  }, [activeTab, getContent, getJson]);

  const handleSave = async (key: string, value: string) => {
    setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));
    await saveContent("global", key, "en", value);
    await saveContent("global", key, "ne", value);
    await saveContent("global", key, "ja", value);
    setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
    setTimeout(() => setSaveStatus((prev) => ({ ...prev, [key]: "idle" })), 1500);
  };

  const handleSaveSocialLinks = async () => {
    setSocialSaving(true);
    await saveJson("global", "social_links", "en", { links: socialLinks });
    await saveJson("global", "social_links", "ne", { links: socialLinks });
    await saveJson("global", "social_links", "ja", { links: socialLinks });
    setSocialSaving(false);
  };

  const handleSaveHours = async () => {
    setHoursSaving(true);
    await saveJson("global", "opening_hours", "en", { hours });
    await saveJson("global", "opening_hours", "ne", { hours });
    await saveJson("global", "opening_hours", "ja", { hours });
    setHoursSaving(false);
  };

  const handleDiscard = async () => {
    setDiscarding(true);
    await discardSectionDrafts("global");
    setDiscarding(false);
    window.location.reload();
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Global Settings</h1>
            <p className="text-xs text-muted mt-1">Manage school name, contact info, social links, and hours</p>
          </div>
          <button
            onClick={handleDiscard}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
          >
            {discarding ? "Discarding..." : "Discard Drafts"}
          </button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6 max-w-lg">
          <button onClick={() => setActiveTab("schoolInfo")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "schoolInfo" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            School Info
          </button>
          <button onClick={() => setActiveTab("contactInfo")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "contactInfo" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Contact
          </button>
          <button onClick={() => setActiveTab("socialLinks")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "socialLinks" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Social
          </button>
          <button onClick={() => setActiveTab("openingHours")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "openingHours" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Hours
          </button>
        </div>

        {/* Fixed Fields */}
        {(activeTab === "schoolInfo" || activeTab === "contactInfo") && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <div className="space-y-4">
              {FIXED_FIELDS[activeTab]?.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {field.label}
                    {hasDraft("global", field.key, "en") && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        Draft
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    {field.type === "textarea" ? (
                      <textarea
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        rows={field.rows || 3}
                        className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder={field.placeholder}
                      />
                    )}
                    <button
                      onClick={() => handleSave(field.key, formData[field.key] || "")}
                      disabled={saveStatus[field.key] === "saving"}
                      className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {saveStatus[field.key] === "saving" ? "..." : saveStatus[field.key] === "saved" ? "✓" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Social Links */}
        {activeTab === "socialLinks" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Social Media Links</h2>
              <button
                onClick={() => setSocialLinks((prev) => [...prev, { platform: "", url: "" }])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                + Add Platform
              </button>
            </div>

            {socialLinks.length === 0 ? (
              <p className="text-xs text-muted italic">No social media links configured.</p>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-surface/50 border border-border/50">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => setSocialLinks((prev) => prev.map((l, j) => j === i ? { ...l, platform: e.target.value } : l))}
                        placeholder="Platform name (e.g., facebook, instagram, tiktok)"
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => setSocialLinks((prev) => prev.map((l, j) => j === i ? { ...l, url: e.target.value } : l))}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setSocialLinks((prev) => prev.filter((_, j) => j !== i))}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveSocialLinks}
              disabled={socialSaving}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {socialSaving ? "Saving..." : "Save Social Links"}
            </button>
            {hasDraft("global", "social_links", "en") && (
              <span className="ml-2 text-xs text-yellow-600">Draft pending</span>
            )}
          </div>
        )}

        {/* Dynamic Opening Hours */}
        {activeTab === "openingHours" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Operating Hours</h2>
              <button
                onClick={() => setHours((prev) => [...prev, { days: "", time: "" }])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                + Add Hours
              </button>
            </div>

            {hours.length === 0 ? (
              <p className="text-xs text-muted italic">No operating hours configured.</p>
            ) : (
              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-surface/50 border border-border/50">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={h.days}
                        onChange={(e) => setHours((prev) => prev.map((hh, j) => j === i ? { ...hh, days: e.target.value } : hh))}
                        placeholder="Days (e.g., Sun-Fri)"
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      />
                      <input
                        type="text"
                        value={h.time}
                        onChange={(e) => setHours((prev) => prev.map((hh, j) => j === i ? { ...hh, time: e.target.value } : hh))}
                        placeholder="Time (e.g., 9:00 AM - 4:00 PM)"
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setHours((prev) => prev.filter((_, j) => j !== i))}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveHours}
              disabled={hoursSaving}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {hoursSaving ? "Saving..." : "Save Hours"}
            </button>
            {hasDraft("global", "opening_hours", "en") && (
              <span className="ml-2 text-xs text-yellow-600">Draft pending</span>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
