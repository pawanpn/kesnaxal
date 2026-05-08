"use client";

import { useState } from "react";
import PageHero from "@/components/ui/PageHero";
import JobCard from "@/components/sections/JobCard";
import ApplicationForm from "@/components/sections/ApplicationForm";
import type { JobVacancy } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { resolveJob } from "@/lib/translate";

function formatDateLocale(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ne: "ne-NP",
    ja: "ja-JP",
  };
  return date.toLocaleDateString(localeMap[locale] || "en-US", options);
}

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobVacancy | null>(null);
  const { locale, t } = useLocale();
  const { jobVacancies: jobs, school } = useDynamicContent();
  const activeJobs = jobs.filter((j) => j.isActive);

  const toggleDetails = (job: JobVacancy) => {
    setSelectedJob((prev) => (prev?.id === job.id ? null : job));
  };

  const handleApply = (job: JobVacancy) => {
    setApplyingJob(job);
  };

  return (
    <div className="min-h-screen">
      <PageHero pageKey="careers" />

      <section className="py-12 lg:py-16">
        <div className="container-custom">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: t.careers.openPositions, value: activeJobs.length.toString(), icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", bg: "bg-primary/5" },
              { label: t.careers.departments, value: [...new Set(activeJobs.map((j) => resolveJob(j, "en").category))].length.toString(), icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", bg: "bg-secondary/10" },
              { label: t.careers.totalVacancies, value: activeJobs.reduce((s, j) => s + j.vacancies, 0).toString(), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", bg: "bg-accent/5" },
              { label: t.careers.location, value: t.careers.kathmandu, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", bg: "bg-primary/5" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-border`}>
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {stat.icon.split(" M").map((p, i) => (
                      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={`M${p}`} />
                    ))}
                  </svg>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Listing */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-lg font-heading font-bold text-primary">{t.careers.availablePositions}</h2>
              </div>

              {activeJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-border">
                  <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-muted text-sm">{t.careers.noOpenPositions}</p>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    locale={locale}
                    t={t}
                    onToggleDetails={toggleDetails}
                    onApply={handleApply}
                  />
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              {selectedJob ? (() => {
                const resolvedSelected = resolveJob(selectedJob, locale);
                return (
                  <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 lg:sticky lg:top-24 animate-fadein">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider">
                        {t.careers.jobDetails}
                      </h3>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface text-muted transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        { label: t.careers.jobTitle, value: resolvedSelected.title },
                        { label: t.careers.category, value: resolvedSelected.category },
                        { label: t.careers.jobLevel, value: resolvedSelected.level },
                        { label: t.careers.experience, value: resolvedSelected.experience },
                        { label: t.careers.salary, value: resolvedSelected.salary },
                        { label: t.careers.noOfVacancies, value: selectedJob.vacancies.toString() },
                        { label: t.careers.workStation, value: resolvedSelected.workstation },
                        { label: t.careers.addedOn, value: formatDateLocale(new Date(selectedJob.addedOn), locale, { day: "numeric", month: "long", year: "numeric" }) },
                        { label: t.careers.applyBefore, value: formatDateLocale(new Date(selectedJob.expiresOn), locale, { day: "numeric", month: "long", year: "numeric" }) },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
                          <span className="text-xs text-muted shrink-0">{row.label}</span>
                          <span className="text-xs font-medium text-foreground text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-sm text-primary mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {t.careers.responsibilities}
                      </h4>
                      <ul className="space-y-2">
                        {resolvedSelected.responsibilities.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted">
                            <span className="text-primary mt-1 shrink-0">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleApply(selectedJob)}
                      className="w-full mt-6 px-6 py-3 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent-dark transition-colors shadow-sm"
                    >
                      {t.careers.applyForPosition}
                    </button>
                  </div>
                );
              })() : (
                <div className="bg-surface rounded-2xl border border-border p-8 text-center lg:sticky lg:top-24">
                  <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-muted text-sm">{t.careers.clickViewDetails}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {applyingJob && (
        <ApplicationForm
          job={applyingJob}
          locale={locale}
          t={t}
          onClose={() => setApplyingJob(null)}
          schoolName={school.name}
        />
      )}
    </div>
  );
}
