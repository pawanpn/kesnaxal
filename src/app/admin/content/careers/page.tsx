"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import type { JobVacancy } from "@/types";

type Locale = "en" | "ne" | "ja";
type LocaleContent = Record<Locale, string>;

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const JOB_CATEGORIES = ["Teaching", "Administration", "Support Staff"];

interface Application {
  id: string; job_id: string; job_title: string; full_name: string;
  email: string; phone: string | null; address: string | null;
  dob: string | null; nationality: string | null; place_of_birth: string | null;
  gender: string | null; marital_status: string | null;
  dependents: string | null; degree: string | null; major_subject: string | null;
  experience_years: number; current_position: string | null;
  subjects: string | null; grades: string | null;
  status: string; created_at: string;
  cv_url: string | null; photo_url: string | null;
  documents_url: string[] | null; cover_letter: string | null;
  form_data: Record<string, unknown> | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700", reviewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700", rejected: "bg-red-100 text-red-700",
  hired: "bg-green-100 text-green-700",
};

function emptyLocale(): LocaleContent {
  return { en: "", ne: "", ja: "" };
}

function newJob(): JobVacancy {
  return {
    id: Date.now(),
    title: emptyLocale(),
    category: { en: "Teaching", ne: "शिक्षण", ja: "教育" },
    level: emptyLocale(),
    experience: emptyLocale(),
    salary: emptyLocale(),
    description: emptyLocale(),
    vacancies: 1,
    workstation: emptyLocale(),
    responsibilities: [],
    addedOn: new Date().toISOString().split("T")[0],
    expiresOn: "",
    isActive: true,
  };
}

