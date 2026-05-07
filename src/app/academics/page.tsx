import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import OptimizedImage from "@/components/ui/OptimizedImage";
import IconBox from "@/components/ui/IconBox";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "Academics",
  description: "Comprehensive academic programs from Primary to Higher Secondary at Kathmandu English School.",
};

export default function AcademicsPage() {
  const { academicLevels, faculty } = siteConfig;

  return (
    <div className="min-h-screen">
      <PageHero title="Academics" subtitle="Nurturing Excellence from Foundation to Future" />

      <section className="py-12 lg:py-16">
        <div className="container-custom space-y-16">
          {academicLevels.map((level) => (
            <div key={level.id} id={level.id} className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="relative h-60 lg:h-80 rounded-2xl overflow-hidden bg-surface">
                  <OptimizedImage src={level.image} alt={level.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div>
                  <span className="text-primary text-sm font-semibold">{level.grades}</span>
                  <SectionHeading title={level.title} />
                  <p className="text-muted leading-relaxed mb-6">{level.desc}</p>

                  {level.subjects && (
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-3">Core Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {level.subjects.map((s) => <span key={s} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {level.streams && level.streams.map((stream) => (
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

      <section id="faculty" className="py-12 lg:py-16 bg-surface scroll-mt-24">
        <div className="container-custom">
          <SectionHeading title="Faculty & Staff" align="center" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {faculty.map((f) => (
              <div key={f.name} className="bg-white rounded-xl p-5 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                <IconBox icon={<span className="text-primary font-heading font-bold text-xl">{f.name.split(" ").pop()?.charAt(0)}</span>} />
                <h4 className="font-semibold text-sm text-foreground">{f.name}</h4>
                <p className="text-xs text-primary font-medium">{f.role}</p>
                <p className="text-xs text-muted mt-1">{f.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
