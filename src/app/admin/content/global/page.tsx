"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/constants/siteConfig";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

interface FieldDef {
  key: string; label: string; type: "text" | "textarea" | "url" | "email"; placeholder?: string; rows?: number;
}

const TABS: { id: string; label: string }[] = [
  { id: "schoolInfo", label: "School Info" },
  { id: "contactInfo", label: "Contact" },
  { id: "socialLinks", label: "Social" },
  { id: "openingHours", label: "Hours" },
];

const FIELDS: Record<string, FieldDef[]> = {
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
    { key: "admissionsEmail", label: "Admissions Email", type: "email", placeholder: "admissions@kes.edu.np" },
    { key: "address", label: "Full Address", type: "textarea", rows: 2, placeholder: "Naxal Sanogaucharan Mandev Marga, Kathmandu" },
    { key: "mapEmbedUrl", label: "Google Maps Embed URL", type: "url", placeholder: "https://www.google.com/maps/embed?pb=..." },
  ],
};

function getFallback(key: string): string {
  const { school, contact } = siteConfig;
  const map: Record<string, string> = {
    schoolName: school.name, motto: school.motto,
    principalName: school.principal.name, principalMessage: school.principal.message,
    phone: contact.phone, phone2: contact.phone2,
    email: contact.email, admissionsEmail: contact.admissionsEmail,
    address: contact.address, mapEmbedUrl: contact.mapEmbedUrl,
  };
  return map[key] || "";
}

interface SocialLink { platform: string; url: string; }
interface HourEntry { days: string; time: string; }

const DEF_SOCIAL: SocialLink[] = [
  { platform: "facebook", url: "https://facebook.com/kesnepal" },
  { platform: "instagram", url: "https://instagram.com/kesnepal" },
  { platform: "twitter", url: "https://twitter.com/kesnepal" },
  { platform: "youtube", url: "https://youtube.com/@kesnepal" },
];
const DEF_HOURS: HourEntry[] = [
  { days: "Sun-Fri", time: "9:00 AM - 4:00 PM" },
  { days: "Sat", time: "9:00 AM - 1:00 PM" },
];

type FormDataType = Record<string, Record<Locale, string>>;

