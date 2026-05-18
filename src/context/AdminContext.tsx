"use client";

import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/* ── Types ── */

export interface EditEntry {
  section: string;
  contentKey: string;
  locale: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
}

export interface SiteContentRow {
  id: string;
  section: string;
  content_key: string;
  locale: string;
  content_text: string | null;
  content_json: Record<string, unknown>;
  content_meta: Record<string, unknown>;
  status: "draft" | "published";
  updated_at: string;
  created_at: string;
}

interface AdminContextValue {
  isAdmin: boolean;
  isSuperadmin: boolean;
  authReady: boolean;
  isEditing: boolean;
  isPreviewMode: boolean;
  editingLocale: string;
  recentEdits: EditEntry[];
  draftCount: number;
  publishedContent: Map<string, SiteContentRow>;
  draftContent: Map<string, SiteContentRow>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  toggleEditMode: () => void;
  togglePreviewMode: () => void;
  setEditingLocale: (locale: string) => void;
  addEdit: (edit: EditEntry) => void;
  saveContent: (section: string, key: string, locale: string, text: string) => Promise<void>;
  saveJson: (section: string, key: string, locale: string, json: Record<string, unknown>) => Promise<void>;
  savePublishedContent: (section: string, key: string, locale: string, text: string) => Promise<void>;
  savePublishedJson: (section: string, key: string, locale: string, json: Record<string, unknown>) => Promise<void>;
  publishAll: () => Promise<{ count: number }>;
  publishSelectedDrafts: (ids: string[]) => Promise<{ count: number }>;
  discardAllDrafts: () => Promise<{ count: number }>;
  discardSectionDrafts: (section: string) => Promise<{ count: number }>;
  discardEdit: (section: string, key: string, locale: string) => void;
  getContent: (section: string, key: string, locale: string) => string;
  getJson: (section: string, key: string, locale: string) => Record<string, unknown>;
  getMeta: (section: string, key: string, locale: string) => Record<string, unknown>;
  getMedia: (section: string, key: string) => string;
  uploadMedia: (file: File, section: string, key: string) => Promise<string | null>;
  hasDraft: (section: string, key: string, locale: string) => boolean;
  loadAllContent: () => Promise<void>;
  contentReady: boolean;
  deleteItem: (section: string, key: string) => Promise<void>;
  listSectionItems: (section: string) => SiteContentRow[];
}

export const AdminContext = createContext<AdminContextValue | null>(null);

/* ── Helpers ── */

function rowKey(section: string, key: string, locale: string) {
  return `${section}::${key}::${locale}`;
}

