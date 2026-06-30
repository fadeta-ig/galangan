"use client";

import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

type HeroSectionProps = {
  locale: string;
  dict: Dictionary;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
};

export default function HeroSection({ locale, dict, data }: HeroSectionProps) {
  const title =
    (locale === "id"
      ? (data?.titleId as string)
      : (data?.titleEn as string)) ||
    "Your Trusted Ship Repairing & Ship Building Partner in East Kalimantan";
  const content =
    (locale === "id"
      ? (data?.contentId as string)
      : (data?.contentEn as string)) ||
    "Mengembalikan kekuatan armada Anda di lautan dengan solusi perbaikan kapal terdepan dan berstandar internasional.";

  const config = data?.configObj || {};
  const bgImage = config.bgImage || "/images/hero_shipyard.png";
  
  const ctaPrimaryLabel = locale === "id" ? (config.ctaPrimaryLabelId || dict.common?.contactUs || "Hubungi Kami") : (config.ctaPrimaryLabelEn || dict.common?.contactUs || "Contact Us");
  const ctaPrimaryUrl = config.ctaPrimaryUrl || `/${locale}/contact`;
  
  const ctaSecondaryLabel = locale === "id" ? (config.ctaSecondaryLabelId || "Layanan Kami") : (config.ctaSecondaryLabelEn || "Our Services");
  const ctaSecondaryUrl = config.ctaSecondaryUrl || `/${locale}/services`;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0A2463]"
      style={{ minHeight: "clamp(560px, calc(100dvh - 73px), 720px)", marginTop: "73px" }}
    >
      <div className="absolute inset-0 z-0 lg:hidden">
        <Image
          src={bgImage}
          alt="Galangan Kapal Lanciar Shipyard"
          fill
          priority
          quality={90}
          unoptimized={!bgImage.startsWith("/")}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#0A2463]/88" />
      </div>

      <div className="absolute inset-y-0 right-0 z-0 hidden w-[45%] lg:block">
        <Image
          src={bgImage}
          alt="Galangan Kapal Lanciar Shipyard"
          fill
          priority
          quality={90}
          unoptimized={!bgImage.startsWith("/")}
          className="object-cover object-center"
          sizes="45vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-white/5" />
      </div>

      <div className="absolute inset-y-0 left-0 z-10 hidden w-[55%] bg-[#0A2463] lg:block" />
      <div className="absolute inset-y-0 left-[55%] z-20 hidden w-1.5 bg-[#9EEFFC] lg:block" />
      <div className="absolute inset-y-0 left-[calc(55%+6px)] z-20 hidden w-1 bg-white lg:block" />

      <div className="relative z-30 mx-auto flex min-h-[inherit] max-w-7xl items-center px-6 py-16 md:px-12 lg:py-0">
        <div className="max-w-[720px] animate-reveal">
          <span
            className="mb-6 inline-block text-[12px] font-medium uppercase tracking-[0.18em] text-[#9EEFFC]"
          >
            PT. Galangan Kapal Lanciar
          </span>

          <h1
            className="mb-6 font-semibold leading-[1.08] tracking-[-0.01em] text-white text-balance"
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: "clamp(2.35rem, 4.65vw, 4.35rem)",
            }}
          >
            {title}
          </h1>

          <p
            className="mb-10 max-w-[54ch] text-[15px] font-medium leading-relaxed text-blue-50 md:text-[17px]"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {content}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={ctaPrimaryUrl}
              className="group inline-flex min-h-12 items-center gap-3 rounded-md bg-white px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0A2463] shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#E7F8FB]"
            >
              {ctaPrimaryLabel}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                weight="bold"
              />
            </Link>
            <Link
              href={ctaSecondaryUrl}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/35 px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-white hover:!text-[#0A2463]"
            >
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
