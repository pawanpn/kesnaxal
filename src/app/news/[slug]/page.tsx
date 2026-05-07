import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/config/siteData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = siteData.newsArticles.find((a) => a.slug === slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = siteData.newsArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const allArticles = siteData.newsArticles;
  const recentPosts = allArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const shareUrl = `https://kes.edu.np/news/${article.slug}`;
  const encodedTitle = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <div className="min-h-screen">
      <article>
        <div className="relative h-64 sm:h-80 lg:h-96 bg-primary-dark">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="container-custom">
              <span className="inline-block bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {article.category}
              </span>
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-white max-w-3xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="container-custom py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8 pb-6 border-b border-border">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {article.author}
                </span>
                <div className="flex items-center gap-1.5">
                  {article.tags.map((tag) => (
                    <span key={tag} className="bg-surface text-xs px-2 py-0.5 rounded-full text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose-custom text-sm lg:text-base">
                {article.content.split("\n\n").map((para, i) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith("**") && trimmed.includes(":**")) {
                    return (
                      <p key={i} className="font-semibold text-foreground">
                        {trimmed.replace(/\*\*/g, "")}
                      </p>
                    );
                  }

                  if (trimmed.startsWith("- **")) {
                    return (
                      <div key={i} className="flex gap-2">
                        <span className="text-primary mt-1 shrink-0">&#x2022;</span>
                        <p>{trimmed.replace(/^- /, "")}</p>
                      </div>
                    );
                  }

                  return (
                    <p key={i} className="text-foreground leading-relaxed">
                      {trimmed
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary-dark">$1</strong>')
                        .replace(/- /, "")
                        .replace(/"/g, '"')
                        .replace(/"/g, '"')}
                    </p>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Share this article</h3>
                <div className="flex gap-3">
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-black text-white hover:opacity-90 transition-opacity"
                    aria-label="Share on X"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-surface rounded-xl p-6 border border-border mb-6">
                  <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Posts
                  </h3>
                  {recentPosts.length === 0 ? (
                    <p className="text-sm text-muted">No other articles yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/news/${post.slug}`}
                          className="flex gap-3 group"
                        >
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={72}
                            height={56}
                            className="w-16 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="text-xs text-muted mb-0.5">
                              {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-primary rounded-xl p-6 text-white">
                  <h3 className="font-heading font-bold text-secondary text-sm uppercase tracking-wider mb-3">
                    Subscribe
                  </h3>
                  <p className="text-sm text-gray-200 mb-4">
                    Get the latest news and updates delivered to your inbox.
                  </p>
                  <form className="flex flex-col gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-3 py-2 rounded-lg text-sm text-foreground bg-white outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-secondary text-primary rounded-lg text-sm font-semibold hover:bg-secondary-dark transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}
