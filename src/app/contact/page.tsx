import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Kathmandu English School. Visit us, call, or send a message.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">Contact Us</h1>
          <p className="text-gray-200 max-w-xl mx-auto text-sm">We&apos;d love to hear from you</p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
