"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";

interface ClassOption {
  id: string;
  value: string;
  label: string;
  active: boolean;
}

const DEFAULT_CLASSES: ClassOption[] = [
  { id: "1", value: "Nursery", label: "Nursery", active: true },
  { id: "2", value: "LKG", label: "LKG", active: true },
  { id: "3", value: "UKG", label: "UKG", active: true },
  { id: "4", value: "Grade 1", label: "Grade 1", active: true },
  { id: "5", value: "Grade 2", label: "Grade 2", active: true },
  { id: "6", value: "Grade 3", label: "Grade 3", active: true },
  { id: "7", value: "Grade 4", label: "Grade 4", active: true },
  { id: "8", value: "Grade 5", label: "Grade 5", active: true },
  { id: "9", value: "Grade 6", label: "Grade 6", active: true },
  { id: "10", value: "Grade 7", label: "Grade 7", active: true },
  { id: "11", value: "Grade 8", label: "Grade 8", active: true },
  { id: "12", value: "Grade 9", label: "Grade 9", active: true },
  { id: "13", value: "Grade 10", label: "Grade 10", active: true },
  { id: "14", value: "Grade 11 Science", label: "Grade 11 (Science)", active: true },
  { id: "15", value: "Grade 11 Management", label: "Grade 11 (Management)", active: true },
  { id: "16", value: "Grade 12 Science", label: "Grade 12 (Science)", active: true },
  { id: "17", value: "Grade 12 Management", label: "Grade 12 (Management)", active: true },
];

async function fetchClasses(): Promise<ClassOption[] | null> {
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("section", "admissions")
    .eq("content_key", "class_list")
    .eq("locale", "en")
    .eq("status", "published")
    .maybeSingle();

  if (data?.content_json) {
    const json = data.content_json as { classes?: ClassOption[] };
    if (json?.classes?.length) return json.classes;
  }
  return null;
}

async function saveClasses(classes: ClassOption[]): Promise<boolean> {
  try {
    const payload = { classes };
    for (const locale of ["en", "ne", "ja"]) {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", "admissions")
        .eq("content_key", "class_list")
        .eq("locale", locale)
        .eq("status", "published")
        .maybeSingle();

      if (existing) {
        await supabase.from("site_content")
          .update({ content_json: payload, content_text: JSON.stringify(payload), updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          section: "admissions", content_key: "class_list", locale,
          content_json: payload, content_text: JSON.stringify(payload), status: "published",
        });
      }
    }
    return true;
  } catch (e) {
    console.error("Class save failed:", e);
    return false;
  }
}

export default function AdmissionsAdminPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchClasses();
    setClasses(data || DEFAULT_CLASSES);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (updated: ClassOption[]) => {
    setSaving(true);
    const ok = await saveClasses(updated);
    if (ok) {
      setClasses(updated);
      toast("success", "Class list saved and published!");
    } else {
      toast("error", "Save failed");
    }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const newClass: ClassOption = {
      id: Date.now().toString(),
      value: newLabel.trim(),
      label: newLabel.trim(),
      active: true,
    };
    handleSave([...classes, newClass]);
    setNewLabel("");
  };

  const handleRemove = (id: string) => {
    handleSave(classes.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    handleSave(classes.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleLabelChange = (id: string, label: string) => {
    setClasses((prev) => prev.map((c) => c.id === id ? { ...c, label, value: label } : c));
  };

  const handleBlurSave = () => {
    handleSave(classes);
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (draggedId === null || draggedId === targetId) return;
    const draggedIdx = classes.findIndex((c) => c.id === draggedId);
    const targetIdx = classes.findIndex((c) => c.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const reordered = [...classes];
    const [draggedItem] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    setDraggedId(null);
    handleSave(reordered);
  };

  const handleResetDefaults = () => {
    if (!confirm("Reset to default class list? This will overwrite your current list.")) return;
    handleSave(DEFAULT_CLASSES);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Admission Classes</h1>
            <p className="text-xs text-muted mt-1">Manage the class/grade list shown on the admission form — drag to reorder</p>
          </div>
          <button onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
            Reset to Defaults
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted">Loading...</span>
          </div>
        ) : (
          <div className="max-w-2xl space-y-3">
            {/* Add new class */}
            <div className="bg-white rounded-xl border border-border p-4 flex gap-2">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                placeholder="e.g., Grade 13, Pre-Nursery, Bridge Course..."
              />
              <button onClick={handleAdd} disabled={!newLabel.trim() || saving}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                + Add Class
              </button>
            </div>

            {/* List */}
            {classes.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <p className="text-xs text-muted">No classes configured. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-muted px-1">Drag the handle to reorder. This is the order shown in the admission form dropdown.</p>
                {classes.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart(c.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(c.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border bg-white transition-all ${c.active ? "border-border" : "border-border opacity-50"}`}
                  >
                    <svg className="w-4 h-4 text-muted cursor-move shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                    </svg>
                    <input
                      value={c.label}
                      onChange={(e) => handleLabelChange(c.id, e.target.value)}
                      onBlur={handleBlurSave}
                      className="flex-1 px-2 py-1.5 rounded border border-border text-sm focus:border-primary outline-none"
                    />
                    <button onClick={() => handleToggleActive(c.id)}
                      title={c.active ? "Active - click to hide" : "Hidden - click to show"}
                      className={`w-7 h-7 flex items-center justify-center rounded shrink-0 ${c.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {c.active
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                      </svg>
                    </button>
                    <button onClick={() => handleRemove(c.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {saving && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-3 h-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Saving and publishing...
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
