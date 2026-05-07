import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import FeaturedNews from "@/components/sections/FeaturedNews";
import NewsGrid from "@/components/sections/NewsGrid";
import SubscribeCTA from "@/components/sections/SubscribeCTA";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "News & Events",
  description: "Stay updated with the latest news, events, and announcements from Kathmandu English School.",
  openGraph: {
    title: "News & Events | Kathmandu English School",
    description: "Stay updated with the latest news, events, and announcements from KES.",
    type: "website",
  },
};

export default function NewsPage() {
  const sorted = [...siteConfig.newsArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen">
      <PageHero pageKey="news" />
      <FeaturedNews article={featured} />
      <NewsGrid articles={rest} />
      <SubscribeCTA />
    </div>
  );
}
