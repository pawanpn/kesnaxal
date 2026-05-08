import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Calendar",
  description: "View the academic calendar for Kathmandu English School — holidays, exams, events, and vacations.",
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
