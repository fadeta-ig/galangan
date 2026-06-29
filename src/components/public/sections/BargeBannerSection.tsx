"use client";

import Image from "next/image";

export default function BargeBannerSection() {
  return (
    <div
      className="relative w-full overflow-hidden bg-slate-900"
      style={{ height: "clamp(240px, 30vw, 440px)" }}
    >
      <Image
        src="/images/blue_orange_barge.png"
        alt="Blue and orange cargo barge docked at shipyard"
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Removed radial gradient as per strict flat-design policy */}
    </div>
  );
}
