"use client";

import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Anchor, ShieldCheck, Wrench, PaintBrush, MagnifyingGlass, Nut } from "@phosphor-icons/react";

type ServicesSectionProps = {
  locale: string;
  dict: Dictionary;
  services: PublicService[];
  data?: {
    titleId?: string | null;
    titleEn?: string | null;
    contentId?: string | null;
    contentEn?: string | null;
  };
};

type ServiceTranslation = {
  locale?: string;
  slug?: string | null;
  title?: string | null;
  shortDescription?: string | null;
};

type PublicService = {
  id: string;
  coverImage?: string | null;
  translations?: ServiceTranslation[];
};

const getIconEl = (slug: string): React.ReactElement => {
  if (slug.includes("repair") || slug.includes("perbaikan"))
    return <Anchor weight="fill" className="size-7" />;
  if (slug.includes("build") || slug.includes("pembuatan") || slug.includes("pembangunan"))
    return <Wrench weight="fill" className="size-7" />;
  if (slug.includes("dock"))
    return <ShieldCheck weight="fill" className="size-7" />;
  if (slug.includes("paint") || slug.includes("cat"))
    return <PaintBrush weight="fill" className="size-7" />;
  if (slug.includes("inspect"))
    return <MagnifyingGlass weight="fill" className="size-7" />;
  return <Nut weight="fill" className="size-7" />;
};

export default function ServicesSection({
  locale,
  dict,
  services,
  data,
}: ServicesSectionProps) {
  const title =
    data ? (locale === "id" ? data.titleId : data.titleEn) : dict.sections?.servicesTitle ?? "Our Services";
  const subtitle =
    data ? (locale === "id" ? data.contentId : data.contentEn) : dict.sections?.servicesSubtitle ?? "";

  return (
    <section className="bg-slate-50 py-24 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* ── Header row ── */}
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <span
              className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007C91]"
            >
              {locale === "id" ? "Layanan Kami" : "Our Services"}
            </span>
            <h2
              className="text-[2rem] font-semibold leading-tight tracking-tight text-[#0A2463] md:text-[2.5rem]"
              style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-slate-600" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={`/${locale}/services`}
            className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full border border-slate-300 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0A2463] transition-all duration-300 hover:border-[#0A2463] hover:bg-[#0A2463] hover:text-white md:self-auto"
          >
            {locale === "id" ? "Lihat Semua" : "View All"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" weight="bold" />
          </Link>
        </div>

        {/* ── 4-card grid ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service, i) => {
            const trans: ServiceTranslation =
              service.translations?.find((t) => t.locale === locale) ??
              service.translations?.[0] ??
              {};
            const slug = trans.slug ?? service.id;

            return (
              <div
                key={service.id}
                className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(10,36,99,0.12)]"
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Background Image Overlay on Hover */}
                {service.coverImage && (
                  <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Image 
                      src={service.coverImage} 
                      alt="" 
                      fill
                      unoptimized={!service.coverImage.startsWith("/")}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-[#0A2463]/85" />
                  </div>
                )}

                <div className="relative z-10 p-8 flex flex-col h-full transition-colors duration-500">
                  {/* Icon */}
                  <div className="mb-8 flex size-14 items-center justify-center rounded-xl bg-slate-50 transition-colors duration-500 group-hover:!bg-white/10 group-hover:!text-white">
                    <div className="text-[#007C91] transition-colors duration-500 group-hover:!text-[#9EEFFC]">
                      {getIconEl(slug)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-4 text-[20px] font-semibold leading-snug text-[#0A2463] transition-colors duration-500 group-hover:!text-white line-clamp-2"
                    style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
                  >
                    {trans.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="mb-8 flex-1 text-[14.5px] leading-relaxed text-slate-500 transition-colors duration-500 group-hover:!text-white/80 line-clamp-3"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  >
                    {trans.shortDescription}
                  </p>

                  {/* CTA */}
                  <Link
                    href={`/${locale}/services/${slug}`}
                    className="group/btn mt-auto inline-flex items-center gap-3 self-start text-[11px] font-bold uppercase tracking-[0.15em] text-[#0A2463] transition-colors duration-300 group-hover:!text-[#9EEFFC]"
                  >
                    {dict.common?.readMore || "Discover"}
                    <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[#0A2463] transition-all duration-300 group-hover:!bg-white/20 group-hover:!text-white group-hover/btn:translate-x-1">
                      <ArrowRight className="size-3.5" weight="bold" />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
