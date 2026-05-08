"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface Faq {
  question: string;
  answer: string;
}

const DEFAULT_HERO: HeroSlide[] = [
  { image: "/images/hero/heroslide1.jpg", title: "Welcome to Kathmandu English School", subtitle: "Shaping Future Leaders Since 1995" },
  { image: "/images/hero/heroslide2.jpg", title: "Academic Excellence", subtitle: "Nurturing Inquisitive Minds with Modern Pedagogy" },
  { image: "/images/hero/heroslide3.jpg", title: "Holistic Development", subtitle: "Sports, Arts, and Cultural Programs for All-Round Growth" },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Sunita Gurung", role: "Parent of Grade 8 Student", text: "KES has transformed my daughter into a confident and curious learner." },
  { name: "Rabin Shrestha", role: "Parent of Grade 10 Student", text: "The academic rigor and extracurricular balance at KES is outstanding." },
];

const DEFAULT_FAQS: Faq[] = [
  { question: "What is the admission process?", answer: "Visit our Admissions page for details on application forms, entrance exams, and required documents." },
  { question: "What curriculum does KES follow?", answer: "KES follows the National Curriculum of Nepal (NEB) with English as the primary medium of instruction." },
  { question: "Does KES provide transportation?", answer: "Yes, we offer bus service on selected routes across Kathmandu Valley." },
];

export default function HomepageManagerPage() {
  const { getJson, saveJson, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const [activeSection, setActiveSection] = useState("hero");
  const [discarding, setDiscarding] = useState(false);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    if (activeSection === "hero") {
      const json = getJson("homepage", "hero_slides", "en");
      const arr = json?.slides as HeroSlide[] | undefined;
      setHeroSlides(arr && arr.length > 0 ? arr : [...DEFAULT_HERO]);
    }
    if (activeSection === "testimonials") {
      const json = getJson("homepage", "testimonials", "en");
      const arr = json?.items as Testimonial[] | undefined;
      setTestimonials(arr && arr.length > 0 ? arr : [...DEFAULT_TESTIMONIALS]);
    }
    if (activeSection === "faq") {
      const json = getJson("homepage", "faqs", "en");
      const arr = json?.items as Faq[] | undefined;
      setFaqs(arr && arr.length > 0 ? arr : [...DEFAULT_FAQS]);
    }
  }, [activeSection, getJson]);

  const handleSave = async () => {
    setSaving(true);
    if (activeSection === "hero") {
      await saveJson("homepage", "hero_slides", "en", { slides: heroSlides });
      await saveJson("homepage", "hero_slides", "ne", { slides: heroSlides });
      await saveJson("homepage", "hero_slides", "ja", { slides: heroSlides });
    }
    if (activeSection === "testimonials") {
      await saveJson("homepage", "testimonials", "en", { items: testimonials });
      await saveJson("homepage", "testimonials", "ne", { items: testimonials });
      await saveJson("homepage", "testimonials", "ja", { items: testimonials });
    }
    if (activeSection === "faq") {
      await saveJson("homepage", "faqs", "en", { items: faqs });
      await saveJson("homepage", "faqs", "ne", { items: faqs });
      await saveJson("homepage", "faqs", "ja", { items: faqs });
    }
    setSaving(false);
  };

  const handleAddSlide = () => setHeroSlides((p) => [...p, { image: "", title: "", subtitle: "" }]);
  const handleAddTestimonial = () => setTestimonials((p) => [...p, { name: "", role: "", text: "" }]);
  const handleAddFaq = () => setFaqs((p) => [...p, { question: "", answer: "" }]);

  const dataKey = activeSection === "hero" ? "hero_slides" : activeSection === "testimonials" ? "testimonials" : "faqs";

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Homepage Manager</h1>
            <p className="text-xs text-muted mt-1">Manage hero slider, testimonials, and FAQ content</p>
          </div>
          <button
            onClick={async () => { setDiscarding(true); await discardSectionDrafts("homepage"); setDiscarding(false); window.location.reload(); }}
            disabled={discarding}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50"
          >
            Discard Drafts
          </button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6 max-w-md">
          {[
            { id: "hero", label: "Hero Slides" },
            { id: "testimonials", label: "Testimonials" },
            { id: "faq", label: "FAQs" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === s.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-sm text-foreground capitalize">
              {activeSection === "hero" ? "Hero Slides" : activeSection}
            </h2>
            <button
              onClick={
                activeSection === "hero" ? handleAddSlide :
                activeSection === "testimonials" ? handleAddTestimonial :
                handleAddFaq
              }
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              + Add {activeSection === "hero" ? "Slide" : activeSection === "testimonials" ? "Testimonial" : "FAQ"}
            </button>
          </div>

          {activeSection === "hero" && (
            <div className="space-y-4">
              {heroSlides.map((slide, i) => (
                <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Slide {i + 1}</span>
                    <button
                      onClick={() => setHeroSlides((p) => p.filter((_, j) => j !== i))}
                      className="w-7 h-7 flex items-center justify-center rounded text-red-500 hover:bg-red-50"
                      title="Remove slide"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => setHeroSlides((p) => p.map((s, j) => j === i ? { ...s, image: e.target.value } : s))}
                    placeholder="Image URL"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2"
                  />
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => setHeroSlides((p) => p.map((s, j) => j === i ? { ...s, title: e.target.value } : s))}
                    placeholder="Title"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2"
                  />
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => setHeroSlides((p) => p.map((s, j) => j === i ? { ...s, subtitle: e.target.value } : s))}
                    placeholder="Subtitle"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "testimonials" && (
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Testimonial {i + 1}</span>
                    <button
                      onClick={() => setTestimonials((p) => p.filter((_, j) => j !== i))}
                      className="w-7 h-7 flex items-center justify-center rounded text-red-500 hover:bg-red-50"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => setTestimonials((p) => p.map((tt, j) => j === i ? { ...tt, name: e.target.value } : tt))}
                    placeholder="Name"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2"
                  />
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => setTestimonials((p) => p.map((tt, j) => j === i ? { ...tt, role: e.target.value } : tt))}
                    placeholder="Role (e.g., Parent of Grade 8)"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2"
                  />
                  <textarea
                    value={t.text}
                    onChange={(e) => setTestimonials((p) => p.map((tt, j) => j === i ? { ...tt, text: e.target.value } : tt))}
                    placeholder="Testimonial text"
                    rows={2}
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "faq" && (
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">FAQ {i + 1}</span>
                    <button
                      onClick={() => setFaqs((p) => p.filter((_, j) => j !== i))}
                      className="w-7 h-7 flex items-center justify-center rounded text-red-500 hover:bg-red-50"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => setFaqs((p) => p.map((f, j) => j === i ? { ...f, question: e.target.value } : f))}
                    placeholder="Question"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => setFaqs((p) => p.map((f, j) => j === i ? { ...f, answer: e.target.value } : f))}
                    placeholder="Answer"
                    rows={3}
                    className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
          {hasDraft("homepage", dataKey, "en") && (
            <span className="ml-2 text-xs text-yellow-600">Draft pending</span>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
