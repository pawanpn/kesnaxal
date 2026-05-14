"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { StaffMember } from "@/types";

export default function StaffAdminPage() {
  const { getJson, saveJson, uploadMedia, hasDraft, loadAllContent } = useAdmin();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const json = getJson("staff", "staff_members", "en");
    const arr = json?.members as StaffMember[] | undefined;
    if (arr?.length) setStaff(arr);
  }, [getJson]);

  const handleSave = async (updated: StaffMember[]) => {
    setSaving(true);
    try {
      await saveJson("staff", "staff_members", "en", { members: updated });
      await saveJson("staff", "staff_members", "ne", { members: updated });
      await saveJson("staff", "staff_members", "ja", { members: updated });
      setStaff(updated);
      toast("success", "Saved successfully");
    } catch {
      toast("error", "Save failed");
    }
    setSaving(false);
  };

  const handleChange = (index: number, field: keyof StaffMember, value: string) => {
    setStaff((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAdd = () => {
    const maxId = staff.reduce((max, s) => Math.max(max, s.id), 0);
    setStaff((prev) => [...prev, { id: maxId + 1, name: "", designation: "", photo: "", department: "" }]);
  };

  const handleDelete = (index: number) => {
    if (!confirm("Remove this staff member?")) return;
    const updated = staff.filter((_, i) => i !== index);
    handleSave(updated);
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    const member = staff[index];
    setUploading(String(member.id));
    const url = await uploadMedia(file, "staff", `staff_${member.id}`);
    if (url) {
      handleChange(index, "photo", url);
      toast("success", "Photo uploaded");
    } else {
      toast("error", "Photo upload failed");
    }
    setUploading(null);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Staff Management</h1>
            <p className="text-xs text-muted mt-1">Add, edit, and manage staff members displayed on the website</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAdd}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
              + Add Staff
            </button>
            <button onClick={() => handleSave(staff)} disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        {hasDraft("staff", "staff_members", "en") && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — publish to make changes visible on the site.
          </div>
        )}

        {staff.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center max-w-4xl">
            <p className="text-xs text-muted italic">No staff members added yet. Click &quot;Add Staff&quot; to begin.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {staff.map((member, i) => (
              <div key={member.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <label className="block text-center mt-1.5 cursor-pointer">
                      <span className="text-[9px] text-primary font-medium hover:underline">
                        {uploading === String(member.id) ? "Uploading..." : "Change"}
                      </span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(i, file);
                          e.target.value = "";
                        }} />
                    </label>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Name</label>
                      <input type="text" value={member.name}
                        onChange={(e) => handleChange(i, "name", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                        placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Designation</label>
                      <input type="text" value={member.designation}
                        onChange={(e) => handleChange(i, "designation", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                        placeholder="e.g., Principal, Teacher" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Department</label>
                      <input type="text" value={member.department || ""}
                        onChange={(e) => handleChange(i, "department", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                        placeholder="e.g., Science, Administration" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Photo URL</label>
                      <input type="url" value={member.photo}
                        onChange={(e) => handleChange(i, "photo", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-[10px] focus:border-primary outline-none font-mono"
                        placeholder="https://..." />
                    </div>
                  </div>

                  {/* Delete */}
                  <button onClick={() => handleDelete(i)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 mt-1" title="Remove">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
