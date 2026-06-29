import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";
import GalleryPageClient from "@/components/public/gallery/GalleryPageClient";

type GalleryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.gallery.pageTitle} | ${dict.meta.siteTitle}`,
    description: dict.gallery.pageSubtitle,
  };
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { locale } = await params;
  const { category: categoryId, page } = await searchParams;

  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const currentPage = Number(page) || 1;
  const pageSize = 16;

  const where = categoryId ? { categoryId } : {};

  const [mediaItems, totalCount, categories] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        translations: { where: { locale: locale as Locale } },
        category: true,
      },
    }),
    prisma.media.count({ where }),
    prisma.mediaCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const items = mediaItems.map((item) => {
    const trans = item.translations[0];
    return {
      id: item.id,
      mediaType: item.mediaType,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      embedUrl: item.embedUrl,
      title: trans?.title ?? "",
      caption: trans?.caption ?? "",
      altText: trans?.altText ?? "",
    };
  });

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: locale === "id" ? cat.nameId : cat.nameEn,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        eyebrow={dict.meta.siteTitle}
        title={dict.gallery.pageTitle}
        subtitle={dict.gallery.pageSubtitle}
        imageSrc="/images/hero_gallery.png"
      />

      {/* Gallery Section - Flat Borders */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <GalleryPageClient
            locale={locale}
            items={items}
            categories={categoryOptions}
            currentCategoryId={categoryId ?? null}
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            allLabel={dict.common.all}
          />
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