export default function CareerManagerPage() {
  const { getJson, saveJson, hasDraft, loadAllContent, contentReady, isAdmin, savePublishedJson } = useAdmin();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [lang, setLang] = useState<Locale>("en");
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newResp, setNewResp] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(true);
  const [appFilter, setAppFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    if (!contentReady || !isAdmin) return;
    setPageReady(true);
  }, [contentReady, isAdmin]);

  useEffect(() => {
    loadAllContent();
    fetchApplications();
  }, []);

  // FIX: jobsLoaded reset huda matra reload garne
  useEffect(() => {
    if (jobsLoaded || !pageReady) return;

    let loaded = false;
    for (const { id: l } of LOCALES) {
      const json = getJson("careers", "job_vacancies", l) as { vacancies?: JobVacancy[] };
      if (json?.vacancies?.length) {
        setJobs(json.vacancies);
        setJobsLoaded(true);
        loaded = true;
        break;
      }
    }

    if (loaded) return;
    if (loadAttempts < 5) {
      const t = setTimeout(() => setLoadAttempts((p) => p + 1), 500);
      return () => clearTimeout(t);
    }
  }, [getJson, jobsLoaded, pageReady, loadAttempts]);

  const fetchApplications = async () => {
    const { data } = await supabase.from("career_applications").select("*").order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
    setAppLoading(false);
  };

  // FIX: saveJobs - publish garda jobsLoaded reset garera fresh data load garne
  const saveJobs = async (updatedJobs: JobVacancy[], publishDirect = false) => {
    setSaving(true);
    try {
      if (publishDirect) {
        // Sabai locales ma published status ma save garne
        for (const { id: l } of LOCALES) {
          await savePublishedJson("careers", "job_vacancies", l, { vacancies: updatedJobs });
        }
        // Purano job_listings conflict hatauna empty publish garne
        await savePublishedJson("careers", "job_listings", "en", { jobs: [] });
        await savePublishedJson("careers", "job_listings", "ne", { jobs: [] });
        await savePublishedJson("careers", "job_listings", "ja", { jobs: [] });
      } else {
        for (const { id: l } of LOCALES) {
          await saveJson("careers", "job_vacancies", l, { vacancies: updatedJobs });
        }
      }

      setJobs(updatedJobs);
      // FIX: reload allow garna jobsLoaded false garnu parxa
      setJobsLoaded(false);
      await loadAllContent();
      // Content load bhayepachi feri true garxa (useEffect le handle garxa)
      toast("success", publishDirect ? "Jobs published and live on site!" : "Jobs saved as draft — click 'Publish Now' to go live");
    } catch (e) {
      console.error("Career save failed:", e);
      toast("error", "Failed to save jobs. Please try again.");
    }
    setSaving(false);
  };

  const handlePublishNow = async () => {
    setPublishing(true);
    try {
      await saveJobs(jobs, true);
    } finally {
      setPublishing(false);
    }
  };

  const hasDraftJobs = hasDraft("careers", "job_vacancies", "en") || hasDraft("careers", "job_vacancies", "ne") || hasDraft("careers", "job_vacancies", "ja");

  const handleSaveJob = async () => {
    if (!editingJob) return;
    const exists = jobs.find((j) => j.id === editingJob.id);
    const updated = exists ? jobs.map((j) => j.id === editingJob.id ? editingJob : j) : [...jobs, editingJob];
    await saveJobs(updated);
    setEditingJob(null);
  };

  const handleSaveAndPublishJob = async () => {
    if (!editingJob) return;
    const exists = jobs.find((j) => j.id === editingJob.id);
    const updated = exists ? jobs.map((j) => j.id === editingJob.id ? editingJob : j) : [...jobs, editingJob];
    await saveJobs(updated, true); // FIX: publishDirect = true
    setEditingJob(null);
  };

  const handleDeleteJob = async (id: number) => {
    const updated = jobs.filter((j) => j.id !== id);
    await saveJobs(updated, true); // FIX: delete pani directly publish garne
    setDeleteConfirmId(null);
  };

  const handleToggleActive = async (id: number) => {
    const updated = jobs.map((j) => j.id === id ? { ...j, isActive: !j.isActive } : j);
    await saveJobs(updated, true); // FIX: toggle pani directly publish garne
  };

  const updateField = (field: keyof JobVacancy, value: string) => {
    if (!editingJob) return;
    const localeFields = ["title", "category", "level", "experience", "salary", "workstation", "description"];
    if (localeFields.includes(field)) {
      setEditingJob({ ...editingJob, [field]: { ...(editingJob[field] as LocaleContent), [lang]: value } });
    } else {
      setEditingJob({ ...editingJob, [field]: value });
    }
  };

  const addResponsibility = () => {
    if (!editingJob || !newResp.trim()) return;
    const resp: LocaleContent = { en: "", ne: "", ja: "" };
    resp[lang] = newResp.trim();
    setEditingJob({ ...editingJob, responsibilities: [...editingJob.responsibilities, resp] });
    setNewResp("");
  };

  const updateResponsibility = (idx: number, value: string) => {
    if (!editingJob) return;
    const updated = editingJob.responsibilities.map((r, i) =>
      i === idx ? { ...r, [lang]: value } : r
    );
    setEditingJob({ ...editingJob, responsibilities: updated });
  };

  const removeResponsibility = (idx: number) => {
    if (!editingJob) return;
    setEditingJob({ ...editingJob, responsibilities: editingJob.responsibilities.filter((_, i) => i !== idx) });
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(id);
    try {
      await supabase.from("career_applications").update({ status }).eq("id", id);
      await fetchApplications();
      if (selectedApp?.id === id) setSelectedApp((prev) => prev ? { ...prev, status } : null);
      toast("success", "Status updated");
    } catch { toast("error", "Status update failed"); }
    setUpdatingStatus(null);
  };

  const filtered = appFilter === "All" ? applications : applications.filter((a) => a.status === appFilter.toLowerCase());

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Career Manager</h1>
            <p className="text-xs text-muted mt-1">Manage job vacancies and applications</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
            <button onClick={() => setActiveTab("jobs")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "jobs" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
              Jobs
            </button>
            <button onClick={() => setActiveTab("applications")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "applications" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
              Applications ({applications.length})
            </button>
          </div>
          {activeTab === "jobs" && (
            <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "jobs" && hasDraftJobs && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-xs text-yellow-800 max-w-5xl flex items-center justify-between">
            <span><strong>Draft pending</strong> — changes not yet visible on public site.</span>
            <div className="flex gap-2 shrink-0">
              <button onClick={handlePublishNow} disabled={publishing}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                {publishing ? "Publishing..." : "Publish Now"}
              </button>
              <a href="/admin/publish" className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-yellow-400 text-yellow-800 hover:bg-yellow-100">
                Review &amp; Publish
              </a>
            </div>
          </div>
        )}

        {!pageReady && activeTab === "jobs" && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 max-w-5xl">
            Loading content data...
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Job List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-sm text-foreground">All Jobs ({jobs.length})</h2>
                  {jobs.length > 0 && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasDraftJobs ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {hasDraftJobs ? "Draft" : "Published"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingJob(newJob())}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
                    + Add Job
                  </button>
                </div>
              </div>
              {jobs.length === 0 ? (
                <p className="text-xs text-muted italic py-8 text-center">No jobs yet. Click &quot;+ Add Job&quot; to create one.</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className={`p-3 rounded-xl border transition-all ${editingJob?.id === job.id ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{job.title[lang] || job.title.en || "Untitled"}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{job.category[lang] || job.category.en}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted">{job.vacancies} vacancy</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${job.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                              {job.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleToggleActive(job.id)} title={job.isActive ? "Deactivate" : "Activate"}
                            className={`w-6 h-6 flex items-center justify-center rounded ${job.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {job.isActive ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                            </svg>
                          </button>
                          <button onClick={() => setEditingJob({ ...job })} title="Edit"
                            className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteConfirmId(job.id)} title="Delete"
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

            {/* Edit/Add Form */}
            <div className="lg:col-span-3">
              {editingJob ? (
                <div className="bg-white rounded-xl border border-border p-5 lg:sticky lg:top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-sm text-foreground">
                      {jobs.find((j) => j.id === editingJob.id) ? "Edit Job" : "Add New Job"} ({lang.toUpperCase()})
                    </h2>
                    <button onClick={() => setEditingJob(null)} className="text-muted hover:text-foreground text-xs">Cancel</button>
                  </div>
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Job Title *</label>
                      <input value={(editingJob.title as LocaleContent)[lang] || ""} onChange={(e) => updateField("title", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="e.g. Mathematics Teacher" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">Category *</label>
                        {lang === "en" ? (
                          <select value={(editingJob.category as LocaleContent).en}
                            onChange={(e) => setEditingJob({ ...editingJob, category: { ...editingJob.category as LocaleContent, en: e.target.value } })}
                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none">
                            {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <input value={(editingJob.category as LocaleContent)[lang] || ""} onChange={(e) => updateField("category", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="Category translation" />
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">Vacancies *</label>
                        <input type="number" min={1} value={editingJob.vacancies}
                          onChange={(e) => setEditingJob({ ...editingJob, vacancies: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Level</label>
                      <input value={(editingJob.level as LocaleContent)[lang] || ""} onChange={(e) => updateField("level", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="e.g. Secondary (Grade 6-10)" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Experience Required</label>
                      <input value={(editingJob.experience as LocaleContent)[lang] || ""} onChange={(e) => updateField("experience", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="e.g. Minimum 3 years" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Salary</label>
                      <input value={(editingJob.salary as LocaleContent)[lang] || ""} onChange={(e) => updateField("salary", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="e.g. Negotiable" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Workstation</label>
                      <input value={(editingJob.workstation as LocaleContent)[lang] || ""} onChange={(e) => updateField("workstation", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" placeholder="e.g. Naxal, Kathmandu" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Job Description ({lang.toUpperCase()})</label>
                      <textarea value={(editingJob.description as LocaleContent)?.[lang] || ""} onChange={(e) => updateField("description", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none resize-y"
                        placeholder="Full job description, requirements, and details..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">Posted Date</label>
                        <input type="date" value={editingJob.addedOn}
                          onChange={(e) => setEditingJob({ ...editingJob, addedOn: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">Expires On</label>
                        <input type="date" value={editingJob.expiresOn}
                          onChange={(e) => setEditingJob({ ...editingJob, expiresOn: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-foreground">Active:</label>
                      <button type="button" onClick={() => setEditingJob({ ...editingJob, isActive: !editingJob.isActive })}
                        className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 ${editingJob.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${editingJob.isActive ? "translate-x-3.5" : "translate-x-0"}`} />
                      </button>
                      <span className="text-[10px] text-muted">{editingJob.isActive ? "Visible to public" : "Hidden from public"}</span>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Responsibilities ({lang.toUpperCase()})</label>
                      <div className="space-y-1.5 mb-2">
                        {editingJob.responsibilities.map((r, i) => (
                          <div key={i} className="flex gap-1.5 items-start">
                            <span className="text-[10px] text-muted mt-2 shrink-0 w-4">{i + 1}.</span>
                            <input value={(r as LocaleContent)[lang] || ""} onChange={(e) => updateResponsibility(i, e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded border border-border text-[11px] focus:border-primary outline-none" />
                            <button onClick={() => removeResponsibility(i)}
                              className="w-6 h-6 flex items-center justify-center rounded text-red-500 hover:bg-red-50 shrink-0 mt-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input value={newResp} onChange={(e) => setNewResp(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResponsibility(); } }}
                          className="flex-1 px-2 py-1.5 rounded border border-border text-[11px] focus:border-primary outline-none" placeholder="Add responsibility..." />
                        <button onClick={addResponsibility} disabled={!newResp.trim()}
                          className="px-2 py-1.5 rounded text-[10px] font-bold bg-primary text-white disabled:opacity-40">Add</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <button onClick={handleSaveJob} disabled={saving || !(editingJob.title as LocaleContent).en?.trim()}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                      {saving ? "Saving..." : jobs.find((j) => j.id === editingJob.id) ? "Update & Save Draft" : "Add & Save Draft"}
                    </button>
                    <button
                      onClick={handleSaveAndPublishJob}
                      disabled={saving || publishing || !(editingJob.title as LocaleContent).en?.trim()}
                      className="py-2.5 px-4 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                      {saving || publishing ? "Saving..." : "Save & Publish"}
                    </button>
                    <button onClick={() => setEditingJob(null)}
                      className="py-2.5 px-4 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-xl border border-border p-8 text-center">
                  <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-muted">Select a job to edit or click &quot;+ Add Job&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <div className="flex items-center gap-1 bg-white rounded-xl border border-border p-1 mb-4 max-w-lg">
              {["All", "pending", "reviewed", "shortlisted", "hired"].map((f) => (
                <button key={f} onClick={() => setAppFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${appFilter === f ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                  {f}
                </button>
              ))}
            </div>
            {appLoading ? (
              <p className="text-xs text-muted">Loading applications...</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-muted">No applications found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtered.map((app) => (
                  <div key={app.id} onClick={() => setSelectedApp(app)}
                    className="bg-white rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all">
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
        )}

        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirmId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">Delete Job?</h3>
                <p className="text-xs text-muted mb-6">This will permanently remove this job vacancy. This action cannot be undone.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteJob(deleteConfirmId)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {selectedApp.address && <p><strong className="text-xs text-muted uppercase tracking-wider">Address:</strong> {selectedApp.address}</p>}
                {selectedApp.dob && <p><strong className="text-xs text-muted uppercase tracking-wider">DOB:</strong> {selectedApp.dob}</p>}
                {selectedApp.nationality && <p><strong className="text-xs text-muted uppercase tracking-wider">Nationality:</strong> {selectedApp.nationality}</p>}
                {selectedApp.gender && <p><strong className="text-xs text-muted uppercase tracking-wider">Gender:</strong> {selectedApp.gender}</p>}
                {selectedApp.marital_status && <p><strong className="text-xs text-muted uppercase tracking-wider">Marital Status:</strong> {selectedApp.marital_status}</p>}
                <p><strong className="text-xs text-muted uppercase tracking-wider">Experience:</strong> {selectedApp.experience_years} years</p>
                {selectedApp.degree && <p><strong className="text-xs text-muted uppercase tracking-wider">Degree:</strong> {selectedApp.degree}</p>}
                {selectedApp.major_subject && <p><strong className="text-xs text-muted uppercase tracking-wider">Major:</strong> {selectedApp.major_subject}</p>}
                {selectedApp.subjects && <p><strong className="text-xs text-muted uppercase tracking-wider">Subjects:</strong> {selectedApp.subjects}</p>}
                {selectedApp.grades && <p><strong className="text-xs text-muted uppercase tracking-wider">Grades:</strong> {selectedApp.grades}</p>}
                {selectedApp.cover_letter && (
                  <div>
                    <strong className="text-xs text-muted uppercase tracking-wider">Cover Letter:</strong>
                    <p className="text-xs mt-1 bg-surface p-2 rounded">{selectedApp.cover_letter}</p>
                  </div>
                )}
                {selectedApp.form_data && Object.keys(selectedApp.form_data).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-primary font-semibold cursor-pointer hover:underline">
                      View Full Form Data
                    </summary>
                    <pre className="text-[10px] bg-surface p-2 rounded mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedApp.form_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Files</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.cv_url && (
                    <a href={selectedApp.cv_url} target="_blank" className="text-xs text-primary font-semibold hover:underline bg-primary/5 px-2 py-1 rounded">
                      View CV
                    </a>
                  )}
                  {selectedApp.photo_url && (
                    <a href={selectedApp.photo_url} target="_blank" className="text-xs text-primary font-semibold hover:underline bg-primary/5 px-2 py-1 rounded">
                      View Photo
                    </a>
                  )}
                  {selectedApp.documents_url && Array.isArray(selectedApp.documents_url) && (selectedApp.documents_url as string[]).map((d: string, i: number) => (
                    <a key={i} href={d} target="_blank" className="text-xs text-primary font-semibold hover:underline bg-primary/5 px-2 py-1 rounded">
                      Doc {i + 1}
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {["pending", "reviewed", "shortlisted", "rejected", "hired"].map((s) => (
                    <button key={s} onClick={() => updateStatus(selectedApp.id, s)}
                      disabled={updatingStatus === selectedApp.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedApp.status === s ? `${statusColors[s]} ring-2 ring-offset-1` : "bg-surface text-muted"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {selectedApp.cv_url && (
                <a href={selectedApp.cv_url} target="_blank" className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">View CV</a>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
