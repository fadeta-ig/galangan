import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";

type DynamicPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: DynamicPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const translation = await prisma.pageTranslation.findFirst({
    where: { slug, locale: locale as Locale, page: { status: "PUBLISHED" } },
  });

  if (!translation) return {};

  const dict = await getDictionary(locale as Locale);
  return {
    title: `${translation.title} | ${dict.meta.siteTitle}`,
    description: translation.content.replace(/<[^>]+>/g, "").substring(0, 160),
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  const page = await prisma.page.findFirst({
    where: {
      status: "PUBLISHED",
      translations: { some: { slug, locale: locale as Locale } },
    },
    include: {
      translations: { where: { locale: locale as Locale } },
      sections: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!page) notFound();

  const translation = page.translations[0];
  if (!translation) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-off-white pb-0">
      <PageHero
        title={translation.title}
        imageSrc={page.heroImage}
        compact
      />

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <article
            className="prose-content animate-reveal"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(translation.content) }}
          />

          {page.sections.map((section) => (
            <div key={section.id} className="mt-12 animate-reveal">
              {section.sectionType === "text" && (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(
                      locale === "id" ? section.contentId : section.contentEn
                    ),
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
