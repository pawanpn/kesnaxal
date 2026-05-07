import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CalendarSection from "@/components/sections/CalendarSection";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "School Calendar",
  description: "View the academic calendar for Kathmandu English School — holidays, exams, events, and vacations.",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen">
      <PageHero pageKey="calendar" />
      <CalendarSection events={siteConfig.calendarEvents} />
    </div>
  );
}
