"use client";

import type { HomepageSection, Statistic } from "@prisma/client";
import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";

import { useEffect, useState, useRef } from "react";

function CountUpNumber({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={nodeRef}>{count}</span>;
}

type StatsSectionProps = {
  locale: string;
  dict: Dictionary;
  stats: Pick<
    Statistic,
    "id" | "number" | "suffix" | "labelId" | "labelEn" | "description"
  >[];
  data?: Pick<
    HomepageSection,
    "titleId" | "titleEn" | "contentId" | "contentEn"
  >;
};

export default function StatsSection({
  locale,
  stats,
  data,
}: StatsSectionProps) {
  const title =
    (locale === "id" ? data?.titleId : data?.titleEn) ||
    "Mengembalikan Kekuatan di Lautan, Solusi Terdepan dalam Perbaikan Kapal";
  const body =
    (locale === "id" ? data?.contentId : data?.contentEn) ||
    "PT. Galangan Kapal Lanciar selalu berkomitmen memberikan pelayanan terbaik bagi perbaikan kapal Anda, didukung oleh fasilitas lengkap dan tim ahli bersertifikasi internasional.";

  return (
    <section className="bg-slate-50 pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-6 pb-20 md:px-12 md:pb-24">

        {/* ── Top: 2-col heading + body ── */}
        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2
              className="text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-[#0A2463] md:text-[2.25rem]"
              style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
            >
              {title}
            </h2>
          </div>
          <div className="flex flex-col items-start justify-center gap-5 lg:col-span-5">
            <p
              className="text-sm leading-relaxed text-slate-500 md:text-[15px]"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              {body}
            </p>
            <Link
              href={`/${locale}/about`}
              className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-md border border-[#0A2463] px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#0A2463] transition-all duration-300 hover:bg-[#0A2463] hover:text-white md:self-auto"
            >
              About Us
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                weight="bold"
              />
            </Link>
          </div>
        </div>

        {/* ── Middle: 2 images ── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              src: "/images/tugboats_docked.png",
              alt: "Fleet of tugboats docked at shipyard",
            },
            {
              src: "/images/shipyard_welder.png",
              alt: "Welder on ship hull with sparks flying",
            },
          ].map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl shadow-sm"
              style={{ height: "clamp(240px, 28vw, 360px)" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.04]"
                sizes="(max-width:768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2463]/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom: Stats row (Full Width Background Image) ── */}
      {stats.length > 0 && (
        <div className="relative w-full overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero_shipyard.png"
              alt="Shipyard statistics background"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#0A2463]/85" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid grid-cols-2 divide-y divide-white/20 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              {stats.slice(0, 4).map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 hover:bg-white/5 lg:p-10"
                >
                  <p
                    className="flex items-center text-5xl font-bold tracking-tight text-white md:text-6xl"
                    style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
                  >
                    <CountUpNumber end={stat.number || 0} />
                    <span className="ml-1 text-[#9EEFFC]">{stat.suffix}</span>
                  </p>
                  <p
                    className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white/95"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  >
                    {locale === "id" ? stat.labelId : stat.labelEn}
                  </p>
                  {stat.description && (
                    <p className="mt-2.5 max-w-[20ch] text-[12px] leading-relaxed text-white/70">
                      {stat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
