import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import AdmissionsForm from "@/components/sections/AdmissionForm";

export const metadata: Metadata = {
  title: "Admissions",
  description: "Apply for admission to Kathmandu English School. Online and in-person applications open.",
};

const admissionsInfo = [
  {
    title: "Eligibility",
    desc: "Students aged 3+ for Nursery up to Grade 11. Previous academic records required for Grade 2 and above.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: "Required Documents",
    desc: "Birth certificate, transfer certificate (if applicable), previous marksheets, passport-size photos (x4), parent ID copies.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    title: "Fee Structure",
    desc: "Competitive fees with sibling discounts and merit-based scholarships. Detailed breakdown provided upon application.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: "Entry Test",
    desc: "Grade 1 and above require a basic aptitude test. Results declared within 3 working days after the examination.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
];

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen">
      <PageHero title="Admissions" subtitle="Begin your child's journey of excellence at KES" />

      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {admissionsInfo.map((item) => (
              <div key={item.title} className="bg-surface rounded-xl p-6 text-center border border-border">
                <div className="text-primary w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">{item.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-heading font-bold text-primary text-center mb-8">Online Admission Form</h2>
          <AdmissionsForm />
        </div>
      </section>
    </div>
  );
}
