"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/constants/siteConfig";
import type { GalleryImage } from "@/types";

function convertDriveUrl(url: string): string {
  if (!url) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  const idMatch = url.match(/[-\w]{25,}/);
  if (idMatch && url.includes("drive.google.com")) return `https://lh3.googleusercontent.com/d/${idMatch[0]}=w800`;
  const openMatch = url.match(/\bid=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}=w800`;
  return url;
}

export default function GalleryAdminPage() {
  const { getJson, saveJson, uploadMedia, loadAllContent, hasDraft, discardSectionDrafts } = useAdmin();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newDriveLink, setNewDriveLink] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSource, setNewSource] = useState<"url" | "upload" | "drive">("url");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

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
  }, [getJson]);

  const dedupCategories = (imgs: GalleryImage[]) =>
    [...new Set(imgs.map((img) => img.category))];

  const handleSave = async (updatedImages: GalleryImage[], updatedCategories?: string[]) => {
    setSaving(true);
    try {
      const cats = updatedCategories ?? dedupCategories(updatedImages);
      await saveJson("gallery", "gallery_images", "en", { images: updatedImages, categories: cats });
      await saveJson("gallery", "gallery_images", "ne", { images: updatedImages, categories: cats });
      await saveJson("gallery", "gallery_images", "ja", { images: updatedImages, categories: cats });
      setImages(updatedImages);
      setCategories(cats);
      toast("success", "Gallery saved as draft — publish from Review page");
    } catch {
      toast("error", "Failed to save gallery");
    }
    setSaving(false);
  };

  const handleAdd = () => {
    const url = newUrl.trim();
    if (!url) return;
    const img: GalleryImage = {
      src: url,
      alt: newAlt.trim() || "Gallery image",
      category: newCategory.trim() || "General",
      width: 800,
      height: 600,
    };
    const updated = [img, ...images];
    const cats = categories.includes(img.category) ? categories : [...categories, img.category];
    handleSave(updated, cats);
    setNewUrl("");
    setNewDriveLink("");
    setNewAlt("");
    setNewCategory("");
  };

  const handleDriveConvert = () => {
    const converted = convertDriveUrl(newDriveLink.trim());
    if (converted !== newDriveLink.trim()) {
      setNewUrl(converted);
      toast("success", "Google Drive link converted");
    }
  };

  const handleUpload = async (file: File) => {
    const key = `gallery_${Date.now()}`;
    const url = await uploadMedia(file, "gallery", key);
    if (url) {
      const img: GalleryImage = {
        src: url,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        category: newCategory.trim() || "General",
        width: 800,
        height: 600,
      };
      const updated = [img, ...images];
      const cats = categories.includes(img.category) ? categories : [...categories, img.category];
      await handleSave(updated, cats);
      setNewUrl("");
      setNewCategory("");
      toast("success", "Image uploaded as draft");
    } else {
      toast("error", "Upload failed");
    }
  };

  const handleReplaceUpload = async (file: File, idx: number) => {
    setUploadingIdx(idx);
    const key = `gallery_${Date.now()}`;
    const url = await uploadMedia(file, "gallery", key);
    if (url) {
      const updated = images.map((img, i) =>
        i === idx ? { ...img, src: url } : img
      );
      await handleSave(updated);
    } else {
      toast("error", "Replace failed");
    }
    setUploadingIdx(null);
  };

  const handleChange = (index: number, field: keyof GalleryImage, value: string | number) => {
    const updated = images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
    setImages(updated);
  };

  const handleDelete = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    const cats = dedupCategories(updated);
    handleSave(updated, cats);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setImages(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
    handleSave(reordered);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const moveImage = (fromIdx: number, direction: "up" | "down") => {
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setImages(reordered);
    handleSave(reordered);
  };

  const filtered = filter === "All" ? images : images.filter((img) => img.category === filter);
  const allCategories = ["All", ...categories];

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Gallery Management</h1>
            <p className="text-xs text-muted mt-1">{images.length} images across {categories.length} categories — drag to reorder</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSave(images)} disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={async () => {
              await discardSectionDrafts("gallery");
              toast("success", "Drafts discarded");
            }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5">
              Discard
            </button>
          </div>
        </div>

        {hasDraft("gallery", "gallery_images", "en") && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — go to Review &amp; Publish to make gallery changes visible on the site.
          </div>
        )}

        {/* Add New Image */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4 max-w-4xl">
          <h2 className="text-xs font-semibold text-foreground mb-3">Add New Image (appears at top)</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setNewSource("url")}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${newSource === "url" ? "bg-primary text-white" : "bg-surface text-muted"}`}>Paste URL</button>
            <button onClick={() => setNewSource("upload")}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${newSource === "upload" ? "bg-primary text-white" : "bg-surface text-muted"}`}>Upload</button>
            <button onClick={() => setNewSource("drive")}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${newSource === "drive" ? "bg-primary text-white" : "bg-surface text-muted"}`}>Google Drive</button>
          </div>

          {newSource === "url" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Image URL</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono" placeholder="https://..." />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Alt Text</label>
                <input type="text" value={newAlt} onChange={(e) => setNewAlt(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Description" />
              </div>
              <div className="w-[140px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} list="cat-list"
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Events" />
              </div>
              <button onClick={handleAdd} disabled={!newUrl.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">+ Add</button>
            </div>
          )}

          {newSource === "upload" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-[140px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} list="cat-list"
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="General" />
              </div>
              <label className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark cursor-pointer">
                Choose File & Upload
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }} />
              </label>
              <p className="text-[10px] text-muted">Upload to Supabase storage. Max 2MB.</p>
            </div>
          )}

          {newSource === "drive" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[300px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Google Drive Share Link</label>
                <div className="flex gap-2">
                  <input type="url" value={newDriveLink} onChange={(e) => setNewDriveLink(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono"
                    placeholder="https://drive.google.com/file/d/..." />
                  <button onClick={handleDriveConvert} disabled={!newDriveLink.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">Convert</button>
                </div>
                {newUrl && <p className="text-[10px] text-green-600 mt-1 font-mono truncate">Converted: {newUrl}</p>}
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Alt Text</label>
                <input type="text" value={newAlt} onChange={(e) => setNewAlt(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Description" />
              </div>
              <div className="w-[140px]">
                <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} list="cat-list"
                  className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none" placeholder="Events" />
              </div>
              <button onClick={handleAdd} disabled={!newUrl.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">+ Add</button>
            </div>
          )}

          <datalist id="cat-list">
            {categories.map((cat) => <option key={cat} value={cat} />)}
          </datalist>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4 max-w-4xl">
          {allCategories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                cat === filter ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-surface"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid with Drag & Drop */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center max-w-4xl">
            <p className="text-xs text-muted">No images in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl">
            {filtered.map((img, fi) => {
              const realIndex = images.indexOf(img);
              const isDragging = dragIdx === realIndex;
              return (
                <div
                  key={`${img.src}-${realIndex}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl border overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${
                    isDragging ? "opacity-30 scale-95" : ""
                  } ${dragOverIdx === realIndex && dragIdx !== realIndex ? "border-primary border-2 ring-1 ring-primary/20 scale-[1.02]" : "border-border"}`}
                >
                  <div className="aspect-[4/3] bg-surface overflow-hidden relative">
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute top-1 left-1 flex gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveImage(realIndex, "up"); }}
                        disabled={realIndex === 0}
                        className="w-5 h-5 flex items-center justify-center rounded bg-black/50 text-white text-[10px] hover:bg-black/70 disabled:opacity-30"
                        title="Move up">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveImage(realIndex, "down"); }}
                        disabled={realIndex === images.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded bg-black/50 text-white text-[10px] hover:bg-black/70 disabled:opacity-30"
                        title="Move down">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded bg-black/60 text-white text-[9px] font-bold">{realIndex + 1}</span>
                    <label className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] cursor-pointer hover:bg-black/80">
                      {uploadingIdx === realIndex ? "..." : "Replace"}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleReplaceUpload(file, realIndex);
                          e.target.value = "";
                        }} />
                    </label>
                  </div>
                  <div className="p-2" draggable={false}>
                    <input type="text" value={img.alt}
                      onChange={(e) => handleChange(realIndex, "alt", e.target.value)}
                      onDragOver={(e) => e.stopPropagation()}
                      className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none mb-1" placeholder="Alt text" />
                    <input type="text" value={img.category}
                      onChange={(e) => handleChange(realIndex, "category", e.target.value)} list={`cat-${realIndex}`}
                      onDragOver={(e) => e.stopPropagation()}
                      className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none mb-1.5" placeholder="Category" />
                    <datalist id={`cat-${realIndex}`}>
                      {categories.map((cat) => <option key={cat} value={cat} />)}
                    </datalist>
                    <button onClick={() => handleDelete(realIndex)}
                      className="w-full py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
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
