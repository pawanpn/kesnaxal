"use client";

import PageHero from "@/components/ui/PageHero";
import StaffGrid from "@/components/sections/StaffGrid";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function StaffPage() {
  const { staff } = useDynamicContent();
  return (
    <div className="min-h-screen">
      <PageHero pageKey="staff" />
      <StaffGrid staff={staff} title="Our Team" />
    </div>
  );
}
