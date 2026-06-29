import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type PageHeroProps = {
  title: string;
  subtitle?: string | null;
  imageSrc?: string | null;
  imageAlt?: string;
  eyebrow?: string | null;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
  compact?: boolean;
};

function isLocalImage(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export default function PageHero({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  eyebrow,
  backHref,
  backLabel,
  children,
  compact = false,
}: PageHeroProps) {
  return (
    <section className={`public-page-hero ${compact ? "public-page-hero--compact" : ""}`}>
      {imageSrc && (
        <div className="public-page-hero__media">
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            priority
            unoptimized={!isLocalImage(imageSrc)}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="public-page-hero__veil" />

      <div className="container relative z-20 mx-auto max-w-5xl px-6">
        <div className="animate-reveal text-center">
          {backHref && backLabel && (
            <Link href={backHref} className="public-page-hero__back">
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          )}

          {eyebrow && <span className="public-page-hero__eyebrow">{eyebrow}</span>}

          <h1 className="public-page-hero__title">{title}</h1>

          {subtitle && <p className="public-page-hero__subtitle">{subtitle}</p>}

          {children && <div className="public-page-hero__meta">{children}</div>}
        </div>
      </div>
    </section>
  );
}
