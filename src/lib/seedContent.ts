import { siteConfig } from "@/constants/siteConfig";
import type { LocaleContent } from "@/types";

type Locale = "en" | "ne" | "ja";
type SeedRow = {
  section: string;
  content_key: string;
  locale: Locale;
  content_text: string;
  content_json: Record<string, unknown>;
  status: "published";
};

const locales: Locale[] = ["en", "ne", "ja"];

function addSimple(rows: SeedRow[], section: string, key: string, value: string) {
  locales.forEach((l) => {
    rows.push({ section, content_key: key, locale: l, content_text: value, content_json: {}, status: "published" });
  });
}

function addLC(rows: SeedRow[], section: string, key: string, lc: LocaleContent) {
  locales.forEach((l) => {
    rows.push({ section, content_key: key, locale: l, content_text: lc[l] || lc.en || "", content_json: {}, status: "published" });
  });
}

function addJson(rows: SeedRow[], section: string, key: string, json: Record<string, unknown>) {
  locales.forEach((l) => {
    rows.push({ section, content_key: key, locale: l, content_text: JSON.stringify(json), content_json: json, status: "published" });
  });
}

// ── Per-section seed functions ──

export function seedGlobal(): SeedRow[] {
  const rows: SeedRow[] = [];
  const { school, contact } = siteConfig;
  addSimple(rows, "global", "schoolName", school.name);
  addSimple(rows, "global", "motto", school.motto);
  addSimple(rows, "global", "principalName", school.principal.name);
  addSimple(rows, "global", "principalMessage", school.principal.message);
  addSimple(rows, "global", "phone", contact.phone);
  addSimple(rows, "global", "phone2", contact.phone2);
  addSimple(rows, "global", "email", contact.email);
  addSimple(rows, "global", "address", contact.address);
  addJson(rows, "global", "social_links", {
    links: [
      { platform: "facebook", url: "https://facebook.com/kesnepal" },
      { platform: "instagram", url: "https://instagram.com/kesnepal" },
      { platform: "twitter", url: "https://twitter.com/kesnepal" },
      { platform: "youtube", url: "https://youtube.com/@kesnepal" },
    ],
  });
  addJson(rows, "global", "opening_hours", {
    hours: [
      { days: "Sun-Fri", time: "9:00 AM - 4:00 PM" },
      { days: "Sat", time: "9:00 AM - 1:00 PM" },
    ],
  });
  return rows;
}

export function seedHero(): SeedRow[] {
  const rows: SeedRow[] = [];
  locales.forEach((l) => {
    const slides = siteConfig.hero.slides.map((s) => ({
      image: s.image,
      title: s.title[l] || s.title.en || "",
      subtitle: s.subtitle[l] || s.subtitle.en || "",
    }));
    rows.push({ section: "homepage", content_key: "hero_slides", locale: l, content_text: JSON.stringify(slides), content_json: { slides }, status: "published" });
  });
  return rows;
}

export function seedTestimonials(): SeedRow[] {
  const rows: SeedRow[] = [];
  locales.forEach((l) => {
    const items = siteConfig.testimonials.map((t) => ({
      name: t.name,
      role: t.role,
      text: t.text[l] || t.text.en || "",
    }));
    rows.push({ section: "homepage", content_key: "testimonials", locale: l, content_text: JSON.stringify(items), content_json: { items }, status: "published" });
  });
  return rows;
}

export function seedFAQs(): SeedRow[] {
  const faqs = [
    {
      en: [
        { question: "What is the admission process?", answer: "Visit our Admissions page for details on application forms, entrance exams, and required documents." },
        { question: "What curriculum does KES follow?", answer: "KES follows the National Curriculum of Nepal (NEB) with English as the primary medium of instruction." },
        { question: "Does KES provide transportation?", answer: "Yes, we offer bus service on selected routes across Kathmandu Valley." },
      ],
      ne: [
        { question: "भर्ना प्रक्रिया के छ?", answer: "आवेदन फारम, प्रवेश परीक्षा र आवश्यक कागजातहरूको विवरणका लागि हाम्रो भर्ना पृष्ठ हेर्नुहोस्।" },
        { question: "केईएसले कुन पाठ्यक्रम अनुसरण गर्छ?", answer: "केईएसले अंग्रेजीलाई प्रमुख शिक्षण माध्यमको रूपमा प्रयोग गर्दै नेपालको राष्ट्रिय पाठ्यक्रम (एनईबी) अनुसरण गर्दछ।" },
        { question: "के केईएसले यातायात प्रदान गर्छ?", answer: "हो, हामी काठमाडौं उपत्यकाका चुनिएका मार्गहरूमा बस सेवा प्रदान गर्छौं।" },
      ],
      ja: [
        { question: "入学手続きはどのようになっていますか？", answer: "入学申込書、入学試験、必要書類の詳細については、入学案内ページをご覧ください。" },
        { question: "KESはどのカリキュラムに従っていますか？", answer: "KESは英語を主要教授言語として、ネパール国家カリキュラム（NEB）に従っています。" },
        { question: "KESは交通手段を提供していますか？", answer: "はい、カトマンズバレー内の選択されたルートでバスサービスを提供しています。" },
      ],
    },
  ];
  const rows: SeedRow[] = [];
  locales.forEach((l) => {
    const items = faqs[0][l];
    rows.push({ section: "homepage", content_key: "faqs", locale: l, content_text: JSON.stringify(items), content_json: { items }, status: "published" });
  });
  return rows;
}

