"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";

interface PdfDoc {
  key: string;
  label: string;
  description: string;
}

const pdfs: PdfDoc[] = [
  { key: "fee_structure", label: "Fee Structure", description: "Current academic year fee breakdown" },
  { key: "syllabus", label: "Syllabus", description: "Complete course syllabus for all grades" },
  { key: "academic_calendar", label: "Academic Calendar", description: "Yearly academic schedule and holidays" },
  { key: "exam_routine", label: "Exam Routine", description: "Examination schedule and time table" },
  { key: "book_list", label: "Book List", description: "Required textbooks for all classes" },
  { key: "student_handbook", label: "Student Handbook", description: "Rules, regulations and guidelines" },
];

export default function AcademicHubPage() {
  const { getContent, getMeta, saveContent, saveJson, hasDraft, uploadMedia, discardSectionDrafts, loadAllContent } = useAdmin();
  const [uploading, setUploading] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadAllContent();
  }, []);

  const getPdfUrl = (key: string) => {
    const dbUrl = getContent("academics", key, "en");
    return dbUrl || null;
  };

  const getPdfMeta = (key: string) => {
    const meta = getMeta("academics", key, "en");
    return meta as { fileName?: string; fileSize?: number; mimeType?: string };
  };

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    const url = await uploadMedia(file, "academics", key);
    if (url) {
      await saveContent("academics", key, "en", url);
      await saveJson("academics", key, "en", {
        mediaUrl: url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    }
    setUploading(null);
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Academic Hub</h1>
            <p className="text-xs text-muted mt-1">Upload and manage PDF documents for fee structure, syllabus, calendar and more</p>
          </div>
          <button
            onClick={async () => { setDiscarding(true); await discardSectionDrafts("academics"); setDiscarding(false); window.location.reload(); }}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50"
          >
            Discard Drafts
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {pdfs.map((doc) => {
            const pdfUrl = getPdfUrl(doc.key);
            const meta = getPdfMeta(doc.key);
            return (
              <div key={doc.key} className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-heading font-bold text-sm text-foreground mb-1">{doc.label}</h3>
                <p className="text-xs text-muted mb-3">{doc.description}</p>

                {pdfUrl ? (
                  <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {meta?.fileName || "View PDF"}
                    </a>
                    {meta?.fileSize && (
                      <p className="text-[10px] text-green-600 mt-0.5">
                        {(meta.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                    {hasDraft("academics", doc.key, "en") && (
                      <span className="text-[10px] text-yellow-600 ml-2">(Draft)</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic mb-3">No file uploaded</p>
                )}

                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer py-1.5 rounded-lg text-xs font-semibold text-center bg-primary text-white hover:bg-primary-dark transition-colors">
                    {uploading === doc.key ? "Uploading..." : pdfUrl ? "Replace" : "Upload PDF"}
                    <input
                      ref={(el) => { fileRefs.current[doc.key] = el; }}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(doc.key, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminGuard>
  );
}
