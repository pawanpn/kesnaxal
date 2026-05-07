"use client";

import { useT } from "@/hooks/useLocale";

interface PageHeroProps {
  title?: string;
  subtitle?: string;
  pageKey?: string;
}

export default function PageHero({ title, subtitle, pageKey }: PageHeroProps) {
  const t = useT();
  const pageInfo = pageKey ? t.pages[pageKey] : null;

  const displayTitle = pageInfo?.title ?? title ?? "";
  const displaySubtitle = pageInfo?.subtitle ?? subtitle;

  return (
    <section className="bg-primary py-12 lg:py-16">
      <div className="container-custom text-center">
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
          {displayTitle}
        </h1>
        {displaySubtitle && (
          <p className="text-gray-200 max-w-xl mx-auto text-sm">{displaySubtitle}</p>
        )}
      </div>
    </section>
  );
}
