"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/constants/siteConfig";
import { useLocale } from "@/hooks/useLocale";
import { resolveContent } from "@/lib/translate";
import EditableElement from "@/components/admin/EditableElement";
import SiteLogo from "@/components/SiteLogo";

const socialIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
};

export default function Footer() {
  const { locale, t } = useLocale();
  const { school, contact, social, footer } = siteConfig;
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative shrink-0">
                <SiteLogo size={48} className="h-10 w-auto object-contain" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-sm">
                  <EditableElement
                    section="school"
                    contentKey="name"
                    value={{ en: school.name, ne: school.name, ja: school.name }}
                    as="span"
                  />
                </h3>
                <p className="text-secondary-light text-xs italic tracking-wide">
                  <EditableElement
                    section="school"
                    contentKey="motto"
                    value={{ en: school.motto, ne: school.motto, ja: school.motto }}
                    as="span"
                  />
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <EditableElement
                section="footer"
                contentKey="about"
                value={footer.about}
                as="span"
              />
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-secondary text-sm uppercase tracking-wider mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2">
              {footer.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-300 text-sm hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-bold text-secondary text-sm uppercase tracking-wider mb-4">
              {t.footer.contactInfo}
            </h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-white/5 mt-0.5">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-white text-xs uppercase tracking-wide mb-1">{t.footer.address}</span>
                  <span className="leading-relaxed text-gray-400">{contact.address}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-white/5 mt-0.5">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-white text-xs uppercase tracking-wide mb-1">{t.footer.phone}</span>
                  <div className="flex flex-col gap-0.5">
                    <a href={`tel:${contact.phone}`} className="text-gray-400 hover:text-secondary transition-colors">{contact.phone}</a>
                    <a href={`tel:${contact.phone2}`} className="text-gray-400 hover:text-secondary transition-colors">{contact.phone2}</a>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-white/5 mt-0.5">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-white text-xs uppercase tracking-wide mb-1">{t.footer.email}</span>
                  <a href={`mailto:${contact.email}`} className="text-gray-400 hover:text-secondary transition-colors break-all">{contact.email}</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Follow Us + Principal */}
          <div>
            <h4 className="font-heading font-bold text-secondary text-sm uppercase tracking-wider mb-4">
              {t.footer.followUs}
            </h4>
            <div className="flex gap-3 mb-6">
              {Object.entries(social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary hover:text-primary transition-colors text-gray-300"
                  aria-label={platform}
                >
                  {socialIcons[platform]}
                </a>
              ))}
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed mb-2">
                <span className="block font-heading font-bold text-secondary uppercase tracking-wider mb-1">{t.footer.principal}</span>
                <span className="text-white font-semibold">
                  <EditableElement
                    section="school"
                    contentKey="principal_name"
                    value={{ en: school.principal.name, ne: school.principal.name, ja: school.principal.name }}
                    as="span"
                  />
                </span>
              </p>
              <p className="text-[11px] text-gray-500 italic leading-relaxed">
                <EditableElement
                  section="school"
                  contentKey="principal_message"
                  value={{ en: school.principal.message, ne: school.principal.message, ja: school.principal.message }}
                  as="span"
                />
              </p>
            </div>
            <Link
              href={contact.mapEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-gray-400 hover:text-secondary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.footer.viewOnGoogleMaps}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} {school.name}. {t.footer.allRightsReserved}
          </p>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-gray-400 text-xs">
              {t.footer.establishedAffiliated.replace('{established}', String(school.established))}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
