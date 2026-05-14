"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent, CalendarEventType } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { resolveCalendarEvent } from "@/lib/translate";
import { adToBs, daysInBsMonth, firstDayOfBsMonth, getBsMonthName, getBsDayName } from "@/lib/bsCal";
import SectionHeading from "@/components/ui/SectionHeading";

interface CalendarSectionProps {
  events: CalendarEvent[];
  eventTypes?: CalendarEventType[];
}

type CalendarMode = "AD" | "BS";

function formatDateLocale(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ne: "ne-NP",
    ja: "ja-JP",
  };
  return date.toLocaleDateString(localeMap[locale] || "en-US", options);
}

export default function CalendarSection({ events, eventTypes = [] }: CalendarSectionProps) {
  const [mode, setMode] = useState<CalendarMode>("AD");
  const [month, setMonth] = useState(mode === "BS" ? 0 : 0);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const { locale, t } = useLocale();

  const typeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    eventTypes.forEach((et) => { map[et.id] = et.color; });
    if (eventTypes.length === 0) {
      map.holiday = "#ef4444";
      map.exam = "#f59e0b";
      map.event = "#10b981";
      map.vacation = "#3b82f6";
    }
    return map;
  }, [eventTypes]);

  const getTypeLabel = (typeId: string) => eventTypes.find((t) => t.id === typeId)?.label || typeId;
  const getTypeColor = (typeId: string) => typeColorMap[typeId] || "#6b7280";

  const AD_MONTHS = useMemo(() => t.calendar.months.split(","), [t.calendar.months]);
  const AD_DAYS = useMemo(() => t.calendar.days.split(","), [t.calendar.days]);
  const BS_MONTHS = useMemo(() => t.calendar.bsMonths.split(","), [t.calendar.bsMonths]);
  const BS_DAYS = useMemo(() => t.calendar.bsDays.split(","), [t.calendar.bsDays]);

  /* ── AD mode ── */
  const adYear = 2026;
  const adDaysInMonth = new Date(adYear, month + 1, 0).getDate();
  const adFirstDay = new Date(adYear, month, 1).getDay();

  /* ── BS mode ── */
  const bsYear = 2083;
  const bsDaysCount = daysInBsMonth(bsYear, month);
  const bsFirstDay = firstDayOfBsMonth(bsYear, month);

  /* ── Common ── */
  const currentMonths = mode === "AD" ? AD_MONTHS : BS_MONTHS;
  const currentDays = mode === "AD" ? AD_DAYS : BS_DAYS;
  const currentYear = mode === "AD" ? adYear : bsYear;
  const daysInMonth = mode === "AD" ? adDaysInMonth : bsDaysCount;
  const firstDay = mode === "AD" ? adFirstDay : bsFirstDay;

  const allMonths = currentMonths.length;
  const monthCount = mode === "AD" ? 12 : allMonths;

  /* ── Build day grid ── */
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  /* ── Build event map ── */
  const eventMap = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach((e) => {
      const adDate = new Date(e.date);
      if (isNaN(adDate.getTime())) return;
      if (mode === "AD") {
        if (adDate.getFullYear() === adYear && adDate.getMonth() === month) {
          const day = adDate.getDate();
          if (!map[day]) map[day] = [];
          map[day].push(e);
        }
      } else {
        const bs = adToBs(e.date);
        if (bs.year <= 0) return;
        if (bs.year === bsYear && bs.month === month) {
          if (!map[bs.date]) map[bs.date] = [];
          map[bs.date].push(e);
        }
      }
    });
    return map;
  }, [events, month, mode, adYear, bsYear]);

  /* ── Event list ── */
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const adDate = new Date(e.date);
      if (isNaN(adDate.getTime())) return false;
      if (mode === "AD") {
        return adDate.getFullYear() === adYear && adDate.getMonth() === month;
      }
      const bs = adToBs(e.date);
      if (bs.year <= 0) return false;
      return bs.year === bsYear && bs.month === month;
    });
  }, [events, month, mode, adYear, bsYear]);

  const goNext = () => setMonth((m) => (m + 1) % monthCount);
  const goPrev = () => setMonth((m) => (m - 1 + monthCount) % monthCount);

  const switchMode = (newMode: CalendarMode) => {
    setMode(newMode);
    setMonth(0);
  };

  /* ── Event date display (always show both AD + BS, dominant based on mode) ── */
  const getEventDates = (e: CalendarEvent) => {
    const adDate = new Date(e.date);
    const adValid = !isNaN(adDate.getTime());
    const bs = adToBs(e.date);
    const bsValid = bs.year > 0;
    const adDay = adValid ? adDate.getDate() : 0;
    const adMonth = adValid ? formatDateLocale(adDate, locale, { month: "short" }) : "";
    const adWeekday = adValid ? formatDateLocale(adDate, locale, { weekday: "long" }) : "";
    const adFull = adValid ? formatDateLocale(adDate, locale, { year: "numeric", month: "long", day: "numeric" }) : "";
    const bsDay = bsValid ? bs.date : 0;
    const bsMonth = bsValid ? getBsMonthName(bs.month, true) : "";
    const bsWeekday = bsValid ? getBsDayName(bs.day) : "";
    const bsFull = bsValid ? `${getBsMonthName(bs.month)} ${bs.date}, ${bs.year}` : "";
    return { adDay, adMonth, adWeekday, adFull, bsDay, bsMonth, bsWeekday, bsFull };
  };

  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <SectionHeading
            title={t.calendar.schoolCalendar}
            subtitle={t.calendar.stayUpdated}
            align="left"
          />

          {/* AD/BS Toggle */}
          <div className="flex rounded-xl bg-white border border-border p-1 shadow-sm">
            {(["AD", "BS"] as CalendarMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === m
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {m === "AD" ? t.calendar.adToggle : t.calendar.bsToggle}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Month Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-4 lg:sticky lg:top-24">
              <h3 className="font-heading font-bold text-primary text-sm uppercase tracking-wider mb-4">
                {currentYear}
              </h3>
              <div className="space-y-1">
                {currentMonths.map((name, idx) => (
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
                aria-label={t.calendar.prevMonth}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-2xl font-heading font-bold text-primary">
                {currentMonths[month]} {currentYear}
              </h3>
              <button
                onClick={goNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-border hover:bg-primary hover:text-white hover:border-primary transition-all text-foreground"
                aria-label={t.calendar.nextMonth}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {currentDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square bg-white/60" />;
                const dayEvents = eventMap[day] || [];
                const hasEvent = dayEvents.length > 0;
                const primaryType = dayEvents[0]?.type || "event";

                return (
                  <div
                    key={day}
                    onMouseEnter={() => hasEvent && setHoverDay(day)}
                    onMouseLeave={() => setHoverDay(null)}
                    className={`relative aspect-square bg-white flex flex-col items-center justify-center transition-colors ${
                      hasEvent ? "cursor-pointer hover:bg-primary/5" : "hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                        hasEvent ? "text-white" : "text-foreground"
                      }`}
                      style={hasEvent ? { backgroundColor: getTypeColor(primaryType) } : undefined}
                    >
                      {day}
                    </span>
                    {hasEvent && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${i > 0 ? "bg-muted" : ""}`}
                            style={i === 0 ? { backgroundColor: getTypeColor(e.type) } : undefined}
                          />
                        ))}
                      </div>
                    )}
                    {hoverDay === day && hasEvent && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-foreground text-white text-[10px] rounded-lg px-2 py-1.5 shadow-xl whitespace-nowrap max-w-[180px] pointer-events-none">
                        {dayEvents.map((e, i) => (
                          <div key={i} className={i > 0 ? "mt-1 pt-1 border-t border-white/20" : ""}>
                            <div className="font-semibold">{resolveCalendarEvent(e, locale).title}</div>
                            <div className="text-white/60 text-[9px]">
                              {mode === "AD"
                                ? formatDateLocale(new Date(e.date), locale, { month: "short", day: "numeric" })
                                : `${getBsMonthName(adToBs(e.date).month, true)} ${adToBs(e.date).date}`}
                            </div>
                          </div>
                        ))}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border flex-wrap">
              {eventTypes.map((et) => (
                <div key={et.id} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} />
                  <span className="text-xs text-muted">{et.label}</span>
                </div>
              ))}
            </div>

            {/* Event List */}
            {monthEvents.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {monthEvents
                  .filter(Boolean)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => {
                    const resolved = resolveCalendarEvent(event, locale);
                    const d = getEventDates(event);
                    const isAD = mode === "AD";
                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow flex gap-3"
                      >
                        <div
                          className="shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center"
                          style={{ backgroundColor: getTypeColor(event.type), color: "white" }}
                        >
                          <span className="text-base font-bold leading-none">
                            {isAD ? d.adDay : d.bsDay || d.adDay}
                          </span>
                          <span className="text-[9px] uppercase font-medium leading-tight">
                            {isAD ? d.adMonth : d.bsMonth || d.adMonth}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-foreground leading-snug">
                            {resolved.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-foreground font-medium">
                              {isAD ? d.adFull : d.bsFull || d.adFull}
                            </span>
                            <span className="text-[10px] text-muted">
                              {isAD ? d.bsFull : d.adFull}
                            </span>
                          </div>
                          {resolved.description && (
                            <p className="text-[10px] text-muted mt-0.5 line-clamp-1">
                              {resolved.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 mt-8">
                <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-muted text-sm">
                  {t.calendar.noEvents.replace("{month}", currentMonths[month])}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
