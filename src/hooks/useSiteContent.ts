"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import type { SiteContentRow } from "@/context/AdminContext";

/**
 * Hook to fetch site content from Supabase with preview-aware logic.
 * - Public visitors: only see status = 'published' (enforced by RLS)
 * - Admin with preview mode ON: sees drafts overriding published
 * - Admin with preview mode OFF: sees published only
 * Falls back to static siteConfig data when no DB row exists.
 */
export function useSiteContent(section: string, locale: string) {
  const { publishedContent, draftContent, isAdmin, isPreviewMode } = useAdmin();
  const [content, setContent] = useState<Map<string, SiteContentRow>>(new Map());

  useEffect(() => {
    const map = new Map<string, SiteContentRow>();

    publishedContent.forEach((row) => {
      if (row.section === section && row.locale === locale) {
        map.set(row.content_key, row);
      }
    });

    // Drafts override when admin is in preview mode
    if (isAdmin && isPreviewMode) {
      draftContent.forEach((row) => {
        if (row.section === section && row.locale === locale) {
          map.set(row.content_key, row);
        }
      });
    }

    // Also add draft entries for keys that don't exist in published (new content in preview)
    if (isAdmin) {
      draftContent.forEach((row) => {
        if (row.section === section && row.locale === locale) {
          if (!map.has(row.content_key)) {
            map.set(row.content_key, row);
          }
        }
      });
    }

    setContent(map);
  }, [publishedContent, draftContent, section, locale, isAdmin, isPreviewMode]);

  const getText = useCallback(
    (key: string): string | null => {
      const row = content.get(key);
      if (!row || !row.content_text) return null;
      return row.content_text;
    },
    [content]
  );

  const getJson = useCallback(
    <T = Record<string, unknown>>(key: string): T | null => {
      const row = content.get(key);
      if (!row || !row.content_json) return null;
      return row.content_json as unknown as T;
    },
    [content]
  );

  const getMeta = useCallback(
    (key: string): Record<string, unknown> | null => {
      const row = content.get(key);
      if (!row || !row.content_meta || Object.keys(row.content_meta).length === 0) return null;
      return row.content_meta;
    },
    [content]
  );

  const isDraft = useCallback(
    (key: string): boolean => {
      const row = content.get(key);
      return row?.status === "draft";
    },
    [content]
  );

  const getStatus = useCallback(
    (key: string): string | null => {
      const row = content.get(key);
      return row?.status || null;
    },
    [content]
  );

  return { getText, getJson, getMeta, isDraft, getStatus, content };
}
