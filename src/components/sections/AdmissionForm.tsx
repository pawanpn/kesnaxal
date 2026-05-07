"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";

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

const steps = [
  { id: 1, label: "Student Information", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: 2, label: "Parent / Guardian", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: 3, label: "Contact Details", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

const classOptions = [
  "Nursery", "LKG", "UKG", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11 Science", "Grade 11 Management", "Grade 12 Science", "Grade 12 Management",
];

export default function AdmissionForm() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, reset, formState: { errors } } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

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
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">Student Information</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name <span className="text-accent">*</span></label>
                  <input {...register("studentName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Enter student's full name" />
                  {errors.studentName && <p className="text-accent text-xs mt-1">{errors.studentName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Date of Birth <span className="text-accent">*</span></label>
                  <input type="date" {...register("dob")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" />
                  {errors.dob && <p className="text-accent text-xs mt-1">{errors.dob.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Applying For Class <span className="text-accent">*</span></label>
                  <select {...register("studentClass")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-white">
                    <option value="">Select class</option>
                    {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.studentClass && <p className="text-accent text-xs mt-1">{errors.studentClass.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadein space-y-5">
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">Parent / Guardian Details</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Father&apos;s Name <span className="text-accent">*</span></label>
                  <input {...register("fatherName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Enter father's full name" />
                  {errors.fatherName && <p className="text-accent text-xs mt-1">{errors.fatherName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Mother&apos;s Name <span className="text-accent">*</span></label>
                  <input {...register("motherName")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Enter mother's full name" />
                  {errors.motherName && <p className="text-accent text-xs mt-1">{errors.motherName.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Parent / Guardian Occupation</label>
                  <input {...register("parentOccupation")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="e.g. Teacher, Business, Engineer" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadein space-y-5">
              <div className="flex items-center gap-3 mb-2"><span className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-heading font-bold text-primary">Contact Information</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number <span className="text-accent">*</span></label>
                  <input {...register("parentPhone")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="e.g. 9841123456" />
                  {errors.parentPhone && <p className="text-accent text-xs mt-1">{errors.parentPhone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <input {...register("parentEmail")} type="email" className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="parent@email.com" />
                  {errors.parentEmail && <p className="text-accent text-xs mt-1">{errors.parentEmail.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Address <span className="text-accent">*</span></label>
                  <input {...register("address")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Enter full street address" />
                  {errors.address && <p className="text-accent text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">City <span className="text-accent">*</span></label>
                  <input {...register("city")} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="e.g. Kathmandu" />
                  {errors.city && <p className="text-accent text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-foreground">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Back
              </button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md">
                Continue <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <><Spinner /> Submitting...</> : "Submit Application"}
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
            <h2 className="text-2xl font-heading font-bold text-primary mb-2">Application Submitted!</h2>
            <p className="text-muted text-sm mb-6">Thank you for applying to Kathmandu English School. Our admissions team will contact you within 3 business days.</p>
            <button onClick={closeSuccess} className="w-full px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">Done</button>
          </div>
        </div>
      )}
    </>
  );
}
