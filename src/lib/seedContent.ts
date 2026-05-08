"use client";

import { supabase } from "@/lib/supabase/client";
import { siteConfig } from "@/constants/siteConfig";
import type { LocaleContent } from "@/types";

type Locale = "en" | "ne" | "ja";

interface SeedRow {
  section: string;
  content_key: string;
  locale: Locale;
  content_text: string;
  content_json: Record<string, unknown>;
  status: "published";
}

function flatSeed(rows: SeedRow[]): SeedRow[] {
  return rows.map((r) => ({ ...r, content_json: r.content_json || {} }));
}

export function generateSeedData(): SeedRow[] {
  const rows: SeedRow[] = [];
  const locales: Locale[] = ["en", "ne", "ja"];

  const addLocale = (section: string, key: string, getText: (locale: Locale) => string) => {
    locales.forEach((locale) => {
      rows.push({ section, content_key: key, locale, content_text: getText(locale), content_json: {}, status: "published" });
    });
  };

  const addSimple = (section: string, key: string, value: string) => {
    locales.forEach((locale) => {
      rows.push({ section, content_key: key, locale, content_text: value, content_json: {}, status: "published" });
    });
  };

  const addLC = (section: string, key: string, lc: LocaleContent) => {
    addLocale(section, key, (l) => lc[l] || lc.en || "");
  };

  const addJson = (section: string, key: string, json: Record<string, unknown>) => {
    locales.forEach((locale) => {
      rows.push({ section, content_key: key, locale, content_text: JSON.stringify(json), content_json: json, status: "published" });
    });
  };

  const { school, contact, footer } = siteConfig;

  // ── Global: School Info ──
  addSimple("global", "schoolName", school.name);
  addSimple("global", "motto", school.motto);
  addSimple("global", "principalName", school.principal.name);
  addSimple("global", "principalMessage", school.principal.message);

  // ── Global: Contact Info ──
  addSimple("global", "phone", contact.phone);
  addSimple("global", "phone2", contact.phone2);
  addSimple("global", "email", contact.email);
  addSimple("global", "address", contact.address);

  // ── Global: Social Links (JSON array) ──
  addJson("global", "social_links", {
    links: [
      { platform: "facebook", url: "https://facebook.com/kesnepal" },
      { platform: "instagram", url: "https://instagram.com/kesnepal" },
      { platform: "twitter", url: "https://twitter.com/kesnepal" },
      { platform: "youtube", url: "https://youtube.com/@kesnepal" },
    ],
  });

  // ── Global: Opening Hours (JSON array) ──
  addJson("global", "opening_hours", {
    hours: [
      { days: "Sun-Fri", time: "9:00 AM - 4:00 PM" },
      { days: "Sat", time: "9:00 AM - 1:00 PM" },
    ],
  });

  // ── Homepage: Hero Slides (JSON array, per locale) ──
  locales.forEach((locale) => {
    const slides = siteConfig.hero.slides.map((slide) => ({
      image: slide.image,
      title: slide.title[locale] || slide.title.en || "",
      subtitle: slide.subtitle[locale] || slide.subtitle.en || "",
    }));
    rows.push({ section: "homepage", content_key: "hero_slides", locale, content_text: JSON.stringify(slides), content_json: { slides }, status: "published" });
  });

  // ── Homepage: Testimonials (JSON array, per locale) ──
  locales.forEach((locale) => {
    const items = siteConfig.testimonials.map((t) => ({
      name: t.name,
      role: t.role,
      text: t.text[locale] || t.text.en || "",
    }));
    rows.push({ section: "homepage", content_key: "testimonials", locale, content_text: JSON.stringify(items), content_json: { items }, status: "published" });
  });

  // ── Homepage: FAQs (JSON array, per locale) ──
  const defaultFaqsEN = [
    { question: "What is the admission process?", answer: "Visit our Admissions page for details on application forms, entrance exams, and required documents." },
    { question: "What curriculum does KES follow?", answer: "KES follows the National Curriculum of Nepal (NEB) with English as the primary medium of instruction." },
    { question: "Does KES provide transportation?", answer: "Yes, we offer bus service on selected routes across Kathmandu Valley." },
  ];
  const defaultFaqsNE = [
    { question: "भर्ना प्रक्रिया के छ?", answer: "आवेदन फारम, प्रवेश परीक्षा र आवश्यक कागजातहरूको विवरणका लागि हाम्रो भर्ना पृष्ठ हेर्नुहोस्।" },
    { question: "केईएसले कुन पाठ्यक्रम अनुसरण गर्छ?", answer: "केईएसले अंग्रेजीलाई प्रमुख शिक्षण माध्यमको रूपमा प्रयोग गर्दै नेपालको राष्ट्रिय पाठ्यक्रम (एनईबी) अनुसरण गर्दछ।" },
    { question: "के केईएसले यातायात प्रदान गर्छ?", answer: "हो, हामी काठमाडौं उपत्यकाका चुनिएका मार्गहरूमा बस सेवा प्रदान गर्छौं।" },
  ];
  const defaultFaqsJA = [
    { question: "入学手続きはどのようになっていますか？", answer: "入学申込書、入学試験、必要書類の詳細については、入学案内ページをご覧ください。" },
    { question: "KESはどのカリキュラムに従っていますか？", answer: "KESは英語を主要教授言語として、ネパール国家カリキュラム（NEB）に従っています。" },
    { question: "KESは交通手段を提供していますか？", answer: "はい、カトマンズバレー内の選択されたルートでバスサービスを提供しています。" },
  ];
  rows.push({ section: "homepage", content_key: "faqs", locale: "en", content_text: JSON.stringify(defaultFaqsEN), content_json: { items: defaultFaqsEN }, status: "published" });
  rows.push({ section: "homepage", content_key: "faqs", locale: "ne", content_text: JSON.stringify(defaultFaqsNE), content_json: { items: defaultFaqsNE }, status: "published" });
  rows.push({ section: "homepage", content_key: "faqs", locale: "ja", content_text: JSON.stringify(defaultFaqsJA), content_json: { items: defaultFaqsJA }, status: "published" });

  // ── Academics: PDF Docs (JSON array, per locale) ──
  const pdfLabelsEN = ["Fee Structure", "Syllabus", "Academic Calendar", "Exam Routine", "Book List", "Student Handbook"];
  const pdfLabelsNE = ["शुल्क संरचना", "पाठ्यक्रम", "शैक्षिक पात्रो", "परीक्षा तालिका", "पुस्तक सूची", "विद्यार्थी पुस्तिका"];
  const pdfLabelsJA = ["料金体系", "シラバス", "学年暦", "試験日程", "図書リスト", "生徒手帳"];
  const pdfDescsEN = [
    "Current academic year fee breakdown", "Complete course syllabus for all grades",
    "Yearly academic schedule and holidays", "Examination schedule and time table",
    "Required textbooks for all classes", "Rules, regulations and guidelines",
  ];
  locales.forEach((locale) => {
    const labels = locale === "en" ? pdfLabelsEN : locale === "ne" ? pdfLabelsNE : pdfLabelsJA;
    const docs = labels.map((label, i) => ({
      key: `pdf_${i}`,
      label,
      description: pdfDescsEN[i],
    }));
    rows.push({ section: "academics", content_key: "pdf_docs", locale, content_text: JSON.stringify(docs), content_json: { docs }, status: "published" });
  });

  // ── Careers: Job Listings (JSON array, per locale) ──
  locales.forEach((locale) => {
    const jobs = siteConfig.jobVacancies.map((job) => ({
      id: `job_${job.id}`,
      title: job.title[locale] || job.title.en || "",
      category: job.category[locale] || job.category.en || "",
      type: "Full-time",
      description: job.responsibilities[0]?.[locale] || job.responsibilities[0]?.en || "",
    }));
    rows.push({ section: "careers", content_key: "job_listings", locale, content_text: JSON.stringify(jobs), content_json: { jobs }, status: "published" });
  });

  // ── Events ──
  siteConfig.upcomingEvents.forEach((event) => {
    const keyId = `event_${event.id}`;
    addLC("events", `${keyId}_title`, event.title);
    addLC("events", `${keyId}_description`, event.description);
    addLC("events", `${keyId}_location`, event.location);
    addSimple("events", `${keyId}_date`, event.date);
    addSimple("events", `${keyId}_time`, event.time);
    addSimple("events", `${keyId}_image`, event.image);
  });

  // ── News Articles ──
  siteConfig.newsArticles.forEach((article) => {
    const keyId = `article_${article.id}`;
    addLC("news", `${keyId}_title`, article.title);
    addLC("news", `${keyId}_excerpt`, article.excerpt);
    addLC("news", `${keyId}_content`, article.content);
    addSimple("news", `${keyId}_author`, article.author);
    addSimple("news", `${keyId}_date`, article.date);
    addSimple("news", `${keyId}_image`, article.image);
    addSimple("news", `${keyId}_category`, article.category);
    addSimple("news", `${keyId}_slug`, article.slug);
    addSimple("news", `${keyId}_tags`, JSON.stringify(article.tags));
  });

  // ── Legacy: Testimonials (individual keys for backward compat) ──
  siteConfig.testimonials.forEach((testimonial) => {
    const keyId = `testimonial_${testimonial.id}`;
    addLC("testimonials", `${keyId}_text`, testimonial.text);
    addSimple("testimonials", `${keyId}_name`, testimonial.name);
    addSimple("testimonials", `${keyId}_role`, testimonial.role);
    addSimple("testimonials", `${keyId}_image`, testimonial.image);
  });

  // ── Footer ──
  addLC("footer", "about", footer.about);

  // ── Academic Levels ──
  siteConfig.academicLevels.forEach((level) => {
    const keyId = `level_${level.id}`;
    addSimple("academics", `${keyId}_title`, level.title);
    addSimple("academics", `${keyId}_grades`, level.grades);
    addSimple("academics", `${keyId}_desc`, level.desc);
    addSimple("academics", `${keyId}_image`, level.image);
    if (level.subjects) { addSimple("academics", `${keyId}_subjects`, JSON.stringify(level.subjects)); }
    if (level.streams) { addSimple("academics", `${keyId}_streams`, JSON.stringify(level.streams)); }
  });

  // ── Faculty ──
  siteConfig.faculty.forEach((member, i) => {
    const keyId = `faculty_${i}`;
    addSimple("faculty", `${keyId}_name`, member.name);
    addSimple("faculty", `${keyId}_role`, member.role);
    addSimple("faculty", `${keyId}_dept`, member.dept);
  });

  // ── Staff ──
  siteConfig.staff.forEach((member) => {
    const keyId = `staff_${member.id}`;
    addSimple("staff", `${keyId}_name`, member.name);
    addSimple("staff", `${keyId}_designation`, member.designation);
    if (member.department) { addSimple("staff", `${keyId}_department`, member.department); }
    addSimple("staff", `${keyId}_photo`, member.photo);
  });

  // ── Calendar Events ──
  if (siteConfig.calendarEvents) {
    siteConfig.calendarEvents.forEach((event) => {
      const keyId = `calendar_${event.id}`;
      addLC("calendar", `${keyId}_title`, event.title);
      if (event.description) addLC("calendar", `${keyId}_description`, event.description);
      addSimple("calendar", `${keyId}_date`, event.date);
      addSimple("calendar", `${keyId}_type`, event.type);
    });
  }

  // ── Gallery ──
  addSimple("gallery", "categories", JSON.stringify(siteConfig.gallery.categories));
  siteConfig.gallery.images.forEach((img, i) => {
    addSimple("gallery", `image_${i}_src`, img.src);
    addSimple("gallery", `image_${i}_alt`, img.alt);
    addSimple("gallery", `image_${i}_category`, img.category);
    addSimple("gallery", `image_${i}_width`, String(img.width));
    addSimple("gallery", `image_${i}_height`, String(img.height));
  });

  return flatSeed(rows);
}

export async function seedSupabaseContent(): Promise<{ count: number; error?: string }> {
  const rows = generateSeedData();
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section,content_key,locale",
    ignoreDuplicates: false,
  });
  if (error) return { count: 0, error: error.message };
  return { count: rows.length };
}
