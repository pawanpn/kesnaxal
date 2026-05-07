import type { Metadata } from "next";
import ResultPortal from "@/components/ResultPortal";

export const metadata: Metadata = {
  title: "Student Results",
  description: "Check your exam results online. Enter your symbol number and date of birth to view and download your marksheet.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">Student Results</h1>
          <p className="text-gray-200 max-w-xl mx-auto text-sm">
            Enter your Symbol Number and Date of Birth to view and download your marksheet
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <ResultPortal />
        </div>
      </section>
    </div>
  );
}
