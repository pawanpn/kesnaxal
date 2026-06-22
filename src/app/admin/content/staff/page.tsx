"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import type { StaffMember } from "@/types";

type Category = "teaching" | "administration" | "support";

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "teaching", label: "Teaching", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "administration", label: "Administration", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "support", label: "Support Staff", color: "bg-green-50 text-green-700 border-green-200" },
];

function newStaff(maxId: number, order: number): StaffMember {
  return {
    id: maxId + 1,
    name: "",
    designation: "",
    photo: "",
    department: "",
    category: "teaching",
    qualification: "",
    bio: "",
    email: "",
    order,
    active: true,
  };
}

async function fetchStaffFromDb(): Promise<StaffMember[]> {
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("section", "staff")
    .eq("content_key", "staff_members")
    .eq("locale", "en")
    .eq("status", "published")
    .maybeSingle();

  if (data?.content_json) {
    const json = data.content_json as { members?: StaffMember[] };
    return json?.members || [];
  }
  return [];
}

async function saveStaffToDb(staff: StaffMember[]): Promise<boolean> {
  try {
    const payload = { members: staff };
    for (const locale of ["en", "ne", "ja"]) {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", "staff")
        .eq("content_key", "staff_members")
        .eq("locale", locale)
        .eq("status", "published")
        .maybeSingle();

      if (existing) {
        await supabase.from("site_content")
          .update({ content_json: payload, content_text: JSON.stringify(payload), updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          section: "staff", content_key: "staff_members", locale,
          content_json: payload, content_text: JSON.stringify(payload), status: "published",
        });
      }
    }
    return true;
  } catch (e) {
    console.error("Staff save failed:", e);
    return false;
  }
}

