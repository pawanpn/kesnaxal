"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";

type Locale = "en" | "ne" | "ja";

interface PdfDoc {
  key: string;
  label: string;
  description: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
}

interface AcademicLevel {
  id: string;
  title: string;
  grades: string;
  desc: string;
  image: string;
  subjects?: string[];
  streams?: { name: string; subjects: string[] }[];
}

interface FacultyMember {
  name: string;
  role: string;
  dept: string;
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const PDF_LABELS: Record<Locale, string[]> = {
  en: ["Fee Structure", "Syllabus", "Academic Calendar", "Exam Routine", "Book List", "Student Handbook"],
  ne: ["शुल्क संरचना", "पाठ्यक्रम", "शैक्षिक पात्रो", "परीक्षा तालिका", "पुस्तक सूची", "विद्यार्थी पुस्तिका"],
  ja: ["料金体系", "シラバス", "学年暦", "試験日程", "図書リスト", "生徒手帳"],
};
const PDF_DESCS = [
  "Current academic year fee breakdown", "Complete course syllabus for all grades",
  "Yearly academic schedule and holidays", "Examination schedule and time table",
  "Required textbooks for all classes", "Rules, regulations and guidelines",
];

function defDocs(locale: Locale): PdfDoc[] {
  return PDF_LABELS[locale].map((label, i) => ({
    key: `pdf_${i}`, label, description: PDF_DESCS[i],
  }));
}

function genKey() { return `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const TABS = [
  { id: "pdfs", label: "PDF Documents" },
  { id: "levels", label: "Academic Levels" },
  { id: "faculty", label: "Faculty" },
];

export default function AcademicHubPage() {
  const { getJson, saveJson, getContent, saveContent, discardSectionDrafts, uploadMedia, loadAllContent } = useAdmin();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("pdfs");
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  // PDF state
  const [docsByLocale, setDocsByLocale] = useState<Record<Locale, PdfDoc[]>>({ en: [], ne: [], ja: [] });
  const [uploading, setUploading] = useState<string | null>(null);

  // Levels state
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [levelForm, setLevelForm] = useState<AcademicLevel>({ id: "", title: "", grades: "", desc: "", image: "", subjects: [] });

  // Faculty state
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [editingFacultyIdx, setEditingFacultyIdx] = useState<number | null>(null);
  const [facultyForm, setFacultyForm] = useState<FacultyMember>({ name: "", role: "", dept: "" });

  useEffect(() => { loadAllContent(); }, []);

  // Load PDFs
  useEffect(() => {
    LOCALES.forEach(({ id: l }) => {
      const json = getJson("academics", "pdf_docs", l);
      const arr = json?.docs as PdfDoc[] | undefined;
      setDocsByLocale((p) => ({ ...p, [l]: arr?.length ? arr : defDocs(l) }));
    });
  }, [getJson]);

  // Load Levels
  useEffect(() => {
    const json = getJson("academics", "academic_levels", "en");
    const arr = json?.levels as AcademicLevel[] | undefined;
    if (arr?.length) {
      setLevels(arr);
    } else {
      // Fallback: load from individual keys
      const fallback: AcademicLevel[] = [];
      ["primary", "secondary", "higher-secondary"].forEach((id) => {
        const title = getContent("academics", `level_${id}_title`, "en");
        if (title) {
          fallback.push({
            id,
            title,
            grades: getContent("academics", `level_${id}_grades`, "en") || "",
            desc: getContent("academics", `level_${id}_desc`, "en") || "",
            image: getContent("academics", `level_${id}_image`, "en") || "",
          });
        }
      });
      if (fallback.length) setLevels(fallback);
    }
  }, [getJson, getContent]);

  // Load Faculty
  useEffect(() => {
    const json = getJson("academics", "faculty_list", "en");
    const arr = json?.members as FacultyMember[] | undefined;
    if (arr?.length) {
      setFaculty(arr);
    } else {
      const fallback: FacultyMember[] = [];
      for (let i = 0; i < 8; i++) {
        const name = getContent("faculty", `faculty_${i}_name`, "en");
        if (name) {
          fallback.push({
            name,
            role: getContent("faculty", `faculty_${i}_role`, "en") || "",
            dept: getContent("faculty", `faculty_${i}_dept`, "en") || "",
          });
        }
      }
      if (fallback.length) setFaculty(fallback);
    }
  }, [getJson, getContent]);

  // PDF handlers
  const docs = docsByLocale[lang];

  const handleUpload = async (docKey: string, file: File) => {
    setUploading(docKey);
    const url = await uploadMedia(file, "academics", docKey);
    if (url) {
      setDocsByLocale((p) => ({
        ...p, [lang]: p[lang].map((d) => d.key === docKey ? { ...d, url, fileName: file.name, fileSize: file.size } : d),
      }));
      toast("success", "PDF uploaded");
    } else {
      toast("error", "Upload failed");
    }
    setUploading(null);
  };

  const handleSavePDFs = async () => {
    setSaving(true);
    try {
      const clean = docs.map(({ url, fileName, fileSize, ...rest }) => ({
        ...rest, ...(url ? { url, fileName, fileSize } : {}),
      }));
      if (syncing) {
        for (const { id: l } of LOCALES) await saveJson("academics", "pdf_docs", l, { docs });
      } else {
        await saveJson("academics", "pdf_docs", lang, { docs: clean });
      }
      toast("success", "PDF docs saved");
    } catch { toast("error", "Save failed"); }
    setSaving(false);
  };

  // Level handlers
  const handleAddLevel = () => {
    setEditingLevelId("new");
    setLevelForm({ id: `level_${Date.now()}`, title: "", grades: "", desc: "", image: "", subjects: [] });
  };

  const handleEditLevel = (level: AcademicLevel) => {
    setEditingLevelId(level.id);
    setLevelForm({ ...level });
  };

  const handleSaveLevel = () => {
    if (editingLevelId === "new") {
      setLevels((p) => [...p, levelForm]);
    } else {
      setLevels((p) => p.map((l) => l.id === editingLevelId ? levelForm : l));
    }
    setEditingLevelId(null);
    setLevelForm({ id: "", title: "", grades: "", desc: "", image: "", subjects: [] });
  };

  const handleDeleteLevel = (id: string) => {
    setLevels((p) => p.filter((l) => l.id !== id));
    if (editingLevelId === id) {
      setEditingLevelId(null);
      setLevelForm({ id: "", title: "", grades: "", desc: "", image: "", subjects: [] });
    }
  };

  const handleSaveLevels = async () => {
    setSaving(true);
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("academics", "academic_levels", l, { levels });
      }
      toast("success", "Academic levels saved");
    } catch { toast("error", "Save failed"); }
    setSaving(false);
  };

  // Faculty handlers
  const handleAddFaculty = () => {
    setEditingFacultyIdx(-1);
    setFacultyForm({ name: "", role: "", dept: "" });
  };

  const handleEditFaculty = (idx: number) => {
    setEditingFacultyIdx(idx);
    setFacultyForm({ ...faculty[idx] });
  };

  const handleSaveFaculty = () => {
    if (editingFacultyIdx === -1) {
      setFaculty((p) => [...p, facultyForm]);
    } else if (editingFacultyIdx !== null) {
      setFaculty((p) => p.map((f, i) => i === editingFacultyIdx ? facultyForm : f));
    }
    setEditingFacultyIdx(null);
    setFacultyForm({ name: "", role: "", dept: "" });
  };

  const handleDeleteFaculty = (idx: number) => {
    setFaculty((p) => p.filter((_, i) => i !== idx));
  };

  const handleSaveFacultyList = async () => {
    setSaving(true);
    try {
      for (const { id: l } of LOCALES) {
        await saveJson("academics", "faculty_list", l, { members: faculty });
      }
      toast("success", "Faculty saved");
    } catch { toast("error", "Save failed"); }
    setSaving(false);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Academic Hub</h1>
            <p className="text-xs text-muted mt-1">Manage PDF documents, academic levels, and faculty</p>
          </div>
          <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("academics"); setDiscarding(false); window.location.reload(); }}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
            Discard Drafts
          </button>
        </div>

        {/* Tabs + Lang */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
              <button type="button" onClick={() => setSyncing(!syncing)}
                className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${syncing ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${syncing ? "translate-x-3" : "translate-x-0"}`} />
              </button>
              Sync
            </label>
          </div>
        </div>

