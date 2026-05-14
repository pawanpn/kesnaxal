"use client";

import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import EditableElement from "@/components/admin/EditableElement";
import EditableImage from "@/components/admin/EditableImage";
import IconBox from "@/components/ui/IconBox";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function AcademicsPage() {
  const { academicLevels, faculty } = useDynamicContent();

  return (
    <div className="min-h-screen">
      <PageHero pageKey="academics" />

      {academicLevels.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="container-custom space-y-16">
            {academicLevels.map((level) => (
              <div key={level.id} id={level.id} className="scroll-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="relative h-60 lg:h-80 rounded-2xl overflow-hidden bg-surface">
                    <EditableImage
                      section="academics"
                      contentKey={`level_${level.id}_image`}
                      src={level.image}
                      alt={level.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <span className="text-primary text-sm font-semibold">
                      <EditableElement
                        section="academics"
                        contentKey={`level_${level.id}_grades`}
                        value={{ en: level.grades, ne: level.grades, ja: level.grades }}
                        as="span"
                      />
                    </span>
                    <SectionHeading
                      title={
                        <EditableElement
                          section="academics"
                          contentKey={`level_${level.id}_title`}
                          value={{ en: level.title, ne: level.title, ja: level.title }}
                          as="span"
                        />
                      }
                    />
                    <p className="text-muted leading-relaxed mb-6">
                      <EditableElement
                        section="academics"
                        contentKey={`level_${level.id}_desc`}
                        value={{ en: level.desc, ne: level.desc, ja: level.desc }}
                        as="span"
                        rich
                      />
                    </p>

                    {!!(level.subjects && level.subjects.length > 0) && (
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-3">Core Subjects</h4>
                        <div className="flex flex-wrap gap-2">
                          {(level.subjects ?? []).map((s) => <span key={s} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>)}
                        </div>
                      </div>
                    )}

                    {!!(level.streams && level.streams.length > 0) && level.streams!.map((stream) => (
                      <div key={stream.name} className="mb-4">
                        <h4 className="font-semibold text-foreground text-sm mb-2">{stream.name} Stream</h4>
                        <div className="flex flex-wrap gap-2">
                          {stream.subjects.map((s) => <span key={s} className="bg-secondary/20 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {faculty.length > 0 && (
        <section id="faculty" className="py-12 lg:py-16 bg-surface scroll-mt-24">
          <div className="container-custom">
            <SectionHeading title="Faculty & Staff" align="center" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {faculty.map((f, idx) => (
                <div key={f.name} className="bg-white rounded-xl p-5 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                  <IconBox icon={<span className="text-primary font-heading font-bold text-xl">{f.name.split(" ").pop()?.charAt(0)}</span>} />
                  <h4 className="font-semibold text-sm text-foreground">
                    <EditableElement
                      section="faculty"
                      contentKey={`faculty_${idx}_name`}
                      value={{ en: f.name, ne: f.name, ja: f.name }}
                      as="span"
                    />
                  </h4>
                  <p className="text-xs text-primary font-medium">
                    <EditableElement
                      section="faculty"
                      contentKey={`faculty_${idx}_role`}
                      value={{ en: f.role, ne: f.role, ja: f.role }}
                      as="span"
                    />
                  </p>
                  <p className="text-xs text-muted mt-1">
                    <EditableElement
                      section="faculty"
                      contentKey={`faculty_${idx}_dept`}
                      value={{ en: f.dept, ne: f.dept, ja: f.dept }}
                      as="span"
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {academicLevels.length === 0 && faculty.length === 0 && (
        <section className="py-20 text-center">
          <p className="text-muted text-sm">Academic content will appear here once added by the admin.</p>
        </section>
      )}
    </div>
  );
}