export default function StaffAdminPage() {
  const { uploadMedia } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const data = await fetchStaffFromDb();
    const sorted = [...data].sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
    setStaff(sorted);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch = !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.designation.toLowerCase().includes(search.toLowerCase()) ||
        (s.department || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [staff, search, categoryFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: staff.length, teaching: 0, administration: 0, support: 0 };
    staff.forEach((s) => {
      const cat = s.category || "teaching";
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [staff]);

  const handleAdd = () => {
    const maxId = staff.reduce((max, s) => Math.max(max, s.id), 0);
    const maxOrder = staff.reduce((max, s) => Math.max(max, s.order ?? 0), 0);
    setEditingStaff(newStaff(maxId, maxOrder + 1));
  };

  const handleSave = async () => {
    if (!editingStaff) return;
    if (!editingStaff.name.trim() || !editingStaff.designation.trim()) {
      toast("error", "Name and Designation are required");
      return;
    }
    setSaving(true);
    const exists = staff.some((s) => s.id === editingStaff.id);
    const updated = exists
      ? staff.map((s) => (s.id === editingStaff.id ? editingStaff : s))
      : [...staff, editingStaff];

    const ok = await saveStaffToDb(updated);
    if (ok) {
      setStaff(updated);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
      toast("success", "Saved and published!");
    } else {
      toast("error", "Save failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const updated = staff.filter((s) => s.id !== id);
    const ok = await saveStaffToDb(updated);
    if (ok) {
      setStaff(updated);
      setDeleteConfirmId(null);
      toast("success", "Removed");
    } else {
      toast("error", "Delete failed");
    }
  };

  const handleToggleActive = async (id: number) => {
    const updated = staff.map((s) => (s.id === id ? { ...s, active: s.active === false ? true : false } : s));
    const ok = await saveStaffToDb(updated);
    if (ok) {
      setStaff(updated);
      toast("success", "Updated");
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!editingStaff) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "staff", `staff_${editingStaff.id}_photo`);
      if (url) {
        setEditingStaff((prev) => prev ? { ...prev, photo: url } : prev);
        toast("success", "Photo uploaded");
      } else {
        toast("error", "Upload failed");
      }
    } catch {
      toast("error", "Upload error");
    }
    setUploading(false);
  };

  // Drag and drop reordering
  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const draggedIdx = staff.findIndex((s) => s.id === draggedId);
    const targetIdx = staff.findIndex((s) => s.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const reordered = [...staff];
    const [draggedItem] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    const withOrder = reordered.map((s, i) => ({ ...s, order: i }));

    setStaff(withOrder);
    setDraggedId(null);
    const ok = await saveStaffToDb(withOrder);
    if (ok) toast("success", "Order updated");
  };

  const categoryStyle = (cat?: string) => CATEGORIES.find((c) => c.value === cat)?.color || CATEGORIES[0].color;
  const categoryLabel = (cat?: string) => CATEGORIES.find((c) => c.value === cat)?.label || "Teaching";

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Team Management</h1>
            <p className="text-xs text-muted mt-1">Manage faculty and staff — changes publish immediately</p>
          </div>
          <button onClick={handleAdd}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
            + Add Staff Member
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, designation, department..."
              className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:border-primary outline-none"
            />

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {[{ value: "all" as const, label: "All" }, ...CATEGORIES].map((c) => (
                <button key={c.value} onClick={() => setCategoryFilter(c.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    categoryFilter === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/30"
                  }`}>
                  {c.label} ({counts[c.value] ?? 0})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted">Loading...</span>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <p className="text-xs text-muted">No staff members found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                <p className="text-[10px] text-muted px-1">Drag to reorder display sequence</p>
                {filteredStaff.map((member) => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={() => handleDragStart(member.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(member.id)}
                    className={`p-3 rounded-xl border transition-all cursor-move ${
                      editingStaff?.id === member.id ? "border-primary bg-primary/5" : "border-border bg-white"
                    } ${member.active === false ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                      </svg>
                      <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {member.photo && (member.photo.startsWith("http") || member.photo.startsWith("/")) ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{member.name || "Untitled"}</p>
                        <p className="text-[10px] text-muted truncate">{member.designation}</p>
                        <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded border ${categoryStyle(member.category)}`}>
                          {categoryLabel(member.category)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleToggleActive(member.id)}
                          title={member.active === false ? "Inactive - click to activate" : "Active - click to deactivate"}
                          className={`w-6 h-6 flex items-center justify-center rounded ${member.active === false ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {member.active === false
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />}
                          </svg>
                        </button>
                        <button onClick={() => setEditingStaff({ ...member })}
                          className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirmId(member.id)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-3">
            {editingStaff ? (
              <div className="bg-white rounded-xl border border-border p-5 lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-sm text-foreground">
                    {staff.some((s) => s.id === editingStaff.id) ? "Edit Staff Member" : "Add New Staff Member"}
                  </h2>
                  <button onClick={() => setEditingStaff(null)} className="text-muted hover:text-foreground text-xs">Cancel</button>
                </div>

                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-border bg-surface flex items-center justify-center overflow-hidden shrink-0">
                      {editingStaff.photo && (editingStaff.photo.startsWith("http") || editingStaff.photo.startsWith("/")) ? (
                        <img src={editingStaff.photo} alt={editingStaff.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-block ${
                          uploading ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                        }`}>
                          {uploading ? "Uploading..." : "📷 Upload Photo"}
                        </div>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading}
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(file); e.target.value = ""; }} />
                      </label>
                      <p className="text-[10px] text-muted mt-1.5">Or paste a photo URL below</p>
                      <input
                        value={editingStaff.photo}
                        onChange={(e) => setEditingStaff({ ...editingStaff, photo: e.target.value })}
                        className="mt-1 w-full px-2 py-1 rounded border border-border text-[10px] font-mono focus:border-primary outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Full Name *</label>
                      <input value={editingStaff.name}
                        onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Mr. John Doe" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Designation *</label>
                      <input value={editingStaff.designation}
                        onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Principal, Teacher" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1.5">Category</label>
                    <div className="flex gap-2">
                      {CATEGORIES.map((c) => (
                        <button key={c.value} type="button"
                          onClick={() => setEditingStaff({ ...editingStaff, category: c.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            editingStaff.category === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                          }`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Department</label>
                      <input value={editingStaff.department || ""}
                        onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Science, Administration" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Qualification</label>
                      <input value={editingStaff.qualification || ""}
                        onChange={(e) => setEditingStaff({ ...editingStaff, qualification: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., M.Ed, B.Sc" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Email</label>
                    <input type="email" value={editingStaff.email || ""}
                      onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                      placeholder="email@kesnaxal.edu.np" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Short Bio</label>
                    <textarea value={editingStaff.bio || ""}
                      onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none resize-y"
                      placeholder="Brief description, experience, achievements..." />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-foreground">Active:</label>
                    <button type="button"
                      onClick={() => setEditingStaff({ ...editingStaff, active: editingStaff.active === false ? true : false })}
                      className={`w-8 h-5 rounded-full transition-colors relative shrink-0 ${editingStaff.active === false ? "bg-gray-300" : "bg-green-500"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${editingStaff.active === false ? "translate-x-0" : "translate-x-3"}`} />
                    </button>
                    <span className="text-[10px] text-muted">{editingStaff.active === false ? "Hidden from public" : "Visible to public"}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? "Saving..." : "Save & Publish"}
                  </button>
                  <button onClick={() => setEditingStaff(null)}
                    className="py-2.5 px-4 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface rounded-xl border border-border p-8 text-center">
                <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-muted">Select a staff member to edit or click &quot;+ Add Staff Member&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirm */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirmId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">Remove Staff Member?</h3>
                <p className="text-xs text-muted mb-6">This will permanently remove them from the team.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
