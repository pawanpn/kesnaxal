"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminToolbar() {
  const { isAdmin, isEditing, isPreviewMode, recentEdits, draftCount, toggleEditMode, togglePreviewMode, publishAll, logout } = useAdmin();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Hide on admin pages (they have their own sidebar)
  if (!isAdmin || pathname?.startsWith("/admin")) return null;

  const handlePublish = async () => {
    setPublishing(true);
    await publishAll();
    setPublishing(false);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom spacer */}
      <div className="h-12" />

      {/* Floating Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur border-t border-primary/30 text-white">
        <div className="container-custom flex items-center justify-between py-2 px-4">
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${isPreviewMode ? "bg-yellow-400 animate-pulse" : isEditing ? "bg-green-400 animate-pulse" : "bg-secondary"}`} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {isPreviewMode ? "PREVIEW MODE" : isEditing ? "EDIT MODE ON" : "Admin Mode"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              onClick={togglePreviewMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPreviewMode
                  ? "bg-yellow-500 text-black shadow-sm"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title="Toggle preview to see draft changes"
            >
              {isPreviewMode ? "Preview ON" : "Preview"}
            </button>

            {/* Edit/View toggle */}
            <button
              onClick={toggleEditMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isEditing
                  ? "bg-secondary text-primary shadow-sm"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isEditing ? "Editing" : "View"}
            </button>

            {/* Draft count + drawer */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="relative px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors"
            >
              Edits
              {draftCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
                  {draftCount}
                </span>
              )}
            </button>

            {/* Go to Dashboard */}
            <a
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/20 transition-colors"
            >
              Dashboard
            </a>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-accent/80 transition-colors text-gray-400 hover:text-white"
            >
              Out
            </button>
          </div>
        </div>
      </div>

      {/* Recent Edits Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white rounded-t-2xl shadow-2xl border border-border max-h-80 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-5 py-3 flex items-center justify-between">
              <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider">
                Recent Edits ({draftCount} drafts)
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface text-muted"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {recentEdits.length === 0 ? (
              <div className="text-center py-8 text-muted text-xs">
                No recent edits. Click editable content to make changes.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentEdits.map((edit, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {edit.section}.{edit.contentKey} ({edit.locale})
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(edit.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs line-through text-muted/60 truncate">{edit.oldValue}</p>
                    <p className="text-xs text-foreground font-medium truncate">{edit.newValue}</p>
                  </div>
                ))}
              </div>
            )}

            {draftCount > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-border px-5 py-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  {publishing ? "Publishing..." : `Publish All Changes (${draftCount})`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
