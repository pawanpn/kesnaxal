"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/constants/siteConfig";
import { useLocale } from "@/hooks/useLocale";
import EditableElement from "@/components/admin/EditableElement";
import SiteLogo from "@/components/SiteLogo";
import { useSiteContent } from "@/hooks/useSiteContent";
import { getSocialIcon } from "@/constants/socialIcons";

interface SocialLinkData {
  platform: string;
  url: string;
  iconUrl?: string;
}

export default function Footer() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { school, contact, social, footer } = siteConfig;
  const { getJson } = useSiteContent("global", "en");

  const dbSocial = getJson<{ links: SocialLinkData[] }>("social_links");
  const socialLinks: SocialLinkData[] = dbSocial?.links?.length
    ? dbSocial.links
    : Object.entries(social).map(([platform, url]) => ({ platform, url }));

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
            <div className="flex flex-wrap gap-3 mb-6">
              {socialLinks.map((link, i) => (
                <a
                  key={`${link.platform}-${i}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary hover:text-primary transition-colors text-gray-300"
                  aria-label={link.platform}
                >
                  {link.iconUrl ? (
                    <img src={link.iconUrl} alt={link.platform} className="w-5 h-5 object-contain rounded-sm" />
                  ) : (
                    getSocialIcon(link.platform)
                  )}
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
