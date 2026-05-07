import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore the vibrant campus life at Kathmandu English School through our photo gallery.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">School Gallery</h1>
          <p className="text-gray-200 max-w-xl mx-auto text-sm">A glimpse into our vibrant campus life</p>
        </div>
      </section>
      <Gallery />
      <Testimonials />
    </div>
  );
}
