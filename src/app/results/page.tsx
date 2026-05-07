import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ResultPortal from "@/components/sections/ResultPortal";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "Student Results",
  description: "Check your exam results online. Enter your symbol number and date of birth to view and download your marksheet.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen">
      <PageHero pageKey="results" />
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <ResultPortal schoolName={siteConfig.school.name} schoolAddress={siteConfig.contact.address} />
        </div>
      </section>
    </div>
  );
}
