"use client";

import { useState, useCallback } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((p) => (p + 1) % testimonials.length), [testimonials.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length), [testimonials.length]);
  const t = testimonials[current];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        <SectionHeading title="What People Say" subtitle="Hear from parents, students, and alumni about their KES experience." align="center" />

        <div className="relative max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl p-8 lg:p-10 text-center shadow-sm border border-border">
            <div className="mb-6">
              <svg className="w-10 h-10 text-primary/20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-foreground text-sm lg:text-base leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center justify-center gap-3">
              <OptimizedImage src={t.image} alt={t.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          </div>

          <button onClick={prev} className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-border hover:bg-primary hover:text-white transition-colors text-foreground" aria-label="Previous testimonial">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-border hover:bg-primary hover:text-white transition-colors text-foreground" aria-label="Next testimonial">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button key={index} onClick={() => setCurrent(index)} className={`w-2.5 h-2.5 rounded-full transition-colors ${index === current ? "bg-primary" : "bg-border hover:bg-muted"}`} aria-label={`Go to testimonial ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
