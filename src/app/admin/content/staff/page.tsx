"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import type { StaffMember } from "@/types";

export default function StaffAdminPage() {
  const { getJson, uploadMedia } = useAdmin();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  // Direct Supabase fetch - fast, no full reload
  const fetchStaff = useCallback(async () => {
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
      if (json?.members?.length) {
        setStaff(json.members);
      }
    }
    setStaffLoaded(true);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Direct Supabase save - no full refetch
  const saveToDb = useCallback(async (updated: StaffMember[]) => {
    try {
      const payload = { members: updated };
      for (const locale of ["en", "ne", "ja"]) {
        const { data: existing } = await supabase
          .from("site_content")
          .select("id")
          .eq("section", "staff")
          .eq("content_key", "staff_members")
          .eq("locale", locale)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("site_content")
            .update({
              content_json: payload,
              content_text: JSON.stringify(payload),
              status: "published",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("site_content").insert({
            section: "staff",
            content_key: "staff_members",
            locale,
            content_json: payload,
            content_text: JSON.stringify(payload),
            status: "published",
          });
        }
      }
      return true;
    } catch (e) {
      console.error("Staff save failed:", e);
      return false;
    }
  }, []);

  const handleSaveMember = async (member: StaffMember) => {
    setSavingId(member.id);
    const updated = staff.map((s) => (s.id === member.id ? member : s));
    const ok = await saveToDb(updated);
    if (ok) {
      setStaff(updated);
      toast("success", "Saved & published!");
    } else {
      toast("error", "Save failed");
    }
    setSavingId(null);
  };

  const handleChange = (index: number, field: keyof StaffMember, value: string) => {
    setStaff((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAdd = async () => {
    setAdding(true);
    const maxId = staff.reduce((max, s) => Math.max(max, s.id), 0);
    const newMember: StaffMember = {
      id: maxId + 1,
      name: "",
      designation: "",
      photo: "",
      department: "",
    };
    const updated = [...staff, newMember];
    const ok = await saveToDb(updated);
    if (ok) {
      setStaff(updated);
      toast("success", "New staff member added!");
    } else {
      toast("error", "Failed to add staff");
    }
    setAdding(false);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Remove this staff member?")) return;
    const updated = staff.filter((_, i) => i !== index);
    const ok = await saveToDb(updated);
    if (ok) {
      setStaff(updated);
      toast("success", "Staff member removed!");
    } else {
      toast("error", "Delete failed");
    }
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    const member = staff[index];
    setUploading(member.id);
    try {
      const url = await uploadMedia(file, "staff", `staff_${member.id}_photo`);
      if (url) {
        const updated = staff.map((s, i) =>
          i === index ? { ...s, photo: url } : s
        );
        const ok = await saveToDb(updated);
        if (ok) {
          setStaff(updated);
          toast("success", "Photo uploaded & saved!");
        }
      } else {
        toast("error", "Photo upload failed");
      }
    } catch {
      toast("error", "Photo upload error");
    }
    setUploading(null);
  };

  if (!staffLoaded) {
    return (
      <AdminGuard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted">Loading team members...</span>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Team Management</h1>
            <p className="text-xs text-muted mt-1">
              Changes publish immediately to the public site
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding..." : "+ Add Member"}
          </button>
        </div>

        {staff.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center max-w-4xl">
            <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-muted">No team members yet.</p>
            <p className="text-xs text-muted mt-1">Click &quot;+ Add Member&quot; to get started.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {staff.map((member, i) => (
              <div key={member.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-start gap-5">
                  {/* Photo Section */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl border-2 border-border bg-surface flex items-center justify-center overflow-hidden">
                      {member.photo && (member.photo.startsWith("http") || member.photo.startsWith("/")) ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    {/* Upload Button */}
                    <label className="cursor-pointer">
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                        uploading === member.id
                          ? "bg-gray-100 text-gray-400 border-gray-200"
                          : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                      }`}>
                        {uploading === member.id ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Uploading...
                          </span>
                        ) : "📷 Upload Photo"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(i, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleChange(i, "name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Mr. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        value={member.designation}
                        onChange={(e) => handleChange(i, "designation", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Principal, Teacher"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={member.department || ""}
                        onChange={(e) => handleChange(i, "department", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        placeholder="e.g., Science, Administration"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                        Photo URL (or upload above)
                      </label>
                      <input
                        type="url"
                        value={member.photo}
                        onChange={(e) => handleChange(i, "photo", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:border-primary outline-none font-mono"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleSaveMember(member)}
                      disabled={savingId === member.id || !member.name.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                      {savingId === member.id ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </span>
                      ) : "Save"}
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      disabled={savingId === member.id}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
