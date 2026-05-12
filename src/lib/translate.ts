import type { Locale, LocaleContent } from "@/types";

const TRANSLATION_DELAY_MS = 600;

/**
 * Mock AI Translation — simulates an API call to translate content.
 * In production, replace this with a fetch to Supabase Edge Function
 * calling OpenAI / Google Translate.
 */
export async function mockTranslateText(
  text: string,
  targetLocale: Locale
): Promise<string> {
  // Return early for English (no translation needed)
  if (targetLocale === "en" || !text) return text;

  // Simulate network latency
  await new Promise((r) => setTimeout(r, TRANSLATION_DELAY_MS));

  return `[${targetLocale.toUpperCase()}] ${text}`;
}

/**
 * Resolves a locale-aware field from a LocaleContent object.
 * Falls back to English if translation isn't available.
 */
export function resolveLocale<T extends string | LocaleContent>(
  field: T,
  locale: Locale
): string {
  if (typeof field === "string") return field;

  const content = field as LocaleContent;
  return content[locale] || content.en || "";
}

/**
 * Resolves the most appropriate locale from a LocaleContent.
 * If the target locale is empty, falls back to en.
 */
export function resolveContent(
  content: LocaleContent,
  locale: Locale
): string {
  return resolveLocale(content, locale);
}

/**
 * Batch-resolves multiple LocaleContent fields at once.
 * Useful for extracting title, excerpt, content in one call.
 */
export function resolveArticle(
  article: {
    title: LocaleContent;
    excerpt: LocaleContent;
    content: LocaleContent;
  } | null | undefined,
  locale: Locale
): { title: string; excerpt: string; content: string } {
  if (!article) return { title: "", excerpt: "", content: "" };
  return {
    title: resolveContent(article.title, locale),
    excerpt: resolveContent(article.excerpt, locale),
    content: resolveContent(article.content, locale),
  };
}

export function resolveEvent(
  event: {
    title: LocaleContent;
    description: LocaleContent;
    location?: LocaleContent;
  },
  locale: Locale
): { title: string; description: string; location: string } {
  return {
    title: resolveContent(event.title, locale),
    description: resolveContent(event.description, locale),
    location: event.location ? resolveContent(event.location, locale) : "",
  };
}

export function resolveJob(
  job: {
    title: LocaleContent;
    category: LocaleContent;
    level: LocaleContent;
    experience: LocaleContent;
    salary: LocaleContent;
    workstation: LocaleContent;
    responsibilities: LocaleContent[];
  },
  locale: Locale
): {
  title: string;
  category: string;
  level: string;
  experience: string;
  salary: string;
  workstation: string;
  responsibilities: string[];
} {
  return {
    title: resolveContent(job.title, locale),
    category: resolveContent(job.category, locale),
    level: resolveContent(job.level, locale),
    experience: resolveContent(job.experience, locale),
    salary: resolveContent(job.salary, locale),
    workstation: resolveContent(job.workstation, locale),
    responsibilities: job.responsibilities.map((r) => resolveContent(r, locale)),
  };
}

export function resolveCalendarEvent(
  event: {
    title: LocaleContent;
    description?: LocaleContent;
  },
  locale: Locale
): { title: string; description: string } {
  return {
    title: resolveContent(event.title, locale),
    description: event.description
      ? resolveContent(event.description, locale)
      : "",
  };
}
