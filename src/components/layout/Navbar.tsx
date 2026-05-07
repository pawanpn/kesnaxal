"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/constants/siteConfig";
import { useLocale } from "@/hooks/useLocale";
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

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary text-secondary font-bold text-sm lg:text-lg">
              {siteConfig.school.shortName}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm lg:text-lg font-heading font-bold text-primary leading-tight">
                {siteConfig.school.name}
              </p>
              <p className="text-[10px] lg:text-xs text-muted italic">
                {t.hero.motto}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
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
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-surface transition-colors border border-border"
                aria-label="Change language"
              >
                <span className="text-base">{locales.find((l) => l.code === locale)?.flag}</span>
                <span className="hidden sm:inline text-xs uppercase">{locale}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-border py-1 animate-fadein z-50">
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        locale === l.code
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-surface"
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
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
