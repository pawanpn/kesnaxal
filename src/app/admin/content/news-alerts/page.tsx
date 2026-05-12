"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { translateToAll } from "@/lib/autoTranslate";
import { siteConfig } from "@/constants/siteConfig";
import type { NewsArticle } from "@/types";

type Locale = "en" | "ne" | "ja";
type LocaleContent = { en: string; ne: string; ja: string };

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" }, { id: "ne", label: "NE" }, { id: "ja", label: "JA" },
];

const CATEGORIES = ["Achievement", "Event", "Announcement", "Infrastructure", "Result"];

const COLORS = [
  "#000000", "#1a1a2e", "#e94560", "#0f3460", "#16213e",
  "#e23e57", "#533483", "#6a2c70", "#b83b5e", "#f08a5d",
  "#ff5722", "#4caf50", "#2196f3", "#9c27b0", "#ff9800",
  "#795548", "#607d8b", "#ffffff", "#cccccc", "#666666",
];

function emptyArticle(): NewsArticle {
  const now = new Date().toISOString().split("T")[0];
  return {
    id: Date.now(),
    slug: "",
    title: { en: "", ne: "", ja: "" },
    excerpt: { en: "", ne: "", ja: "" },
    content: { en: "", ne: "", ja: "" },
    author: "",
    date: now,
    image: "",
    category: "Announcement",
    tags: [],
  };
}

