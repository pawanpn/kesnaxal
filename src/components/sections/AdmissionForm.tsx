"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { useT } from "@/hooks/useLocale";

const admissionSchema = z.object({
  studentName: z.string().min(2, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  studentClass: z.string().min(1, "Class is required"),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  parentOccupation: z.string().optional(),
  parentPhone: z.string().min(10, "Valid phone number required").max(15, "Valid phone number required"),
  parentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionForm() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, reset, formState: { errors } } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

  const steps = [
    { id: 1, label: t.admission.studentInformation, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: 2, label: t.admission.parentGuardian, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: 3, label: t.admission.contactDetails, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  const classOptions = [
    { value: "Nursery", label: t.admission.nursery },
    { value: "LKG", label: t.admission.lkg },
    { value: "UKG", label: t.admission.ukg },
    { value: "Grade 1", label: t.admission.grade1 },
    { value: "Grade 2", label: t.admission.grade2 },
    { value: "Grade 3", label: t.admission.grade3 },
    { value: "Grade 4", label: t.admission.grade4 },
    { value: "Grade 5", label: t.admission.grade5 },
    { value: "Grade 6", label: t.admission.grade6 },
    { value: "Grade 7", label: t.admission.grade7 },
    { value: "Grade 8", label: t.admission.grade8 },
    { value: "Grade 9", label: t.admission.grade9 },
    { value: "Grade 10", label: t.admission.grade10 },
    { value: "Grade 11 Science", label: t.admission.grade11 },
    { value: "Grade 11 Management", label: t.admission.grade12 },
    { value: "Grade 12 Science", label: t.admission.grade11b },
    { value: "Grade 12 Management", label: t.admission.grade12b },
  ];

  const validateStep = async (): Promise<boolean> => {
    if (step === 1) return trigger(["studentName", "dob", "studentClass"]);
    if (step === 2) return trigger(["fatherName", "motherName"]);
    if (step === 3) return trigger(["parentPhone", "address", "city"]);
    return true;
  };

  const handleNext = async () => { const valid = await validateStep(); if (valid) setStep((s) => Math.min(s + 1, 3)); };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
    console.log("Admission Form Submitted:", data);
  };

  const closeSuccess = () => { setShowSuccess(false); reset(); setStep(1); };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-border p-6 lg:p-8">
        <div className="flex items-center justify-between mb-10">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > s.id ? "bg-green-500 border-green-500 text-white" : step === s.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/25" : "border-border text-muted bg-surface"
                }`}>
                  {step > s.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                  )}
                </div>
                <span className={`text-[11px] font-medium whitespace-nowrap ${step >= s.id ? "text-primary" : "text-muted"}`}>{s.label}</span>
              </div>
              {s.id < 3 && <div className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${step > s.id ? "bg-green-500" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 1 && (
            <div className="animate-fadein space-y-5">
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">{t.admission.studentInformation}</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.fullName}</label>
                  <input {...register("studentName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.fullNamePlaceholder} />
                  {errors.studentName && <p className="text-accent text-xs mt-1">{errors.studentName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.dateOfBirth}</label>
                  <input type="date" {...register("dob")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" />
                  {errors.dob && <p className="text-accent text-xs mt-1">{errors.dob.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.applyingForClass}</label>
                  <select {...register("studentClass")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-white">
                    <option value="">{t.admission.selectClass}</option>
                    {classOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.studentClass && <p className="text-accent text-xs mt-1">{errors.studentClass.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadein space-y-5">
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">{t.admission.parentGuardianDetails}</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.fathersName}</label>
                  <input {...register("fatherName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.fathersNamePlaceholder} />
                  {errors.fatherName && <p className="text-accent text-xs mt-1">{errors.fatherName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.mothersName}</label>
                  <input {...register("motherName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.mothersNamePlaceholder} />
                  {errors.motherName && <p className="text-accent text-xs mt-1">{errors.motherName.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.occupation}</label>
                  <input {...register("parentOccupation")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.occupationPlaceholder} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadein space-y-5">
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">{t.admission.contactInformation}</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.phoneNumber}</label>
                  <input {...register("parentPhone")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.phonePlaceholder} />
                  {errors.parentPhone && <p className="text-accent text-xs mt-1">{errors.parentPhone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.emailAddress}</label>
                  <input {...register("parentEmail")} type="email" className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.emailPlaceholder} />
                  {errors.parentEmail && <p className="text-accent text-xs mt-1">{errors.parentEmail.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.address}</label>
                  <input {...register("address")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.addressPlaceholder} />
                  {errors.address && <p className="text-accent text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{t.admission.city}</label>
                  <input {...register("city")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.admission.cityPlaceholder} />
                  {errors.city && <p className="text-accent text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-foreground">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>{t.admission.back}
              </button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md">
                {t.admission.continue} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <><Spinner /> {t.admission.submitting}</> : t.admission.submitApplication}
              </button>
            )}
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadein">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-primary mb-2">{t.admission.applicationSubmitted}</h2>
            <p className="text-muted text-sm mb-6">{t.admission.thankYouMessage}</p>
            <button onClick={closeSuccess} className="w-full px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">{t.admission.done}</button>
          </div>
        </div>
      )}
    </>
  );
}
