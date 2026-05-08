"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  degree: string | null;
  experience_years: number;
  status: string;
  created_at: string;
  cv_url: string | null;
  photo_url: string | null;
}

const jobCategories = ["Teaching", "Administration", "Support Staff", "All"];
const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-green-100 text-green-700",
};

export default function CareerManagerPage() {
  const { getContent, saveContent, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Job listing form
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("Teaching");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobSaving, setJobSaving] = useState(false);

  useEffect(() => {
    loadAllContent();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(id);
    await supabase.from("career_applications").update({ status }).eq("id", id);
    await fetchApplications();
    if (selectedApp?.id === id) {
      setSelectedApp((prev) => prev ? { ...prev, status } : null);
    }
    setUpdatingStatus(null);
  };

  const addJob = async () => {
    setJobSaving(true);
    const jobKey = `job_${Date.now()}`;
    await saveContent("careers", jobKey, "en", jobTitle);
    await saveContent("careers", `${jobKey}_desc`, "en", jobDesc);
    setJobSaving(false);
    setJobTitle("");
    setJobDesc("");
    alert("Job saved as draft. Publish to make it live.");
  };

  const filtered = filter === "All"
    ? applications
    : applications.filter((a) => a.status === filter.toLowerCase());

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Career Manager</h1>
            <p className="text-xs text-muted mt-1">Post jobs and manage applications</p>
          </div>
          <button
            onClick={async () => { await discardSectionDrafts("careers"); window.location.reload(); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5"
          >
            Discard Drafts
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post a Job */}
          <div className="bg-white rounded-xl border border-border p-5 lg:col-span-1">
            <h2 className="font-heading font-bold text-sm text-foreground mb-3">Post New Job</h2>
            <div className="space-y-3">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                placeholder="Job Title"
              />
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
              >
                {jobCategories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none resize-y"
                placeholder="Job description..."
              />
              <button
                onClick={addJob}
                disabled={!jobTitle || jobSaving}
                className="w-full py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {jobSaving ? "Saving..." : "Add Job (Draft)"}
              </button>
            </div>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1 bg-white rounded-xl border border-border p-1 mb-4 max-w-lg">
              {["All", "pending", "reviewed", "shortlisted", "hired"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-xs text-muted">Loading applications...</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-muted">No applications found.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{app.full_name}</p>
                        <p className="text-xs text-muted">{app.job_title} | {app.email}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[app.status] || ""}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedApp(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg text-foreground">{selectedApp.full_name}</h2>
                <button onClick={() => setSelectedApp(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong className="text-xs text-muted uppercase tracking-wider">Job:</strong> {selectedApp.job_title}</p>
                <p><strong className="text-xs text-muted uppercase tracking-wider">Email:</strong> {selectedApp.email}</p>
                {selectedApp.phone && <p><strong className="text-xs text-muted uppercase tracking-wider">Phone:</strong> {selectedApp.phone}</p>}
                <p><strong className="text-xs text-muted uppercase tracking-wider">Experience:</strong> {selectedApp.experience_years} years</p>
                {selectedApp.degree && <p><strong className="text-xs text-muted uppercase tracking-wider">Degree:</strong> {selectedApp.degree}</p>}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {["pending", "reviewed", "shortlisted", "rejected", "hired"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedApp.id, s)}
                      disabled={updatingStatus === selectedApp.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedApp.status === s ? `${statusColors[s]} ring-2 ring-offset-1` : "bg-surface text-muted"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {selectedApp.cv_url && (
                <a href={selectedApp.cv_url} target="_blank" className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">
                  View CV
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
