"use client";

import PageHero from "@/components/ui/PageHero";
import CalendarSection from "@/components/sections/CalendarSection";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function CalendarPage() {
  const { calendarEvents, calendarEventTypes } = useDynamicContent();
  return (
    <div className="min-h-screen">
      <PageHero pageKey="calendar" />
      <CalendarSection events={calendarEvents} eventTypes={calendarEventTypes} />
    </div>
  );
}