export default function GlobalSettingsPage() {
  const { getContent, saveContent, getJson, saveJson, discardSectionDrafts, hasDraft, loadAllContent, uploadMedia } = useAdmin();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("schoolInfo");
  const [lang, setLang] = useState<Locale>("en");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialSaving, setSocialSaving] = useState(false);
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    setLogoUrl(getContent("global", "logo_url", "en") || "/data/logo.jpg");
    if (activeTab === "schoolInfo" || activeTab === "contactInfo") {
      const data: FormDataType = {};
      (FIELDS[activeTab] || []).forEach((f) => {
        data[f.key] = { en: "", ne: "", ja: "" };
        LOCALES.forEach(({ id: l }) => {
          data[f.key][l] = getContent("global", f.key, l) || getFallback(f.key);
        });
      });
      setFormData(data);
      setSaveStatus({});
    }
    if (activeTab === "socialLinks") {
      const json = getJson("global", "social_links", "en");
      const arr = json?.links as SocialLink[] | undefined;
      setSocialLinks(arr?.length ? arr : [...DEF_SOCIAL]);
    }
    if (activeTab === "openingHours") {
      const json = getJson("global", "opening_hours", lang);
      const arr = json?.hours as HourEntry[] | undefined;
      setHours(arr?.length ? arr : [...DEF_HOURS]);
    }
  }, [activeTab, lang, getContent, getJson]);

  const updateField = (key: string, locale: Locale, value: string) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (!next[key]) next[key] = { en: "", ne: "", ja: "" };
      if (autoTranslate) LOCALES.forEach(({ id: l }) => { next[key] = { ...next[key], [l]: value }; });
      else next[key] = { ...next[key], [locale]: value };
      return next;
    });
  };

  const handleSaveField = async (key: string) => {
    setSaveStatus((p) => ({ ...p, [key]: "saving" }));
    try {
      const data = formData[key] || { en: "", ne: "", ja: "" };
      for (const { id: l } of LOCALES) {
        await saveContent("global", key, l, data[l] || "");
      }
      toast("success", `${key} saved as draft`);
    } catch { toast("error", "Failed to save"); }
    setSaveStatus((p) => ({ ...p, [key]: "saved" }));
    setTimeout(() => setSaveStatus((p) => ({ ...p, [key]: "idle" })), 1500);
  };

  const handleSaveSocial = async () => {
    setSocialSaving(true);
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("global", "social_links", l, { links: socialLinks });
      }
      toast("success", "Social links saved as draft");
    } catch { toast("error", "Failed to save social links"); }
    setSocialSaving(false);
  };

  const handleSaveHours = async () => {
    setHoursSaving(true);
    try {
      if (autoTranslate) {
        for (const { id: l } of LOCALES) await saveJson("global", "opening_hours", l, { hours });
      } else {
        await saveJson("global", "opening_hours", lang, { hours });
      }
      toast("success", "Hours saved as draft");
    } catch { toast("error", "Failed to save hours"); }
    setHoursSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadMedia(file, "global", "logo");
      if (url) {
        setLogoUrl(url);
        await saveContent("global", "logo_url", "en", url);
        await saveContent("global", "logo_url", "ne", url);
        await saveContent("global", "logo_url", "ja", url);
        toast("success", "Logo saved as draft - publish from Review page");
      }
    } catch { toast("error", "Logo upload failed"); }
    setLogoUploading(false);
    if (e.target) e.target.value = "";
  };

  const handleResetLogo = async () => {
    try {
      setLogoUrl("/data/logo.jpg");
      await saveContent("global", "logo_url", "en", "/data/logo.jpg");
      await saveContent("global", "logo_url", "ne", "/data/logo.jpg");
      await saveContent("global", "logo_url", "ja", "/data/logo.jpg");
      toast("success", "Logo reset to default (draft)");
    } catch { toast("error", "Failed to reset logo"); }
  };

  const handleDiscard = async () => {
    setDiscarding(true);
    try {
      await discardSectionDrafts("global");
      toast("success", "Drafts discarded");
    } catch { toast("error", "Failed to discard"); }
    setDiscarding(false);
    window.location.reload();
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Global Settings</h1>
            <p className="text-xs text-muted mt-1">Manage school info, logo, contact, social links, and hours</p>
          </div>
          <button onClick={handleDiscard} disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
            {discarding ? "Discarding..." : "Discard Drafts"}
          </button>
        </div>

        {/* Tabs + Lang */}
        <div className="flex items-center justify-between mb-4 max-w-2xl">
          <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                {t.label}
              </button>
            ))}
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
          </div>
        </div>

        {/* School Info & Contact fields */}
        {(activeTab === "schoolInfo" || activeTab === "contactInfo") && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            {activeTab === "schoolInfo" && (
              <div className="mb-6 pb-6 border-b border-border">
                <label className="block text-xs font-semibold text-foreground mb-2">School Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                      {logoUploading ? "Uploading..." : logoUrl && logoUrl !== "/data/logo.jpg" ? "Change Logo" : "Upload Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {logoUrl && logoUrl !== "/data/logo.jpg" && (
                      <button onClick={handleResetLogo} className="ml-2 px-3 py-2 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5">Reset</button>
                    )}
                    <p className="text-[10px] text-muted mt-1">Square image, max 2MB. Saves instantly to all pages.</p>
                  </div>
                </div>
              </div>
            )}
            {autoTranslate && (
              <div className="mb-4 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
                Auto ON — editing any language copies to all.
              </div>
            )}
            <div className="space-y-5">
              {FIELDS[activeTab]?.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">{field.label}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOCALES.map(({ id: l }) => (
                      <div key={l} className="relative">
                        <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                        {field.type === "textarea" ? (
                          <textarea value={formData[field.key]?.[l] || ""} onChange={(e) => updateField(field.key, l, e.target.value)}
                            rows={field.rows || 2} className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y" placeholder={field.placeholder} />
                        ) : (
                          <input type={field.type} value={formData[field.key]?.[l] || ""} onChange={(e) => updateField(field.key, l, e.target.value)}
                            className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none" placeholder={field.placeholder} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleSaveField(field.key)} disabled={saveStatus[field.key] === "saving"}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {saveStatus[field.key] === "saving" ? "Saving..." : saveStatus[field.key] === "saved" ? "✓ Draft Saved" : "Save Draft"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {activeTab === "socialLinks" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Social Media Links</h2>
              <button onClick={() => setSocialLinks((p) => [...p, { platform: "", url: "" }])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ Add</button>
            </div>
            <div className="space-y-3">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex-1 space-y-2">
                    <input value={link.platform} onChange={(e) => setSocialLinks((p) => p.map((l, j) => j === i ? { ...l, platform: e.target.value } : l))}
                      placeholder="Platform (e.g., facebook)" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    <input type="url" value={link.url} onChange={(e) => setSocialLinks((p) => p.map((l, j) => j === i ? { ...l, url: e.target.value } : l))}
                      placeholder="https://..." className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                  </div>
                  <button onClick={() => setSocialLinks((p) => p.filter((_, j) => j !== i))}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSaveSocial} disabled={socialSaving}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {socialSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        )}

        {/* Opening Hours */}
        {activeTab === "openingHours" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm text-foreground">Operating Hours</h2>
              <button onClick={() => setHours((p) => [...p, { days: "", time: "" }])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ Add</button>
            </div>
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex-1 space-y-2">
                    <input value={h.days} onChange={(e) => setHours((p) => p.map((hh, j) => j === i ? { ...hh, days: e.target.value } : hh))}
                      placeholder="Days (e.g., Sun-Fri)" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    <input value={h.time} onChange={(e) => setHours((p) => p.map((hh, j) => j === i ? { ...hh, time: e.target.value } : hh))}
                      placeholder="Time (e.g., 9:00 AM - 4:00 PM)" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                  </div>
                  <button onClick={() => setHours((p) => p.filter((_, j) => j !== i))}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSaveHours} disabled={hoursSaving}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {hoursSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
