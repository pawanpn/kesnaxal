import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import type { NewsArticle } from "@/types";

interface FeaturedNewsProps {
  article: NewsArticle;
}

const categoryVariant: Record<string, Parameters<typeof Badge>[0]["variant"]> = {
  Achievement: "green",
  Event: "secondary",
  Announcement: "accent",
  Infrastructure: "purple",
  Result: "teal",
};

export default function FeaturedNews({ article }: FeaturedNewsProps) {
  return (
    <section className="bg-surface border-b border-border">
      <div className="container-custom py-8 lg:py-12">
        <SectionHeading title="Featured Story" />

        <Link href={`/news/${article.slug}`} className="group grid grid-cols-1 lg:grid-cols-5 gap-6 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-border hover:border-primary/30">
          <div className="lg:col-span-3 relative h-64 sm:h-80 lg:h-full min-h-[320px] overflow-hidden">
            <OptimizedImage src={article.image} alt={article.title} fill priority className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 60vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge variant={categoryVariant[article.category] || "primary"}>{article.category}</Badge>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs text-muted mb-3">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {article.author}
              </span>
            </div>

            <h2 className="font-heading font-bold text-xl lg:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{article.title}</h2>
            <p className="text-sm text-muted leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>

            <div className="flex items-center gap-2">
              <span className="text-primary text-sm font-semibold group-hover:underline">Read Full Story</span>
              <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-border">
              {article.tags.map((tag) => <span key={tag} className="bg-surface text-xs px-2.5 py-1 rounded-full text-muted">#{tag}</span>)}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
