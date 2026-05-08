"use client";

import { useState, useEffect, useRef } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdmin } from "@/hooks/useAdmin";
import type { GalleryImage } from "@/types";

export default function GalleryAdminPage() {
  const { getJson, saveJson, uploadMedia, hasDraft, discardSectionDrafts, loadAllContent } = useAdmin();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAllContent(); }, []);

  useEffect(() => {
    const json = getJson("gallery", "gallery_images", "en");
    const arr = json?.images as GalleryImage[] | undefined;
    const cats = json?.categories as string[] | undefined;
    if (arr?.length) setImages(arr);
    if (cats?.length) setCategories(cats);
    else if (arr?.length) {
      const unique = [...new Set(arr.map((img) => img.category))];
      setCategories(unique);
    }
  }, [getJson]);

  const handleSave = async (updatedImages: GalleryImage[], updatedCategories?: string[]) => {
    setSaving(true);
    const cats = updatedCategories ?? categories;
    await saveJson("gallery", "gallery_images", "en", { images: updatedImages, categories: cats });
    await saveJson("gallery", "gallery_images", "ne", { images: updatedImages, categories: cats });
    await saveJson("gallery", "gallery_images", "ja", { images: updatedImages, categories: cats });
    setImages(updatedImages);
    if (updatedCategories) setCategories(updatedCategories);
    setSaving(false);
  };

  const handleChange = (index: number, field: keyof GalleryImage, value: string | number) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  };

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    const img: GalleryImage = {
      src: newUrl.trim(),
      alt: newAlt.trim() || "Gallery image",
      category: newCategory.trim() || "General",
      width: 800,
      height: 600,
    };
    const updated = [...images, img];
    const isNewCat = !categories.includes(img.category);
    const cats = isNewCat ? [...categories, img.category] : categories;
    handleSave(updated, cats);
    setNewUrl("");
    setNewAlt("");
    setNewCategory("");
  };

  const handleDelete = (index: number) => {
    if (!confirm("Remove this image from the gallery?")) return;
    const updated = images.filter((_, i) => i !== index);
    const remainingCats = [...new Set(updated.map((img) => img.category))];
    handleSave(updated, remainingCats);
  };

  const handleUpload = async (file: File) => {
    setUploading(file.name);
    const key = `gallery_${Date.now()}`;
    const url = await uploadMedia(file, "gallery", key);
    if (url) setNewUrl(url);
    setUploading(null);
  };

  const filtered = filter === "All" ? images : images.filter((img) => img.category === filter);
  const allCategories = ["All", ...categories];

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Gallery Management</h1>
            <p className="text-xs text-muted mt-1">Manage images and categories for the school gallery</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSave(images)} disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save All"}
            </button>
            <button onClick={async () => { setDiscarding(true); await discardSectionDrafts("gallery"); setDiscarding(false); window.location.reload(); }}
              disabled={discarding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/5 disabled:opacity-50">
              Discard
            </button>
          </div>
        </div>

        {hasDraft("gallery", "gallery_images", "en") && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 max-w-4xl">
            Draft pending — publish to make changes visible on the site.
          </div>
        )}

        {/* Add New Image */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4 max-w-4xl">
          <h2 className="text-xs font-semibold text-foreground mb-3">Add New Image</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-semibold text-muted mb-0.5">Image URL</label>
              <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none font-mono"
                placeholder="https://..." />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-semibold text-muted mb-0.5">Alt Text</label>
              <input type="text" value={newAlt} onChange={(e) => setNewAlt(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                placeholder="Description of image" />
            </div>
            <div className="w-[140px]">
              <label className="block text-[10px] font-semibold text-muted mb-0.5">Category</label>
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                list="category-list"
                className="w-full px-2 py-1.5 rounded border border-border text-xs focus:border-primary outline-none"
                placeholder="Events" />
              <datalist id="category-list">
                {categories.map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </div>
            <label className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-surface cursor-pointer">
              {uploading ? "Uploading..." : "Upload"}
              <input type="file" accept="image/*" className="hidden" ref={uploadRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }} />
            </label>
            <button onClick={handleAdd} disabled={!newUrl.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              + Add
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4 max-w-4xl">
          {allCategories.map((cat) => (
            <button key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                cat === filter
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted hover:bg-surface"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center max-w-4xl">
            <p className="text-xs text-muted italic">
              {images.length === 0 ? "No images yet. Add one above to get started." : "No images in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl">
            {filtered.map((img, i) => {
              const realIndex = images.indexOf(img);
              return (
                <div key={`${img.src}-${realIndex}`} className="bg-white rounded-xl border border-border overflow-hidden group">
                  <div className="aspect-[4/3] bg-surface overflow-hidden">
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <input type="text" value={img.alt}
                      onChange={(e) => handleChange(realIndex, "alt", e.target.value)}
                      className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none mb-1"
                      placeholder="Alt text" />
                    <input type="text" value={img.category}
                      onChange={(e) => handleChange(realIndex, "category", e.target.value)}
                      list={`cat-list-${realIndex}`}
                      className="w-full px-1.5 py-1 rounded border border-border text-[10px] focus:border-primary outline-none mb-1.5"
                      placeholder="Category" />
                    <datalist id={`cat-list-${realIndex}`}>
                      {categories.map((cat) => <option key={cat} value={cat} />)}
                    </datalist>
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(realIndex)}
                        className="flex-1 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        Delete
                      </button>
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
