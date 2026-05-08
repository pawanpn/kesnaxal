import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Events",
  description: "Stay updated with the latest news, events, and announcements from Kathmandu English School.",
  openGraph: {
    title: "News & Events | Kathmandu English School",
    description: "Stay updated with the latest news, events, and announcements from KES.",
    type: "website",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
