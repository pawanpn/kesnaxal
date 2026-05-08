"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import type { NewsArticle, LocaleContent } from "@/types";

type Locale = "en" | "ne" | "ja";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const CATEGORIES = ["Achievement", "Event", "Announcement", "Infrastructure", "Result"];

function emptyLC(): LocaleContent { return { en: "", ne: "", ja: "" }; }

function emptyArticle(id: number): NewsArticle {
  return {
    id,
    slug: "",
    title: emptyLC(),
    excerpt: emptyLC(),
    content: emptyLC(),
    author: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
    category: "Event",
    tags: [],
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

/* ── Simple Rich Text Toolbar ── */
function RichTextEditor({
  html,
  onChange,
  placeholder,
  onImageUpload,
  uploading,
}: {
  html: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string | null>;
  uploading?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [showSource, setShowSource] = useState(false);
  const isInternal = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      const sel = saveSelection();
      editorRef.current.innerHTML = html || "";
      restoreSelection(sel);
    }
    isInternal.current = false;
  }, [html]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternal.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) execCmd("insertImage", url);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    const url = await onImageUpload(file);
    if (url) execCmd("insertImage", url);
    e.target.value = "";
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-1.5 bg-surface border-b border-border flex-wrap">
        <ToolbarBtn cmd="bold" label="B" title="Bold (Ctrl+B)" />
        <ToolbarBtn cmd="italic" label="I" title="Italic (Ctrl+I)" cls="italic" />
        <ToolbarBtn cmd="underline" label="U" title="Underline (Ctrl+U)" cls="underline" />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn cmd="formatBlock" val="h2" label="H2" title="Heading 2" />
        <ToolbarBtn cmd="formatBlock" val="h3" label="H3" title="Heading 3" />
        <ToolbarBtn cmd="formatBlock" val="p" label="P" title="Paragraph" />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn cmd="insertUnorderedList" label="•" title="Bullet List" />
        <ToolbarBtn cmd="insertOrderedList" label="1." title="Numbered List" />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolbarBtn cmd="createLink" label="🔗" title="Insert Link" />
        <button onClick={handleInsertImage} type="button"
          className="w-7 h-7 flex items-center justify-center rounded text-xs hover:bg-white/60" title="Insert Image URL">
          🖼
        </button>
        {onImageUpload && (
          <label className="w-7 h-7 flex items-center justify-center rounded text-xs hover:bg-white/60 cursor-pointer" title="Upload Image">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
            {uploading && <span className="ml-0.5 animate-spin">⏳</span>}
          </label>
        )}
        <span className="w-px h-5 bg-border mx-0.5" />
        <button onClick={() => setShowSource(!showSource)} type="button"
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${showSource ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
          HTML
        </button>
      </div>

      {showSource ? (
        <textarea
          value={html}
          onChange={(e) => { onChange(e.target.value); }}
          rows={8}
          className="w-full px-3 py-2 outline-none text-xs font-mono resize-y bg-white"
          placeholder={placeholder}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          className="w-full px-3 py-2 outline-none text-xs min-h-[180px] max-h-[400px] overflow-y-auto bg-white
            [&[data-placeholder]:empty:before]:content-[attr(data-placeholder)] [&[data-placeholder]:empty:before]:text-muted
            [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
            [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2
            [&_li]:mb-0.5 [&_img]:max-w-full [&_img]:rounded [&_img]:my-2
            [&_a]:text-primary [&_a]:underline [&_strong]:font-bold [&_em]:italic [&_u]:underline"
        />
      )}
    </div>
  );
}

function ToolbarBtn({ cmd, val, label, title, cls }: { cmd: string; val?: string; label: string; title: string; cls?: string }) {
  const handle = () => { document.execCommand(cmd, false, val); };
  return (
    <button onClick={handle} type="button"
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold hover:bg-white/60 ${cls || ""}`} title={title}>
      {label}
    </button>
  );
}

/* ── Save Selection helper for contentEditable ── */
function saveSelection() {
  const sel = typeof window !== "undefined" ? window.getSelection() : null;
  if (sel && sel.rangeCount > 0) {
    return { range: sel.getRangeAt(0), node: sel.anchorNode, offset: sel.anchorOffset };
  }
  return null;
}
function restoreSelection(saved: ReturnType<typeof saveSelection>) {
  if (!saved || typeof window === "undefined") return;
  try {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(saved.range);
    }
  } catch { /* ignore */ }
}

/* ── Main Page ── */
export default function NewsAdminPage() {
  const { getJson, saveJson, getContent, uploadMedia, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const { toast } = useToast();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lang, setLang] = useState<Locale>("en");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const json = getJson("news", "news_articles", lang);
    const arr = json?.articles as NewsArticle[] | undefined;
    if (arr && arr.length > 0) {
      setArticles(arr);
    } else {
      const raw = getContent("news", "news_articles", lang);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.articles?.length) setArticles(parsed.articles);
          else setArticles([]);
        } catch { setArticles([]); }
      } else {
        setArticles([]);
      }
    }
    if (!initialized) setInitialized(true);
  }, [lang, getJson, getContent, initialized]);

  const selected = articles.find((a) => a.id === selectedId) || null;

  const saveArticles = async (updated: NewsArticle[]) => {
    setSaving(true);
    try {
      for (const { id: l } of LOCALES) {
        if (autoTranslate && l !== lang) {
          await saveJson("news", "news_articles", l, { articles: updated });
        } else if (!autoTranslate && l === lang) {
          await saveJson("news", "news_articles", l, { articles: updated });
        }
      }
      if (!autoTranslate) {
        await saveJson("news", "news_articles", lang, { articles: updated });
      }
      setArticles(updated);
      toast("success", "Articles saved!");
    } catch (e) {
      toast("error", "Failed to save articles");
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const setSelected = (article: NewsArticle) => {
    setArticles((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    setSelectedId(article.id);
  };

  const handleSelect = (id: number) => {
    // Save current if dirty
    setSelectedId(id);
  };

  const handleAdd = () => {
    const maxId = articles.reduce((max, a) => Math.max(max, a.id), 0);
    const newArticle = emptyArticle(maxId + 1);
    setArticles((prev) => [...prev, newArticle]);
    setSelectedId(newArticle.id);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const updated = articles.filter((a) => a.id !== id);
    saveArticles(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const handleField = (field: keyof NewsArticle, value: unknown) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value };
    setSelected(updated);
  };

  const handleLocaleField = (field: "title" | "excerpt" | "content", locale: Locale, value: string) => {
    if (!selected) return;
    const next = { ...selected[field], [locale]: value };
    if (autoTranslate) {
      LOCALES.forEach((l) => { next[l.id] = value; });
    }
    handleField(field, next);
  };

  const handleTitleChange = (locale: Locale, value: string) => {
    handleLocaleField("title", locale, value);
    if (!selected) return;
    if (locale === lang && !selected.slug) {
      const s = slugify(value);
      handleField("slug", s);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadMedia(file, "news", `article_${selected?.id || "new"}_cover`);
    if (url) { handleField("image", url); toast("success", "Cover image uploaded!"); }
    setUploading(false);
    if (e.target) e.target.value = "";
  };

  const handleRichImageUpload = async (file: File): Promise<string | null> => {
    const url = await uploadMedia(file, "news", `article_${selected?.id || "new"}_inline`);
    return url;
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !selected) return;
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (selected.tags.includes(tag)) { setTagInput(""); return; }
    handleField("tags", [...selected.tags, tag]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!selected) return;
    handleField("tags", selected.tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    saveArticles(articles);
  };

  const hasPending = hasDraft("news", "news_articles", "en") || hasDraft("news", "news_articles", "ne") || hasDraft("news", "news_articles", "ja");

  return (
    <AdminGuard>
      <div className="flex h-full">
        {/* Left sidebar - Article list */}
        <div className="w-64 shrink-0 border-r border-border bg-white flex flex-col">
          <div className="p-3 border-b border-border">
            <button onClick={handleAdd}
              className="w-full py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Article
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {articles.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted text-center italic">No articles yet. Click above to add one.</p>
            )}
            {articles.map((a) => (
              <button key={a.id}
                onClick={() => handleSelect(a.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/50 transition-colors ${
                  selectedId === a.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface"
                }`}>
                <p className="text-xs font-semibold truncate text-foreground">{a.title[lang] || a.title.en || "(Untitled)"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted">{a.date}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{a.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white shrink-0">
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground">News Articles</h1>
              <p className="text-[10px] text-muted mt-0.5">Create and manage news articles with rich content and images</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={saving || articles.length === 0}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? "Saving..." : "Save All Articles"}
              </button>
              <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("news"); toast("success", "Drafts discarded"); setDiscarding(false); window.location.reload(); }}
                disabled={discarding}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
                Discard
              </button>
            </div>
          </div>

          {/* Editor body */}
          {selected ? (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Locale + Auto */}
              <div className="flex items-center justify-between mb-5 max-w-4xl">
                <div className="flex gap-1 bg-surface rounded-lg border border-border p-0.5">
                  {LOCALES.map((l) => (
                    <button key={l.id} onClick={() => setLang(l.id)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
                    <button onClick={() => setAutoTranslate(!autoTranslate)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${autoTranslate ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${autoTranslate ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                    Auto
                  </label>
                  <button onClick={() => handleDelete(selected.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>

              {autoTranslate && (
                <div className="mb-4 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 max-w-4xl">
                  Auto-translate ON — editing any locale copies to all. Toggle OFF for per-language editing.
                </div>
              )}

              <div className="space-y-5 max-w-4xl">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOCALES.map((l) => (
                      <div key={l.id} className="relative">
                        <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                        <input type="text" value={selected.title[l.id] || ""}
                          onChange={(e) => handleTitleChange(l.id, e.target.value)}
                          className="w-full px-2 py-1.5 pt-3 rounded border border-border text-xs focus:border-primary outline-none"
                          placeholder={`Title (${l.id.toUpperCase()})`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slug, Author, Date, Category in a row */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Slug</label>
                    <input type="text" value={selected.slug}
                      onChange={(e) => handleField("slug", e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono"
                      placeholder="article-slug" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Author</label>
                    <input type="text" value={selected.author}
                      onChange={(e) => handleField("author", e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      placeholder="KES Media Team" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
                    <input type="date" value={selected.date}
                      onChange={(e) => handleField("date", e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                    <select value={selected.category}
                      onChange={(e) => handleField("category", e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none bg-white">
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        {t}
                        <button onClick={() => handleRemoveTag(t)} className="hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input type="text" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                      className="flex-1 px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                      placeholder="Add tag, press Enter" />
                    <button onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-border hover:bg-white">+</button>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Cover Image</label>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-20 rounded-lg border border-border bg-surface flex items-center justify-center overflow-hidden shrink-0">
                      {selected.image ? (
                        <img src={selected.image} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                        {uploading ? "Uploading..." : selected.image ? "Change Image" : "Upload Image"}
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      {selected.image && (
                        <div className="mt-1">
                          <input type="url" value={selected.image}
                            onChange={(e) => handleField("image", e.target.value)}
                            className="w-full px-2 py-1 rounded border border-border text-[10px] focus:border-primary outline-none font-mono"
                            placeholder="Or paste image URL" />
                        </div>
                      )}
                      <p className="text-[10px] text-muted mt-1">Recommended: 1200x630px, JPG/PNG</p>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Excerpt / Summary</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOCALES.map((l) => (
                      <div key={l.id} className="relative">
                        <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                        <textarea value={selected.excerpt[l.id] || ""}
                          onChange={(e) => handleLocaleField("excerpt", l.id, e.target.value)} rows={3}
                          className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                          placeholder={`Brief summary (${l.id.toUpperCase()})`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content - Rich Text */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Content — <span className="text-primary font-bold">{lang.toUpperCase()}</span></label>
                  <RichTextEditor
                    html={selected.content[lang] || ""}
                    onChange={(val) => handleLocaleField("content", lang, val)}
                    placeholder={`Write article content in ${lang.toUpperCase()}... Use the toolbar to format text, insert images and links.`}
                    onImageUpload={handleRichImageUpload}
                    uploading={uploading}
                  />
                </div>
              </div>

              {/* Save current button */}
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                  {saving ? "Saving..." : "Save All Articles"}
                </button>
                {hasPending && <span className="text-xs text-yellow-600">Draft pending</span>}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-xs">Select an article from the left or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
