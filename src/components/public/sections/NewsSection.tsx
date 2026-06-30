"use client";

import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react";
import { getLocalizedUrl, type Locale } from "@/lib/i18n/config";

type NewsSectionProps = {
  locale: string;
  dict: Dictionary;
  news: PublicNewsPost[];
  data?: {
    titleId?: string | null;
    titleEn?: string | null;
  };
};

type NewsTranslation = {
  locale?: string;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
};

type PublicNewsPost = {
  id: string;
  featuredImage?: string | null;
  publishDate?: Date | string | null;
  translations?: NewsTranslation[];
};

// High-quality shipyard images fallback
const CARD_IMAGES = [
  "/images/news_safety.png",
  "/images/news_dock.png",
  "/images/news_award.png",
];

export default function NewsSection({
  locale,
  dict,
  news,
  data,
}: NewsSectionProps) {
  if (!news || news.length === 0) return null;

  const title =
    data ? (locale === "id" ? data.titleId : data.titleEn) : "Shipyard Spotlight";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (data as any)?.configObj || {};
  const ctaPrimaryLabel = locale === "id" 
    ? (config.ctaPrimaryLabelId || "Semua Berita") 
    : (config.ctaPrimaryLabelEn || "All News");
  const ctaPrimaryUrl = config.ctaPrimaryUrl || getLocalizedUrl('/news', locale as Locale);

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* ── Header ── */}
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007C91]">
              {locale === "id" ? "Sorotan Berita" : "Latest News"}
            </span>
            <h2
              className="text-[2rem] font-semibold tracking-tight text-[#0A2463] md:text-[2.5rem]"
              style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
            >
              {title}
            </h2>
          </div>
          <Link
            href={ctaPrimaryUrl}
            className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-md border border-[#0A2463] px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#0A2463] transition-all duration-300 hover:bg-[#0A2463] hover:text-white md:self-auto"
          >
            {ctaPrimaryLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </Link>
        </div>

        {/* ── 3-card grid ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 3).map((item, i) => {
            const trans: NewsTranslation =
              item.translations?.find((t) => t.locale === locale) ??
              item.translations?.[0] ??
              {};
            const slug = trans.slug ?? item.id;

            const publishDate = item.publishDate
              ? new Date(item.publishDate).toLocaleDateString(
                  locale === "id" ? "id-ID" : "en-US",
                  { day: "numeric", month: "long", year: "numeric" }
                )
              : null;

            const imgSrc = item.featuredImage || CARD_IMAGES[i % CARD_IMAGES.length];

            const excerpt: string =
              trans.excerpt
                ? trans.excerpt
                : (trans.content?.replace(/<[^>]+>/g, "").substring(0, 130) ?? "") + "...";

            return (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#0A2463]/30 hover:shadow-[0_18px_36px_rgba(10,36,99,0.08)]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div
                  className="relative w-full overflow-hidden border-b border-slate-100"
                  style={{ height: "clamp(200px, 25vw, 240px)" }}
                >
                  <Image
                    src={imgSrc}
                    alt={trans.title ?? "Shipyard news"}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.05]"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-8">
                  {publishDate && (
                    <div className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <CalendarBlank className="size-3.5" weight="bold" />
                      {publishDate}
                    </div>
                  )}

                  <h3
                    className="mb-4 text-[18px] font-semibold leading-snug text-[#0A2463] transition-colors duration-200 group-hover:text-[#0D2F7A] line-clamp-2"
                    style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
                  >
                    {trans.title}
                  </h3>

                  <p
                    className="mb-8 flex-1 text-[14px] leading-relaxed text-slate-600 line-clamp-3"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  >
                    {excerpt}
                  </p>

                  <Link
                    href={getLocalizedUrl(`/news/${slug}`, locale as Locale)}
                    className="group/btn inline-flex items-center gap-2 self-start rounded-md bg-[#0A2463] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#0D2F7A]"
                  >
                    {dict.common?.readMore ?? "Selengkapnya"}
                    <ArrowRight
                      className="size-3 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                      weight="bold"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
