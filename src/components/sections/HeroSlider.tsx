"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useLocale } from "@/hooks/useLocale";
import { resolveContent } from "@/lib/translate";
import type { HeroSlide } from "@/types";

interface HeroSliderProps {
  slides: HeroSlide[];
  motto: string;
}

export default function HeroSlider({ slides, motto }: HeroSliderProps) {
  const { locale, t } = useLocale();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[500px] sm:h-[550px] lg:h-[600px] overflow-hidden bg-primary-dark">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        >
          {slide.image ? (
            <OptimizedImage src={slide.image} alt={resolveContent(slide.title, locale)} fill priority={index === 0} className="object-cover" sizes="100vw" />
          ) : (
            <div className="absolute inset-0 bg-[#1e3a8a]" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <p className="text-secondary font-heading text-sm sm:text-lg font-light tracking-widest mb-2 animate-fadein uppercase">
            {motto}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-4">
              {resolveContent(slides[current].title, locale)}
          </h1>
          <p className="text-gray-200 text-base sm:text-xl max-w-xl mx-auto">{resolveContent(slides[current].subtitle, locale)}</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-semibold text-sm hover:bg-secondary-dark transition-colors shadow-lg"
            >
              {t.hero.enroll}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              {t.hero.learnMore}
            </Link>
          </div>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors" aria-label="Previous slide">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors" aria-label="Next slide">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrent(index)} className={`w-3 h-3 rounded-full transition-colors ${index === current ? "bg-secondary" : "bg-white/50 hover:bg-white/80"}`} aria-label={`Go to slide ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}