        {/* PDF Documents */}
        {activeTab === "pdfs" && (
          <div className="space-y-4 max-w-3xl">
            {docs.map((doc, i) => (
              <div key={doc.key} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-3 space-y-2">
                    <input value={doc.label}
                      onChange={(e) => setDocsByLocale((p) => ({ ...p, [lang]: p[lang].map((d, j) => j === i ? { ...d, label: e.target.value } : d) }))}
                      placeholder={`Document Name (${lang.toUpperCase()})`}
                      className="w-full px-3 py-1.5 rounded border border-border text-sm focus:border-primary outline-none font-heading font-bold" />
                    <input value={doc.description}
                      onChange={(e) => setDocsByLocale((p) => ({ ...p, [lang]: p[lang].map((d, j) => j === i ? { ...d, description: e.target.value } : d) }))}
                      placeholder={`Description (${lang.toUpperCase()})`}
                      className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                  </div>
                  <button onClick={() => setDocsByLocale((p) => ({ ...p, [lang]: p[lang].filter((_, j) => j !== i) }))}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {doc.url ? (
                  <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline">{doc.fileName || "View PDF"}</a>
                    {doc.fileSize && <p className="text-[10px] text-green-600">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic mb-3">No file uploaded</p>
                )}
                <label className="inline-flex cursor-pointer py-1.5 px-3 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark">
                  {uploading === doc.key ? "Uploading..." : doc.url ? "Replace PDF" : "Upload PDF"}
                  <input type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(doc.key, file); e.target.value = ""; }} />
                </label>
              </div>
            ))}
            <button onClick={() => setDocsByLocale((p) => ({ ...p, [lang]: [...p[lang], { key: genKey(), label: "", description: "", url: undefined }] }))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ Add Document</button>
            <button onClick={handleSavePDFs} disabled={saving}
              className="ml-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save PDFs"}
            </button>
          </div>
        )}

        {/* Academic Levels */}
        {activeTab === "levels" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-bold text-sm text-foreground">Academic Levels</h2>
                <div className="flex gap-2">
                  <button onClick={handleAddLevel}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ Add Level</button>
                  <button onClick={handleSaveLevels} disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? "Saving..." : "Save All"}
                  </button>
                </div>
              </div>
              {levels.length === 0 ? (
                <p className="text-xs text-muted italic">No academic levels yet. Click Add Level to create.</p>
              ) : (
                levels.map((level) => (
                  <div key={level.id} className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">{level.id}</span>
                          <h3 className="font-heading font-bold text-sm text-foreground">{level.title || "(Untitled)"}</h3>
                        </div>
                        <p className="text-xs text-muted mb-1">Grades: {level.grades || "-"}</p>
                        <p className="text-xs text-muted line-clamp-2">{level.desc || "-"}</p>
                        {level.subjects && level.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {level.subjects.map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditLevel(level)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteLevel(level.id)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Level edit form */}
            {editingLevelId && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-heading font-bold text-sm text-foreground mb-3">
                  {editingLevelId === "new" ? "New Level" : "Edit Level"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">ID (slug)</label>
                    <input value={levelForm.id} onChange={(e) => setLevelForm((p) => ({ ...p, id: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono"
                      placeholder="e.g., primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Title</label>
                    <input value={levelForm.title} onChange={(e) => setLevelForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      placeholder="e.g., Primary Level" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Grades</label>
                    <input value={levelForm.grades} onChange={(e) => setLevelForm((p) => ({ ...p, grades: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      placeholder="e.g., Nursery to Grade 5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Description</label>
                    <textarea value={levelForm.desc} onChange={(e) => setLevelForm((p) => ({ ...p, desc: e.target.value }))} rows={3}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y"
                      placeholder="Brief description of this academic level" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Image URL</label>
                    <input value={levelForm.image} onChange={(e) => setLevelForm((p) => ({ ...p, image: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono"
                      placeholder="https://..." />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveLevel}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                      {editingLevelId === "new" ? "Add Level" : "Update Level"}
                    </button>
                    <button onClick={() => { setEditingLevelId(null); setLevelForm({ id: "", title: "", grades: "", desc: "", image: "", subjects: [] }); }}
                      className="py-2 px-3 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Faculty */}
        {activeTab === "faculty" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Faculty list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-bold text-sm text-foreground">Faculty Members</h2>
                <div className="flex gap-2">
                  <button onClick={handleAddFaculty}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ Add Faculty</button>
                  <button onClick={handleSaveFacultyList} disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? "Saving..." : "Save All"}
                  </button>
                </div>
              </div>
              {faculty.length === 0 ? (
                <p className="text-xs text-muted italic">No faculty members yet.</p>
              ) : (
                faculty.map((member, i) => (
                  <div key={i} className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-3">
                        <h3 className="font-heading font-bold text-sm text-foreground">{member.name}</h3>
                        <p className="text-xs text-muted">{member.role}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface mt-1 inline-block">{member.dept}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditFaculty(i)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteFaculty(i)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Faculty edit form */}
            {editingFacultyIdx !== null && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-heading font-bold text-sm text-foreground mb-3">
                  {editingFacultyIdx === -1 ? "New Faculty" : "Edit Faculty"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Name</label>
                    <input value={facultyForm.name} onChange={(e) => setFacultyForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Role</label>
                    <input value={facultyForm.role} onChange={(e) => setFacultyForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="e.g., Head of Department" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-0.5">Department</label>
                    <input value={facultyForm.dept} onChange={(e) => setFacultyForm((p) => ({ ...p, dept: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="e.g., Science" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveFaculty}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                      {editingFacultyIdx === -1 ? "Add Faculty" : "Update"}
                    </button>
                    <button onClick={() => { setEditingFacultyIdx(null); setFacultyForm({ name: "", role: "", dept: "" }); }}
                      className="py-2 px-3 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
