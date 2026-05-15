"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PageHero from "@/components/ui/PageHero";
import FeaturedNews from "@/components/sections/FeaturedNews";
import NewsGrid from "@/components/sections/NewsGrid";
import SubscribeCTA from "@/components/sections/SubscribeCTA";
import { useDynamicContent } from "@/hooks/useDynamicContent";

const PAGE_SIZE = 6;

export default function NewsPage() {
  const { newsArticles } = useDynamicContent();
  const sorted = [...newsArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featured = sorted[0] || null;
  const rest = sorted.slice(1);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < rest.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, rest.length));
  }, [rest.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="min-h-screen">
      <PageHero pageKey="news" />
      {featured && <FeaturedNews article={featured} />}
      <NewsGrid articles={rest.slice(0, visibleCount)} />
      <div ref={loaderRef} className="h-16 flex items-center justify-center">
        {hasMore && (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <SubscribeCTA />
    </div>
  );
}
