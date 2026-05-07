"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ContactInfo } from "@/types";

interface InquiryFormProps {
  contact: ContactInfo;
}

export default function InquiryForm({ contact }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    console.log("Inquiry Form Data:", Object.fromEntries(fd.entries()));
    setSubmitted(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <SectionHeading title="Send Us a Message" />
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-green-700 text-sm">We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <input name="name" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <input name="email" type="email" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <input name="phone" className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Subject *</label>
              <select name="subject" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-white">
                <option value="">Select subject</option>
                <option value="admission">Admission Inquiry</option>
                <option value="academic">Academic Information</option>
                <option value="fee">Fee Structure</option>
                <option value="general">General Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message *</label>
              <textarea name="message" rows={4} required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none" placeholder="Write your message..." />
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">Send Message</button>
          </form>
        )}
      </div>

      <div>
        <div className="bg-surface rounded-xl p-6 mb-6">
          <h3 className="text-lg font-heading font-bold text-primary mb-4">Contact Information</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div><p className="font-medium text-foreground">Address</p><p className="text-muted">{contact.address}</p></div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <div><p className="font-medium text-foreground">Phone</p><p className="text-muted">{contact.phone} | {contact.phone2}</p></div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <div><p className="font-medium text-foreground">Email</p><p className="text-muted">{contact.email}</p></div>
            </li>
          </ul>
        </div>
        <div className="rounded-xl overflow-hidden h-[300px] lg:h-[350px] border border-border">
          <iframe src={contact.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="School Location" />
        </div>
      </div>
    </div>
  );
}
