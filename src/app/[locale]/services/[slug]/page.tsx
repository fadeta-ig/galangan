import { isValidLocale, type Locale, getLocalizedUrl } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { getSeoMetadata } from "@/lib/seo";
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
  const baseSeo = await getSeoMetadata(
    "service",
    service.serviceId,
    locale as Locale,
    `${service.title} | ${dict.services.pageTitle} | ${dict.meta.siteTitle}`,
    service.shortDescription,
    service.service.coverImage
  );

  const oppLocale = locale === "id" ? "en" : "id";
  const oppTrans = await prisma.serviceTranslation.findFirst({
    where: { serviceId: service.serviceId, locale: oppLocale }
  });

  if (oppTrans) {
    baseSeo.alternates = {
      ...baseSeo.alternates,
      languages: {
        [locale]: getLocalizedUrl(`/services/${service.slug}`, locale as Locale),
        [oppLocale]: getLocalizedUrl(`/services/${oppTrans.slug}`, oppLocale as Locale),
      }
    };
  }

  return baseSeo;
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
          gallery: { include: { media: true } },
          projectServices: { 
            where: { project: { status: 'PUBLISHED' } },
            include: { project: { include: { translations: true } } } 
          },
          relatedServices: { 
            where: { status: 'PUBLISHED' },
            include: { translations: true } 
          }
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

  let processSteps: { title: string; desc: string }[] = [];
  try { processSteps = JSON.parse(trans.processSteps); } catch {}

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        backHref={getLocalizedUrl('/services', locale as Locale)}
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

              {processSteps && processSteps.length > 0 && (
                <div className="mt-16 animate-reveal" style={{ animationDelay: "50ms" }}>
                  <h3 className="text-2xl font-semibold text-navy mb-8">{locale === "id" ? "Proses Kerja" : "Work Process"}</h3>
                  <div className="space-y-6">
                    {processSteps.map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-cyan/10 text-cyan font-bold flex items-center justify-center shrink-0 border border-cyan/20 group-hover:bg-cyan group-hover:text-white transition-colors">
                            {i + 1}
                          </div>
                          {i !== processSteps.length - 1 && <div className="w-px h-full bg-gray-200 mt-4 group-hover:bg-cyan/30 transition-colors" />}
                        </div>
                        <div className="pb-8">
                          <h4 className="text-xl font-semibold text-navy mb-2">{step.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    <Link href={getLocalizedUrl('/contact', locale as Locale)} className="btn-premium w-full justify-center group bg-cyan hover:bg-cyan-dark text-white">
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

                {/* Related Services */}
                {service.relatedServices && service.relatedServices.length > 0 && (
                  <div className="premium-shell">
                    <div className="premium-core p-6 flex flex-col gap-4">
                      <h4 className="font-semibold text-navy">{locale === "id" ? "Layanan Terkait" : "Related Services"}</h4>
                      <div className="flex flex-col gap-3">
                        {service.relatedServices.map((rs) => {
                          const trans = rs.translations.find(t => t.locale === locale) || rs.translations[0];
                          if (!trans) return null;
                          return (
                            <Link key={rs.id} href={`/${locale}/services/${trans.slug}`} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-cyan/30 hover:bg-cyan/5 transition-colors">
                              {rs.coverImage && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                                  <Image src={rs.coverImage} alt={trans.title} fill className="object-cover" sizes="48px" unoptimized={!rs.coverImage.startsWith("/")} />
                                </div>
                              )}
                              <span className="font-medium text-navy text-sm group-hover:text-cyan transition-colors line-clamp-2">{trans.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Projects */}
                {service.projectServices && service.projectServices.length > 0 && (
                  <div className="premium-shell">
                    <div className="premium-core p-6 flex flex-col gap-4">
                      <h4 className="font-semibold text-navy">{locale === "id" ? "Proyek Terkait" : "Related Projects"}</h4>
                      <div className="flex flex-col gap-3">
                        {service.projectServices.map((ps) => {
                          const trans = ps.project.translations.find(t => t.locale === locale) || ps.project.translations[0];
                          if (!trans) return null;
                          return (
                            <Link key={ps.id} href={`/${locale}/experience/${trans.slug}`} className="group flex flex-col gap-2 p-3 rounded-xl border border-gray-100 hover:border-cyan/30 hover:bg-cyan/5 transition-colors">
                              {ps.project.coverImage && (
                                <div className="w-full h-24 rounded-lg overflow-hidden shrink-0 relative">
                                  <Image src={ps.project.coverImage} alt={trans.title} fill className="object-cover" sizes="200px" unoptimized={!ps.project.coverImage.startsWith("/")} />
                                </div>
                              )}
                              <span className="font-medium text-navy text-sm group-hover:text-cyan transition-colors line-clamp-2">{trans.title}</span>
                            </Link>
                          );
                        })}
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
