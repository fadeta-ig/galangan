import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

export async function getSeoMetadata(
  entityType: string,
  entityId: string,
  locale: Locale,
  fallbackTitle: string,
  fallbackDescription: string,
  fallbackImage?: string | null
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

  const finalTitle = seo?.metaTitle || fallbackTitle;
  const finalDescription = seo?.metaDescription || fallbackDescription;
  const finalOgImage = seo?.ogImage || fallbackImage;

  if (!seo) {
    return {
      title: finalTitle,
      description: finalDescription,
      openGraph: {
        title: finalTitle,
        description: finalDescription,
        images: finalOgImage ? [{ url: finalOgImage }] : [],
      }
    };
  }

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: seo.ogTitle || finalTitle,
      description: seo.ogDescription || finalDescription,
      images: finalOgImage ? [{ url: finalOgImage }] : [],
    },
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
  };
}
