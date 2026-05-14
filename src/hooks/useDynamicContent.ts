"use client";

import { useMemo } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useLocale } from "@/hooks/useLocale";
import { siteConfig } from "@/constants/siteConfig";
import type {
  HeroSlide,
  UpcomingEvent,
  NewsArticle,
  Testimonial,
  GalleryImage,
  LocaleContent,
  Locale,
  CalendarEvent,
  CalendarEventType,
  StaffMember,
  JobVacancy,
  AcademicLevel,
  FacultyMember,
  ContactInfo,
  SchoolInfo,
  Notice,
} from "@/types";

/**
 * Dynamic content hook — reads ONLY from Supabase.
 * No static fallbacks. Superadmin must seed each section.
 * School & contact have minimal hardcoded defaults for site identity.
 */
export function useDynamicContent() {
  const { getContent, getJson, contentReady } = useAdmin();
  const { locale, t } = useLocale();

  const hasDb = useMemo(() => {
    return !!(
      getContent("global", "schoolName", locale) ||
      getContent("global", "logo_url", "en") ||
      getContent("hero", "slide_0_title", locale) ||
      getContent("events", "event_1_title", locale)
    );
  }, [getContent, locale]);

  // ── School (minimal fallback for site identity) ──
  const school: SchoolInfo = useMemo(() => {
    const def = siteConfig.school;
    return {
      ...def,
      name: getContent("global", "schoolName", locale) || def.name,
      shortName: getContent("global", "shortName", locale) || def.shortName,
      motto: getContent("global", "motto", locale) || def.motto,
      established: Number(getContent("global", "established", locale)) || def.established,
      history: getContent("global", "history", locale) || def.history,
      principal: {
        name: getContent("global", "principalName", locale) || def.principal.name,
        message: getContent("global", "principalMessage", locale) || def.principal.message,
      },
    };
  }, [getContent, locale]);

  // ── Contact (minimal fallback) ──
  const contact: ContactInfo = useMemo(() => {
    const def = siteConfig.contact;
    return {
      address: getContent("global", "address", locale) || def.address,
      phone: getContent("global", "phone", locale) || def.phone,
      phone2: getContent("global", "phone2", locale) || def.phone2,
      email: getContent("global", "email", locale) || def.email,
      admissionsEmail: getContent("global", "admissionsEmail", locale) || def.admissionsEmail,
      mapEmbedUrl: getContent("global", "mapEmbedUrl", locale) || def.mapEmbedUrl,
    };
  }, [getContent, locale]);

  // ── Hero — Supabase only, no fallback ──
  const heroSlides: HeroSlide[] = useMemo(() => {
    if (!hasDb) return [];
    const jsonStr = getContent("homepage", "hero_slides", locale);
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.slides?.length) return p.slides as HeroSlide[];
      } catch {}
    }
    // Try flat keys (old format)
    const slides: HeroSlide[] = [];
    for (let i = 0; i < 10; i++) {
      const title = getContent("hero", `slide_${i}_title`, locale);
      if (!title && i > 2) break;
      slides.push({
        image: getContent("hero", `slide_${i}_image`, locale) || "",
        title: { en: getContent("hero", `slide_${i}_title`, "en") || "", ne: getContent("hero", `slide_${i}_title`, "ne") || "", ja: getContent("hero", `slide_${i}_title`, "ja") || "" },
        subtitle: { en: getContent("hero", `slide_${i}_subtitle`, "en") || "", ne: getContent("hero", `slide_${i}_subtitle`, "ne") || "", ja: getContent("hero", `slide_${i}_subtitle`, "ja") || "" },
      });
    }
    return slides;
  }, [hasDb, getContent, locale]);

  // ── Events — Supabase only ──
  const events: UpcomingEvent[] = useMemo(() => {
    if (!hasDb) return [];
    const result: UpcomingEvent[] = [];
    for (let i = 1; i <= 50; i++) {
      const title = getContent("events", `event_${i}_title`, locale);
      if (!title) break;
      result.push({
        id: i,
        title: { en: getContent("events", `event_${i}_title`, "en") || "", ne: getContent("events", `event_${i}_title`, "ne") || "", ja: getContent("events", `event_${i}_title`, "ja") || "" },
        date: getContent("events", `event_${i}_date`, locale) || "",
        time: getContent("events", `event_${i}_time`, locale) || "",
        location: { en: getContent("events", `event_${i}_location`, "en") || "", ne: getContent("events", `event_${i}_location`, "ne") || "", ja: getContent("events", `event_${i}_location`, "ja") || "" },
        image: getContent("events", `event_${i}_image`, locale) || "",
        description: { en: getContent("events", `event_${i}_description`, "en") || "", ne: getContent("events", `event_${i}_description`, "ne") || "", ja: getContent("events", `event_${i}_description`, "ja") || "" },
      });
    }
    return result;
  }, [hasDb, getContent, locale]);

  // ── News — Supabase only ──
  const newsArticles: NewsArticle[] = useMemo(() => {
    if (!contentReady) return [];
    const jsonStr = getContent("news", "news_articles", "en") || getContent("news", "news_articles", "ne") || getContent("news", "news_articles", "ja");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.articles?.length) return p.articles as NewsArticle[];
      } catch {}
    }
    return [];
  }, [contentReady, getContent]);

  // ── Breaking News ──
  const breakingNews = useMemo(() => {
    if (!contentReady) return { active: false, messages: {} as Record<Locale, string> };
    const raw = getContent("alerts", "breaking_news_active", "en");
    let active = false;
    if (raw) { try { const j = JSON.parse(raw); active = !!j.active; } catch {} }
    if (raw === "true") active = true;
    const messages: Record<Locale, string> = { en: "", ne: "", ja: "" };
    (["en", "ne", "ja"] as Locale[]).forEach((l) => { messages[l] = getContent("alerts", "breaking_news_text", l); });
    return { active, messages };
  }, [contentReady, getContent]);

  // ── Emergency Popup ──
  const emergency = useMemo(() => {
    if (!contentReady) return { active: false, title: {} as Record<Locale, string>, message: {} as Record<Locale, string> };
    const raw = getContent("alerts", "emergency_active", "en");
    let active = false;
    if (raw) { try { const j = JSON.parse(raw); active = !!j.active; } catch {} }
    if (raw === "true") active = true;
    const title: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const message: Record<Locale, string> = { en: "", ne: "", ja: "" };
    (["en", "ne", "ja"] as Locale[]).forEach((l) => {
      title[l] = getContent("alerts", "emergency_title", l);
      message[l] = getContent("alerts", "emergency_message", l);
    });
    return { active, title, message };
  }, [contentReady, getContent]);

  // ── Testimonials — Supabase only ──
  const testimonials: Testimonial[] = useMemo(() => {
    if (!hasDb) return [];
    const jsonStr = getContent("homepage", "testimonials", "en") || getContent("homepage", "testimonials", "ne") || getContent("homepage", "testimonials", "ja");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.items?.length) return p.items as Testimonial[];
      } catch {}
    }
    return [];
  }, [hasDb, getContent]);

  // ── Gallery — Supabase only ──
  const gallerySubtitle = useMemo(() => {
    return getContent("gallery", "gallery_subtitle", locale) || "";
  }, [getContent, locale]);

  const galleryImages: GalleryImage[] = useMemo(() => {
    if (!contentReady) return [];
    const jsonStr = getContent("gallery", "gallery_images", "en");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.images?.length) return p.images as GalleryImage[];
      } catch {}
    }
    return [];
  }, [contentReady, getContent]);

  const galleryCategories: string[] = useMemo(() => {
    const jsonStr = getContent("gallery", "gallery_images", "en");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.categories?.length) return p.categories as string[];
      } catch {}
    }
    return [];
  }, [getContent]);

  // ── Academic Levels — Supabase only ──
  const academicLevels: AcademicLevel[] = useMemo(() => {
    if (!hasDb) return [];

    const json = getJson("academics", "academic_levels", locale) as { levels?: AcademicLevel[] };
    if (json?.levels?.length) return json.levels;

    const results: AcademicLevel[] = [];
    const ids = ["primary", "secondary", "higher"];
    ids.forEach((id) => {
      const title = getContent("academics", `level_${id}_title`, locale);
      if (title) {
        results.push({
          id,
          title,
          grades: getContent("academics", `level_${id}_grades`, locale) || "",
          desc: getContent("academics", `level_${id}_desc`, locale) || "",
          image: getContent("academics", `level_${id}_image`, locale) || "",
        });
      }
    });
    return results;
  }, [hasDb, getJson, getContent, locale]);

  // ── Faculty — Supabase only ──
  const faculty: FacultyMember[] = useMemo(() => {
    if (!hasDb) return [];
    const json = getJson("academics", "faculty_list", locale) as { members?: FacultyMember[] };
    if (json?.members?.length) return json.members;
    const fallback = getContent("academics", "faculty_list", "en");
    if (fallback) {
      try {
        const p = JSON.parse(fallback);
        if (p.members?.length) return p.members as FacultyMember[];
      } catch {}
    }
    return [];
  }, [hasDb, getJson, getContent, locale]);

  // ── Staff — Supabase only ──
  const staff: StaffMember[] = useMemo(() => {
    const jsonStr = getContent("staff", "staff_members", "en");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.members?.length) return p.members as StaffMember[];
      } catch {}
    }
    return [];
  }, [getContent]);

  // ── Jobs — Supabase only ──
  const jobVacancies: JobVacancy[] = useMemo(() => {
    if (!contentReady) return [];
    // Try JSON from careers admin (saveJson stores in content_json)
    const json = getJson("careers", "job_vacancies", locale) as { vacancies?: JobVacancy[] };
    if (json?.vacancies?.length) return json.vacancies;
    // Try old flat keys from old seed
    const jsonStr = getContent("careers", "job_listings", "en");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.jobs?.length) return p.jobs as JobVacancy[];
      } catch {}
    }
    // Try old flat keys from old seed
    const results: JobVacancy[] = [];
    for (let i = 1; i <= 20; i++) {
      const title = getContent("careers", `job_${i}_title`, locale);
      if (!title) break;
      results.push({
        id: i,
        title: { en: getContent("careers", `job_${i}_title`, "en") || "", ne: getContent("careers", `job_${i}_title`, "ne") || "", ja: getContent("careers", `job_${i}_title`, "ja") || "" },
        category: { en: getContent("careers", `job_${i}_category`, "en") || "", ne: getContent("careers", `job_${i}_category`, "ne") || "", ja: getContent("careers", `job_${i}_category`, "ja") || "" },
        level: { en: getContent("careers", `job_${i}_level`, "en") || "", ne: getContent("careers", `job_${i}_level`, "ne") || "", ja: getContent("careers", `job_${i}_level`, "ja") || "" },
        experience: { en: getContent("careers", `job_${i}_experience`, "en") || "", ne: getContent("careers", `job_${i}_experience`, "ne") || "", ja: getContent("careers", `job_${i}_experience`, "ja") || "" },
        salary: { en: getContent("careers", `job_${i}_salary`, "en") || "", ne: getContent("careers", `job_${i}_salary`, "ne") || "", ja: getContent("careers", `job_${i}_salary`, "ja") || "" },
        vacancies: Number(getContent("careers", `job_${i}_vacancies`, locale)) || 0,
        workstation: { en: getContent("careers", `job_${i}_workstation`, "en") || "", ne: getContent("careers", `job_${i}_workstation`, "ne") || "", ja: getContent("careers", `job_${i}_workstation`, "ja") || "" },
        responsibilities: [],
        addedOn: getContent("careers", `job_${i}_addedOn`, locale) || "",
        expiresOn: getContent("careers", `job_${i}_expiresOn`, locale) || "",
        isActive: getContent("careers", `job_${i}_isActive`, locale) === "true",
      });
    }
    return results;
  }, [contentReady, getContent, locale]);

  // ── Notices — Supabase only ──
  const notices: Notice[] = useMemo(() => {
    if (!contentReady) return [];
    const jsonStr = getContent("notices", "notices_list", "en");
    if (jsonStr) {
      try {
        const p = JSON.parse(jsonStr);
        if (p.notices?.length) return p.notices as Notice[];
      } catch {}
    }
    return [];
  }, [contentReady, getContent]);

  // ── Calendar — Supabase only ──
  const calendarEventTypes: CalendarEventType[] = useMemo(() => {
    const json = getJson("calendar", "calendar_types", "en") as { types?: CalendarEventType[] };
    if (json?.types?.length) return json.types;
    const t = getJson("calendar", "calendar_types", locale) as { types?: CalendarEventType[] };
    if (t?.types?.length) return t.types;
    const ne = getJson("calendar", "calendar_types", "ne") as { types?: CalendarEventType[] };
    if (ne?.types?.length) return ne.types;
    const ja = getJson("calendar", "calendar_types", "ja") as { types?: CalendarEventType[] };
    if (ja?.types?.length) return ja.types;
    return [];
  }, [getJson, locale]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!hasDb) return [];

    const json = getJson("calendar", "calendar_events", locale) as { events?: CalendarEvent[] };
    if (json?.events?.length) return json.events;

    const results: CalendarEvent[] = [];
    for (let i = 1; i <= 30; i++) {
      const title = getContent("calendar", `calendar_${i}_title`, locale);
      if (!title) break;
      results.push({
        id: i,
        title: { en: getContent("calendar", `calendar_${i}_title`, "en") || "", ne: getContent("calendar", `calendar_${i}_title`, "ne") || "", ja: getContent("calendar", `calendar_${i}_title`, "ja") || "" },
        type: getContent("calendar", `calendar_${i}_type`, locale) || "event",
        date: getContent("calendar", `calendar_${i}_date`, locale) || "",
        description: { en: getContent("calendar", `calendar_${i}_description`, "en") || "", ne: getContent("calendar", `calendar_${i}_description`, "ne") || "", ja: getContent("calendar", `calendar_${i}_description`, "ja") || "" },
      });
    }
    return results;
  }, [hasDb, getJson, getContent, locale]);

  return {
    school,
    contact,
    heroSlides,
    events,
    newsArticles,
    breakingNews,
    emergency,
    testimonials,
    galleryImages,
    gallerySubtitle,
    galleryCategories,
    academicLevels,
    faculty,
    staff,
    jobVacancies,
    calendarEvents,
    calendarEventTypes,
    notices,
  };
}
