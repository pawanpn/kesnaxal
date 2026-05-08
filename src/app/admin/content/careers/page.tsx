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

interface JobItem {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
}

const jobCategories = ["Teaching", "Administration", "Support Staff"];
const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-green-100 text-green-700",
};

export default function CareerManagerPage() {
  const { getJson, saveJson, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("Teaching");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobSaving, setJobSaving] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [savingJobs, setSavingJobs] = useState(false);

  useEffect(() => {
    loadAllContent();
    fetchApplications();
  }, []);

  useEffect(() => {
    const json = getJson("careers", "job_listings", "en");
    const arr = json?.jobs as JobItem[] | undefined;
    if (arr && arr.length > 0) setJobs(arr);
  }, [getJson]);

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

  const handleSaveJobs = async () => {
    setSavingJobs(true);
    await saveJson("careers", "job_listings", "en", { jobs });
    await saveJson("careers", "job_listings", "ne", { jobs });
    await saveJson("careers", "job_listings", "ja", { jobs });
    setSavingJobs(false);
  };

  const handleAddOrUpdate = () => {
    if (editingJobId) {
      setJobs((prev) => prev.map((j) => j.id === editingJobId ? { ...j, title: jobTitle, category: jobCategory, type: jobType, description: jobDesc } : j));
      setEditingJobId(null);
    } else {
      const newJob: JobItem = { id: `job_${Date.now()}`, title: jobTitle, category: jobCategory, type: jobType, description: jobDesc };
      setJobs((prev) => [...prev, newJob]);
    }
    setJobTitle("");
    setJobDesc("");
    setJobCategory("Teaching");
    setJobType("Full-time");
  };

  const handleEditJob = (job: JobItem) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobCategory(job.category);
    setJobType(job.type);
    setJobDesc(job.description);
  };

  const handleDeleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (editingJobId === id) {
      setEditingJobId(null);
      setJobTitle("");
      setJobDesc("");
      setJobCategory("Teaching");
      setJobType("Full-time");
    }
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setJobTitle("");
    setJobDesc("");
    setJobCategory("Teaching");
    setJobType("Full-time");
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
          {/* Job Postings List + Form */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="font-heading font-bold text-sm text-foreground mb-3">
                {editingJobId ? "Edit Job" : "Post New Job"}
              </h2>
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
                  {jobCategories.map((c) => <option key={c}>{c}</option>)}
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
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none resize-y"
                  placeholder="Job description..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOrUpdate}
                    disabled={!jobTitle}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {editingJobId ? "Update Job" : "Add Job"}
                  </button>
                  {editingJobId && (
                    <button
                      onClick={handleCancelEdit}
                      className="py-2 px-3 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Jobs List */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-bold text-sm text-foreground">Current Jobs ({jobs.length})</h2>
                <button
                  onClick={handleSaveJobs}
                  disabled={savingJobs}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {savingJobs ? "Saving..." : "Save All"}
                </button>
              </div>
              {jobs.length === 0 ? (
                <p className="text-xs text-muted italic">No job listings yet.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-3 rounded-lg bg-surface/50 border border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-xs font-semibold text-foreground truncate">{job.title}</p>
                          <div className="flex gap-1 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{job.category}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted">{job.type}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete"
                          >
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
              {hasDraft("careers", "job_listings", "en") && (
                <p className="text-[10px] text-yellow-600 mt-2">Draft pending</p>
              )}
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
