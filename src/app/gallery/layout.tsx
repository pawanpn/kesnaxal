import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore the vibrant campus life at Kathmandu English School through our photo gallery.",
  openGraph: {
    title: "Gallery | Kathmandu English School",
    description: "Explore campus life, events, sports, and infrastructure at KES through our photo gallery.",
    type: "website",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
