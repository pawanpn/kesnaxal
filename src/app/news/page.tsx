"use client";

import PageHero from "@/components/ui/PageHero";
import FeaturedNews from "@/components/sections/FeaturedNews";
import NewsGrid from "@/components/sections/NewsGrid";
import SubscribeCTA from "@/components/sections/SubscribeCTA";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function NewsPage() {
  const { newsArticles } = useDynamicContent();
  const sorted = [...newsArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
