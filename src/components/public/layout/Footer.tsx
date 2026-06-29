import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import NewsletterForm from "@/components/public/forms/NewsletterForm";

type FooterProps = {
  locale: string;
  dict: Dictionary;
  settings: Record<string, string>;
};

export default function Footer({ locale, dict, settings }: FooterProps) {
  const year = new Date().getFullYear();
  const siteName = settings.site_name ?? "Galangan Kapal";

  const navLinks = [
    { label: dict.nav?.home ?? "Home", href: `/${locale}` },
    { label: dict.nav?.about ?? "About", href: `/${locale}/about` },
    { label: dict.nav?.services ?? "Services", href: `/${locale}/services` },
    { label: dict.nav?.experience ?? "Experience", href: `/${locale}/experience` },
    { label: dict.nav?.news ?? "News", href: `/${locale}/news` },
    { label: dict.nav?.contact ?? "Contact", href: `/${locale}/contact` },
  ];

  const socials = [
    { key: "social_instagram", Icon: InstagramLogo, label: "Instagram" },
    { key: "social_facebook", Icon: FacebookLogo, label: "Facebook" },
    { key: "social_linkedin", Icon: LinkedinLogo, label: "LinkedIn" },
    { key: "social_youtube", Icon: YoutubeLogo, label: "YouTube" },
  ].filter((s) => settings[s.key]);

  return (
    <footer className="bg-white" style={{ borderTop: "1px solid #f1f5f9" }}>
      {/* ── Main 3-col grid ── */}
      <div
        className="mx-auto grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-3 md:gap-12 md:px-12"
        style={{ maxWidth: "1280px" }}
      >
        {/* Col 1 — Contact */}
        <div>
          <h4
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A2463]"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {dict.footer?.getInTouch ?? "Get in Touch"}
          </h4>
          <ul className="flex flex-col gap-3.5">
            {settings.company_address && (
              <li className="flex items-start gap-3 text-[13px] leading-relaxed text-slate-500">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#0A2463]" />
                <span>{settings.company_address}</span>
              </li>
            )}
            {settings.company_phone && (
              <li className="flex items-center gap-3 text-[13px] text-slate-500">
                <Phone className="size-4 shrink-0 text-[#0A2463]" />
                <a
                  href={`tel:${settings.company_phone}`}
                  className="hover:text-[#0A2463] transition-colors"
                >
                  {settings.company_phone}
                </a>
              </li>
            )}
            {settings.company_email && (
              <li className="flex items-center gap-3 text-[13px] text-slate-500">
                <EnvelopeSimple className="size-4 shrink-0 text-[#0A2463]" />
                <a
                  href={`mailto:${settings.company_email}`}
                  className="hover:text-[#0A2463] transition-colors"
                >
                  {settings.company_email}
                </a>
              </li>
            )}
          </ul>

          {/* Socials */}
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-200 hover:border-[#0A2463] hover:bg-[#0A2463] hover:text-white"
                >
                  <Icon className="size-4" weight="fill" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 — Sitemap */}
        <div>
          <h4
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A2463]"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            Sitemap
          </h4>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#0A2463]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Brand + Newsletter */}
        <div>
          <Link
            href={`/${locale}`}
            className="mb-4 inline-flex items-center gap-1"
            style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
          >
            <span className="text-[22px] font-semibold tracking-tight text-[#0A2463]">
              GALANGAN
            </span>
            <span className="text-[22px] font-semibold tracking-tight text-[#B42318]">
              KAPAL
            </span>
          </Link>

          <p className="mb-5 text-[13px] leading-relaxed text-slate-400">
            {settings.site_tagline_id ??
              settings.site_tagline_en ??
              "Solusi Terdepan Perbaikan & Pembangunan Kapal di Kalimantan Timur."}
          </p>

          <h5
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {dict.footer?.newsletter ?? "Get Latest Updates"}
          </h5>
          <NewsletterForm
            placeholder={dict.footer?.newsletterPlaceholder ?? "Your email address"}
          />
        </div>
      </div>

      {/* ── Sub-footer blue bar ── */}
      <div className="bg-[#0A2463]">
        <div
          className="mx-auto flex flex-col items-center justify-between gap-3 px-6 py-4 text-[12px] font-medium tracking-wide text-blue-100/85 sm:flex-row md:px-12"
          style={{ maxWidth: "1280px" }}
        >
          <p>
            &copy; {year} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href={`/${locale}/pages/${locale === "id" ? "kebijakan-privasi" : "privacy-policy"}`}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${locale}/pages/${locale === "id" ? "syarat-ketentuan" : "terms-of-service"}`}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
