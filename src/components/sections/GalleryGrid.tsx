"use client";

import { useState, useCallback, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ChromaGrid from "@/components/ui/ChromaGrid";
import { useT } from "@/hooks/useLocale";
import type { GalleryImage } from "@/types";

interface GalleryGridProps {
  images: GalleryImage[];
  subtitle?: string;
  categories?: string[];
}

export default function GalleryGrid({ images, subtitle, categories: storedCats }: GalleryGridProps) {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState(t.sections.All);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const safeImages = images.filter(Boolean);
  const categories = storedCats?.length
    ? [t.sections.All, ...storedCats]
    : [t.sections.All, ...Array.from(new Set(safeImages.map((img) => img.category)))];

  const filtered = activeCategory === t.sections.All
    ? safeImages
    : safeImages.filter((img) => img.category === activeCategory);

  const chromaItems = filtered.map((img) => ({
    image: img.src,
    title: img.alt,
    subtitle: img.category,
    borderColor: "#6366f1",
    gradient: "linear-gradient(145deg, #1e3a8a, #111827)",
  }));

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
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  const handleCardClick = useCallback((index: number) => {
    openLightbox(index);
  }, [openLightbox]);

  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <SectionHeading
            title={t.sections.SchoolGallery}
            subtitle={subtitle || t.pages.gallery.subtitle}
            align="center"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "bg-white text-foreground border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm">{t.sections.NoImagesFound}</p>
          </div>
        ) : (
          <ChromaGrid
            items={chromaItems}
            columns={4}
            radius={300}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
            onItemClick={handleCardClick}
          />
        )}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadein"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {filtered.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative max-w-[90vw] max-h-[85vh] w-auto h-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lightboxIndex].src}
              alt={filtered[lightboxIndex].alt}
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto rounded-xl object-contain shadow-2xl"
            />
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white text-sm font-medium mb-1">{filtered[lightboxIndex].alt}</p>
            <p className="text-gray-400 text-xs">
              {filtered[lightboxIndex].category} &middot; {lightboxIndex + 1} / {filtered.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
