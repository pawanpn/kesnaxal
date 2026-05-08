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
  StaffMember,
  JobVacancy,
  AcademicLevel,
  FacultyMember,
  ContactInfo,
  SchoolInfo,
} from "@/types";

/**
 * Hook that resolves content from Supabase (via AdminContext) with fallback to siteConfig.
 */
export function useDynamicContent() {
  const { getContent } = useAdmin();
  const { locale } = useLocale();

  const supabaseHasContent = useMemo(() => {
    return !!(
      getContent("hero", "slide_0_title", locale) ||
      getContent("events", "event_1_title", locale) ||
      getContent("school", "name", locale)
    );
  }, [getContent, locale]);

  const resolveText = (section: string, key: string, fallback: LocaleContent): string => {
    const fromDb = getContent(section, key, locale);
    if (fromDb) return fromDb;
    return fallback[locale] || fallback.en || "";
  };

  const resolveSimple = (section: string, key: string, fallback: string): string => {
    const fromDb = getContent(section, key, locale);
    return fromDb || fallback;
  };

  // ── School ──
  const school: SchoolInfo = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.school;
    return {
      ...siteConfig.school,
      name: resolveSimple("school", "name", siteConfig.school.name),
      shortName: resolveSimple("school", "shortName", siteConfig.school.shortName),
      motto: resolveSimple("school", "motto", siteConfig.school.motto),
      established: Number(resolveSimple("school", "established", String(siteConfig.school.established))) || siteConfig.school.established,
      history: resolveSimple("school", "history", siteConfig.school.history),
      principal: {
        name: resolveSimple("school", "principal_name", siteConfig.school.principal.name),
        message: resolveSimple("school", "principal_message", siteConfig.school.principal.message),
      },
    };
  }, [supabaseHasContent, getContent, locale]);

  // ── Contact ──
  const contact: ContactInfo = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.contact;
    return {
      address: resolveSimple("contact", "address", siteConfig.contact.address),
      phone: resolveSimple("contact", "phone", siteConfig.contact.phone),
      phone2: resolveSimple("contact", "phone2", siteConfig.contact.phone2),
      email: resolveSimple("contact", "email", siteConfig.contact.email),
      admissionsEmail: resolveSimple("contact", "admissionsEmail", siteConfig.contact.admissionsEmail),
      mapEmbedUrl: resolveSimple("contact", "mapEmbedUrl", siteConfig.contact.mapEmbedUrl),
    };
  }, [supabaseHasContent, getContent, locale]);

  // ── Hero ──
  const heroSlides: HeroSlide[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.hero.slides;
    return siteConfig.hero.slides.map((slide, i) => {
      const resolve_ = (key: string) => resolveText("hero", `slide_${i}_${key}`, slide[key as keyof HeroSlide] as LocaleContent);
      return {
        ...slide,
        title: {
          en: getContent("hero", `slide_${i}_title`, "en") || slide.title.en || "",
          ne: getContent("hero", `slide_${i}_title`, "ne") || slide.title.ne || "",
          ja: getContent("hero", `slide_${i}_title`, "ja") || slide.title.ja || "",
        },
        subtitle: {
          en: getContent("hero", `slide_${i}_subtitle`, "en") || slide.subtitle.en || "",
          ne: getContent("hero", `slide_${i}_subtitle`, "ne") || slide.subtitle.ne || "",
          ja: getContent("hero", `slide_${i}_subtitle`, "ja") || slide.subtitle.ja || "",
        },
        image: resolveSimple("hero", `slide_${i}_image`, slide.image),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Events ──
  const events: UpcomingEvent[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.upcomingEvents;
    return siteConfig.upcomingEvents.map((event) => {
      const id = `event_${event.id}`;
      return {
        ...event,
        title: { ...event.title, [locale]: resolveText("events", `${id}_title`, event.title) },
        description: { ...event.description, [locale]: resolveText("events", `${id}_description`, event.description) },
        location: { ...event.location, [locale]: resolveText("events", `${id}_location`, event.location) },
        date: resolveSimple("events", `${id}_date`, event.date),
        time: resolveSimple("events", `${id}_time`, event.time),
        image: resolveSimple("events", `${id}_image`, event.image),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── News ──
  const newsArticles: NewsArticle[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.newsArticles;
    return siteConfig.newsArticles.map((article) => {
      const id = `article_${article.id}`;
      return {
        ...article,
        title: { ...article.title, [locale]: resolveText("news", `${id}_title`, article.title) },
        excerpt: { ...article.excerpt, [locale]: resolveText("news", `${id}_excerpt`, article.excerpt) },
        content: { ...article.content, [locale]: resolveText("news", `${id}_content`, article.content) },
        author: resolveSimple("news", `${id}_author`, article.author),
        date: resolveSimple("news", `${id}_date`, article.date),
        image: resolveSimple("news", `${id}_image`, article.image),
        category: resolveSimple("news", `${id}_category`, article.category),
        slug: resolveSimple("news", `${id}_slug`, article.slug),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Testimonials ──
  const testimonials: Testimonial[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.testimonials;
    return siteConfig.testimonials.map((t) => {
      const id = `testimonial_${t.id}`;
      return {
        ...t,
        text: { ...t.text, [locale]: resolveText("testimonials", `${id}_text`, t.text) },
        name: resolveSimple("testimonials", `${id}_name`, t.name),
        role: resolveSimple("testimonials", `${id}_role`, t.role),
        image: resolveSimple("testimonials", `${id}_image`, t.image),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Gallery ──
  const galleryImages: GalleryImage[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.gallery.images;
    return siteConfig.gallery.images.map((img, i) => ({
      ...img,
      src: resolveSimple("gallery", `image_${i}_src`, img.src),
      alt: resolveSimple("gallery", `image_${i}_alt`, img.alt),
    }));
  }, [supabaseHasContent, getContent, locale]);

  // ── Academic Levels ──
  const academicLevels: AcademicLevel[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.academicLevels;
    return siteConfig.academicLevels.map((level) => {
      const id = `level_${level.id}`;
      return {
        ...level,
        title: resolveSimple("academics", `${id}_title`, level.title),
        grades: resolveSimple("academics", `${id}_grades`, level.grades),
        desc: resolveSimple("academics", `${id}_desc`, level.desc),
        image: resolveSimple("academics", `${id}_image`, level.image),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Faculty ──
  const faculty: FacultyMember[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.faculty;
    return siteConfig.faculty.map((m, i) => {
      const id = `faculty_${i}`;
      return {
        name: resolveSimple("faculty", `${id}_name`, m.name),
        role: resolveSimple("faculty", `${id}_role`, m.role),
        dept: resolveSimple("faculty", `${id}_dept`, m.dept),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Staff ──
  const staff: StaffMember[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.staff;
    return siteConfig.staff.map((m) => {
      const id = `staff_${m.id}`;
      return {
        ...m,
        name: resolveSimple("staff", `${id}_name`, m.name),
        designation: resolveSimple("staff", `${id}_designation`, m.designation),
        department: m.department ? resolveSimple("staff", `${id}_department`, m.department) : undefined,
        photo: resolveSimple("staff", `${id}_photo`, m.photo),
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Jobs ──
  const jobVacancies: JobVacancy[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.jobVacancies;
    return siteConfig.jobVacancies.map((job) => {
      const id = `job_${job.id}`;
      return {
        ...job,
        title: { ...job.title, [locale]: resolveText("careers", `${id}_title`, job.title) },
        category: { ...job.category, [locale]: resolveText("careers", `${id}_category`, job.category) },
        level: { ...job.level, [locale]: resolveText("careers", `${id}_level`, job.level) },
        experience: { ...job.experience, [locale]: resolveText("careers", `${id}_experience`, job.experience) },
        salary: { ...job.salary, [locale]: resolveText("careers", `${id}_salary`, job.salary) },
        workstation: { ...job.workstation, [locale]: resolveText("careers", `${id}_workstation`, job.workstation) },
        vacancies: Number(resolveSimple("careers", `${id}_vacancies`, String(job.vacancies))) || job.vacancies,
        addedOn: resolveSimple("careers", `${id}_addedOn`, job.addedOn),
        expiresOn: resolveSimple("careers", `${id}_expiresOn`, job.expiresOn),
        isActive: resolveSimple("careers", `${id}_isActive`, String(job.isActive)) === "true",
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  // ── Calendar ──
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!supabaseHasContent) return siteConfig.calendarEvents;
    return siteConfig.calendarEvents.map((event) => {
      const id = `calendar_${event.id}`;
      return {
        ...event,
        title: { ...event.title, [locale]: resolveText("calendar", `${id}_title`, event.title) },
        type: resolveSimple("calendar", `${id}_type`, event.type) as CalendarEvent["type"],
        date: resolveSimple("calendar", `${id}_date`, event.date),
        description: event.description
          ? { ...event.description, [locale]: resolveText("calendar", `${id}_description`, event.description) }
          : undefined,
      };
    });
  }, [supabaseHasContent, getContent, locale]);

  return {
    supabaseHasContent,
    resolveText,
    resolveSimple,
    school,
    contact,
    heroSlides,
    events,
    newsArticles,
    testimonials,
    galleryImages,
    academicLevels,
    faculty,
    staff,
    jobVacancies,
    calendarEvents,
  };
}