export function seedNews(): SeedRow[] {
  const rows: SeedRow[] = [];
  // Flat key-value seed for backward compat
  siteConfig.newsArticles.forEach((a) => {
    const id = `article_${a.id}`;
    addLC(rows, "news", `${id}_title`, a.title);
    addLC(rows, "news", `${id}_excerpt`, a.excerpt);
    addLC(rows, "news", `${id}_content`, a.content);
    addSimple(rows, "news", `${id}_author`, a.author);
    addSimple(rows, "news", `${id}_date`, a.date);
    addSimple(rows, "news", `${id}_image`, a.image);
    addSimple(rows, "news", `${id}_category`, a.category);
    addSimple(rows, "news", `${id}_slug`, a.slug);
    addSimple(rows, "news", `${id}_tags`, JSON.stringify(a.tags));
  });
  // JSON format for admin panel
  locales.forEach((l) => {
    rows.push({ section: "news", content_key: "news_articles", locale: l, content_text: JSON.stringify({ articles: siteConfig.newsArticles }), content_json: { articles: siteConfig.newsArticles }, status: "published" });
  });
  return rows;
}

export function seedEvents(): SeedRow[] {
  const rows: SeedRow[] = [];
  siteConfig.upcomingEvents.forEach((e) => {
    const id = `event_${e.id}`;
    addLC(rows, "events", `${id}_title`, e.title);
    addLC(rows, "events", `${id}_description`, e.description);
    addLC(rows, "events", `${id}_location`, e.location);
    addSimple(rows, "events", `${id}_date`, e.date);
    addSimple(rows, "events", `${id}_time`, e.time);
    addSimple(rows, "events", `${id}_image`, e.image);
  });
  return rows;
}

export function seedAcademics(): SeedRow[] {
  const rows: SeedRow[] = [];
  siteConfig.academicLevels.forEach((level) => {
    const id = `level_${level.id}`;
    addSimple(rows, "academics", `${id}_title`, level.title);
    addSimple(rows, "academics", `${id}_grades`, level.grades);
    addSimple(rows, "academics", `${id}_desc`, level.desc);
    addSimple(rows, "academics", `${id}_image`, level.image);
    if (level.subjects) addSimple(rows, "academics", `${id}_subjects`, JSON.stringify(level.subjects));
    if (level.streams) addSimple(rows, "academics", `${id}_streams`, JSON.stringify(level.streams));
  });
  locales.forEach((l) => {
    const pdfLabels = l === "en" ? ["Fee Structure", "Syllabus", "Academic Calendar", "Exam Routine", "Book List", "Student Handbook"]
      : l === "ne" ? ["शुल्क संरचना", "पाठ्यक्रम", "शैक्षिक पात्रो", "परीक्षा तालिका", "पुस्तक सूची", "विद्यार्थी पुस्तिका"]
      : ["料金体系", "シラバス", "学年暦", "試験日程", "図書リスト", "生徒手帳"];
    const pdfDescs = ["Current academic year fee breakdown", "Complete course syllabus for all grades", "Yearly academic schedule and holidays", "Examination schedule and time table", "Required textbooks for all classes", "Rules, regulations and guidelines"];
    const docs = pdfLabels.map((label, i) => ({ key: `pdf_${i}`, label, description: pdfDescs[i] }));
    rows.push({ section: "academics", content_key: "pdf_docs", locale: l, content_text: JSON.stringify(docs), content_json: { docs }, status: "published" });
  });
  return rows;
}

export function seedFaculty(): SeedRow[] {
  const rows: SeedRow[] = [];
  siteConfig.faculty.forEach((m, i) => {
    const id = `faculty_${i}`;
    addSimple(rows, "faculty", `${id}_name`, m.name);
    addSimple(rows, "faculty", `${id}_role`, m.role);
    addSimple(rows, "faculty", `${id}_dept`, m.dept);
  });
  // JSON format for admin
  locales.forEach((l) => {
    rows.push({ section: "academics", content_key: "faculty_list", locale: l, content_text: JSON.stringify({ members: siteConfig.faculty }), content_json: { members: siteConfig.faculty }, status: "published" });
  });
  return rows;
}

