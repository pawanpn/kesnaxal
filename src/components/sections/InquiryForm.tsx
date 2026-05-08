"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import EditableElement from "@/components/admin/EditableElement";
import { useT } from "@/hooks/useLocale";
import type { ContactInfo } from "@/types";

interface InquiryFormProps {
  contact: ContactInfo;
}

export default function InquiryForm({ contact }: InquiryFormProps) {
  const t = useT();
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
        <SectionHeading title={t.forms.sendUsMessage} />
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-lg font-semibold text-green-800 mb-2">{t.forms.messageSent}</h3>
            <p className="text-green-700 text-sm">{t.forms.weWillGetBack}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.forms.fullName}</label>
                <input name="name" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.forms.yourName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.forms.email}</label>
                <input name="email" type="email" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.forms.yourEmail} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.forms.phone}</label>
              <input name="phone" className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder={t.forms.yourPhone} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.forms.subject}</label>
              <select name="subject" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-white">
                <option value="">{t.forms.selectSubject}</option>
                <option value="admission">{t.forms.admissionInquiry}</option>
                <option value="academic">{t.forms.academicInfo}</option>
                <option value="fee">{t.forms.feeStructure}</option>
                <option value="general">{t.forms.generalInquiry}</option>
                <option value="other">{t.forms.other}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.forms.message}</label>
              <textarea name="message" rows={4} required className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none" placeholder={t.forms.messagePlaceholder} />
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">{t.forms.sendMessage}</button>
          </form>
        )}
      </div>

      <div>
        <div className="bg-surface rounded-xl p-6 mb-6">
          <h3 className="text-lg font-heading font-bold text-primary mb-4">{t.forms.contactInfo}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div><p className="font-medium text-foreground">{t.forms.address}</p>
                <p className="text-muted">
                  <EditableElement section="contact" contentKey="address" value={{ en: contact.address, ne: contact.address, ja: contact.address }} as="span" />
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <div><p className="font-medium text-foreground">{t.forms.phoneLabel}</p>
                <p className="text-muted">
                  <EditableElement section="contact" contentKey="phone" value={{ en: contact.phone, ne: contact.phone, ja: contact.phone }} as="span" />
                  {" | "}
                  <EditableElement section="contact" contentKey="phone2" value={{ en: contact.phone2, ne: contact.phone2, ja: contact.phone2 }} as="span" />
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <div><p className="font-medium text-foreground">{t.forms.emailLabel}</p>
                <p className="text-muted">
                  <EditableElement section="contact" contentKey="email" value={{ en: contact.email, ne: contact.email, ja: contact.email }} as="span" />
                </p>
              </div>
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
