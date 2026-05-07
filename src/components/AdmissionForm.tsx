"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const admissionSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  studentClass: z.string().min(1, "Class is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  parentPhone: z
    .string()
    .min(10, "Valid phone number required")
    .max(15, "Valid phone number required"),
  parentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

const steps = [
  { id: 1, label: "Student Info" },
  { id: 2, label: "Parent Info" },
  { id: 3, label: "Uploads" },
  { id: 4, label: "Review" },
];

const classOptions = [
  "Nursery", "LKG", "UKG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11 Science", "Grade 11 Management", "Grade 12 Science", "Grade 12 Management",
];

export default function AdmissionForm() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [marksheet, setMarksheet] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      gender: "male",
    },
  });

  const allFields = watch();

  const validateStep = async () => {
    if (step === 1) {
      return trigger(["studentName", "studentClass", "dob", "gender"]);
    }
    if (step === 2) {
      return trigger(["fatherName", "motherName", "parentPhone", "address"]);
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleMarksheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMarksheet(file);
  };

  const onSubmit = (data: AdmissionFormData) => {
    const formData = {
      ...data,
      photo: photo?.name || null,
      marksheet: marksheet?.name || null,
      submittedAt: new Date().toISOString(),
    };
    console.log("Admission Form Data:", formData);
    setShowSuccess(true);
  };

  const closeModal = () => {
    setShowSuccess(false);
    reset();
    setPhoto(null);
    setMarksheet(null);
    setPhotoPreview(null);
    setStep(1);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-border p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step >= s.id
                    ? "bg-primary border-primary text-white"
                    : "border-border text-muted"
                }`}
              >
                {step > s.id ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-muted"}`}>
                {s.label}
              </span>
              {s.id < 4 && <div className="w-8 h-0.5 bg-border shrink-0" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 1 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="text-lg font-heading font-bold text-primary">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                  <input
                    {...register("studentName")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="Student's full name"
                  />
                  {errors.studentName && (
                    <p className="text-accent text-xs mt-1">{errors.studentName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Class *</label>
                  <select
                    {...register("studentClass")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-white"
                  >
                    <option value="">Select class</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.studentClass && (
                    <p className="text-accent text-xs mt-1">{errors.studentClass.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    {...register("dob")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                  />
                  {errors.dob && (
                    <p className="text-accent text-xs mt-1">{errors.dob.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gender *</label>
                  <div className="flex gap-4 py-2">
                    {(["male", "female", "other"] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={g}
                          {...register("gender")}
                          className="accent-primary"
                        />
                        <span className="text-sm capitalize">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="text-lg font-heading font-bold text-primary">Parent Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Father&apos;s Name *</label>
                  <input
                    {...register("fatherName")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="Father's full name"
                  />
                  {errors.fatherName && (
                    <p className="text-accent text-xs mt-1">{errors.fatherName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mother&apos;s Name *</label>
                  <input
                    {...register("motherName")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="Mother's full name"
                  />
                  {errors.motherName && (
                    <p className="text-accent text-xs mt-1">{errors.motherName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                  <input
                    {...register("parentPhone")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="e.g. 9841123456"
                  />
                  {errors.parentPhone && (
                    <p className="text-accent text-xs mt-1">{errors.parentPhone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    {...register("parentEmail")}
                    type="email"
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="Email (optional)"
                  />
                  {errors.parentEmail && (
                    <p className="text-accent text-xs mt-1">{errors.parentEmail.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Address *</label>
                  <input
                    {...register("address")}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                    placeholder="Full address"
                  />
                  {errors.address && (
                    <p className="text-accent text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="text-lg font-heading font-bold text-primary">Document Upload</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Student Photo</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover mx-auto"
                        />
                      ) : (
                        <div>
                          <svg className="w-10 h-10 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          <p className="text-sm text-muted">Click to upload photo</p>
                        </div>
                      )}
                      {photo && <p className="text-xs text-primary mt-1">{photo.name}</p>}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Previous Marksheet</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleMarksheetChange}
                      className="hidden"
                      id="marksheet-upload"
                    />
                    <label htmlFor="marksheet-upload" className="cursor-pointer">
                      <svg className="w-10 h-10 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-sm text-muted">Click to upload marksheet</p>
                      <p className="text-xs text-muted mt-1">PDF, JPG, or PNG</p>
                    </label>
                    {marksheet && <p className="text-xs text-primary mt-1">{marksheet.name}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="text-lg font-heading font-bold text-primary">Review Your Application</h3>
              <div className="bg-surface rounded-lg p-5 space-y-3 text-sm">
                <h4 className="font-heading font-bold text-primary border-b border-border pb-2">
                  Student Info
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted">Name:</span> {allFields.studentName}</div>
                  <div><span className="text-muted">Class:</span> {allFields.studentClass}</div>
                  <div><span className="text-muted">DOB:</span> {allFields.dob}</div>
                  <div><span className="text-muted">Gender:</span> {allFields.gender}</div>
                </div>

                <h4 className="font-heading font-bold text-primary border-b border-border pb-2 mt-4">
                  Parent Info
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted">Father:</span> {allFields.fatherName}</div>
                  <div><span className="text-muted">Mother:</span> {allFields.motherName}</div>
                  <div><span className="text-muted">Phone:</span> {allFields.parentPhone}</div>
                  <div><span className="text-muted">Email:</span> {allFields.parentEmail || "N/A"}</div>
                  <div className="col-span-2"><span className="text-muted">Address:</span> {allFields.address}</div>
                </div>

                <h4 className="font-heading font-bold text-primary border-b border-border pb-2 mt-4">
                  Documents
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted">Photo:</span> {photo?.name || "Not uploaded"}</div>
                  <div><span className="text-muted">Marksheet:</span> {marksheet?.name || "Not uploaded"}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadein">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-primary mb-2">
              Application Submitted!
            </h3>
            <p className="text-muted text-sm mb-6">
              Thank you for your application. We will review your details and contact you within 3 business days.
            </p>
            <button
              onClick={closeModal}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
