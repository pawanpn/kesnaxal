"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";

type Locale = "en" | "ne" | "ja";

interface PdfDoc {
  key: string;
  label: string;
  description: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const LABELS: Record<Locale, string[]> = {
  en: ["Fee Structure", "Syllabus", "Academic Calendar", "Exam Routine", "Book List", "Student Handbook"],
  ne: ["शुल्क संरचना", "पाठ्यक्रम", "शैक्षिक पात्रो", "परीक्षा तालिका", "पुस्तक सूची", "विद्यार्थी पुस्तिका"],
  ja: ["料金体系", "シラバス", "学年暦", "試験日程", "図書リスト", "生徒手帳"],
};
const DESCS_EN = [
  "Current academic year fee breakdown", "Complete course syllabus for all grades",
  "Yearly academic schedule and holidays", "Examination schedule and time table",
  "Required textbooks for all classes", "Rules, regulations and guidelines",
];

function defDocs(locale: Locale): PdfDoc[] {
  return LABELS[locale].map((label, i) => ({
    key: `pdf_${i}`, label, description: DESCS_EN[i],
  }));
}

function genKey() { return `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

export default function AcademicHubPage() {
  const { getJson, saveJson, hasDraft, discardSectionDrafts, uploadMedia, loadAllContent } = useAdmin();
  const [lang, setLang] = useState<Locale>("en");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [docsByLocale, setDocsByLocale] = useState<Record<Locale, PdfDoc[]>>({ en: [], ne: [], ja: [] });
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    LOCALES.forEach(({ id: l }) => {
      const json = getJson("academics", "pdf_docs", l);
      const arr = json?.docs as PdfDoc[] | undefined;
      setDocsByLocale((p) => ({ ...p, [l]: arr?.length ? arr : defDocs(l) }));
    });
  }, [getJson]);

  const docs = docsByLocale[lang];

  const handleUpload = async (docKey: string, file: File) => {
    setUploading(docKey);
    const url = await uploadMedia(file, "academics", docKey);
    if (url) {
      setDocsByLocale((p) => ({
        ...p, [lang]: p[lang].map((d) => d.key === docKey ? { ...d, url, fileName: file.name, fileSize: file.size } : d),
      }));
      if (autoTranslate) {
        LOCALES.forEach(({ id: l }) => {
          if (l !== lang) {
            setDocsByLocale((pp) => ({
              ...pp, [l]: pp[l].map((d) => d.key === docKey ? { ...d, url, fileName: file.name, fileSize: file.size } : d),
            }));
          }
        });
      }
    }
    setUploading(null);
  };

  const handleAdd = () => {
    setDocsByLocale((p) => ({ ...p, [lang]: [...p[lang], { key: genKey(), label: "", description: "", url: undefined }] }));
  };

  const handleRemove = (key: string) => {
    setDocsByLocale((p) => ({ ...p, [lang]: p[lang].filter((d) => d.key !== key) }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (autoTranslate) {
      for (const { id: l } of LOCALES) {
        await saveJson("academics", "pdf_docs", l, { docs: docs });
      }
    } else {
      const clean = docs.map(({ url, fileName, fileSize, ...rest }) => ({
        ...rest, ...(url ? { url, fileName, fileSize } : {}),
      }));
      await saveJson("academics", "pdf_docs", lang, { docs: clean });
    }
    setSaving(false);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Academic Hub</h1>
            <p className="text-xs text-muted mt-1">Upload and manage PDF documents for fee structure, syllabus, calendar and more</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
              + Add Document
            </button>
            <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("academics"); setDiscarding(false); window.location.reload(); }}
              disabled={discarding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
              Discard Drafts
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
            {LOCALES.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                {l.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
            <button onClick={() => setAutoTranslate(!autoTranslate)}
              className={`w-8 h-4 rounded-full transition-colors relative ${autoTranslate ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${autoTranslate ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            Auto
          </label>
        </div>

        <div className="space-y-4 max-w-3xl">
          {docs.map((doc, i) => (
            <div key={doc.key} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 mr-3 space-y-2">
                  <input type="text" value={doc.label}
                    onChange={(e) => setDocsByLocale((p) => ({ ...p, [lang]: p[lang].map((d, j) => j === i ? { ...d, label: e.target.value } : d) }))}
                    placeholder={`Document Name (${lang.toUpperCase()})`}
                    className="w-full px-3 py-1.5 rounded border border-border text-sm focus:border-primary outline-none font-heading font-bold" />
                  <input type="text" value={doc.description}
                    onChange={(e) => setDocsByLocale((p) => ({ ...p, [lang]: p[lang].map((d, j) => j === i ? { ...d, description: e.target.value } : d) }))}
                    placeholder={`Description (${lang.toUpperCase()})`}
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                </div>
                <button onClick={() => handleRemove(doc.key)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50" title="Remove">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {doc.url ? (
                <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                  <div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {doc.fileName || "View PDF"}
                    </a>
                    {doc.fileSize && <p className="text-[10px] text-green-600 mt-0.5">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted italic mb-3">No file uploaded</p>
              )}

              <label className="inline-flex cursor-pointer py-1.5 px-3 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-colors">
                {uploading === doc.key ? "Uploading..." : doc.url ? "Replace PDF" : "Upload PDF"}
                <input
                  ref={(el) => { fileRefs.current[doc.key] = el; }}
                  type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(doc.key, file); e.target.value = ""; }}
                />
              </label>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
          {saving ? "Saving..." : `Save Changes (${autoTranslate ? "All Languages" : lang.toUpperCase()})`}
        </button>
        {hasDraft("academics", "pdf_docs", "en") && <span className="ml-2 text-xs text-yellow-600">Draft pending</span>}
      </div>
    </AdminGuard>
  );
}