/* ── Provider ── */

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingLocale, setEditingLocale] = useState("en");
  const [recentEdits, setRecentEdits] = useState<EditEntry[]>([]);
  const [publishedContent, setPublishedContent] = useState<Map<string, SiteContentRow>>(new Map());
  const [draftContent, setDraftContent] = useState<Map<string, SiteContentRow>>(new Map());
  const [draftCount, setDraftCount] = useState(0);
  const [contentReady, setContentReady] = useState(false);

  /* ── Check auth on mount ── */
  useEffect(() => {
    let mounted = true;

    const readyTimer = setTimeout(() => {
      if (mounted) setAuthReady(true);
    }, 10000);

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        supabase.auth.signOut().catch(() => {});
        setIsAdmin(false);
        setIsSuperadmin(false);
      } else {
        const hasSession = !!data.session;
        setIsAdmin(hasSession);
        if (hasSession) {
          supabase.from("admin_profiles").select("role").maybeSingle().then(({ data: profile }) => {
            if (mounted) setIsSuperadmin(profile?.role === "superadmin");
          });
        } else {
          setIsSuperadmin(false);
        }
      }
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "TOKEN_REFRESHED" && !session) {
        supabase.auth.signOut().catch(() => {});
      }
      const hasSession = !!session;
      setIsAdmin(hasSession);
      if (hasSession) {
        supabase.from("admin_profiles").select("role").maybeSingle().then(({ data: profile }) => {
          if (mounted) setIsSuperadmin(profile?.role === "superadmin");
        });
      } else {
        setIsSuperadmin(false);
      }
      setAuthReady(true);
      if (!session) {
        setIsEditing(false);
        setIsPreviewMode(false);
        setPublishedContent(new Map());
        setDraftContent(new Map());
        setDraftCount(0);
        setRecentEdits([]);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(readyTimer);
      listener?.subscription.unsubscribe();
    };
  }, []);

  const queryClient = useQueryClient();

  /* ── React Query: fetch content with caching ── */
  const {
    data: contentData,
    isLoading: contentLoading,
  } = useQuery({
    queryKey: ["site_content", isAdmin],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*").limit(5000);
      return (data as SiteContentRow[]) || [];
    },
    staleTime: isAdmin ? 30 * 1000 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const loadAllContent = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
    await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
  }, [queryClient]);

  /* ── Sync React Query data into content Maps ── */
  useEffect(() => {
    console.log("CONTENT_LOADING:", contentLoading, "DATA_COUNT:", contentData?.length);
    if (contentLoading) return;
    setContentReady(true);
    if (!contentData) return;
    const pub = new Map<string, SiteContentRow>();
    const draft = new Map<string, SiteContentRow>();
    let dCount = 0;
    contentData.forEach((row) => {
      const key = rowKey(row.section, row.content_key, row.locale);
      if (row.status === "published") pub.set(key, row);
      else { draft.set(key, row); dCount++; }
    });
    console.log("PUB_MAP_SIZE:", pub.size, "HAS_CAREERS:", pub.has("careers::job_vacancies::en"));
    setPublishedContent(pub);
    setDraftContent(draft);
    setDraftCount(dCount);
  }, [contentData, contentLoading]);

  /* ── Read preview cookie on mount ── */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const hasPreview = document.cookie.includes("kes_preview=1");
    setIsPreviewMode(hasPreview);
  }, []);

  /* ── Refresh content when tab becomes visible ── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({ queryKey: ["site_content"] });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [queryClient]);

  /* ── Real-time subscriptions ── */
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        () => { queryClient.invalidateQueries({ queryKey: ["site_content"] }); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, queryClient]);

  /* ── Get content (draft overrides published for admin only) ── */
  const getContent = useCallback(
    (section: string, key: string, locale: string): string => {
      const rk = rowKey(section, key, locale);
      if (isAdmin) {
        const d = draftContent.get(rk);
        if (d) return d.content_text || "";
      }
      const p = publishedContent.get(rk);
      console.log("GETJSON_DEBUG:", rk, !!p, p?.status);
      if (p) return p.content_text || "";
      return "";
    },
    [draftContent, publishedContent, isAdmin]
  );

  /* ── Get JSON content ── */
  function parseContentJson(row: SiteContentRow | undefined): Record<string, unknown> {
    if (!row) return {};
    const cj = row.content_json;
    if (cj && typeof cj === "object" && !Array.isArray(cj) && Object.keys(cj).length > 0) return cj;
    if (typeof cj === "string") { try { const p = JSON.parse(cj); if (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length > 0) return p; } catch {} }
    const ct = row.content_text;
    if (ct) { try { const p = JSON.parse(ct); if (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length > 0) return p; } catch {} }
    return {};
  }

  const getJson = useCallback(
    (section: string, key: string, locale: string): Record<string, unknown> => {
      const rk = rowKey(section, key, locale);
      if (isAdmin) {
        const d = draftContent.get(rk);
        if (d) {
          const parsed = parseContentJson(d);
          if (Object.keys(parsed).length > 0) return parsed;
        }
      }
      const p = publishedContent.get(rk);
      console.log("GETJSON_DEBUG:", rk, !!p, p?.status);
      const parsed = parseContentJson(p);
      if (Object.keys(parsed).length > 0) return parsed;
      return {};
    },
    [draftContent, publishedContent, isAdmin]
  );

  /* ── Get meta ── */
  const getMeta = useCallback(
    (section: string, key: string, locale: string): Record<string, unknown> => {
      const rk = rowKey(section, key, locale);
      const d = draftContent.get(rk);
      if (d?.content_meta && Object.keys(d.content_meta).length > 0) return d.content_meta;
      const p = publishedContent.get(rk);
      console.log("GETJSON_DEBUG:", rk, !!p, p?.status);
      if (p?.content_meta && Object.keys(p.content_meta).length > 0) return p.content_meta;
      return {};
    },
    [draftContent, publishedContent]
  );

  const hasDraft = useCallback(
    (section: string, key: string, locale: string): boolean => {
      return draftContent.has(rowKey(section, key, locale));
    },
    [draftContent]
  );

  /* ── Save content as draft ── */
  const saveContent = useCallback(
    async (section: string, key: string, locale: string, text: string) => {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", locale)
        .maybeSingle();

      let error = null;
      if (existing) {
        const res = await supabase
          .from("site_content")
          .update({ content_text: text, status: "draft", updated_at: new Date().toISOString(), updated_by: (await supabase.auth.getSession()).data.session?.user.id })
          .eq("id", existing.id);
        error = res.error;
      } else {
        const res = await supabase.from("site_content").insert({
          section,
          content_key: key,
          locale,
          content_text: text,
          status: "draft",
          updated_by: (await supabase.auth.getSession()).data.session?.user.id,
        });
        error = res.error;
      }

      if (!error) {
        await supabase.from("edit_log").insert({
          section,
          content_key: key,
          locale,
          new_value: JSON.parse(JSON.stringify({ text })),
        });
        queryClient.invalidateQueries({ queryKey: ["site_content"] });
      }
    },
    []
  );

  /* ── Save JSON content as draft ── */
  const saveJson = useCallback(
    async (section: string, key: string, locale: string, json: Record<string, unknown>) => {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", locale)
        .maybeSingle();

      const uid = (await supabase.auth.getSession()).data.session?.user.id;
      let error = null;
      if (existing) {
        const res = await supabase
          .from("site_content")
          .update({ content_json: json, content_text: JSON.stringify(json), status: "draft", updated_at: new Date().toISOString(), updated_by: uid })
          .eq("id", existing.id);
        error = res.error;
      } else {
        const res = await supabase.from("site_content").insert({
          section,
          content_key: key,
          locale,
          content_json: json,
          content_text: JSON.stringify(json),
          status: "draft",
          updated_by: uid,
        });
        error = res.error;
      }

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
    },
    []
  );

  /* ── Save content as published (for global settings visible to all visitors) ── */
  const savePublishedContent = useCallback(
    async (section: string, key: string, locale: string, text: string) => {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", locale)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_content")
          .update({ content_text: text, status: "published", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          section,
          content_key: key,
          locale,
          content_text: text,
          status: "published",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    },
    [queryClient]
  );

  const savePublishedJson = useCallback(
    async (section: string, key: string, locale: string, json: Record<string, unknown>) => {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", locale)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_content")
          .update({ content_json: json, content_text: JSON.stringify(json), status: "published", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          section,
          content_key: key,
          locale,
          content_json: json,
          content_text: JSON.stringify(json),
          status: "published",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    },
    [queryClient]
  );

  /* ── Add to recent edits list ── */
  const addEdit = useCallback((edit: EditEntry) => {
    setRecentEdits((prev) => [edit, ...prev].slice(0, 50));
  }, []);

  /* ── Discard a specific edit ── */
  const discardEdit = useCallback(
    async (section: string, key: string, locale: string) => {
      await supabase
        .from("site_content")
        .delete()
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", locale)
        .eq("status", "draft");

      setRecentEdits((prev) =>
        prev.filter(
          (e) => !(e.section === section && e.contentKey === key && e.locale === locale)
        )
      );
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
    },
    []
  );

  /* ── Publish all drafts ── */
  const publishAll = useCallback(async (): Promise<{ count: number }> => {
    const { data, error } = await supabase.rpc("publish_all_drafts");
    if (error) return { count: 0 };
    setRecentEdits([]);
    await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
    await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    return { count: (data as number) || 0 };
  }, [queryClient]);

  /* ── Publish selected drafts by ID ── */
  const publishSelectedDrafts = useCallback(async (ids: string[]): Promise<{ count: number }> => {
    if (!ids.length) return { count: 0 };
    const { error } = await supabase
      .from("site_content")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return { count: 0 };
    setRecentEdits([]);
    await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
    await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    return { count: ids.length };
  }, [queryClient]);

  /* ── Discard all drafts ── */
  const discardAllDrafts = useCallback(async (): Promise<{ count: number }> => {
    const { data, error } = await supabase.rpc("discard_all_drafts");
    if (error) return { count: 0 };
    setRecentEdits([]);
    await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
    await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    return { count: (data as number) || 0 };
  }, [queryClient]);

  /* ── Discard section drafts ── */
  const discardSectionDrafts = useCallback(async (section: string): Promise<{ count: number }> => {
    const { data, error } = await supabase.rpc("discard_section_drafts", { p_section: section });
    if (error) return { count: 0 };
    setRecentEdits((prev) => prev.filter((e) => e.section !== section));
    await queryClient.invalidateQueries({ queryKey: ["site_content"], exact: false });
    await queryClient.refetchQueries({ queryKey: ["site_content"], exact: false });
    return { count: (data as number) || 0 };
  }, [queryClient]);

  /* ── Upload media to Supabase Storage ── */
  const uploadMedia = useCallback(
    async (file: File, section: string, key: string): Promise<string | null> => {
      const fileName = `${section}/${key}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from("media").upload(fileName, file);
      if (error) {
        console.error("Upload failed:", error);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(data.path);

      await supabase.from("media").insert({
        file_name: file.name,
        storage_path: data.path,
        public_url: publicUrl,
        section,
        content_key: key,
        mime_type: file.type,
        size_bytes: file.size,
      });

      // Auto-publish media URL as published content so public visitors see it
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("section", section)
        .eq("content_key", key)
        .eq("locale", "en")
        .maybeSingle();

      if (existing) {
        await supabase.from("site_content").update({ content_text: publicUrl, status: "published", updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({ section, content_key: key, locale: "en", content_text: publicUrl, status: "published" });
        await supabase.from("site_content").insert({ section, content_key: key, locale: "ne", content_text: publicUrl, status: "published" });
        await supabase.from("site_content").insert({ section, content_key: key, locale: "ja", content_text: publicUrl, status: "published" });
      }

      return publicUrl;
    },
    []
  );

  /* ── Get media URL ── */
  const getMedia = useCallback(
    (section: string, key: string): string => {
      const locales = ["en", "ne", "ja"];
      for (const l of locales) {
        const rk = rowKey(section, key, l);
        const d = draftContent.get(rk);
        if (d?.content_text) return d.content_text;
        const p = publishedContent.get(rk);
      console.log("GETJSON_DEBUG:", rk, !!p, p?.status);
        if (p?.content_text) return p.content_text;
      }
      return "";
    },
    [draftContent, publishedContent]
  );

  /* ── Seed content from siteConfig ── */
  const seedContent = useCallback(async (): Promise<{ count: number; error?: string }> => {
    const { seedAllContent } = await import("@/lib/seedContent");
    const result = await seedAllContent();
    if (!result.error) queryClient.invalidateQueries({ queryKey: ["site_content"] });
    return result;
  }, []);

  const seedSection = useCallback(async (section: string): Promise<{ count: number; error?: string }> => {
    const { seedSectionContent } = await import("@/lib/seedContent");
    const result = await seedSectionContent(section);
    if (!result.error) queryClient.invalidateQueries({ queryKey: ["site_content"] });
    return result;
  }, []);

  /* ── Auth ── */
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Invalid email or password." };
    return {};
  }, []);

  const logout = useCallback(async () => {
    setIsPreviewMode(false);
    if (typeof document !== "undefined") {
      document.cookie = "kes_preview=; path=/; max-age=0";
    }
    try {
      await supabase.auth.signOut();
    } catch {
      /* best-effort: clear state regardless */
    }
    setIsAdmin(false);
    setIsSuperadmin(false);
    setIsEditing(false);
    setRecentEdits([]);
    setPublishedContent(new Map());
    setDraftContent(new Map());
    setDraftCount(0);
  }, []);

  /* ── Delete a content row entirely (all locales) ── */
  const deleteItem = useCallback(
    async (section: string, key: string) => {
      await supabase.from("site_content").delete()
        .eq("section", section)
        .eq("content_key", key);
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
    },
    []
  );

  /* ── List all rows in a section ── */
  const listSectionItems = useCallback(
    (section: string): SiteContentRow[] => {
      const all = new Map([...publishedContent, ...draftContent]);
      const rows: SiteContentRow[] = [];
      const seen = new Set<string>();
      all.forEach((row) => {
        if (row.section === section && !seen.has(row.content_key)) {
          seen.add(row.content_key);
          rows.push(row);
        }
      });
      return rows;
    },
    [publishedContent, draftContent]
  );

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.cookie = next
          ? "kes_preview=1; path=/; max-age=86400; SameSite=Lax; Secure"
          : "kes_preview=; path=/; max-age=0; Secure";
      }
      return next;
    });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isSuperadmin,
        authReady,
        isEditing,
        isPreviewMode,
        editingLocale,
        recentEdits,
        draftCount,
        publishedContent,
        draftContent,
        login,
        logout,
        toggleEditMode,
        togglePreviewMode,
        setEditingLocale,
        addEdit,
        saveContent,
        saveJson,
        savePublishedContent,
        savePublishedJson,
        publishAll,
        publishSelectedDrafts,
        discardAllDrafts,
        discardSectionDrafts,
        discardEdit,
        getContent,
        getJson,
        getMeta,
        getMedia,
        uploadMedia,
        hasDraft,
        loadAllContent,
        contentReady,
        deleteItem,
        listSectionItems,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}







