import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CaretDown, CheckCircle, Question } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";

type ServiceDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  
  const service = await prisma.serviceTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { service: true }
  });

  if (!service) return {};

  const dict = await getDictionary(locale as Locale);
  return {
    title: `${service.title} | ${dict.services.pageTitle} | ${dict.meta.siteTitle}`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  const trans = await prisma.serviceTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { 
      service: {
        include: {
          gallery: { include: { media: true } }
        }
      }
    }
  });

  if (!trans || trans.service.status !== "PUBLISHED") {
    notFound();
  }

  const { service } = trans;

  let benefits: string[] = [];
  try { benefits = JSON.parse(trans.benefits); } catch {}
  
  let faq: { question: string; answer: string }[] = [];
  try { faq = JSON.parse(trans.faq); } catch {}

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        backHref={`/${locale}/services`}
        backLabel={dict.services.pageTitle}
        title={trans.title}
        subtitle={trans.shortDescription}
        imageSrc={service.coverImage}
      />

      {/* Content Section - The Editorial Split */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              <div 
                className="prose-content animate-reveal"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(trans.fullDescription) }}
              />

              {benefits && benefits.length > 0 && (
                <div className="mt-16 animate-reveal" style={{ animationDelay: "100ms" }}>
                  <h3 className="text-2xl font-semibold text-navy mb-8">{dict.services.benefits}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <CheckCircle className="w-6 h-6 text-cyan shrink-0 mt-0.5" weight="fill" />
                        <span className="text-gray-600 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {faq && faq.length > 0 && (
                <div className="mt-16 animate-reveal" style={{ animationDelay: "200ms" }}>
                  <h3 className="text-2xl font-semibold text-navy mb-8">{dict.services.faq}</h3>
                  <div className="flex flex-col gap-4">
                    {faq.map((item, i) => (
                      <details key={i} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-navy hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Question className="w-5 h-5 text-cyan shrink-0" weight="fill" />
                            {item.question}
                          </div>
                          <span className="transition group-open:rotate-180">
                            <CaretDown className="size-5" />
                          </span>
                        </summary>
                        <div className="p-6 pt-0 text-gray-500 leading-relaxed bg-gray-50">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-32 flex flex-col gap-8 animate-reveal" style={{ animationDelay: "300ms" }}>
                
                {/* Contact Widget */}
                <div className="premium-shell">
                  <div className="premium-core p-8 bg-navy text-white border-none">
                    <h4 className="text-xl font-semibold mb-4">{dict.services.needService}</h4>
                    <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                      {locale === "id" 
                        ? "Tim ahli kami siap membantu Anda. Hubungi kami untuk konsultasi teknis atau permintaan penawaran harga."
                        : "Our expert team is ready to assist you. Contact us for technical consultation or a quotation request."}
                    </p>
                    <Link href={`/${locale}/contact`} className="btn-premium w-full justify-center group bg-cyan hover:bg-cyan-dark text-white">
                      <span>{dict.common.contactUs}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                
                {/* Gallery Widget (if any) */}
                {service.gallery && service.gallery.length > 0 && (
                  <div className="premium-shell">
                    <div className="premium-core p-6 flex flex-col gap-4">
                      <h4 className="font-semibold text-navy">{dict.nav.gallery}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {service.gallery.slice(0, 4).map((g) => (
                          <div key={g.id} className="aspect-square rounded-xl overflow-hidden relative">
                            <Image src={g.media.url} alt="Gallery" fill unoptimized={!g.media.url.startsWith("/")} sizes="(max-width: 768px) 50vw, 33vw" className="object-cover hover:scale-110 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
