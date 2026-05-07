"use client";

import PageHero from "@/components/ui/PageHero";
import AdmissionForm from "@/components/sections/AdmissionForm";

export default function AdmissionPage() {
  return (
    <div className="min-h-screen">
      <PageHero title="Online Admission" subtitle="Begin your child's journey of excellence at Kathmandu English School." />

      <section className="py-12 lg:py-16 bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Eligibility", desc: "Students aged 3+ for Nursery up to Grade 12. Academic records required for Grade 2 and above.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Documents Required", desc: "Birth certificate, previous marksheets, passport-size photos, and parent ID copies.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "Entry Test", desc: "Grade 1 and above require an aptitude test. Results declared within 3 working days.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="text-primary w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <AdmissionForm />
        </div>
      </section>
    </div>
  );
}
