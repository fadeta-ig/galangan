"use client";

import type { Dictionary } from "@/types/dictionary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

type ExperienceSectionProps = {
  locale: string;
  dict: Dictionary;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
};

// ── Gallery images: left tall + right 2x3 grid ──
const LEFT_TALL = "/images/female_engineer.png";
const RIGHT_GRID = [
  { src: "/images/drydock_aerial.png", alt: "Aerial view of dry dock" },
  { src: "/images/marine_engine.png", alt: "Ship diesel engine room" },
  { src: "/images/shipyard_welder.png", alt: "Welder on ship hull" },
  { src: "/images/tugboats_docked.png", alt: "Tugboats at berth" },
  { src: "/images/hero_shipyard.png", alt: "Shipyard overview" },
  { src: "/images/blue_orange_barge.png", alt: "Cargo barge in dry dock" },
];

export default function ExperienceSection({
  locale,
  dict,
  data,
  projects = [],
}: ExperienceSectionProps) {
  const title =
    data
      ? locale === "id"
        ? data.titleId
        : data.titleEn
      : "Track Record of Optimal Ship Repair Experience";

  const config = data?.configObj || {};
  const ctaPrimaryLabel = locale === "id" 
    ? (config.ctaPrimaryLabelId || dict.sections?.viewAllExperience || "Our Experience")
    : (config.ctaPrimaryLabelEn || dict.sections?.viewAllExperience || "Our Experience");
  const ctaPrimaryUrl = config.ctaPrimaryUrl || `/${locale}/experience`;

  const customMedia = config.experienceMedia || [];
  
  let leftTallImage = LEFT_TALL;
  let rightGridImages = RIGHT_GRID;

  if (customMedia.length > 0) {
    leftTallImage = customMedia[0].url || LEFT_TALL;
    rightGridImages = customMedia.length > 1 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? customMedia.slice(1, 7).map((m: any) => ({ src: m.url, alt: m.filename }))
      : RIGHT_GRID;
  } else if (projects && projects.length > 0) {
    leftTallImage = projects[0]?.coverImage || LEFT_TALL;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rightGridImages = projects.slice(1, 7).map((p: any) => ({
      src: p.coverImage || "/images/drydock_aerial.png",
      alt: p.translations?.[0]?.title || "Project Image"
    }));
    if (rightGridImages.length < 6) {
      rightGridImages = [
        ...rightGridImages,
        ...RIGHT_GRID.slice(rightGridImages.length, 6)
      ];
    }
  }

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* ── Header ── */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#007C91]">
              {locale === "id" ? "Pengalaman" : "Experience"}
            </span>
            <h2
              className="max-w-lg text-[1.6rem] font-semibold tracking-tight text-[#0A2463] md:text-[2rem]"
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

        {/* ── Gallery grid ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Left tall image */}
          <div
            className="group relative overflow-hidden rounded-2xl lg:col-span-4"
            style={{ height: "clamp(280px, 36vw, 540px)" }}
          >
            <Image
              src={leftTallImage}
              alt="Maritime engineer at shipyard"
              fill
              unoptimized={!leftTallImage.startsWith("/")}
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.04]"
              sizes="(max-width:1024px) 100vw, 33vw"
            />
            {/* Removed legacy gradient */}
          </div>

          {/* Right 2×3 grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:col-span-8">
            {rightGridImages.map((img: { src: string; alt: string }, i: number) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl"
                style={{
                  height: "clamp(120px, 14vw, 260px)",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized={!img.src.startsWith("/")}
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-[#0A2463]/0 transition-colors duration-500 group-hover:bg-[#0A2463]/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
