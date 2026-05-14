"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { stripHtml } from "@/lib/sanitize";
import type { JobVacancy, Translations, Locale } from "@/types";
import { resolveJob } from "@/lib/translate";

/* ── Types ── */

interface TableRow {
  id: number;
  organization?: string;
  position?: string;
  fromDate?: string;
  toDate?: string;
  institution?: string;
  degree?: string;
  major?: string;
  title?: string;
  [key: string]: string | number | undefined;
}

interface AppFormData {
  photo: File | null;
  photoPreview: string | null;
  fullName: string;
  nationality: string;
  email: string;
  address: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  maritalStatus: string;
  dependents: string;
  gradeLevel: string;
  interestedSubjects: string;
  highestEducation: string;
  majorSubject: string;
  workExperience: TableRow[];
  educationHistory: TableRow[];
  trainings: TableRow[];
  whyWorkWithUs: string;
  challengesFaced: string;
  thoughtsOnEducation: string;
  specialInterests: string;
  healthDetails: string;
  ref1Name: string;
  ref1Address: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Address: string;
  ref2Phone: string;
  cv: File | null;
  cvName: string;
  experienceDoc: File | null;
  experienceDocName: string;
  academicDoc: File | null;
  academicDocName: string;
}

interface ApplicationFormProps {
  job: JobVacancy;
  locale: Locale;
  t: Translations;
  onClose: () => void;
  schoolName: string;
}

/* ── Constants ── */

const TOTAL_STEPS = 4;

function emptyRow(id: number, fields: string[]): TableRow {
  const row: TableRow = { id };
  fields.forEach((f) => (row[f] = ""));
  return row;
}

function emptyForm(): AppFormData {
  return {
    photo: null,
    photoPreview: null,
    fullName: "",
    nationality: "",
    email: "",
    address: "",
    phone: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    maritalStatus: "",
    dependents: "",
    gradeLevel: "",
    interestedSubjects: "",
    highestEducation: "",
    majorSubject: "",
    workExperience: [emptyRow(Date.now(), ["organization", "position", "fromDate", "toDate"])],
    educationHistory: [emptyRow(Date.now() + 1, ["institution", "degree", "major", "fromDate", "toDate"])],
    trainings: [emptyRow(Date.now() + 2, ["institution", "title", "fromDate", "toDate"])],
    whyWorkWithUs: "",
    challengesFaced: "",
    thoughtsOnEducation: "",
    specialInterests: "",
    healthDetails: "",
    ref1Name: "", ref1Address: "", ref1Phone: "",
    ref2Name: "", ref2Address: "", ref2Phone: "",
    cv: null, cvName: "",
    experienceDoc: null, experienceDocName: "",
    academicDoc: null, academicDocName: "",
  };
}

/* ── Helpers ── */

function handlePhotoChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setForm: React.Dispatch<React.SetStateAction<AppFormData>>
) {
  const file = e.target.files?.[0];
  if (!file) return;
  const preview = URL.createObjectURL(file);
  setForm((prev) => ({ ...prev, photo: file, photoPreview: preview }));
}

function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  key: "cv" | "experienceDoc" | "academicDoc",
  nameKey: "cvName" | "experienceDocName" | "academicDocName",
  setForm: React.Dispatch<React.SetStateAction<AppFormData>>
) {
  const file = e.target.files?.[0];
  if (!file) return;
  setForm((prev) => ({ ...prev, [key]: file, [nameKey]: file.name }));
}

function FileUpload({
  label,
  name,
  accept,
  fileName,
  onChange,
}: {
  label: string;
  name: string;
  accept: string;
  fileName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      <div
        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {fileName ? (
          <p className="text-xs text-primary font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fileName}
          </p>
        ) : (
          <div>
            <svg className="w-6 h-6 text-muted mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-[11px] text-muted">{"Drag & drop or click to browse"}</p>
          </div>
        )}
        <input ref={inputRef} type="file" name={name} accept={accept} className="hidden" onChange={onChange} />
      </div>
    </div>
  );
}

/* ── Table Section ── */

