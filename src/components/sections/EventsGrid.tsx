"use client";

import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLocale } from "@/hooks/useLocale";
import { resolveEvent } from "@/lib/translate";
import type { UpcomingEvent } from "@/types";

interface EventsGridProps {
  events: UpcomingEvent[];
}

export default function EventsGrid({ events }: EventsGridProps) {
  const { locale, t } = useLocale();

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title={t.sections.UpcomingEvents} />
          <Link href="/news" className="text-sm text-primary font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            {t.common.allNewsEvents}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => {
            const { title, description, location } = resolveEvent(event, locale);
            const dateLocale = locale === "en" ? "en-US" : locale === "ne" ? "ne-NP" : "ja-JP";
            return (
              <div key={event.id} className="group bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
                <div className="relative h-44 overflow-hidden">
                  <OptimizedImage src={event.image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute top-3 left-3">
                    <Badge>{new Date(event.date).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
