"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
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
  status: "draft" | "published";
}

interface AdminContextValue {
  isAdmin: boolean;
  isEditing: boolean;
  editingLocale: string;
  recentEdits: EditEntry[];
  draftCount: number;
  publishedContent: Map<string, SiteContentRow>;
  draftContent: Map<string, SiteContentRow>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  toggleEditMode: () => void;
  setEditingLocale: (locale: string) => void;
  addEdit: (edit: EditEntry) => void;
  saveContent: (section: string, key: string, locale: string, text: string) => Promise<void>;
  publishAll: () => Promise<void>;
  discardEdit: (section: string, key: string, locale: string) => void;
  getContent: (section: string, key: string, locale: string) => string;
  uploadMedia: (file: File, section: string, key: string) => Promise<string | null>;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

/* ── Helpers ── */

function rowKey(section: string, key: string, locale: string) {
  return `${section}::${key}::${locale}`;
}

/* ── Provider ── */

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLocale, setEditingLocale] = useState("en");
  const [recentEdits, setRecentEdits] = useState<EditEntry[]>([]);
  const [publishedContent, setPublishedContent] = useState<Map<string, SiteContentRow>>(new Map());
  const [draftContent, setDraftContent] = useState<Map<string, SiteContentRow>>(new Map());
  const [draftCount, setDraftCount] = useState(0);

  /* ── Check auth on mount ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
      if (!session) setIsEditing(false);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  /* ── Load content from Supabase on admin login ── */
  useEffect(() => {
    if (!isAdmin) return;
    loadAllContent();
  }, [isAdmin]);

  /* ── Real-time subscriptions ── */
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        () => loadAllContent()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const loadAllContent = async () => {
    const { data } = await supabase.from("site_content").select("*");
    if (!data) return;

    const pub = new Map<string, SiteContentRow>();
    const draft = new Map<string, SiteContentRow>();
    let dCount = 0;

    (data as SiteContentRow[]).forEach((row) => {
      const key = rowKey(row.section, row.content_key, row.locale);
      if (row.status === "published") {
        pub.set(key, row);
      } else {
        draft.set(key, row);
        dCount++;
      }
    });

    setPublishedContent(pub);
    setDraftContent(draft);
    setDraftCount(dCount);
  };

  /* ── Get content (draft overrides published) ── */
  const getContent = useCallback(
    (section: string, key: string, locale: string): string => {
      const rk = rowKey(section, key, locale);
      const d = draftContent.get(rk);
      if (d) return d.content_text || "";
      const p = publishedContent.get(rk);
      if (p) return p.content_text || "";
      return "";
    },
    [draftContent, publishedContent]
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

      if (existing) {
        await supabase
          .from("site_content")
          .update({ content_text: text, status: "draft", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          section,
          content_key: key,
          locale,
          content_text: text,
          status: "draft",
        });
      }

      // Log edit
      await supabase.from("edit_log").insert({
        section,
        content_key: key,
        locale,
        new_value: text,
      });
    },
    []
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
      await loadAllContent();
    },
    []
  );

  /* ── Publish all drafts ── */
  const publishAll = useCallback(async () => {
    await supabase.rpc("publish_all_drafts");
    setRecentEdits([]);
    await loadAllContent();
  }, []);

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

      return publicUrl;
    },
    []
  );

  /* ── Auth ── */
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setIsAdmin(true);
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsEditing(false);
    setRecentEdits([]);
    setPublishedContent(new Map());
    setDraftContent(new Map());
    setDraftCount(0);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isEditing,
        editingLocale,
        recentEdits,
        draftCount,
        publishedContent,
        draftContent,
        login,
        logout,
        toggleEditMode,
        setEditingLocale,
        addEdit,
        saveContent,
        publishAll,
        discardEdit,
        getContent,
        uploadMedia,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
