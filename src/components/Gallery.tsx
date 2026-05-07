"use client";

import { useState } from "react";
import Image from "next/image";
import { siteData } from "@/config/siteData";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const images = siteData.gallery.images;
  const categories = ["All", ...siteData.gallery.categories];

  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const openLightbox = (src: string, alt: string) => {
    setLightboxImage(src);
    setLightboxAlt(alt);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxAlt("");
    document.body.style.overflow = "";
  };

  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-3">
            School Gallery
          </h2>
          <p className="text-muted max-w-lg mx-auto text-sm">
            Explore our campus life, events, and achievements through the lens.
          </p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-foreground border border-border hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((img, idx) => (
            <div
              key={idx}
              className="break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group"
              onClick={() => openLightbox(img.src, img.alt)}
            >
              <div className="relative">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                  <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs bg-primary/80 px-2 py-1 rounded">
                      {img.alt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fadein"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt={lightboxAlt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            <p className="text-white text-center mt-3 text-sm">{lightboxAlt}</p>
          </div>
        </div>
      )}
    </section>
  );
}
