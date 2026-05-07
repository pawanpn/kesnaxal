import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import InquiryForm from "@/components/sections/InquiryForm";
import { siteConfig } from "@/constants/siteConfig";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Kathmandu English School. Visit us, call, or send a message.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <PageHero pageKey="contact" />
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <InquiryForm contact={siteConfig.contact} />
        </div>
      </section>
    </div>
  );
}
