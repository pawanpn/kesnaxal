"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/constants/siteConfig";
import { supabase } from "@/lib/supabase/client";
import type { GalleryImage } from "@/types";

function convertDriveUrl(url: string): string {
  if (!url) return url;
  if (!url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  const idMatch = url.match(/[-\w]{25,}/);
  if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  return url;
}

export default function GalleryAdminPage() {
  const { getJson, getContent, saveJson, saveContent, uploadMedia, loadAllContent, hasDraft, isSuperadmin, seedSection } = useAdmin();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [gallerySubtitle, setGallerySubtitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newDriveLink, setNewDriveLink] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newSource, setNewSource] = useState<"url" | "upload" | "drive">("url");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatVal, setEditCatVal] = useState("");
  const [newCatInput, setNewCatInput] = useState("");

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    const json = getJson("gallery", "gallery_images", "en");
    const arr = json?.images as GalleryImage[] | undefined;
    const cats = json?.categories as string[] | undefined;

    if (arr?.length) {
      setImages(arr);
      setCategories(cats?.length ? cats : [...new Set(arr.map((img) => img.category))]);
    } else {
      setImages([...siteConfig.gallery.images]);
      setCategories([...siteConfig.gallery.categories]);
    }

    const sub = getContent("gallery", "gallery_subtitle", "en");
    setGallerySubtitle(sub || "");
  }, [getJson, getContent]);

  const dedupCategories = (imgs: GalleryImage[]) =>
    [...new Set(imgs.map((img) => img.category))];

  const save = async (imgs: GalleryImage[], cats: string[]) => {
    try {
      for (const loc of ["en", "ne", "ja"]) {
        await saveJson("gallery", "gallery_images", loc, { images: imgs, categories: cats });
      }
      setImages(imgs);
      setCategories(cats);
      return true;
    } catch {
      toast("error", "Save failed");
      return false;
    }
  };

  // ── Single image save ──
  const handleSaveImage = async (idx: number, alt: string, cat: string) => {
    setSavingIdx(idx);
    const updated = images.map((img, i) => i === idx ? { ...img, alt, category: cat } : img);
    const cats = categories.includes(cat) ? categories : [...categories, cat];
    const ok = await save(updated, cats);
    if (ok) toast("success", "Image saved as draft");
    setSavingIdx(null);
  };

  // ── Add ──
  const handleAdd = async () => {
    const url = newUrl.trim();
    if (!url) return;
    const img: GalleryImage = {
      src: url,
      alt: newAlt.trim() || "Gallery image",
      category: newCat.trim() || "General",
      width: 800, height: 600,
    };
    const updated = [img, ...images];
    const cats = categories.includes(img.category) ? categories : [...categories, img.category];
    const ok = await save(updated, cats);
    if (ok) {
      setNewUrl(""); setNewDriveLink(""); setNewAlt(""); setNewCat("");
      toast("success", "Image added as draft");
    }
  };

  // ── Upload ──
  const handleUpload = async (file: File) => {
    const key = `gallery_${Date.now()}`;
    const url = await uploadMedia(file, "gallery", key);
    if (!url) { toast("error", "Upload failed"); return; }
    const img: GalleryImage = {
      src: url,
      alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      category: newCat.trim() || "General",
      width: 800, height: 600,
    };
    const updated = [img, ...images];
    const cats = categories.includes(img.category) ? categories : [...categories, img.category];
    const ok = await save(updated, cats);
    if (ok) { setNewCat(""); toast("success", "Image uploaded as draft"); }
  };

  // ── Replace ──
  const handleReplaceUpload = async (file: File, idx: number) => {
    setUploadingIdx(idx);
    const oldUrl = images[idx]?.src || "";
    const key = `gallery_${Date.now()}`;
    const url = await uploadMedia(file, "gallery", key);
    if (url) {
      const updated = images.map((img, i) => i === idx ? { ...img, src: url } : img);
      await save(updated, categories);
      if (oldUrl.includes("supabase.co")) {
        try {
          const path = oldUrl.split("/storage/v1/object/public/media/")[1];
          if (path) await supabase.storage.from("media").remove([decodeURIComponent(path)]);
        } catch { /* best effort */ }
      }
    } else { toast("error", "Replace failed"); }
    setUploadingIdx(null);
  };

  // ── Delete ──
  const handleDelete = async (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    const cats = dedupCategories(updated);
    await save(updated, cats);
    toast("success", "Image deleted");
  };

  // ── Drag & Drop ──
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); const el = e.currentTarget as HTMLElement; el.dataset.idx ? setDragOverIdx(Number(el.dataset.idx)) : setDragOverIdx(null); };
  const handleDragLeave = () => setDragOverIdx(null);
  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const dragIdx2 = Number(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIdx2) || dragIdx2 === dropIdx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx2, 1);
    reordered.splice(dropIdx, 0, moved);
    setImages(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await save(reordered, categories);
    toast("success", "Order saved");
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  const moveImage = async (fromIdx: number, dir: "up" | "down") => {
    const toIdx = dir === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setImages(reordered);
    await save(reordered, categories);
  };

  // ── Categories ──
  const handleAddCategory = async () => {
    const cat = newCatInput.trim();
    if (!cat || categories.includes(cat)) { setNewCatInput(""); return; }
    const updated = [...categories, cat];
    await save(images, updated);
    setNewCatInput("");
    toast("success", `Category "${cat}" added`);
  };
  const handleRenameCategory = async (oldName: string) => {
    const newName = editCatVal.trim();
    if (!newName || newName === oldName || categories.includes(newName)) { setEditingCat(null); return; }
    const updatedImages = images.map((img) => img.category === oldName ? { ...img, category: newName } : img);
    const updatedCats = categories.map((c) => c === oldName ? newName : c);
    await save(updatedImages, updatedCats);
    setEditingCat(null);
    toast("success", `Renamed to "${newName}"`);
  };
  const handleDeleteCategory = async (cat: string) => {
    const updatedImages = images.map((img) => img.category === cat ? { ...img, category: "General" } : img);
    const updatedCats = categories.filter((c) => c !== cat);
    await save(updatedImages, updatedCats);
    toast("success", `Category "${cat}" removed`);
  };

  const handleSaveSubtitle = async () => {
    if (!gallerySubtitle.trim()) return;
    await saveContent("gallery", "gallery_subtitle", "en", gallerySubtitle.trim());
    await saveContent("gallery", "gallery_subtitle", "ne", gallerySubtitle.trim());
    await saveContent("gallery", "gallery_subtitle", "ja", gallerySubtitle.trim());
    toast("success", "Subtitle saved as draft");
  };

  const filtered = filter === "All" ? images : images.filter((img) => img.category === filter);
  const allCats = ["All", ...categories];

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Gallery Management</h1>
            <p className="text-xs text-muted mt-1">{images.length} images · {categories.length} categories · drag to reorder</p>
          </div>
          {isSuperadmin && (
            <button onClick={async () => { const r = await seedSection("gallery"); toast(r.error ? "error" : "success", r.error || `Seeded ${r.count} rows`); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5">
              Seed Defaults
            </button>
          )}
        </div>

        {hasDraft("gallery", "gallery_images", "en") && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — publish from Review &amp; Publish to make gallery visible on the site.
          </div>
        )}

        {/* Subtitle */}
        <div className="bg-white rounded-xl border border-border p-3 mb-4 max-w-4xl flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-muted mb-0.5">Gallery Page Subtitle</label>
            <input type="text" value={gallerySubtitle} onChange={(e) => setGallerySubtitle(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
              placeholder="A glimpse into our vibrant campus life" />
          </div>
          <button onClick={handleSaveSubtitle}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark shrink-0">Save</button>
        </div>

        {/* Add Image */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4 max-w-4xl">
          <h2 className="text-xs font-semibold text-foreground mb-3">Add New Image (appears at top)</h2>
          <div className="flex gap-2 mb-3">
            {(["url", "upload", "drive"] as const).map((s) => (
              <button key={s} onClick={() => setNewSource(s)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold capitalize ${newSource === s ? "bg-primary text-white" : "bg-surface text-muted"}`}>{s}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {newSource === "url" && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Image URL</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono" placeholder="https://..." />
              </div>
            )}
            {newSource === "drive" && (
              <div className="flex-1 min-w-[250px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Google Drive Link</label>
                <div className="flex gap-1.5">
                  <input type="url" value={newDriveLink} onChange={(e) => setNewDriveLink(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono" placeholder="https://drive.google.com/file/d/..." />
                  <button onClick={() => { const c = convertDriveUrl(newDriveLink.trim()); if (c !== newDriveLink.trim()) { setNewUrl(c); toast("success", "Converted"); } }}
                    disabled={!newDriveLink.trim()}
                    className="px-2 py-1.5 rounded text-[10px] font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">Convert</button>
                </div>
                {newUrl && newSource === "drive" && <p className="text-[10px] text-green-600 mt-1 font-mono truncate">✓ {newUrl}</p>}
              </div>
            )}
            {newSource === "upload" && (
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark cursor-pointer">
                Choose File
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
              </label>
            )}
            {(newSource === "url" || newSource === "drive") && (
              <>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] font-semibold text-muted mb-0.5">Alt Text / Name</label>
                  <input type="text" value={newAlt} onChange={(e) => setNewAlt(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Photo description" />
                </div>
                <div className="w-[130px]">
                  <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                  <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} list="add-cat-list"
                    className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Events" />
                </div>
                <button onClick={handleAdd} disabled={!newUrl.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">+ Add</button>
              </>
            )}
            {newSource === "upload" && (
              <>
                <div className="w-[130px]">
                  <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                  <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} list="add-cat-list"
                    className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="General" />
                </div>
              </>
            )}
          </div>
          <datalist id="add-cat-list">
            {categories.map((cat) => <option key={cat} value={cat} />)}
          </datalist>
        </div>

        {/* Categories Manager */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4 max-w-4xl">
          <h2 className="text-xs font-semibold text-foreground mb-2">Categories ({categories.length})</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-0.5 bg-surface rounded-lg border border-border/50">
                {editingCat === cat ? (
                  <input value={editCatVal} onChange={(e) => setEditCatVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(cat); if (e.key === "Escape") setEditingCat(null); }}
                    onBlur={() => handleRenameCategory(cat)}
                    autoFocus className="w-[100px] px-2 py-1 text-[10px] rounded-l-lg border-0 focus:ring-1 focus:ring-primary outline-none" />
                ) : (
                  <span className="px-2 py-1 text-[10px] font-medium text-foreground">{cat}</span>
                )}
                <button onClick={() => { setEditingCat(cat); setEditCatVal(cat); }}
                  className="w-5 h-5 flex items-center justify-center text-muted hover:text-primary" title="Rename">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDeleteCategory(cat)}
                  className="w-5 h-5 flex items-center justify-center rounded-r text-muted hover:text-red-500" title="Delete">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <div className="flex items-center gap-0.5">
              <input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
                className="w-[90px] px-2 py-1 text-[10px] rounded-lg border border-border focus:border-primary outline-none" placeholder="New..." />
              <button onClick={handleAddCategory}
                className="w-5 h-5 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200" title="Add">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter + Grid */}
        <div className="flex flex-wrap gap-1.5 mb-4 max-w-4xl">
          {allCats.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${cat === filter ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-surface"}`}>{cat}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center max-w-4xl">
            <p className="text-xs text-muted">No images in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl">
            {filtered.map((img) => {
              const realIdx = images.indexOf(img);
              const isDragging = dragIdx === realIdx;
              return (
                <div
                  key={`${img.src}-${realIdx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, realIdx)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, realIdx)}
                  onDragEnd={handleDragEnd}
                  data-idx={realIdx}
                  className={`bg-white rounded-xl border overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${
                    isDragging ? "opacity-30 scale-95" : ""
                  } ${dragOverIdx === realIdx && dragIdx !== realIdx ? "border-primary border-2 ring-1 ring-primary/20 scale-[1.02]" : "border-border"}`}
                >
                  <div className="aspect-[4/3] bg-surface overflow-hidden relative">
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute top-1 left-1 flex gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); moveImage(realIdx, "up"); }} disabled={realIdx === 0}
                        className="w-5 h-5 flex items-center justify-center rounded bg-black/50 text-white text-[10px] hover:bg-black/70 disabled:opacity-30" title="Move up">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveImage(realIdx, "down"); }} disabled={realIdx === images.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded bg-black/50 text-white text-[10px] hover:bg-black/70 disabled:opacity-30" title="Move down">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded bg-black/60 text-white text-[9px] font-bold">{realIdx + 1}</span>
                    <label className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] cursor-pointer hover:bg-black/80">
                      {uploadingIdx === realIdx ? "..." : "Replace"}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceUpload(f, realIdx); e.target.value = ""; }} />
                    </label>
                  </div>
                  <div className="p-2 space-y-1" draggable={false}>
                    <div>
                      <label className="text-[9px] text-muted">Alt / Name</label>
                      <input type="text" value={img.alt}
                        onChange={(e) => setImages((prev) => prev.map((img2, i) => i === realIdx ? { ...img2, alt: e.target.value } : img2))}
                        onDragOver={(e) => e.stopPropagation()}
                        className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none" placeholder="Alt text" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted">Category</label>
                      <input type="text" value={img.category}
                        onChange={(e) => setImages((prev) => prev.map((img2, i) => i === realIdx ? { ...img2, category: e.target.value } : img2))}
                        onDragOver={(e) => e.stopPropagation()} list={`cl-${realIdx}`}
                        className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none" placeholder="Category" />
                      <datalist id={`cl-${realIdx}`}>{categories.map((c) => <option key={c} value={c} />)}</datalist>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveImage(realIdx, images[realIdx]?.alt || img.alt, images[realIdx]?.category || img.category)}
                        disabled={savingIdx === realIdx}
                        className="flex-1 py-1 rounded text-[10px] font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                        {savingIdx === realIdx ? "..." : "Save"}
                      </button>
                      <button onClick={() => handleDelete(realIdx)}
                        className="flex-1 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
