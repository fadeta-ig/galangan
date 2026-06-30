import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { getSeoMetadata } from "@/lib/seo";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type DynamicPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: DynamicPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const page = await prisma.page.findFirst({
    where: { status: "PUBLISHED", translations: { some: { slug, locale: locale as Locale } } },
    include: { translations: { where: { locale: locale as Locale } } },
  });

  if (!page || !page.translations[0]) return {};

  const translation = page.translations[0];
  
  const dict = await getDictionary(locale as Locale);
  return getSeoMetadata(
    "page",
    page.id,
    locale as Locale,
    `${translation.title} | ${dict.meta.siteTitle}`,
    translation.content.replace(/<[^>]+>/g, "").substring(0, 160),
    page.heroImage
  );
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
        <div className="container mx-auto px-6 max-w-4xl">
          {translation.content && (
            <article
              className="prose-content animate-reveal mb-16"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(translation.content) }}
            />
          )}

          <div className="space-y-16">
            {page.sections.map((section) => {
              const content = locale === "id" ? section.contentId : section.contentEn;
              const config = section.config ? JSON.parse(section.config) : {};

              switch (section.sectionType) {
                case "text":
                  return (
                    <div
                      key={section.id}
                      className="prose-content animate-reveal"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
                    />
                  );
                case "image":
                  return config.url ? (
                    <div key={section.id} className="relative aspect-video w-full overflow-hidden rounded-2xl animate-reveal">
                      <Image src={config.url} alt="Section Image" fill className="object-cover" />
                    </div>
                  ) : null;
                case "gallery":
                  if (!config.images || config.images.length === 0) return null;
                  return (
                    <div key={section.id} className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-reveal">
                      {config.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square overflow-hidden rounded-xl">
                          <Image src={img} alt={`Gallery Image ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  );
                case "cta":
                  const btnLabel = config[`btnLabel_${locale}`];
                  const btnUrl = config[`btnUrl_${locale}`];
                  return (
                    <div key={section.id} className="bg-[#0A2463] text-white p-10 md:p-16 rounded-3xl animate-reveal text-center">
                      <h3 className="text-2xl md:text-3xl font-semibold mb-8 font-outfit">{content}</h3>
                      {btnLabel && btnUrl && (
                        <Link href={btnUrl} className="inline-flex items-center gap-2 bg-[#007C91] hover:bg-[#005e6e] transition-colors px-8 py-4 rounded-full font-semibold tracking-wide">
                          {btnLabel}
                          <ArrowRight size={20} weight="bold" />
                        </Link>
                      )}
                    </div>
                  );
                case "custom":
                  return (
                    <div key={section.id} className="w-full animate-reveal" dangerouslySetInnerHTML={{ __html: content }} />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
