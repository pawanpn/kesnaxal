/**
 * Server-side utility to fetch published content from Supabase.
 * Falls back to siteConfig when Supabase is empty.
 */
import { supabase } from "@/lib/supabase/client";
import { siteConfig } from "@/constants/siteConfig";
import type {
  HeroSlide,
  UpcomingEvent,
  NewsArticle,
  Testimonial,
  GalleryImage,
  FooterInfo,
  LocaleContent,
  Locale,
} from "@/types";

// ── Cache helpers ──

type ContentMap = Map<string, string>; // keyed by "content_key::locale"

let _contentCache: ContentMap | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getAllContent(): Promise<ContentMap> {
  if (_contentCache && Date.now() - _cacheTime < CACHE_TTL) return _contentCache;

  const map = new Map<string, string>();
  const { data } = await supabase
    .from("site_content")
    .select("section, content_key, locale, content_text")
    .eq("status", "published");

  if (data) {
    for (const row of data) {
      map.set(`${row.section}::${row.content_key}::${row.locale}`, row.content_text || "");
    }
  }

  _contentCache = map;
  _cacheTime = Date.now();
  return map;
}

export function clearContentCache() {
  _contentCache = null;
  _cacheTime = 0;
}

// ── Content getters ──

export async function getText(section: string, key: string, locale: Locale): Promise<string> {
  const content = await getAllContent();
  const val = content.get(`${section}::${key}::${locale}`);
  if (val !== undefined) return val;
  return "";
}

export async function getLocaleText(
  section: string,
  key: string,
  locale: Locale,
  fallback: LocaleContent
): Promise<string> {
  const fromDb = await getText(section, key, locale);
  if (fromDb) return fromDb;
  return fallback[locale] || fallback.en || "";
}

export async function hasPublishedContent(): Promise<boolean> {
  const content = await getAllContent();
  return content.size > 0;
}

// ── Typed fetchers for page data ──

export async function getHeroSlides(locale: Locale): Promise<HeroSlide[]> {
  const content = await getAllContent();
  if (content.size === 0) return siteConfig.hero.slides;

  return siteConfig.hero.slides.map((slide, i) => {
    const title = content.get(`hero::slide_${i}_title::${locale}`) || slide.title[locale] || slide.title.en || "";
    const subtitle = content.get(`hero::slide_${i}_subtitle::${locale}`) || slide.subtitle[locale] || slide.subtitle.en || "";
    const image = content.get(`hero::slide_${i}_image::${locale}`) || slide.image;
    return {
      ...slide,
      title: { ...slide.title, [locale]: title },
      subtitle: { ...slide.subtitle, [locale]: subtitle },
      image,
    };
  });
}

export async function getEvents(locale: Locale): Promise<UpcomingEvent[]> {
  const content = await getAllContent();
  if (content.size === 0) return siteConfig.upcomingEvents;

  return siteConfig.upcomingEvents.map((event) => {
    const id = `event_${event.id}`;
    const title = content.get(`events::${id}_title::${locale}`) || event.title[locale] || event.title.en || "";
    const description = content.get(`events::${id}_description::${locale}`) || event.description[locale] || event.description.en || "";
    const location = content.get(`events::${id}_location::${locale}`) || event.location[locale] || event.location.en || "";
    return {
      ...event,
      title: { ...event.title, [locale]: title },
      description: { ...event.description, [locale]: description },
      location: { ...event.location, [locale]: location },
    };
  });
}

export async function getNewsArticles(locale: Locale): Promise<NewsArticle[]> {
  const content = await getAllContent();

  // Try JSON format first (from admin panel)
  const jsonStr = content.get(`news::news_articles::${locale}`);
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.articles && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
        return parsed.articles as NewsArticle[];
      }
    } catch { /* fall through to individual keys */ }
  }

  if (content.size === 0) return siteConfig.newsArticles;

  return siteConfig.newsArticles.map((article) => {
    const id = `article_${article.id}`;
    const title = content.get(`news::${id}_title::${locale}`) || article.title[locale] || article.title.en || "";
    const excerpt = content.get(`news::${id}_excerpt::${locale}`) || article.excerpt[locale] || article.excerpt.en || "";
    const body = content.get(`news::${id}_content::${locale}`) || article.content[locale] || article.content.en || "";
    return {
      ...article,
      title: { ...article.title, [locale]: title },
      excerpt: { ...article.excerpt, [locale]: excerpt },
      content: { ...article.content, [locale]: body },
    };
  });
}

export async function getTestimonials(locale: Locale): Promise<Testimonial[]> {
  const content = await getAllContent();
  if (content.size === 0) return siteConfig.testimonials;

  return siteConfig.testimonials.map((t) => {
    const id = `testimonial_${t.id}`;
    const text = content.get(`testimonials::${id}_text::${locale}`) || t.text[locale] || t.text.en || "";
    return { ...t, text: { ...t.text, [locale]: text } };
  });
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const content = await getAllContent();
  if (content.size === 0) return siteConfig.gallery.images;

  return siteConfig.gallery.images.map((img, i) => {
    const src = content.get(`gallery::image_${i}_src::en`) || img.src;
    const alt = content.get(`gallery::image_${i}_alt::en`) || img.alt;
    return { ...img, src, alt };
  });
}

export async function getFooterAbout(locale: Locale): Promise<FooterInfo> {
  const content = await getAllContent();
  if (content.size === 0) return siteConfig.footer;

  const about: LocaleContent = {
    en: content.get(`footer::about::en`) || siteConfig.footer.about.en || "",
    ne: content.get(`footer::about::ne`) || siteConfig.footer.about.ne || "",
    ja: content.get(`footer::about::ja`) || siteConfig.footer.about.ja || "",
  };
  return { ...siteConfig.footer, about };
}
