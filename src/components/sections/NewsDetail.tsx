"use client";

import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Badge from "@/components/ui/Badge";
import SocialShare from "@/components/ui/SocialShare";
import { useLocale } from "@/hooks/useLocale";
import { resolveArticle } from "@/lib/translate";
import type { NewsArticle } from "@/types";

interface NewsDetailProps {
  article: NewsArticle;
  recentPosts: NewsArticle[];
}

export default function NewsDetail({ article, recentPosts }: NewsDetailProps) {
  const { locale } = useLocale();
  const resolved = resolveArticle(article, locale);
  const shareUrl = `https://kes.edu.np/news/${article.slug}`;

  return (
    <article>
      <div className="relative h-64 sm:h-80 lg:h-[450px] bg-primary-dark">
        <OptimizedImage src={article.image} alt={resolved.title} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-xs text-gray-300 mb-4">
              <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-secondary transition-colors">News</Link>
              <span>/</span>
              <span className="text-secondary truncate">{resolved.title}</span>
            </nav>
            <Badge>{article.category}</Badge>
            <h1 className="text-2xl lg:text-4xl font-heading font-bold text-white max-w-3xl leading-tight mt-3">{resolved.title}</h1>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8 pb-6 border-b border-border">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {article.author}
              </span>
              <div className="flex items-center gap-1.5">{article.tags.map((tag) => <span key={tag} className="bg-surface text-xs px-2 py-0.5 rounded-full text-muted">#{tag}</span>)}</div>
            </div>

            <div className="prose-custom text-sm lg:text-base">
              {resolved.content.split("\n\n").map((para, i) => {
                const trimmed = para.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith("**") && trimmed.includes(":**")) {
                  return <p key={i} className="font-heading font-bold text-primary text-lg">{trimmed.replace(/\*\*/g, "")}</p>;
                }
                if (trimmed.startsWith("- **")) {
                  return <div key={i} className="flex gap-2 py-1"><span className="text-primary mt-1.5 shrink-0">&bull;</span><p className="text-foreground leading-relaxed">{trimmed.replace(/^- /, "")}</p></div>;
                }
                return (
                  <p key={i} className="text-foreground leading-relaxed">
                    {trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')}
                  </p>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Share this article</h3>
              <SocialShare url={shareUrl} title={resolved.title} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface rounded-xl p-6 border border-border">
                <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-4">Recent News</h3>
                <div className="space-y-4">
                  {recentPosts.map((post) => {
                    const r = resolveArticle(post, locale);
                    return (
                      <Link key={post.id} href={`/news/${post.slug}`} className="flex gap-3 group">
                        <div className="relative w-16 h-12 shrink-0 rounded-lg overflow-hidden">
                          <OptimizedImage src={post.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="64px" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted mb-0.5">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="bg-primary rounded-xl p-6 text-white">
                <h3 className="font-heading font-bold text-secondary text-sm uppercase tracking-wider mb-3">Newsletter</h3>
                <p className="text-sm text-gray-200 mb-4">Stay updated with the latest news, events, and announcements.</p>
                <form className="flex flex-col gap-2">
                  <input type="email" placeholder="Your email address" className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-white outline-none" />
                  <button type="submit" className="w-full px-4 py-2.5 bg-secondary text-primary rounded-lg text-sm font-bold hover:bg-secondary-dark transition-colors">Subscribe</button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
