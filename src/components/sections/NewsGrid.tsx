"use client";

import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLocale } from "@/hooks/useLocale";
import { resolveArticle } from "@/lib/translate";
import type { NewsArticle } from "@/types";

interface NewsGridProps {
  articles: NewsArticle[];
}

const categoryVariant: Record<string, Parameters<typeof Badge>[0]["variant"]> = {
  Achievement: "green",
  Event: "secondary",
  Announcement: "accent",
  Infrastructure: "purple",
  Result: "teal",
};

export default function NewsGrid({ articles }: NewsGridProps) {
  const { locale } = useLocale();

  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title="Latest News" />
          <span className="text-xs text-muted">{articles.length} articles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.filter(Boolean).map((article) => {
            const resolved = resolveArticle(article, locale);
            return (
              <Link key={article.id} href={`/news/${article.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border hover:border-primary/30 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <OptimizedImage src={article.image} alt={resolved.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={categoryVariant[article.category] || "primary"}>{article.category}</Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    <span>{new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span className="w-1 h-1 rounded-full bg-muted" />
                    <span>{article.author}</span>
                  </div>
                  <h2 className="font-heading font-bold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{resolved.title}</h2>
                  <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">{resolved.excerpt}</p>
                  <div className="flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:underline mt-auto">
                    Read More
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
