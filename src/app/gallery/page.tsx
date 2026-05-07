import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import GalleryGrid from "@/components/sections/GalleryGrid";
import Testimonials from "@/components/sections/Testimonials";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore the vibrant campus life at Kathmandu English School through our photo gallery.",
  openGraph: {
    title: "Gallery | Kathmandu English School",
    description: "Explore campus life, events, sports, and infrastructure at KES through our photo gallery.",
    type: "website",
  },
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <PageHero pageKey="gallery" />
      <GalleryGrid images={siteConfig.gallery.images} />
      <Testimonials testimonials={siteConfig.testimonials} />
    </div>
  );
}