function execCmd(cmd: string, val?: string) {
  document.execCommand(cmd, false, val);
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  useEffect(() => {
    if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, htmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleHtml = () => {
    if (htmlMode) {
      onChange(rawHtml);
    } else {
      setRawHtml(editorRef.current?.innerHTML || "");
    }
    setHtmlMode(!htmlMode);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {!htmlMode && (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-surface border-b border-border">
          <button type="button" onClick={() => execCmd("bold")} title="Bold (Ctrl+B)" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-xs font-bold">B</button>
          <button type="button" onClick={() => execCmd("italic")} title="Italic (Ctrl+I)" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-xs italic">I</button>
          <button type="button" onClick={() => execCmd("underline")} title="Underline (Ctrl+U)" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-xs underline">U</button>
          <span className="w-px h-5 bg-border mx-0.5" />
          <button type="button" onClick={() => execCmd("formatBlock", "h2")} title="Heading 2" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px] font-bold">H2</button>
          <button type="button" onClick={() => execCmd("formatBlock", "h3")} title="Heading 3" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px] font-bold">H3</button>
          <button type="button" onClick={() => execCmd("formatBlock", "p")} title="Paragraph" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[9px]">P</button>
          <span className="w-px h-5 bg-border mx-0.5" />
          <button type="button" onClick={() => execCmd("insertUnorderedList")} title="Bullet List" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px]">•≡</button>
          <button type="button" onClick={() => execCmd("insertOrderedList")} title="Numbered List" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px]">1≡</button>
          <span className="w-px h-5 bg-border mx-0.5" />
          <button type="button" onClick={() => { const u = prompt("URL:"); if (u) execCmd("createLink", u); }} title="Insert Link" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px]">🔗</button>
          <button type="button" onClick={() => { const u = prompt("Image URL:"); if (u) execCmd("insertImage", u); }} title="Insert Image" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[10px]">🖼</button>
          <span className="w-px h-5 bg-border mx-0.5" />
          <div className="relative" title="Text Color">
            <input type="color" onChange={(e) => execCmd("foreColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
          </div>
          <div className="flex items-center gap-0.5 ml-auto">
            {COLORS.slice(0, 8).map((c) => (
              <button key={c} type="button" onClick={() => execCmd("foreColor", c)} title={c}
                className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="w-px h-5 bg-border mx-0.5" />
          <button type="button" onClick={toggleHtml} title="HTML Source" className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[9px] font-mono">&lt;/&gt;</button>
        </div>
      )}
      {htmlMode ? (
        <textarea value={rawHtml} onChange={(e) => setRawHtml(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 text-xs font-mono bg-yellow-50 outline-none resize-y"
          placeholder={placeholder}
          style={{ minHeight: `${rows * 24}px` }} />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="w-full px-3 py-2 text-sm outline-none min-h-[120px] prose-custom"
          style={{ minHeight: `${rows * 24}px` }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function NewsAlertsPage() {
  const { getContent, getJson, saveContent, saveJson, uploadMedia, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"articles" | "breaking">("articles");
  const [lang, setLang] = useState<Locale>("en");
  const [contentLang, setContentLang] = useState<Locale>("en");
  const [syncing, setSyncing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  // ── News Articles ──
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  // ── Breaking & Emergency ──
  const [breakingNews, setBreakingNews] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [breakingActive, setBreakingActive] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyMsg, setEmergencyMsg] = useState<Record<Locale, string>>({ en: "", ne: "", ja: "" });
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [alertSaving, setAlertSaving] = useState<string | null>(null);

  useEffect(() => { loadAllContent(); }, []);

  // Load articles
  useEffect(() => {
    const arr = LOCALES.reduce<NewsArticle[]>((acc, { id: l }) => {
      if (acc.length) return acc;
      const json = getJson("news", "news_articles", l);
      const data = json?.articles as NewsArticle[] | undefined;
      return data?.length ? data : acc;
    }, [] as NewsArticle[]);
    setArticles(arr.length ? arr : [...siteConfig.newsArticles]);
  }, [getJson]);

  // Load breaking/emergency
  useEffect(() => {
    const bn: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const et: Record<Locale, string> = { en: "", ne: "", ja: "" };
    const em: Record<Locale, string> = { en: "", ne: "", ja: "" };
    LOCALES.forEach(({ id: l }) => {
      bn[l] = getContent("news", "breaking_news_text", l);
      et[l] = getContent("news", "emergency_title", l);
      em[l] = getContent("news", "emergency_message", l);
    });
    setBreakingNews(bn);
    setEmergencyTitle(et);
    setEmergencyMsg(em);
    const bm = getJson("news", "breaking_news_active", "en");
    setBreakingActive((bm as { active?: boolean })?.active || false);
    const emeta = getJson("news", "emergency_active", "en");
    setEmergencyActive((emeta as { active?: boolean })?.active || false);
  }, [getContent, getJson]);

  const saveArticles = async (updated: NewsArticle[]) => {
    setSaving(true);
    try {
      for (const loc of ["en", "ne", "ja"]) {
        await saveJson("news", "news_articles", loc, { articles: updated });
      }
      setArticles(updated);
      toast("success", "Articles saved as draft — publish from Review page");
    } catch { toast("error", "Save failed"); }
    setSaving(false);
  };

  const handleSaveArticle = async () => {
    if (!editing) return;
    const exists = articles.find((a) => a.id === editing.id);
    const updated = exists
      ? articles.map((a) => (a.id === editing.id ? editing : a))
      : [editing, ...articles];
    await saveArticles(updated);
    setEditing(null);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    const updated = articles.filter((a) => a.id !== id);
    await saveArticles(updated);
  };

  const updateField = (field: keyof NewsArticle, value: string | number | string[]) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const updateLocaleField = (field: "title" | "excerpt" | "content", locale: Locale, value: string) => {
    if (!editing) return;
    if (syncing) {
      setEditing({ ...editing, [field]: { en: value, ne: value, ja: value } });
    } else {
      setEditing({ ...editing, [field]: { ...(editing[field] as LocaleContent), [locale]: value } });
    }
  };

  const handleTranslate = async (field: "title" | "excerpt" | "content" | "breaking" | "emergency_title" | "emergency_msg") => {
    let text = "";
    if (field === "breaking") text = breakingNews[lang];
    else if (field === "emergency_title") text = emergencyTitle[lang];
    else if (field === "emergency_msg") text = emergencyMsg[lang];
    else if (editing) text = (editing[field] as LocaleContent)[lang];
    if (!text?.trim() || translating) return;

    setTranslating(true);
    try {
      const results = await translateToAll(text, lang);
      if (field === "breaking") {
        setBreakingNews((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      } else if (field === "emergency_title") {
        setEmergencyTitle((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      } else if (field === "emergency_msg") {
        setEmergencyMsg((p) => { const n = { ...p }; for (const [l, v] of Object.entries(results)) if (v) n[l as Locale] = v; return n; });
      } else if (editing) {
        setEditing((prev) => {
          if (!prev) return prev;
          const updated = { ...(prev[field] as LocaleContent) };
          for (const [l, v] of Object.entries(results)) if (v) updated[l as Locale] = v;
          return { ...prev, [field]: updated };
        });
      }
    } catch {}
    setTranslating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingImg(true);
    const url = await uploadMedia(file, "news", `article_img_${Date.now()}`);
    if (url) { setEditing({ ...editing, image: url }); toast("success", "Image uploaded"); }
    else toast("error", "Upload failed");
    setUploadingImg(false);
    e.target.value = "";
  };

  const addTag = () => {
    if (!editing || !tagInput.trim()) return;
    if (!editing.tags.includes(tagInput.trim())) {
      setEditing({ ...editing, tags: [...editing.tags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!editing) return;
    setEditing({ ...editing, tags: editing.tags.filter((t) => t !== tag) });
  };

  // ── Breaking / Emergency save helpers ──
  const handleToggleSave = async (key: string, active: boolean) => {
    try { await saveJson("news", key, "en", { active }); toast("success", "Saved"); } catch { toast("error", "Failed"); }
  };
  const handleSaveBreaking = async () => {
    setAlertSaving("breaking");
    try {
      for (const { id: l } of LOCALES) await saveContent("news", "breaking_news_text", l, syncing ? breakingNews[lang] : breakingNews[l]);
      toast("success", "Saved");
    } catch { toast("error", "Failed"); }
    setAlertSaving(null);
  };
  const handleSaveEmergency = async () => {
    setAlertSaving("emergency");
    try {
      for (const { id: l } of LOCALES) {
        await saveContent("news", "emergency_title", l, syncing ? emergencyTitle[lang] : emergencyTitle[l]);
        await saveContent("news", "emergency_message", l, syncing ? emergencyMsg[lang] : emergencyMsg[l]);
      }
      toast("success", "Saved");
    } catch { toast("error", "Failed"); }
    setAlertSaving(null);
  };

  const sortedArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">News &amp; Alerts</h1>
            <p className="text-xs text-muted mt-1">Manage news articles, breaking ticker, and emergency popups</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l.id ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
              <button type="button" onClick={() => setSyncing(!syncing)}
                className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${syncing ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${syncing ? "translate-x-3" : "translate-x-0"}`} />
              </button>
              Sync
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-4 w-fit">
          <button onClick={() => setActiveTab("articles")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "articles" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            News Articles
          </button>
          <button onClick={() => setActiveTab("breaking")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "breaking" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Breaking &amp; Emergency
          </button>
        </div>

        {/* ============ NEWS ARTICLES TAB ============ */}
        {activeTab === "articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Article List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-sm text-foreground">Articles ({articles.length})</h2>
                <button onClick={() => setEditing(emptyArticle())}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700">+ New</button>
              </div>
              {articles.length === 0 ? (
                <p className="text-xs text-muted italic py-8 text-center">No articles yet.</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {sortedArticles.map((a) => (
                    <div key={a.id} className={`p-3 rounded-xl border transition-all ${editing?.id === a.id ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditing({ ...a })}>
                          {a.image && <img src={a.image} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />}
                          <p className="text-xs font-semibold text-foreground truncate">{(a.title as LocaleContent)[lang] || (a.title as LocaleContent).en || "Untitled"}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{a.category}</span>
                            <span className="text-[10px] text-muted">{a.date}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteArticle(a.id)}
                          className="w-6 h-6 shrink-0 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit/Add Form */}
            <div className="lg:col-span-3">
              {editing ? (
                <div className="bg-white rounded-xl border border-border p-5 lg:sticky lg:top-6 space-y-4 max-h-[700px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-bold text-sm text-foreground">
                      {articles.find((a) => a.id === editing.id) ? "Edit Article" : "New Article"} ({lang.toUpperCase()})
                    </h2>
                    <button onClick={() => setEditing(null)} className="text-xs text-muted hover:text-foreground">Cancel</button>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Article Image</label>
                    <div className="flex items-center gap-3">
                      {editing.image && <img src={editing.image} alt="" className="w-24 h-16 object-cover rounded-lg border" />}
                      <div className="flex-1 flex gap-2">
                        <input type="url" value={editing.image} onChange={(e) => updateField("image", e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono" placeholder="https://... or upload" />
                        <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface text-muted hover:bg-primary/10 cursor-pointer border">
                          {uploadingImg ? "..." : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Title (per locale) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-foreground">Title *</label>
                      <button onClick={() => handleTranslate("title")} disabled={translating || !(editing.title as LocaleContent)[lang]?.trim()}
                        className="text-[9px] text-primary hover:underline disabled:opacity-30">{translating ? "..." : "Translate"}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCALES.map((l) => (
                        <div key={l.id} className="relative">
                          <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                          <input value={(editing.title as LocaleContent)[l.id] || ""}
                            onChange={(e) => updateLocaleField("title", l.id, e.target.value)}
                            className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none" placeholder={`Title (${l.id.toUpperCase()})`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-foreground">Excerpt</label>
                      <button onClick={() => handleTranslate("excerpt")} disabled={translating || !(editing.excerpt as LocaleContent)[lang]?.trim()}
                        className="text-[9px] text-primary hover:underline disabled:opacity-30">{translating ? "..." : "Translate"}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCALES.map((l) => (
                        <div key={l.id} className="relative">
                          <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.id.toUpperCase()}</span>
                          <textarea value={(editing.excerpt as LocaleContent)[l.id] || ""}
                            onChange={(e) => updateLocaleField("excerpt", l.id, e.target.value)} rows={2}
                            className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-none" placeholder={`Excerpt (${l.id.toUpperCase()})`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content — Rich Text Editor per locale */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <label className="block text-[11px] font-semibold text-foreground">Content</label>
                        <div className="flex gap-0.5">
                          {LOCALES.map((l) => (
                            <button key={l.id} type="button" onClick={() => setContentLang(l.id)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${contentLang === l.id ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200"}`}>
                              {l.id.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleTranslate("content")} disabled={translating || !(editing.content as LocaleContent)[lang]?.trim()}
                        className="text-[9px] text-primary hover:underline disabled:opacity-30">{translating ? "..." : "Translate"}</button>
                    </div>
                    <RichTextEditor
                      value={(editing.content as LocaleContent)[contentLang] || ""}
                      onChange={(html) => updateLocaleField("content", contentLang, html)}
                      placeholder={`Write article content in ${contentLang.toUpperCase()}...`}
                      rows={8}
                    />
                  </div>

                  {/* Meta fields */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Author</label>
                      <input value={editing.author} onChange={(e) => updateField("author", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-[10px] focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Date</label>
                      <input type="date" value={editing.date}
                        onChange={(e) => updateField("date", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-[10px] focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                      <select value={editing.category} onChange={(e) => updateField("category", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-[10px] focus:border-primary outline-none bg-white">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-0.5">Slug</label>
                      <input value={editing.slug} onChange={(e) => updateField("slug", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border text-[10px] focus:border-primary outline-none font-mono" placeholder="auto-generate" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[10px] font-semibold text-muted mb-1">Tags</label>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {editing.tags.map((t) => (
                        <span key={t} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px]">
                          {t}
                          <button onClick={() => removeTag(t)} className="ml-0.5 hover:text-red-500">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        className="flex-1 px-2 py-1 rounded border border-border text-[10px] focus:border-primary outline-none" placeholder="Add tag..." />
                      <button onClick={addTag} disabled={!tagInput.trim()}
                        className="px-2 py-1 rounded text-[10px] font-semibold bg-primary text-white disabled:opacity-40">Add</button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveArticle} disabled={saving || !(editing.title as LocaleContent).en?.trim()}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                      {saving ? "Saving..." : "Save Draft"}
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="py-2.5 px-4 rounded-lg text-xs font-semibold border border-border text-muted hover:bg-surface">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-xl border border-border p-8 text-center">
                  <p className="text-xs text-muted">Select an article to edit or click &quot;+ New&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ BREAKING & EMERGENCY TAB ============ */}
        {activeTab === "breaking" && (
          <div className="space-y-6 max-w-2xl">
            {/* Breaking News */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-sm text-foreground">Breaking News Ticker</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-muted">{breakingActive ? "ON" : "OFF"}</span>
                  <button onClick={() => { setBreakingActive(!breakingActive); handleToggleSave("breaking_news_active", !breakingActive); }}
                    className={`w-10 h-5 rounded-full transition-colors relative ${breakingActive ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${breakingActive ? "translate-x-5" : ""}`} />
                  </button>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {LOCALES.map(({ id: l }) => (
                  <div key={l} className="relative">
                    <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                    <textarea value={breakingNews[l] || ""}
                      onChange={(e) => setBreakingNews((p) => {
                        const n = { ...p, [l]: e.target.value };
                        if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value);
                        return n;
                      })} rows={2}
                      className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y"
                      placeholder={`Breaking news (${l.toUpperCase()})`} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => handleTranslate("breaking")} disabled={translating || !breakingNews[lang]?.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">
                  {translating ? <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> ...</> : "Translate"}
                </button>
              </div>
              <button onClick={handleSaveBreaking}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                {alertSaving === "breaking" ? "Saving..." : "Save News"}
              </button>
            </div>

            {/* Emergency Popup */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-sm text-foreground">Emergency Pop-up</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-muted">{emergencyActive ? "ON" : "OFF"}</span>
                  <button onClick={() => { setEmergencyActive(!emergencyActive); handleToggleSave("emergency_active", !emergencyActive); }}
                    className={`w-10 h-5 rounded-full transition-colors relative ${emergencyActive ? "bg-accent" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emergencyActive ? "translate-x-5" : ""}`} />
                  </button>
                </label>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {LOCALES.map(({ id: l }) => (
                    <div key={l} className="relative">
                      <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                      <input value={emergencyTitle[l] || ""}
                        onChange={(e) => setEmergencyTitle((p) => { const n = { ...p, [l]: e.target.value }; if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value); return n; })}
                        className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none" placeholder={`Title (${l.toUpperCase()})`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleTranslate("emergency_title")} disabled={translating || !emergencyTitle[lang]?.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">Translate</button>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALES.map(({ id: l }) => (
                    <div key={l} className="relative">
                      <span className="absolute -top-2 left-2 text-[9px] font-bold text-muted bg-white px-1">{l.toUpperCase()}</span>
                      <textarea value={emergencyMsg[l] || ""}
                        onChange={(e) => setEmergencyMsg((p) => { const n = { ...p, [l]: e.target.value }; if (syncing) LOCALES.forEach(({ id: ll }) => n[ll] = e.target.value); return n; })} rows={3}
                        className="w-full px-2 py-1.5 pt-3 rounded border border-border text-[11px] focus:border-primary outline-none resize-y" placeholder={`Message (${l.toUpperCase()})`} />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleTranslate("emergency_msg")} disabled={translating || !emergencyMsg[lang]?.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border hover:bg-primary/5 disabled:opacity-30">Translate</button>
              </div>
              <button onClick={handleSaveEmergency}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark">
                {alertSaving === "emergency" ? "Saving..." : "Save Pop-up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
