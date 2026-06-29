"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, List, X, Anchor, Wrench, ShieldCheck, PaintBrush, MagnifyingGlass, Nut } from "@phosphor-icons/react";

const getIconEl = (slug: string): React.ReactElement => {
  if (slug.includes("repair") || slug.includes("perbaikan"))
    return <Anchor weight="fill" className="size-5" />;
  if (slug.includes("build") || slug.includes("pembuatan") || slug.includes("pembangunan"))
    return <Wrench weight="fill" className="size-5" />;
  if (slug.includes("dock"))
    return <ShieldCheck weight="fill" className="size-5" />;
  if (slug.includes("paint") || slug.includes("cat"))
    return <PaintBrush weight="fill" className="size-5" />;
  if (slug.includes("inspect"))
    return <MagnifyingGlass weight="fill" className="size-5" />;
  return <Nut weight="fill" className="size-5" />;
};

type Dictionary = {
  nav: {
    home: string;
    about: string;
    services: string;
    experience: string;
    news: string;
    gallery?: string;
    contact: string;
  };
  common: {
    contactUs: string;
  };
  [key: string]: unknown;
};

type NavbarProps = {
  locale: string;
  dict: Dictionary;
  services?: {
    id: string;
    title: string;
    slug: string;
  }[];
};

export default function Navbar({ locale, dict, services = [] }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = () => {
    const newLocale = locale === "id" ? "en" : "id";
    return pathname.replace(`/${locale}`, `/${newLocale}`);
  };

  const navLinks = [
    { name: dict.nav.home, href: `/${locale}` },
    { name: dict.nav.about, href: `/${locale}/about` },
    { name: dict.nav.services, href: `/${locale}/services` },
    { name: dict.nav.experience, href: `/${locale}/experience` },
    { name: dict.nav.news, href: `/${locale}/news` },
  ];

  return (
    <>
      {/* ─── Fixed Header ─── */}
      <header
        className="fixed inset-x-0 top-0 z-[200]"
        style={{
          backgroundColor: "white",
          borderBottom: scrolled ? "none" : "1px solid #f1f5f9",
          boxShadow: scrolled
            ? "0 2px 24px rgba(10,22,40,0.08)"
            : "none",
          transition: "box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-bottom-color 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            padding: "0 clamp(1.25rem, 4vw, 3rem)",
            height: "73px",
          }}
        >
          {/* ── Logo ── */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1.5 shrink-0"
            style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
          >
            <span
              className="text-[18px] font-semibold tracking-tight text-[#0A2463]"
            >
              GALANGAN
            </span>
            <span
              className="text-[18px] font-semibold tracking-tight text-[#B42318]"
            >
              KAPAL
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== `/${locale}` && pathname.startsWith(link.href + "/"));
              
              const isServices = link.href === `/${locale}/services`;

              return (
                <div key={link.href} className="group relative py-6">
                  <Link
                    href={link.href}
                    className="relative text-[12.5px] font-semibold uppercase tracking-[0.13em] transition-colors duration-200"
                    style={{
                      color: isActive ? "#0A2463" : "#64748b",
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    }}
                  >
                    {link.name}
                    {/* Active underline */}
                    {isActive && (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#0A2463]"
                      />
                    )}
                  </Link>

                  {/* Dropdown for Services - Mega Menu Style */}
                  {isServices && services.length > 0 && (
                    <div className="absolute left-1/2 top-full w-[600px] -translate-x-1/2 opacity-0 invisible translate-y-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-50 pt-4">
                      <div className="rounded-2xl border border-white/50 bg-white/85 backdrop-blur-xl p-6 shadow-[0_32px_64px_rgba(10,36,99,0.12)]">
                        <div className="grid grid-cols-2 gap-4">
                          {services.map((service) => (
                            <Link
                              key={service.id}
                              href={`/${locale}/services/${service.slug}`}
                              className="group/item flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-white/80 hover:shadow-sm"
                            >
                              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#007C91] transition-colors group-hover/item:bg-[#0A2463] group-hover/item:text-white">
                                {getIconEl(service.slug)}
                              </div>
                              <div className="flex flex-col">
                                <span 
                                  className="text-[14px] font-semibold text-[#0A2463] transition-colors group-hover/item:text-[#007C91]"
                                  style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
                                >
                                  {service.title}
                                </span>
                                <span className="mt-0.5 text-[12px] text-slate-500" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                                  {locale === 'id' ? 'Pelajari lebih lanjut' : 'Learn more'} &rarr;
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Actions ── */}
          <div className="hidden items-center gap-5 md:flex">
            {/* Locale switcher */}
            <Link
              href={switchLocale()}
              className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-[#0A2463]"
              title={`Switch to ${locale === "id" ? "English" : "Bahasa Indonesia"}`}
            >
              <Globe className="size-4" />
              {locale === "id" ? "EN" : "ID"}
            </Link>

            {/* Contact CTA */}
            <Link
              href={`/${locale}/contact`}
              className="rounded-[4px] bg-[#0A2463] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#0D2F7A] hover:shadow-[0_10px_22px_rgba(10,36,99,0.18)] active:scale-[0.98]"
            >
              {dict.common.contactUs}
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="flex size-10 items-center justify-center rounded-full bg-slate-50 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="size-5 text-[#0A2463]" weight="bold" />
            ) : (
              <List className="size-5 text-[#0A2463]" weight="bold" />
            )}
          </button>
        </div>
      </header>

      {/* ─── Mobile Drawer ─── */}
      <div
        className="fixed inset-0 z-[190] flex flex-col bg-white pt-[73px] transition-opacity duration-300 md:hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <nav className="flex flex-col divide-y divide-slate-100 px-6 overflow-y-auto">
          {navLinks.map((link) => {
            const isServices = link.href === `/${locale}/services`;
            
            return (
              <div key={link.href} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="py-4 text-[15px] font-semibold uppercase tracking-wider text-slate-700 hover:text-[#0A2463]"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  {link.name}
                </Link>
                {/* Mobile Services Dropdown List */}
                {isServices && services.length > 0 && (
                  <div className="flex flex-col pl-4 pb-4 gap-3 border-l-2 border-slate-100 ml-2">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/${locale}/services/${service.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] text-slate-500 hover:text-[#0A2463]"
                        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-6 pb-10 pt-8">
          <Link
            href={switchLocale()}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-[4px] border border-slate-200 py-3 text-[13px] font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:border-[#0A2463] hover:text-[#0A2463]"
          >
            <Globe className="size-4" />
            {locale === "id" ? "Switch to English" : "Ganti ke Indonesia"}
          </Link>
          <Link
            href={`/${locale}/contact`}
            onClick={() => setIsOpen(false)}
            className="rounded-[4px] bg-[#0A2463] py-3.5 text-center text-[13px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#0D2F7A]"
          >
            {dict.common.contactUs}
          </Link>
        </div>
      </div>
    </>
  );
}
