"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent } from "@/types";

interface CalendarSectionProps {
  events: CalendarEvent[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const typeStyles: Record<CalendarEvent["type"], string> = {
  holiday: "bg-accent text-white",
  exam: "bg-orange-500 text-white",
  event: "bg-primary text-white",
  vacation: "bg-secondary text-primary",
};

export default function CalendarSection({ events }: CalendarSectionProps) {
  const [month, setMonth] = useState(0); // January = 0

  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [events, month, year]);

  const eventMap = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    monthEvents.forEach((e) => {
      const day = new Date(e.date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(e);
    });
    return map;
  }, [monthEvents]);

  const goNext = () => setMonth((m) => (m + 1) % 12);
  const goPrev = () => setMonth((m) => (m - 1 + 12) % 12);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-3">
            School Calendar
          </h2>
          <p className="text-muted max-w-lg mx-auto text-sm">
            Stay updated with important dates, exams, holidays, and events throughout the year.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Month Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-4 lg:sticky lg:top-24">
              <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-4">
                2026
              </h3>
              <div className="space-y-1">
                {MONTHS.map((name, idx) => (
                  <button
                    key={name}
                    onClick={() => setMonth(idx)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      month === idx
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-foreground hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {name}
                    {month === idx && (
                      <span className="float-right opacity-70">
                        <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-border hover:bg-primary hover:text-white hover:border-primary transition-all text-foreground"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-2xl font-heading font-bold text-primary">
                {MONTHS[month]} {year}
              </h3>
              <button
                onClick={goNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-border hover:bg-primary hover:text-white hover:border-primary transition-all text-foreground"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square rounded-lg" />;
                const dayEvents = eventMap[day] || [];
                const hasEvent = dayEvents.length > 0;
                const primaryType = dayEvents[0]?.type || "event";

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg border transition-all duration-200 flex flex-col items-center justify-center relative ${
                      hasEvent
                        ? "border-primary/30 bg-primary/5 cursor-pointer hover:shadow-md hover:border-primary"
                        : "border-transparent hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                        hasEvent ? typeStyles[primaryType] : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvent && (
                      <div className="absolute -bottom-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i === 0 ? typeStyles[e.type] : "bg-muted"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border flex-wrap">
              {(["holiday", "exam", "event", "vacation"] as const).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${typeStyles[type]}`} />
                  <span className="text-xs text-muted capitalize">{type}</span>
                </div>
              ))}
            </div>

            {/* Event List for Selected Month */}
            {monthEvents.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monthEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow flex gap-4"
                    >
                      <div
                        className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                          typeStyles[event.type]
                        }`}
                      >
                        <span className="text-lg font-bold leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-[10px] uppercase font-medium">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted mb-0.5">
                          {new Date(event.date).toLocaleDateString("en-US", { weekday: "long" })}
                        </p>
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted mt-1 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-8">
                <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-muted text-sm">No events scheduled for {MONTHS[month]}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
