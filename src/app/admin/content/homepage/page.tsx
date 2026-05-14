"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";

type Locale = "en" | "ne" | "ja";

interface HeroSlide { image: string; title: string; subtitle: string; }
interface Testimonial { name: string; role: string; text: string; }
interface Faq { question: string; answer: string; }

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const DEF_HERO_EN: HeroSlide[] = [
  { image: "https://picsum.photos/seed/keshero1/1200/600", title: "Welcome to Kathmandu English School", subtitle: "Shaping Future Leaders Since 1995" },
  { image: "https://picsum.photos/seed/keshero2/1200/600", title: "Academic Excellence", subtitle: "Nurturing Inquisitive Minds with Modern Pedagogy" },
  { image: "https://picsum.photos/seed/keshero3/1200/600", title: "Holistic Development", subtitle: "Sports, Arts, and Cultural Programs for All-Round Growth" },
];
const DEF_HERO_NE: HeroSlide[] = [
  { image: "https://picsum.photos/seed/keshero1/1200/600", title: "काठमाडौं इंग्लिश स्कूलमा स्वागत छ", subtitle: "सन् १९९५ देखि भविष्यका नेताहरूको निर्माण" },
  { image: "https://picsum.photos/seed/keshero2/1200/600", title: "शैक्षिक उत्कृष्टता", subtitle: "आधुनिक शिक्षण विधिद्वारा जिज्ञासु मस्तिष्कहरूको पोषण" },
  { image: "https://picsum.photos/seed/keshero3/1200/600", title: "समग्र विकास", subtitle: "सर्वाङ्गीण विकासका लागि खेलकुद, कला र सांस्कृतिक कार्यक्रमहरू" },
];
const DEF_HERO_JA: HeroSlide[] = [
  { image: "https://picsum.photos/seed/keshero1/1200/600", title: "カトマンズイングリッシュスクールへようこそ", subtitle: "1995年以来、未来のリーダーを育成" },
  { image: "https://picsum.photos/seed/keshero2/1200/600", title: "学業の卓越性", subtitle: "現代的な教育法で探究心を育む" },
  { image: "https://picsum.photos/seed/keshero3/1200/600", title: "全人的開発", subtitle: "全面的な成長のためのスポーツ、芸術、文化プログラム" },
];

const DEF_TEST_EN: Testimonial[] = [
  { name: "Sunita Gurung", role: "Parent of Grade 8 Student", text: "KES has transformed my daughter into a confident and curious learner." },
  { name: "Rabin Shrestha", role: "Parent of Grade 10 Student", text: "The academic rigor and extracurricular balance at KES is outstanding." },
];
const DEF_TEST_NE: Testimonial[] = [
  { name: "Sunita Gurung", role: "Parent of Grade 8 Student", text: "केईएसले मेरी छोरीलाई आत्मविश्वासी र जिज्ञासु विद्यार्थीमा रूपान्तरण गरेको छ।" },
  { name: "Rabin Shrestha", role: "Parent of Grade 10 Student", text: "केईएसमा शैक्षिक कठोरता र अतिरिक्त क्रियाकलापको सन्तुलन उत्कृष्ट छ।" },
];
const DEF_TEST_JA: Testimonial[] = [
  { name: "Sunita Gurung", role: "Parent of Grade 8 Student", text: "KESは私の娘を自信に満ちた好奇心旺盛な学習者に変えました。" },
  { name: "Rabin Shrestha", role: "Parent of Grade 10 Student", text: "KESでの学業の厳しさと課外活動のバランスは素晴らしいです。" },
];

const DEF_FAQ_EN: Faq[] = [
  { question: "What is the admission process?", answer: "Visit our Admissions page for details on application forms, entrance exams, and required documents." },
  { question: "What curriculum does KES follow?", answer: "KES follows the National Curriculum of Nepal (NEB) with English as the primary medium of instruction." },
  { question: "Does KES provide transportation?", answer: "Yes, we offer bus service on selected routes across Kathmandu Valley." },
];
const DEF_FAQ_NE: Faq[] = [
  { question: "भर्ना प्रक्रिया के छ?", answer: "आवेदन फारम, प्रवेश परीक्षा र आवश्यक कागजातहरूको विवरणका लागि हाम्रो भर्ना पृष्ठ हेर्नुहोस्।" },
  { question: "केईएसले कुन पाठ्यक्रम अनुसरण गर्छ?", answer: "केईएसले अंग्रेजीलाई प्रमुख शिक्षण माध्यमको रूपमा प्रयोग गर्दै नेपालको राष्ट्रिय पाठ्यक्रम (एनईबी) अनुसरण गर्दछ।" },
  { question: "के केईएसले यातायात प्रदान गर्छ?", answer: "हो, हामी काठमाडौं उपत्यकाका चुनिएका मार्गहरूमा बस सेवा प्रदान गर्छौं।" },
];
const DEF_FAQ_JA: Faq[] = [
  { question: "入学手続きはどのようになっていますか？", answer: "入学申込書、入学試験、必要書類の詳細については、入学案内ページをご覧ください。" },
  { question: "KESはどのカリキュラムに従っていますか？", answer: "KESは英語を主要教授言語として、ネパール国家カリキュラム（NEB）に従っています。" },
  { question: "KESは交通手段を提供していますか？", answer: "はい、カトマンズバレー内の選択されたルートでバスサービスを提供しています。" },
];