export function seedStaff(): SeedRow[] {
  const rows: SeedRow[] = [];
  siteConfig.staff.forEach((m) => {
    const id = `staff_${m.id}`;
    addSimple(rows, "staff", `${id}_name`, m.name);
    addSimple(rows, "staff", `${id}_designation`, m.designation);
    if (m.department) addSimple(rows, "staff", `${id}_department`, m.department);
    addSimple(rows, "staff", `${id}_photo`, m.photo);
  });
  // JSON format
  locales.forEach((l) => {
    rows.push({ section: "staff", content_key: "staff_members", locale: l, content_text: JSON.stringify({ members: siteConfig.staff }), content_json: { members: siteConfig.staff }, status: "published" });
  });
  return rows;
}

export function seedCareers(): SeedRow[] {
  const rows: SeedRow[] = [];
  locales.forEach((l) => {
    const jobs = siteConfig.jobVacancies.map((job) => ({
      id: job.id,
      title: job.title[l] || job.title.en || "",
      category: job.category[l] || job.category.en || "",
      level: job.level[l] || job.level.en || "",
      experience: job.experience[l] || job.experience.en || "",
      salary: job.salary[l] || job.salary.en || "",
      vacancies: job.vacancies,
      workstation: job.workstation[l] || job.workstation.en || "",
      responsibilities: job.responsibilities.map((r) => r[l] || r.en || ""),
      addedOn: job.addedOn,
      expiresOn: job.expiresOn,
      isActive: job.isActive,
    }));
    rows.push({ section: "careers", content_key: "job_listings", locale: l, content_text: JSON.stringify(jobs), content_json: { jobs }, status: "published" });
  });
  return rows;
}

export function seedCalendar(): SeedRow[] {
  const rows: SeedRow[] = [];
  siteConfig.calendarEvents.forEach((e) => {
    const id = `calendar_${e.id}`;
    addLC(rows, "calendar", `${id}_title`, e.title);
    if (e.description) addLC(rows, "calendar", `${id}_description`, e.description);
    addSimple(rows, "calendar", `${id}_date`, e.date);
    addSimple(rows, "calendar", `${id}_type`, e.type);
  });
  return rows;
}

export function seedGallery(): SeedRow[] {
  const rows: SeedRow[] = [];
  addSimple(rows, "gallery", "categories", JSON.stringify(siteConfig.gallery.categories));
  siteConfig.gallery.images.forEach((img, i) => {
    addSimple(rows, "gallery", `image_${i}_src`, img.src);
    addSimple(rows, "gallery", `image_${i}_alt`, img.alt);
    addSimple(rows, "gallery", `image_${i}_category`, img.category);
    addSimple(rows, "gallery", `image_${i}_width`, String(img.width));
    addSimple(rows, "gallery", `image_${i}_height`, String(img.height));
  });
  return rows;
}

export function seedNotices(): SeedRow[] {
  const rows: SeedRow[] = [];
  if (siteConfig.notices) {
    locales.forEach((l) => {
      rows.push({ section: "notices", content_key: "notices_list", locale: l, content_text: JSON.stringify({ notices: siteConfig.notices }), content_json: { notices: siteConfig.notices }, status: "published" });
    });
  }
  return rows;
}

// ── Section map ──

const SECTION_SEEDERS: Record<string, () => SeedRow[]> = {
  global: seedGlobal,
  homepage: () => [...seedHero(), ...seedTestimonials(), ...seedFAQs()],
  hero: seedHero,
  testimonials: seedTestimonials,
  faqs: seedFAQs,
  news: seedNews,
  events: seedEvents,
  academics: seedAcademics,
  faculty: seedFaculty,
  staff: seedStaff,
  careers: seedCareers,
  calendar: seedCalendar,
  gallery: seedGallery,
  notices: seedNotices,
};

export function getSectionSeedRows(section: string): SeedRow[] {
  const fn = SECTION_SEEDERS[section];
  if (!fn) return [];
  return fn();
}

export function getAllSeedRows(): SeedRow[] {
  const all: SeedRow[] = [];
  const seen = new Set<string>();
  const uniqueSections = [
    ...seedGlobal(), ...seedHero(), ...seedTestimonials(), ...seedFAQs(),
    ...seedNews(), ...seedEvents(), ...seedAcademics(), ...seedFaculty(),
    ...seedStaff(), ...seedCareers(), ...seedCalendar(), ...seedGallery(),
    ...seedNotices(),
  ];
  uniqueSections.forEach((r) => {
    const key = `${r.section}::${r.content_key}::${r.locale}`;
    if (!seen.has(key)) { seen.add(key); all.push(r); }
  });
  return all;
}

async function seedToSupabase(rows: SeedRow[]): Promise<{ count: number; error?: string }> {
  if (!rows.length) return { count: 0 };
  const { supabase } = await import("@/lib/supabase/client");
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section,content_key,locale",
    ignoreDuplicates: false,
  });
  if (error) return { count: 0, error: error.message };
  return { count: rows.length };
}

export async function seedAllContent(): Promise<{ count: number; error?: string }> {
  return seedToSupabase(getAllSeedRows());
}

export async function seedSectionContent(section: string): Promise<{ count: number; error?: string }> {
  return seedToSupabase(getSectionSeedRows(section));
}
