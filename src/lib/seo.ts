import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

export async function getSeoMetadata(
  entityType: string,
  entityId: string,
  locale: Locale,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<Metadata> {
  const seo = await prisma.seoMeta.findUnique({
    where: {
      entityType_entityId_locale: {
        entityType,
        entityId,
        locale,
      },
    },
  });

  if (!seo) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  return {
    title: seo.metaTitle || fallbackTitle,
    description: seo.metaDescription || fallbackDescription,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || fallbackTitle,
      description: seo.ogDescription || seo.metaDescription || fallbackDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
  };
}
