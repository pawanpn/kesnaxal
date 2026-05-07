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

  const addLocale = (
    section: string,
    key: string,
    getText: (locale: Locale) => string
  ) => {
    locales.forEach((locale) => {
      rows.push({
        section,
        content_key: key,
        locale,
        content_text: getText(locale),
        content_json: {},
        status: "published",
      });
    });
  };

  const addSimple = (section: string, key: string, value: string) => {
    locales.forEach((locale) => {
      rows.push({
        section,
        content_key: key,
        locale,
        content_text: value,
        content_json: {},
        status: "published",
      });
    });
  };

  const addLC = (section: string, key: string, lc: LocaleContent) => {
    addLocale(section, key, (l) => lc[l] || lc.en || "");
  };

  // ── School Info ──
  const { school, contact, footer } = siteConfig;
  addSimple("school", "name", school.name);
  addSimple("school", "shortName", school.shortName);
  addSimple("school", "motto", school.motto);
  addSimple("school", "established", String(school.established));
  addSimple("school", "history", school.history);
  addSimple("school", "principal_name", school.principal.name);
  addSimple("school", "principal_message", school.principal.message);

  // ── Contact ──
  addSimple("contact", "address", contact.address);
  addSimple("contact", "phone", contact.phone);
  addSimple("contact", "phone2", contact.phone2);
  addSimple("contact", "email", contact.email);
  addSimple("contact", "admissionsEmail", contact.admissionsEmail);
  addSimple("contact", "mapEmbedUrl", contact.mapEmbedUrl);

  // ── Hero Slides ──
  siteConfig.hero.slides.forEach((slide, i) => {
    addLC("hero", `slide_${i}_title`, slide.title);
    addLC("hero", `slide_${i}_subtitle`, slide.subtitle);
    addSimple("hero", `slide_${i}_image`, slide.image);
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

  // ── Testimonials ──
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
    if (level.subjects) {
      addSimple("academics", `${keyId}_subjects`, JSON.stringify(level.subjects));
    }
    if (level.streams) {
      addSimple("academics", `${keyId}_streams`, JSON.stringify(level.streams));
    }
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
    if (member.department) {
      addSimple("staff", `${keyId}_department`, member.department);
    }
    addSimple("staff", `${keyId}_photo`, member.photo);
  });

  // ── Job Vacancies ──
  siteConfig.jobVacancies.forEach((job) => {
    const keyId = `job_${job.id}`;
    addLC("careers", `${keyId}_title`, job.title);
    addLC("careers", `${keyId}_category`, job.category);
    addLC("careers", `${keyId}_level`, job.level);
    addLC("careers", `${keyId}_experience`, job.experience);
    addLC("careers", `${keyId}_salary`, job.salary);
    addLC("careers", `${keyId}_workstation`, job.workstation);
    addSimple("careers", `${keyId}_vacancies`, String(job.vacancies));
    addSimple("careers", `${keyId}_addedOn`, job.addedOn);
    addSimple("careers", `${keyId}_expiresOn`, job.expiresOn);
    addSimple("careers", `${keyId}_isActive`, String(job.isActive));
    job.responsibilities.forEach((resp, ri) => {
      addLC("careers", `${keyId}_resp_${ri}`, resp);
    });
  });

  // ── Calendar Events ──
  siteConfig.calendarEvents.forEach((event) => {
    const keyId = `calendar_${event.id}`;
    addLC("calendar", `${keyId}_title`, event.title);
    if (event.description) addLC("calendar", `${keyId}_description`, event.description);
    addSimple("calendar", `${keyId}_date`, event.date);
    addSimple("calendar", `${keyId}_type`, event.type);
  });

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

/**
 * Seeds the Supabase site_content table with data from siteConfig.
 * Uses upsert to avoid duplicates. All inserted as "published".
 */
export async function seedSupabaseContent(): Promise<{ count: number; error?: string }> {
  const rows = generateSeedData();

  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section,content_key,locale",
    ignoreDuplicates: false,
  });

  if (error) return { count: 0, error: error.message };
  return { count: rows.length };
}
