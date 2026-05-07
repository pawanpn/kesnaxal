import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Academics",
  description: "Comprehensive academic programs from Primary to Higher Secondary at Kathmandu English School.",
};

const levels = [
  {
    id: "primary",
    title: "Primary Level",
    grades: "Nursery - Grade 5",
    desc: "Our primary program focuses on building strong foundations in literacy, numeracy, and social skills through play-based and experiential learning methods. We follow a child-centric approach where every child learns at their own pace.",
    subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer", "Arts & Crafts", "Physical Education"],
  },
  {
    id: "secondary",
    title: "Secondary Level",
    grades: "Grade 6 - 10",
    desc: "The secondary curriculum deepens conceptual understanding and analytical skills. Students are prepared for the Secondary Education Examination (SEE) with rigorous academics and co-curricular enrichment.",
    subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer Science", "Health & Physical Education", "Optional Subjects"],
  },
  {
    id: "higher",
    title: "Higher Secondary",
    grades: "Grade 11 - 12",
    desc: "Our 10+2 program offers Science and Management streams under NEB affiliation. Students receive advanced preparation for university entrance exams and career counseling.",
    streams: [
      { name: "Science", subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Computer Science"] },
      { name: "Management", subjects: ["Accountancy", "Economics", "Business Studies", "Mathematics", "English", "Computer Science"] },
    ],
  },
];

const faculty = [
  { name: "Mr. Bishnu Prasad Sharma", role: "Principal", dept: "Administration" },
  { name: "Mrs. Anju Thapa", role: "Vice Principal", dept: "Academics" },
  { name: "Mr. Rajan Koirala", role: "HOD", dept: "Science" },
  { name: "Mrs. Sunita Rai", role: "HOD", dept: "English" },
  { name: "Mr. Dhiraj Poudel", role: "HOD", dept: "Mathematics" },
  { name: "Mrs. Menuka Acharya", role: "HOD", dept: "Nepali" },
  { name: "Mr. Sagar Bista", role: "HOD", dept: "Computer Science" },
  { name: "Mrs. Rajani Shrestha", role: "HOD", dept: "Social Studies" },
];

export default function AcademicsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">Academics</h1>
          <p className="text-gray-200 max-w-xl mx-auto text-sm">Nurturing Excellence from Foundation to Future</p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-custom space-y-16">
          {levels.map((level) => (
            <div key={level.id} id={level.id} className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="relative h-60 lg:h-80 rounded-2xl overflow-hidden bg-surface">
                  <Image
                    src={`/images/${level.id}.jpg`}
                    alt={level.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <span className="text-primary text-sm font-semibold">{level.grades}</span>
                  <h2 className="text-2xl font-heading font-bold text-primary mt-1 mb-4">{level.title}</h2>
                  <p className="text-muted leading-relaxed mb-6">{level.desc}</p>

                  {"subjects" in level && "subjects" in level && (
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-3">Core Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {(level as typeof levels[0] & { subjects: string[] }).subjects.map((s) => (
                          <span key={s} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {"streams" in level && (level as typeof levels[2] & { streams: { name: string; subjects: string[] }[] }).streams.map((stream) => (
                    <div key={stream.name} className="mb-4">
                      <h4 className="font-semibold text-foreground text-sm mb-2">{stream.name} Stream</h4>
                      <div className="flex flex-wrap gap-2">
                        {stream.subjects.map((s) => (
                          <span key={s} className="bg-secondary/20 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                        ))}
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
          <h2 className="text-2xl font-heading font-bold text-primary text-center mb-10">Faculty & Staff</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {faculty.map((f) => (
              <div key={f.name} className="bg-white rounded-xl p-5 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-heading font-bold text-xl">
                    {f.name.split(" ").pop()?.charAt(0)}
                  </span>
                </div>
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
