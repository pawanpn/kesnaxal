import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the dedicated team of educators and staff at Kathmandu English School.",
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
