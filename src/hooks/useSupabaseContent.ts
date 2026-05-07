"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import type { SiteContentRow } from "@/context/AdminContext";

/**
 * Hook to fetch published content from Supabase for a specific section & locale.
 * Falls back to static siteConfig data.
 * Reacts to real-time admin edits via AdminContext.
 */
export function useSupabaseContent(section: string, locale: string) {
  const { publishedContent, draftContent, isAdmin } = useAdmin();
  const [content, setContent] = useState<Map<string, SiteContentRow>>(new Map());

  useEffect(() => {
    const map = new Map<string, SiteContentRow>();

    // Published content first
    publishedContent.forEach((row) => {
      if (row.section === section && row.locale === locale) {
        map.set(row.content_key, row);
      }
    });

    // Drafts override (only visible to admins)
    if (isAdmin) {
      draftContent.forEach((row) => {
        if (row.section === section && row.locale === locale) {
          map.set(row.content_key, row);
        }
      });
    }

    setContent(map);
  }, [publishedContent, draftContent, section, locale, isAdmin]);

  /**
   * Get text for a key. Returns null if no Supabase content.
   * Caller should fall back to siteConfig static data.
   */
  const getText = (key: string): string | null => {
    const row = content.get(key);
    if (!row || !row.content_text) return null;
    return row.content_text;
  };

  /**
   * Get JSON for a key. Returns null if no Supabase content.
   */
  const getJson = <T = Record<string, unknown>>(key: string): T | null => {
    const row = content.get(key);
    if (!row || !row.content_json) return null;
    return row.content_json as unknown as T;
  };

  return { getText, getJson, content };
}
