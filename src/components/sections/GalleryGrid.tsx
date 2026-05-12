"use client";

import { useState, useCallback, useEffect } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/hooks/useLocale";
import type { GalleryImage } from "@/types";

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState(t.sections.All);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const categories = [t.sections.All, ...Array.from(new Set(images.map((img) => img.category)))];
  const filtered = activeCategory === t.sections.All ? images : images.filter((img) => img.category === activeCategory);
  const SHOWN_COUNT = 8;
  const visible = showAll ? filtered : filtered.slice(0, SHOWN_COUNT);
  const hasMore = filtered.length > SHOWN_COUNT;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <SectionHeading title={t.sections.SchoolGallery} subtitle={t.pages.gallery.subtitle} align="center" />
        </div>

        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" : "bg-white text-foreground border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((img, idx) => {
            const originalIndex = filtered.indexOf(img);
            return (
              <div
                key={`${img.src}-${idx}`}
                className="group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
                onClick={() => openLightbox(originalIndex)}
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-white text-sm font-semibold">{img.alt}</span>
                    <span className="text-secondary text-xs font-medium mt-1">{img.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              {t.sections.All} ({filtered.length - SHOWN_COUNT} more)
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted text-sm">{t.sections.NoImagesFound}</p>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadein" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110" aria-label="Close lightbox">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {filtered.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110" aria-label="Previous image">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110" aria-label="Next image">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh] w-auto h-auto flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={filtered[lightboxIndex].src} alt={filtered[lightboxIndex].alt} className="max-h-[85vh] max-w-[90vw] w-auto h-auto rounded-xl object-contain shadow-2xl" />
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white text-sm font-medium mb-1">{filtered[lightboxIndex].alt}</p>
            <p className="text-gray-400 text-xs">{filtered[lightboxIndex].category} &middot; {lightboxIndex + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </section>
  );
}
