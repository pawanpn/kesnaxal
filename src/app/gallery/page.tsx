"use client";

import PageHero from "@/components/ui/PageHero";
import GalleryGrid from "@/components/sections/GalleryGrid";
import Testimonials from "@/components/sections/Testimonials";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function GalleryPage() {
  const { galleryImages, testimonials } = useDynamicContent();
  return (
    <div className="min-h-screen">
      <PageHero pageKey="gallery" />
      <GalleryGrid images={galleryImages} />
      <Testimonials testimonials={testimonials} />
    </div>
  );
}
