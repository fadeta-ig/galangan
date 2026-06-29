"use client";
import type { Dictionary } from "@/types/dictionary";

import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";

type CTASectionProps = {
  locale: string;
  dict: Dictionary;
  data?: Record<string, any> /* eslint-disable-line @typescript-eslint/no-explicit-any */;
  whatsappNumber?: string;
  whatsappMessage?: string;
};

export default function CTASection({ locale, dict, data, whatsappNumber, whatsappMessage }: CTASectionProps) {
  const title = data ? (locale === "id" ? data.titleId : data.titleEn) : dict.common.contactUs;
  const subtitle = data ? (locale === "id" ? data.contentId : data.contentEn) : (locale === "id" ? "Siap membantu kebutuhan maritim Anda. Hubungi tim kami sekarang." : "Ready to assist your maritime needs. Contact our team now.");
  
  const waUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage || "")}`
    : "#";

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-28">
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="premium-shell animate-reveal">
          <div className="premium-core grid gap-10 p-8 md:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
                {dict.common.contactUs}
              </span>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.01em] text-navy md:text-5xl">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 md:text-base">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-stretch">
              <Link href={`/${locale}/contact`} className="btn-premium group w-full justify-center">
                <span>{dict.common.sendMessage}</span>
                <span className="btn-premium-icon">
                  <ArrowRight className="w-4 h-4 text-navy group-hover:text-cyan-dark" weight="bold" />
                </span>
              </Link>
              
              {whatsappNumber && (
                <a 
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1FA855] px-6 py-3 text-sm font-semibold text-[#117A3A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#ECFDF3] hover:text-[#0B5F2A]"
                >
                  <WhatsappLogo className="w-5 h-5" weight="fill" />
                  <span>{dict.common.chatWhatsApp}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
