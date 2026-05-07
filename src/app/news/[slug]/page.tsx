import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsDetail from "@/components/sections/NewsDetail";
import { siteConfig } from "@/constants/siteConfig";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = siteConfig.newsArticles.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };

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
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = siteConfig.newsArticles.find((a) => a.slug === slug);
  if (!article) notFound();

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
