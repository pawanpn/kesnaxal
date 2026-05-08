"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { supabase } from "@/lib/supabase/client";

interface CareerApplication {
  id: string;
  job_id: string;
  job_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dob: string | null;
  degree: string | null;
  university: string | null;
  experience_years: number;
  current_position: string | null;
  subjects: string | null;
  grades: string | null;
  cv_url: string | null;
  photo_url: string | null;
  documents_url: unknown;
  cover_letter: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function CareerApplicationsPage() {
  const [apps, setApps] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("career_applications").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    const { data } = await query;
    setApps((data as CareerApplication[]) || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("career_applications").update({ status }).eq("id", id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application permanently?")) return;
    setDeleting(id);
    const { error } = await supabase.from("career_applications").delete().eq("id", id);
    if (!error) {
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
    }
    setDeleting(null);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewed: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    hired: "bg-purple-100 text-purple-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    hired: "Hired",
  };

  return (
    <AdminGuard>
      <div className="flex h-full">
        {/* Left - List */}
        <div className="w-80 shrink-0 border-r border-border bg-white flex flex-col">
          <div className="p-3 border-b border-border">
            <h2 className="font-heading font-bold text-sm text-foreground mb-2">Career Applications</h2>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none bg-white">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!loading && apps.length === 0 && (
              <p className="px-3 py-6 text-xs text-muted text-center italic">No applications found.</p>
            )}
            {apps.map((app) => (
              <button key={app.id}
                onClick={() => setSelected(app)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/50 transition-colors ${
                  selected?.id === app.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface"
                }`}>
                <p className="text-xs font-semibold truncate text-foreground">{app.full_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted truncate">{app.job_title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[app.status] || app.status}
                  </span>
                </div>
                <p className="text-[9px] text-muted mt-0.5">
                  {new Date(app.created_at).toLocaleDateString()} {new Date(app.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white shrink-0">
                <h1 className="text-lg font-heading font-bold text-foreground">Application Detail</h1>
                <div className="flex items-center gap-2">
                  <select value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                    className="px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none bg-white">
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50">
                    {deleting === selected.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl space-y-4">
                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-heading font-bold text-sm text-foreground mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <Info label="Full Name" value={selected.full_name} />
                      <Info label="Email" value={selected.email} link />
                      <Info label="Phone" value={selected.phone || "—"} />
                      <Info label="Date of Birth" value={selected.dob || "—"} />
                      <Info label="Address" value={selected.address || "—"} className="col-span-2" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-heading font-bold text-sm text-foreground mb-3">Job Application</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <Info label="Position Applied" value={selected.job_title} />
                      <Info label="Experience" value={`${selected.experience_years} year(s)`} />
                      <Info label="Current Position" value={selected.current_position || "—"} />
                      <Info label="Degree" value={selected.degree || "—"} />
                      <Info label="University" value={selected.university || "—"} />
                      <Info label="Subjects" value={selected.subjects || "—"} />
                    </div>
                  </div>

                  {(selected.cv_url || selected.photo_url) && (
                    <div className="bg-white rounded-xl border border-border p-5">
                      <h3 className="font-heading font-bold text-sm text-foreground mb-3">Documents</h3>
                      <div className="flex gap-3 flex-wrap">
                        {selected.cv_url && (
                          <a href={selected.cv_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            View CV/Resume
                          </a>
                        )}
                        {selected.photo_url && (
                          <a href={selected.photo_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100">
                            View Photo
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {selected.cover_letter && (
                    <div className="bg-white rounded-xl border border-border p-5">
                      <h3 className="font-heading font-bold text-sm text-foreground mb-3">Cover Letter</h3>
                      <div className="prose prose-xs max-w-none text-xs whitespace-pre-wrap text-muted leading-relaxed">
                        {selected.cover_letter}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-heading font-bold text-sm text-foreground mb-3">Submission Info</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <Info label="Status" value={statusLabels[selected.status] || selected.status} />
                      <Info label="Grade Range" value={selected.grades || "—"} />
                      <Info label="Submitted On" value={new Date(selected.created_at).toLocaleString()} className="col-span-2" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs">Select an application to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}

function Info({ label, value, link, className }: { label: string; value: string; link?: boolean; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
      {link ? (
        <a href={`mailto:${value}`} className="text-xs text-primary hover:underline">{value}</a>
      ) : (
        <p className="text-xs text-foreground mt-0.5">{value}</p>
      )}
    </div>
  );
}
