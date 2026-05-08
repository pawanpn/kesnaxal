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
    { key: "address", label: "Full Address", type: "textarea", rows: 2, placeholder: "Naxal Sanogaucharan Mandev Marga, Kathmandu" },
  ],
  socialLinks: [
    { key: "facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
    { key: "instagram", label: "Instagram URL", type: "url" },
    { key: "twitter", label: "Twitter URL", type: "url" },
    { key: "youtube", label: "YouTube URL", type: "url" },
  ],
  openingHours: [
    { key: "weekdayHours", label: "Weekday Hours", type: "text", placeholder: "Sun-Fri: 9:00 AM - 4:00 PM" },
    { key: "officeHours", label: "Office Hours", type: "text", placeholder: "Sun-Fri: 9:00 AM - 3:00 PM" },
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
    case "facebook": return social.facebook;
    case "instagram": return social.instagram;
    case "twitter": return social.twitter;
    case "youtube": return social.youtube;
    case "weekdayHours": return ""; // optional
    case "officeHours": return ""; // optional
    default: return "";
  }
}

export default function GlobalSettingsPage() {
  const {
    getContent,
    saveContent,
    discardSectionDrafts,
    hasDraft,
    loadAllContent,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<keyof typeof FIELDS>("schoolInfo");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    const data: Record<string, string> = {};
    FIELDS[activeTab].forEach((f) => {
      const dbVal = getContent("global", f.key, "en");
      data[f.key] = dbVal || getFallbackValue(f.key);
    });
    setFormData(data);
    setSaveStatus({});
  }, [activeTab, getContent]);

  const handleSave = async (key: string, value: string) => {
    setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));
    await saveContent("global", key, "en", value);
    await saveContent("global", key, "ne", value);
    await saveContent("global", key, "ja", value);
    setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
    setTimeout(() => setSaveStatus((prev) => ({ ...prev, [key]: "idle" })), 1500);
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
            <p className="text-xs text-muted mt-1">Manage school name, logo, contact info, social links, and hours</p>
          </div>
          <button
            onClick={handleDiscard}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
          >
            {discarding ? "Discarding..." : "Discard Drafts"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6 max-w-lg">
          {(Object.keys(FIELDS) as (keyof typeof FIELDS)[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {tab === "schoolInfo" && "School Info"}
              {tab === "contactInfo" && "Contact"}
              {tab === "socialLinks" && "Social"}
              {tab === "openingHours" && "Hours"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
          <div className="space-y-4">
            {FIELDS[activeTab].map((field) => (
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
      </div>
    </AdminGuard>
  );
}
