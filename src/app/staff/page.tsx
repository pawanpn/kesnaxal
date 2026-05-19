"use client";
import PageHero from "@/components/ui/PageHero";
import StaffGrid from "@/components/sections/StaffGrid";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { useAdmin } from "@/hooks/useAdmin";

export default function StaffPage() {
  const { staff } = useDynamicContent();
  const { contentReady } = useAdmin();

  return (
    <div className="min-h-screen">
      <PageHero pageKey="staff" />
      <StaffGrid
        staff={staff}
        title="Our Team"
        loading={!contentReady}
      />
    </div>
  );
}
