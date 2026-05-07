import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import StaffGrid from "@/components/sections/StaffGrid";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the dedicated team of educators and staff at Kathmandu English School.",
};

export default function StaffPage() {
  return (
    <div className="min-h-screen">
      <PageHero pageKey="staff" />
      <StaffGrid staff={siteConfig.staff} title="Our Team" />
    </div>
  );
}
