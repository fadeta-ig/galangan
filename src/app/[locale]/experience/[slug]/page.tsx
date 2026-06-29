import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, CalendarBlank, Tag, Buildings, Anchor } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";

type ExperienceDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  
  const project = await prisma.projectTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { project: true }
  });

  if (!project) return {};

  const seoMeta = await prisma.seoMeta.findUnique({
    where: { entityType_entityId_locale: { entityType: "project", entityId: project.projectId, locale: locale as Locale } }
  });

  const dict = await getDictionary(locale as Locale);
  return {
    title: seoMeta?.metaTitle || `${project.title} | ${dict.experience.pageTitle} | ${dict.meta.siteTitle}`,
    description: seoMeta?.metaDescription || project.shortDescription,
    openGraph: {
      title: seoMeta?.ogTitle || project.title,
      description: seoMeta?.ogDescription || project.shortDescription,
      images: seoMeta?.ogImage ? [{ url: seoMeta.ogImage }] : undefined,
    },
    alternates: {
      canonical: seoMeta?.canonicalUrl || undefined
    }
  };
}

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  const trans = await prisma.projectTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { 
      project: {
        include: {
          gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
          category: {
            include: { translations: { where: { locale: locale as Locale } } }
          },
          projectServices: { include: { service: { include: { translations: true } } } }
        }
      }
    }
  });

  if (!trans || trans.project.status !== "PUBLISHED") {
    notFound();
  }

  const { project } = trans;
  const categoryName = project.category?.translations[0]?.name;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        backHref={`/${locale}/experience`}
        backLabel={dict.experience.pageTitle}
        title={trans.title}
        subtitle={trans.shortDescription}
        imageSrc={project.coverImage}
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

              {trans.scopeSummary && (
                <div className="mt-16 animate-reveal" style={{ animationDelay: "100ms" }}>
                  <h3 className="text-2xl font-semibold text-navy mb-8">Scope Summary</h3>
                  <div 
                    className="prose-content p-8 bg-gray-50 border border-gray-100 rounded-3xl"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(trans.scopeSummary) }}
                  />
                </div>
              )}

              {/* Gallery Grid */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-16 animate-reveal" style={{ animationDelay: "200ms" }}>
                  <h3 className="text-2xl font-semibold text-navy mb-8">{dict.nav.gallery}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.gallery.map((item) => (
                      <div key={item.id} className="aspect-[4/3] rounded-2xl overflow-hidden relative group">
                        <Image 
                          src={item.media.url} 
                          alt="Gallery item" 
                          fill
                          unoptimized={!item.media.url.startsWith("/")}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {item.isBefore && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-semibold uppercase rounded-full">
                            Before
                          </div>
                        )}
                        {!item.isBefore && item.media.originalName && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-cyan/90 backdrop-blur-md text-white text-xs font-semibold uppercase rounded-full">
                            After
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Project Metadata) */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-32 flex flex-col gap-8 animate-reveal" style={{ animationDelay: "300ms" }}>
                
                {/* Meta Widget */}
                <div className="premium-shell">
                  <div className="premium-core p-8 bg-white flex flex-col gap-6">
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-cyan mb-2">Project Details</h4>
                    
                    {project.showClientName && project.clientName && (
                      <div className="flex items-start gap-4">
                        <Buildings className="w-6 h-6 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">{dict.experience.client}</div>
                          <div className="text-navy font-semibold">{project.clientName}</div>
                        </div>
                      </div>
                    )}
                    
                    {project.vesselType && (
                      <div className="flex items-start gap-4">
                        <Anchor className="w-6 h-6 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">{dict.experience.vesselType}</div>
                          <div className="text-navy font-semibold">{project.vesselType}</div>
                        </div>
                      </div>
                    )}
                    
                    {project.projectYear && (
                      <div className="flex items-start gap-4">
                        <CalendarBlank className="w-6 h-6 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">{dict.experience.year}</div>
                          <div className="text-navy font-semibold">{project.projectYear}</div>
                        </div>
                      </div>
                    )}

                    {project.location && (
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">{dict.experience.location}</div>
                          <div className="text-navy font-semibold">{project.location}</div>
                        </div>
                      </div>
                    )}

                    {categoryName && (
                      <div className="flex items-start gap-4">
                        <Tag className="w-6 h-6 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">Category</div>
                          <div className="text-navy font-semibold">{categoryName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Services */}
                {project.projectServices && project.projectServices.length > 0 && (
                  <div className="premium-shell">
                    <div className="premium-core p-6 flex flex-col gap-4">
                      <h4 className="font-semibold text-navy">{locale === "id" ? "Layanan Terkait" : "Related Services"}</h4>
                      <div className="flex flex-col gap-3">
                        {project.projectServices.map((ps) => {
                          const trans = ps.service.translations.find(t => t.locale === locale) || ps.service.translations[0];
                          if (!trans) return null;
                          return (
                            <Link key={ps.id} href={`/${locale}/services/${trans.slug}`} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-cyan/30 hover:bg-cyan/5 transition-colors">
                              {ps.service.coverImage && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                                  <Image src={ps.service.coverImage} alt={trans.title} fill className="object-cover" sizes="48px" unoptimized={!ps.service.coverImage.startsWith("/")} />
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

                <div className="premium-shell">
                  <div className="premium-core p-8 bg-navy text-white border-none text-center">
                    <h4 className="text-xl font-semibold mb-4">Mulai Proyek Anda</h4>
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                      Hubungi kami untuk mendiskusikan kebutuhan galangan kapal Anda.
                    </p>
                    <Link href={`/${locale}/contact`} className="btn-premium w-full justify-center group bg-cyan hover:bg-cyan-dark text-white">
                      <span>{dict.common.contactUs}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
