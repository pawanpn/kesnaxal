"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminDashboard() {
  const { isEditing, draftCount, toggleEditMode, publishAll } = useAdmin();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <div className="container-custom py-12">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted mb-8">SuperAdmin Visual CMS Control Panel</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-3">
              How to Edit
            </h2>
            <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
              <li>Enable <strong className="text-foreground">Edit Mode</strong> above</li>
              <li>Navigate to any page on the website</li>
              <li>Click any text to edit it in-place</li>
              <li>Changes save as <strong className="text-orange-600">drafts</strong> automatically</li>
              <li>Click <strong className="text-accent">Publish All</strong> when ready</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