function DynamicTable({
  title,
  columns,
  rows,
  onChange,
  onAdd,
  onRemove,
  t,
}: {
  title: string;
  columns: { key: string; label: string }[];
  rows: TableRow[];
  onChange: (id: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  t: Record<string, string>;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-heading font-bold text-primary">{title}</h4>
        <button type="button" onClick={onAdd} className="text-xs text-secondary hover:text-secondary-dark font-semibold flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t.addRow}
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="p-3 rounded-xl bg-surface border border-border relative">
            {rows.length > 1 && (
              <button type="button" onClick={() => onRemove(row.id)} className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors" aria-label="Remove">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <div key={col.key} className={col.key === "organization" || col.key === "institution" || col.key === "title" ? "col-span-2" : ""}>
                  <label className="block text-[11px] text-muted mb-0.5">{col.label}</label>
                  <input
                    type={col.key.toLowerCase().includes("date") ? "date" : "text"}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onChange(row.id, col.key, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder={col.label}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function ApplicationForm({ job, locale, t, onClose, schoolName }: ApplicationFormProps) {
  const resolved = resolveJob(job, locale);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AppFormData>(emptyForm());
  const af = t.applicationForm;

  const isTeaching = job.category.en === "Teaching";

  const update = (field: keyof AppFormData, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  /* ── Table helpers ── */
  const addRow = (key: "workExperience" | "educationHistory" | "trainings", fields: string[]) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], emptyRow(Date.now() + Math.random(), fields)] }));
  };
  const removeRow = (key: "workExperience" | "educationHistory" | "trainings", id: number) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((r) => r.id !== id) }));
  };
  const changeRow = (key: "workExperience" | "educationHistory" | "trainings", id: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileName = `career-applications/${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { data, error } = await supabase.storage.from("media").upload(fileName, file, { upsert: true });
    if (error) {
      console.error("Upload failed:", error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      let cvUrl: string | null = null;
      const docUrls: string[] = [];

      if (form.photo) {
        photoUrl = await uploadFile(form.photo, "photos");
      }
      if (form.cv) {
        cvUrl = await uploadFile(form.cv, "cvs");
      }
      if (form.experienceDoc) {
        const url = await uploadFile(form.experienceDoc, "docs");
        if (url) docUrls.push(url);
      }
      if (form.academicDoc) {
        const url = await uploadFile(form.academicDoc, "docs");
        if (url) docUrls.push(url);
      }

      const experienceData = form.workExperience.filter((r) => r.organization || r.position);
      const educationData = form.educationHistory.filter((r) => r.institution || r.degree);
      const trainingData = form.trainings.filter((r) => r.institution || r.title);

      const { error } = await supabase.from("career_applications").insert({
        job_id: String(job.id),
        job_title: resolved.title,
        full_name: stripHtml(form.fullName),
        email: stripHtml(form.email),
        phone: stripHtml(form.phone || ""),
        address: stripHtml(form.address || ""),
        dob: form.dateOfBirth || null,
        nationality: stripHtml(form.nationality || ""),
        place_of_birth: stripHtml(form.placeOfBirth || ""),
        gender: form.gender || null,
        marital_status: form.maritalStatus || null,
        dependents: form.dependents || null,
        degree: stripHtml(form.highestEducation || ""),
        major_subject: stripHtml(form.majorSubject || ""),
        experience_years: experienceData.length,
        subjects: stripHtml(form.interestedSubjects || ""),
        grades: stripHtml(form.gradeLevel || ""),
        cv_url: cvUrl,
        photo_url: photoUrl,
        documents_url: docUrls,
        cover_letter: stripHtml(form.whyWorkWithUs),
        form_data: {
          workExperience: experienceData.map((r) => ({
            ...r,
            organization: r.organization ? stripHtml(r.organization) : r.organization,
            position: r.position ? stripHtml(r.position) : r.position,
          })),
          educationHistory: educationData.map((r) => ({
            ...r,
            institution: r.institution ? stripHtml(r.institution) : r.institution,
            degree: r.degree ? stripHtml(r.degree) : r.degree,
            major: r.major ? stripHtml(r.major) : r.major,
          })),
          trainings: trainingData.map((r) => ({
            ...r,
            institution: r.institution ? stripHtml(r.institution) : r.institution,
            title: r.title ? stripHtml(r.title) : r.title,
          })),
          challengesFaced: stripHtml(form.challengesFaced),
          thoughtsOnEducation: stripHtml(form.thoughtsOnEducation),
          specialInterests: stripHtml(form.specialInterests),
          healthDetails: stripHtml(form.healthDetails),
          references: [
            { name: stripHtml(form.ref1Name), address: stripHtml(form.ref1Address), phone: stripHtml(form.ref1Phone) },
            { name: stripHtml(form.ref2Name), address: stripHtml(form.ref2Address), phone: stripHtml(form.ref2Phone) },
          ],
        },
      });

      if (error) {
        console.error("Submission error:", error.message);
        alert("Failed to submit application. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const steps = [af.stepPersonal, af.stepExperience, af.stepSubjective, af.stepUpload];

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-fadein">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-heading font-bold text-primary mb-2">{af.applicationSubmitted}</h3>
          <p className="text-sm text-muted mb-6">{af.thankYouMessage}</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            {af.backToVacancies}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 pb-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto animate-fadein">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-border px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-heading font-bold text-primary uppercase tracking-wide">
                {schoolName}
              </h2>
              <p className="text-xs text-muted">{resolved.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted transition-colors" aria-label="Close">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {steps.map((label, i) => (
              <div key={i} className="flex-1 flex items-center gap-1">
                <div className={`flex-1 h-2 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
                {i < steps.length - 1 && <div className="w-2" />}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-primary font-semibold mt-2 text-center">{steps[step]}</p>
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* ──────────────────────────── STEP 0: Personal ──────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Photo */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">{af.photoUpload}</p>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-32 rounded-xl bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                    {form.photoPreview ? (
                      <Image src={form.photoPreview} alt="Photo preview" width={96} height={128} className="object-cover w-full h-full" />
                    ) : (
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <label className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                    {af.uploadPhoto}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, setForm)} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">{af.fullName}</label>
                  <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.nationality}</label>
                  <input type="text" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Nepali" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.email}</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.phone}</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="98XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.dateOfBirth}</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">{af.address}</label>
                  <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Enter your address" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.placeOfBirth}</label>
                  <input type="text" value={form.placeOfBirth} onChange={(e) => update("placeOfBirth", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="City / District" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.gender}</label>
                  <div className="flex gap-4 py-2">
                    {["male", "female", "other"].map((g) => (
                      <label key={g} className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                        <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={(e) => update("gender", e.target.value)} className="accent-primary" />
                        {g === "male" ? af.genderMale : g === "female" ? af.genderFemale : af.genderOther}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.maritalStatus}</label>
                  <select value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                    <option value="">{af.maritalStatusSelect}</option>
                    <option value="married">{af.married}</option>
                    <option value="unmarried">{af.unmarried}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{af.noOfDependents}</label>
                  <input type="number" min="0" value={form.dependents} onChange={(e) => update("dependents", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="0" />
                </div>
              </div>

              {/* Teaching only section */}
              {isTeaching && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs font-heading font-bold text-primary mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {af.teachingInfo}
                  </p>
                  <p className="text-[11px] text-muted mb-3 -mt-1">{af.teachingInfoNote}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{af.gradeLevel}</label>
                      <input type="text" value={form.gradeLevel} onChange={(e) => update("gradeLevel", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Primary / Secondary / +2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{af.interestedSubjects}</label>
                      <input type="text" value={form.interestedSubjects} onChange={(e) => update("interestedSubjects", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Math, Science, English" />
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Summary */}
              <div>
                <h4 className="text-sm font-heading font-bold text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {af.highestEducation}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-muted mb-0.5">{af.highestEducation}</label>
                    <input type="text" value={form.highestEducation} onChange={(e) => update("highestEducation", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Master's Degree" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted mb-0.5">{af.majorSubject}</label>
                    <input type="text" value={form.majorSubject} onChange={(e) => update("majorSubject", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Mathematics" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────── STEP 1: Experience ──────────────────────────── */}
          {step === 1 && (
            <div className="space-y-2">
              <DynamicTable
                title={af.workExperience}
                columns={[
                  { key: "organization", label: af.organization },
                  { key: "position", label: af.position },
                  { key: "fromDate", label: af.fromDate },
                  { key: "toDate", label: af.toDate },
                ]}
                rows={form.workExperience}
                onChange={(id, field, value) => changeRow("workExperience", id, field, value)}
                onAdd={() => addRow("workExperience", ["organization", "position", "fromDate", "toDate"])}
                onRemove={(id) => removeRow("workExperience", id)}
                t={af}
              />

              <DynamicTable
                title={af.educationHistory}
                columns={[
                  { key: "institution", label: af.organization },
                  { key: "degree", label: af.degree },
                  { key: "major", label: af.majorSubject },
                  { key: "fromDate", label: af.fromDate },
                  { key: "toDate", label: af.toDate },
                ]}
                rows={form.educationHistory}
                onChange={(id, field, value) => changeRow("educationHistory", id, field, value)}
                onAdd={() => addRow("educationHistory", ["institution", "degree", "major", "fromDate", "toDate"])}
                onRemove={(id) => removeRow("educationHistory", id)}
                t={af}
              />

              <DynamicTable
                title={af.trainings}
                columns={[
                  { key: "institution", label: af.organization },
                  { key: "title", label: af.titleProgram },
                  { key: "fromDate", label: af.fromDate },
                  { key: "toDate", label: af.toDate },
                ]}
                rows={form.trainings}
                onChange={(id, field, value) => changeRow("trainings", id, field, value)}
                onAdd={() => addRow("trainings", ["institution", "title", "fromDate", "toDate"])}
                onRemove={(id) => removeRow("trainings", id)}
                t={af}
              />
            </div>
          )}

          {/* ──────────────────────────── STEP 2: Subjective ──────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{af.whyWorkWithUs}</label>
                <textarea value={form.whyWorkWithUs} onChange={(e) => update("whyWorkWithUs", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y" placeholder={af.whyWorkWithUs} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{af.challengesFaced}</label>
                <textarea value={form.challengesFaced} onChange={(e) => update("challengesFaced", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y" placeholder={af.challengesFaced} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{af.thoughtsOnEducation}</label>
                <textarea value={form.thoughtsOnEducation} onChange={(e) => update("thoughtsOnEducation", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y" placeholder={af.thoughtsOnEducation} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{af.specialInterests}</label>
                <textarea value={form.specialInterests} onChange={(e) => update("specialInterests", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y" placeholder={af.specialInterests} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{af.healthDetails}</label>
                <textarea value={form.healthDetails} onChange={(e) => update("healthDetails", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y" placeholder={af.healthDetails} />
              </div>

              {/* References */}
              <div>
                <h4 className="text-sm font-heading font-bold text-primary mb-3">{af.references}</h4>
                {[
                  {
                    label: af.reference1,
                    name: form.ref1Name, address: form.ref1Address, phone: form.ref1Phone,
                    nameKey: "ref1Name" as const, addrKey: "ref1Address" as const, phoneKey: "ref1Phone" as const,
                  },
                  {
                    label: af.reference2,
                    name: form.ref2Name, address: form.ref2Address, phone: form.ref2Phone,
                    nameKey: "ref2Name" as const, addrKey: "ref2Address" as const, phoneKey: "ref2Phone" as const,
                  },
                ].map((r) => (
                  <div key={r.label} className="mb-3 last:mb-0">
                    <p className="text-xs font-semibold text-foreground mb-2">{r.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-muted mb-0.5">{af.refereeName}</label>
                        <input type="text" value={r.name} onChange={(e) => update(r.nameKey, e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted mb-0.5">{af.refereeAddress}</label>
                        <input type="text" value={r.address} onChange={(e) => update(r.addrKey, e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted mb-0.5">{af.refereePhone}</label>
                        <input type="tel" value={r.phone} onChange={(e) => update(r.phoneKey, e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────────────────── STEP 3: Upload ──────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h4 className="text-sm font-heading font-bold text-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {af.documentUpload}
              </h4>
              <p className="text-[11px] text-muted -mt-3 mb-1">{af.supportedFormats}</p>

              <FileUpload
                label={af.cvUpload}
                name="cv"
                accept=".pdf,.doc,.docx"
                fileName={form.cvName}
                onChange={(e) => handleFileChange(e, "cv", "cvName", setForm)}
              />
              <FileUpload
                label={af.experienceLetters}
                name="experience"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                fileName={form.experienceDocName}
                onChange={(e) => handleFileChange(e, "experienceDoc", "experienceDocName", setForm)}
              />
              <FileUpload
                label={af.academicCertificates}
                name="academic"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                fileName={form.academicDocName}
                onChange={(e) => handleFileChange(e, "academicDoc", "academicDocName", setForm)}
              />
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="border-t border-border px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            {af.backToVacancies}
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-surface transition-all"
              >
                {af.previous}
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
              >
                {af.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-dark transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? af.submitting : af.submitApplication}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
