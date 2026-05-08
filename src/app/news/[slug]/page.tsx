import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsDetail from "@/components/sections/NewsDetail";
import { siteConfig } from "@/constants/siteConfig";
import { clearContentCache, getText } from "@/lib/supabase/content";
import type { Locale } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

function resolve(article: (typeof siteConfig.newsArticles)[number], locale: Locale) {
  return {
    ...article,
    title: { ...article.title, [locale]: article.title[locale] || article.title.en || "" },
    excerpt: { ...article.excerpt, [locale]: article.excerpt[locale] || article.excerpt.en || "" },
    content: { ...article.content, [locale]: article.content[locale] || article.content.en || "" },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = siteConfig.newsArticles.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title.en,
    description: article.excerpt.en,
    openGraph: {
      title: article.title.en,
      description: article.excerpt.en,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title.en }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title.en,
      description: article.excerpt.en,
      images: [article.image],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const baseArticle = siteConfig.newsArticles.find((a) => a.slug === slug);
  if (!baseArticle) notFound();

  // Try to fetch updated content from Supabase
  clearContentCache();
  const id = `article_${baseArticle.id}`;
  const locales: Locale[] = ["en", "ne", "ja"];

  let article = { ...baseArticle };
  let hasDbContent = false;

  for (const loc of locales) {
    const dbTitle = await getText("news", `${id}_title`, loc);
    const dbExcerpt = await getText("news", `${id}_excerpt`, loc);
    const dbContent = await getText("news", `${id}_content`, loc);
    if (dbTitle || dbExcerpt || dbContent) hasDbContent = true;
    if (dbTitle) article.title = { ...article.title, [loc]: dbTitle };
    if (dbExcerpt) article.excerpt = { ...article.excerpt, [loc]: dbExcerpt };
    if (dbContent) article.content = { ...article.content, [loc]: dbContent };
  }

  // Also check for author/date/image overrides
  const dbAuthor = await getText("news", `${id}_author`, "en");
  const dbDate = await getText("news", `${id}_date`, "en");
  const dbImage = await getText("news", `${id}_image`, "en");
  const dbCategory = await getText("news", `${id}_category`, "en");
  if (dbAuthor) article.author = dbAuthor;
  if (dbDate) article.date = dbDate;
  if (dbImage) article.image = dbImage;
  if (dbCategory) article.category = dbCategory;

  const recentPosts = siteConfig.newsArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      <NewsDetail article={article} recentPosts={recentPosts} />
    </div>
  );
}
