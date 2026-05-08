"use client";

import PageHero from "@/components/ui/PageHero";
import InquiryForm from "@/components/sections/InquiryForm";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function ContactPage() {
  const { contact } = useDynamicContent();
  return (
    <div className="min-h-screen">
      <PageHero pageKey="contact" />
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <InquiryForm contact={contact} />
        </div>
      </section>
    </div>
  );
}
