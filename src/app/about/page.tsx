"use client";


import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import ValueCards from "@/components/sections/ValueCards";
import OptimizedImage from "@/components/ui/OptimizedImage";
import EditableElement from "@/components/admin/EditableElement";
import EditableImage from "@/components/admin/EditableImage";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import type { ValueCard } from "@/types";

const values: ValueCard[] = [
  {
    title: "Academic Excellence",
    desc: "Rigorous curriculum with a focus on critical thinking, creativity, and lifelong learning skills.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  },
  {
    title: "Character Building",
    desc: "Instilling integrity, discipline, empathy, and respect through every interaction and program.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  },
  {
    title: "Holistic Development",
    desc: "Sports, arts, cultural programs, and leadership opportunities for all-round student growth.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.91 6.023 6.023 0 01-2.77-.91" /></svg>,
  },
  {
    title: "Global Perspective",
    desc: "Exchange programs, international curriculum standards, and exposure to diverse cultures and ideas.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  },
];

export default function AboutPage() {
  const { school } = useDynamicContent();
  return (
    <div className="min-h-screen">
      <PageHero pageKey="about" />

      <section className="py-12 lg:py-16">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeading
              title={
                <EditableElement
                  section="school"
                  contentKey="name"
                  value={{ en: school.name, ne: school.name, ja: school.name }}
                  as="span"
                />
              }
            />
            <p className="text-muted leading-relaxed mb-4">
              <EditableElement
                section="school"
                contentKey="history"
                value={{ en: school.history, ne: school.history, ja: school.history }}
                as="span"
                rich
              />
            </p>
            <p className="text-muted leading-relaxed mb-4">
              <EditableElement
                section="school"
                contentKey="principal_message"
                value={{ en: school.principal.message, ne: school.principal.message, ja: school.principal.message }}
                as="span"
                rich
              />
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted">Established:</span>{" "}
                <strong>
                  <EditableElement
                    section="school"
                    contentKey="established"
                    value={{ en: String(school.established), ne: String(school.established), ja: String(school.established) }}
                    as="span"
                  />
                </strong>
              </div>
              <div>
                <span className="text-muted">Principal:</span>{" "}
                <strong>
                  <EditableElement
                    section="school"
                    contentKey="principal_name"
                    value={{ en: school.principal.name, ne: school.principal.name, ja: school.principal.name }}
                    as="span"
                  />
                </strong>
              </div>
            </div>
          </div>
          <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-surface">
            <EditableImage
              section="about"
              contentKey="school_image"
              src="/images/school_building.jpg"
              alt="School Building"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <ValueCards cards={values} title="Our Core Values" />
    </div>
  );
}