const DEF_HERO: Record<Locale, HeroSlide[]> = { en: DEF_HERO_EN, ne: DEF_HERO_NE, ja: DEF_HERO_JA };
const DEF_TEST: Record<Locale, Testimonial[]> = { en: DEF_TEST_EN, ne: DEF_TEST_NE, ja: DEF_TEST_JA };
const DEF_FAQ: Record<Locale, Faq[]> = { en: DEF_FAQ_EN, ne: DEF_FAQ_NE, ja: DEF_FAQ_JA };

export default function HomepageManagerPage() {
  const { getJson, saveJson, hasDraft, discardSectionDrafts, loadAllContent, isSuperadmin, seedSection } = useAdmin();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [lang, setLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const [heroSlides, setHeroSlides] = useState<Record<Locale, HeroSlide[]>>({ en: [], ne: [], ja: [] });
  const [testimonials, setTestimonials] = useState<Record<Locale, Testimonial[]>>({ en: [], ne: [], ja: [] });
  const [faqs, setFaqs] = useState<Record<Locale, Faq[]>>({ en: [], ne: [], ja: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    LOCALES.forEach(({ id: l }) => {
      if (activeSection === "hero") {
        const json = getJson("homepage", "hero_slides", l);
        const arr = json?.slides as HeroSlide[] | undefined;
        setHeroSlides((p) => ({ ...p, [l]: arr?.length ? arr : [...DEF_HERO[l]] }));
      }
      if (activeSection === "testimonials") {
        const json = getJson("homepage", "testimonials", l);
        const arr = json?.items as Testimonial[] | undefined;
        setTestimonials((p) => ({ ...p, [l]: arr?.length ? arr : [...DEF_TEST[l]] }));
      }
      if (activeSection === "faq") {
        const json = getJson("homepage", "faqs", l);
        const arr = json?.items as Faq[] | undefined;
        setFaqs((p) => ({ ...p, [l]: arr?.length ? arr : [...DEF_FAQ[l]] }));
      }
    });
  }, [activeSection, getJson]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeSection === "hero") {
        for (const { id: l } of LOCALES) {
          await saveJson("homepage", "hero_slides", l, { slides: syncing ? heroSlides[lang] : heroSlides[l] });
        }
      }
      if (activeSection === "testimonials") {
        for (const { id: l } of LOCALES) {
          await saveJson("homepage", "testimonials", l, { items: syncing ? testimonials[lang] : testimonials[l] });
        }
      }
      if (activeSection === "faq") {
        for (const { id: l } of LOCALES) {
          await saveJson("homepage", "faqs", l, { items: syncing ? faqs[lang] : faqs[l] });
        }
      }
      toast("success", "Saved successfully");
    } catch {
      toast("error", "Failed to save");
    }
    setSaving(false);
  };

  const addItem = () => {
    if (activeSection === "hero") setHeroSlides((p) => ({ ...p, [lang]: [...p[lang], { image: "", title: "", subtitle: "" }] }));
    if (activeSection === "testimonials") setTestimonials((p) => ({ ...p, [lang]: [...p[lang], { name: "", role: "", text: "" }] }));
    if (activeSection === "faq") setFaqs((p) => ({ ...p, [lang]: [...p[lang], { question: "", answer: "" }] }));
  };

  const removeItem = (i: number) => {
    if (activeSection === "hero") setHeroSlides((p) => ({ ...p, [lang]: p[lang].filter((_, j) => j !== i) }));
    if (activeSection === "testimonials") setTestimonials((p) => ({ ...p, [lang]: p[lang].filter((_, j) => j !== i) }));
    if (activeSection === "faq") setFaqs((p) => ({ ...p, [lang]: p[lang].filter((_, j) => j !== i) }));
  };

  const dataKey = activeSection === "hero" ? "hero_slides" : activeSection === "testimonials" ? "testimonials" : "faqs";
  const sectionTitle = activeSection === "hero" ? "Hero Slides" : activeSection === "testimonials" ? "Testimonials" : "FAQs";

  const currentItems = activeSection === "hero" ? heroSlides[lang] : activeSection === "testimonials" ? testimonials[lang] : faqs[lang];

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Homepage Manager</h1>
            <p className="text-xs text-muted mt-1">Manage hero slider, testimonials, and FAQ content</p>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* Tabs + Lang + Sync */}
        <div className="flex items-center justify-between mb-4 max-w-2xl">
          <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
            {[{ id: "hero", label: "Hero Slides" }, { id: "testimonials", label: "Testimonials" }, { id: "faq", label: "FAQs" }].map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === s.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
              <button type="button" onClick={() => setSyncing(!syncing)}
                className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${syncing ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${syncing ? "translate-x-3" : "translate-x-0"}`} />
              </button>
              Sync
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-sm text-foreground">
              {sectionTitle} <span className="text-[10px] font-normal text-muted">({lang.toUpperCase()})</span>
            </h2>
            <button onClick={addItem}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">
              + Add {activeSection === "hero" ? "Slide" : activeSection === "testimonials" ? "Testimonial" : "FAQ"}
            </button>
          </div>

          {currentItems.length === 0 ? (
            <p className="text-xs text-muted italic">No items yet. Click + Add to create one.</p>
          ) : (
            <div className="space-y-4">
              {currentItems.map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                      {sectionTitle.replace(/s$/, "")} {i + 1}
                    </span>
                    <button onClick={() => removeItem(i)}
                      className="w-7 h-7 flex items-center justify-center rounded text-red-500 hover:bg-red-50" title="Remove">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {activeSection === "hero" && (
                    <>
                      <input type="text" value={(item as HeroSlide).image}
                        onChange={(e) => setHeroSlides((p) => ({ ...p, [lang]: p[lang].map((s, j) => j === i ? { ...s, image: e.target.value } : s) }))}
                        placeholder="Image URL" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2" />
                      <input type="text" value={(item as HeroSlide).title}
                        onChange={(e) => setHeroSlides((p) => ({ ...p, [lang]: p[lang].map((s, j) => j === i ? { ...s, title: e.target.value } : s) }))}
                        placeholder={`Title (${lang.toUpperCase()})`} className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2" />
                      <input type="text" value={(item as HeroSlide).subtitle}
                        onChange={(e) => setHeroSlides((p) => ({ ...p, [lang]: p[lang].map((s, j) => j === i ? { ...s, subtitle: e.target.value } : s) }))}
                        placeholder={`Subtitle (${lang.toUpperCase()})`} className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                    </>
                  )}
                  {activeSection === "testimonials" && (
                    <>
                      <input type="text" value={(item as Testimonial).name}
                        onChange={(e) => setTestimonials((p) => ({ ...p, [lang]: p[lang].map((t, j) => j === i ? { ...t, name: e.target.value } : t) }))}
                        placeholder="Name" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2" />
                      <input type="text" value={(item as Testimonial).role}
                        onChange={(e) => setTestimonials((p) => ({ ...p, [lang]: p[lang].map((t, j) => j === i ? { ...t, role: e.target.value } : t) }))}
                        placeholder="Role" className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2" />
                      <textarea value={(item as Testimonial).text}
                        onChange={(e) => setTestimonials((p) => ({ ...p, [lang]: p[lang].map((t, j) => j === i ? { ...t, text: e.target.value } : t) }))}
                        placeholder={`Testimonial text (${lang.toUpperCase()})`} rows={2}
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y" />
                    </>
                  )}
                  {activeSection === "faq" && (
                    <>
                      <input type="text" value={(item as Faq).question}
                        onChange={(e) => setFaqs((p) => ({ ...p, [lang]: p[lang].map((f, j) => j === i ? { ...f, question: e.target.value } : f) }))}
                        placeholder={`Question (${lang.toUpperCase()})`} className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none mb-2" />
                      <textarea value={(item as Faq).answer}
                        onChange={(e) => setFaqs((p) => ({ ...p, [lang]: p[lang].map((f, j) => j === i ? { ...f, answer: e.target.value } : f) }))}
                        placeholder={`Answer (${lang.toUpperCase()})`} rows={3}
                        className="w-full px-3 py-1.5 rounded border border-border text-xs focus:border-primary outline-none resize-y" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
            {saving ? "Saving..." : `Save All (${syncing ? "Copies to All Languages" : lang.toUpperCase()})`}
          </button>
          {syncing && (
            <span className="ml-2 text-[10px] text-blue-600">Sync ON — saves to all locales</span>
          )}
          {hasDraft("homepage", dataKey, "en") && <span className="ml-2 text-xs text-yellow-600">Draft pending</span>}
        </div>
      </div>
    </AdminGuard>
  );
}
