"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/constants/siteConfig";
import { useLocale } from "@/hooks/useLocale";
import SiteLogo from "@/components/SiteLogo";
import type { NavLink } from "@/types";

const navLinks: NavLink[] = siteConfig.nav.links;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t, locales } = useLocale();
  const langRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="relative shrink-0">
              <SiteLogo
                size={48}
                className="h-9 lg:h-12 w-auto object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs lg:text-base font-heading font-bold text-primary leading-tight whitespace-nowrap">
                {siteConfig.school.name}
              </p>
              <p className="text-[10px] lg:text-[11px] text-muted italic whitespace-nowrap">
                {t.hero.motto}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setAcademicsOpen(true)}
                  onMouseLeave={() => setAcademicsOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-0.5 ${
                      isActive(link.href)
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {t.nav[link.label] || link.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {academicsOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-border py-2 animate-fadein">
                      {link.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => setAcademicsOpen(false)}
                        >
                          {t.nav[sub.label] || sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t.nav[link.label] || link.label}
                </Link>
              )
            )}
          </nav>

          {/* Language Switcher + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-surface border border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20 outline-none"
                aria-label="Change language"
                aria-expanded={langOpen}
              >
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold uppercase tracking-wider">{locale}</span>
                <svg className={`w-3 h-3 text-muted transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-border py-1.5 animate-fadein z-50">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        locale === l.code
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-foreground hover:bg-surface"
                      }`}
                    >
                      <span className="text-lg leading-none">{l.flag}</span>
                      <span className="flex-1 text-left">{l.label}</span>
                      {locale === l.code && (
                        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="lg:hidden p-2 rounded-md text-foreground hover:bg-surface"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-white animate-fadein">
          <div className="container-custom py-3 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setAcademicsOpen(!academicsOpen)}
                  >
                    {t.nav[link.label] || link.label}
                    <svg className={`w-3 h-3 transition-transform ${academicsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {academicsOpen && (
                    <div className="ml-4 border-l-2 border-primary/20 pl-3">
                      {link.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                          onClick={() => { setAcademicsOpen(false); setMobileOpen(false); }}
                        >
                          {t.nav[sub.label] || sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href) ? "bg-primary text-white" : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t.nav[link.label] || link.label}
                </Link>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
