"use client";

import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminDashboard() {
  const { isEditing, editingLocale, setEditingLocale, draftCount, toggleEditMode, publishAll, seedContent } = useAdmin();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ count?: number; error?: string } | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    const result = await seedContent();
    setSeedResult(result);
    setSeeding(false);
  };

  const locales = [
    { code: "en", label: "English" },
    { code: "ne", label: "नेपाली" },
    { code: "ja", label: "日本語" },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <div className="container-custom py-12">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted mb-8">SuperAdmin Visual CMS Control Panel</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{isEditing ? "On" : "Off"}</p>
                  <p className="text-xs text-muted">Edit Mode</p>
                </div>
              </div>
              <button
                onClick={toggleEditMode}
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                  isEditing
                    ? "bg-secondary text-primary"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {isEditing ? "Exit Edit Mode" : "Enable Edit Mode"}
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{draftCount}</p>
                  <p className="text-xs text-muted">Draft Changes</p>
                </div>
              </div>
              <button
                onClick={() => publishAll()}
                disabled={draftCount === 0}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Publish All
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted">Quick Links</p>
                </div>
              </div>
              <Link
                href="/"
                className="block w-full py-2 rounded-lg text-xs font-semibold text-center bg-surface text-foreground hover:bg-primary hover:text-white transition-all"
              >
                Go to Website
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted">Seed Data</p>
                </div>
              </div>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-all"
              >
                {seeding ? "Seeding..." : "Seed from siteConfig"}
              </button>
              {seedResult && (
                <p className={`text-xs mt-2 text-center ${seedResult.error ? "text-accent" : "text-green-600"}`}>
                  {seedResult.error || `Seeded ${seedResult.count} rows to Supabase`}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-3">
                How to Edit
              </h2>
              <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
                <li>Enable <strong className="text-foreground">Edit Mode</strong> above</li>
                <li>Select your editing language below</li>
                <li>Navigate to any page on the website</li>
                <li>Click any text to edit it in-place</li>
                <li>Changes save as <strong className="text-orange-600">drafts</strong> automatically</li>
                <li>Click <strong className="text-accent">Publish All</strong> when ready</li>
              </ol>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-3">
                Editing Language
              </h2>
              <p className="text-xs text-muted mb-4">
                Select which language you want to edit. Each language has its own content.
              </p>
              <div className="flex gap-2">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setEditingLocale(l.code)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      editingLocale === l.code
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
