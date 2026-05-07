import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteData } from "@/config/siteData";

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
  const articles = siteData.newsArticles;

  return (
    <div className="min-h-screen">
      <section className="bg-primary py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
            News & Events
          </h1>
          <p className="text-gray-200 max-w-xl mx-auto text-sm">
            Stay informed about the latest happenings, achievements, and announcements at Kathmandu English School.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border hover:border-primary/30"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    <span>{new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span className="w-1 h-1 rounded-full bg-muted" />
                    <span>{article.author}</span>
                  </div>
                  <h2 className="font-heading font-bold text-base lg:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted line-clamp-2 mb-4">{article.excerpt}</p>
                  <span className="text-primary text-sm font-semibold group-hover:underline">
                    Read More
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
