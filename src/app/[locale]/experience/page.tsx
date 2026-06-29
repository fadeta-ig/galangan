import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Anchor } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";
import SearchFilter from "@/components/public/ui/SearchFilter";
import Pagination from "@/components/public/ui/Pagination";

type ExperiencePageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.experience.pageTitle} | ${dict.meta.siteTitle}`,
    description: dict.experience.pageSubtitle,
  };
}

export default async function ExperiencePage({ params, searchParams }: ExperiencePageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const sp = (await searchParams) || {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const categoryId = typeof sp.category === "string" ? sp.category : undefined;
  const page = parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1;
  const limit = 9;

  const where = {
    status: "PUBLISHED" as const,
    ...(categoryId ? { categoryId } : {}),
    ...(q ? {
      translations: {
        some: {
          locale: locale as Locale,
          title: { contains: q }
        }
      }
    } : {})
  };

  const total = await prisma.project.count({ where });
  const totalPages = Math.ceil(total / limit);

  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { projectYear: "desc" }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      translations: {
        where: { locale: locale as Locale }
      }
    }
  });

  const categories = await prisma.projectCategory.findMany({
    where: { isActive: true },
    include: { translations: { where: { locale: locale as Locale } } }
  });

  const categoryOptions = categories.map(c => ({
    id: c.id,
    name: c.translations[0]?.name || "Unknown"
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        eyebrow={dict.meta.siteTitle}
        title={dict.experience.pageTitle}
        subtitle={dict.experience.pageSubtitle}
        imageSrc="/images/hero_experience_1.png"
      />

      {/* Projects Grid (Bento) - Flat Borders */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <SearchFilter 
            placeholder={dict.common?.search || "Search projects..."} 
            categories={categoryOptions} 
            allLabel={dict.common?.all || "All Categories"} 
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {projects.map((project, i) => {
              const trans = project.translations[0];
              if (!trans) return null;

              // Make every 3rd item large (Bento box effect)
              const isLarge = i % 3 === 0;
              const gridClass = isLarge ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4";

              return (
                <div 
                  key={project.id} 
                  className={`group relative overflow-hidden rounded-xl bg-white border border-slate-200 ${gridClass} h-[400px] md:h-[500px] animate-reveal transition-colors duration-300 hover:border-[#0A2463]/40`}
                  style={{ animationDelay: `${(i % 3) * 100}ms` }}
                >
                  {project.coverImage ? (
                    <Image 
                      src={project.coverImage} 
                      alt={trans.title}
                      fill
                      className="object-cover img-zoom"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                      <Anchor className="w-16 h-16 text-slate-200" weight="fill" />
                    </div>
                  )}

                  {/* Solid dark overlay for text contrast instead of gradient */}
                  <div className="absolute inset-0 z-10 bg-[#0A2463]/70 group-hover:bg-[#0A2463]/80 transition-colors duration-500" />
                  
                  <div className="absolute inset-0 z-20 p-8 md:p-10 flex flex-col justify-end">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {project.vesselType && (
                          <span className="px-3 py-1 bg-white/10 rounded-md text-[10px] font-semibold text-white uppercase tracking-widest border border-white/20">
                            {project.vesselType}
                          </span>
                        )}
                        {project.projectYear && (
                          <span className="px-3 py-1 bg-white/10 rounded-md text-[10px] font-semibold text-white border border-white/20">
                            {project.projectYear}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                        {trans.title}
                      </h3>
                      
                      <p className="text-blue-100/90 text-sm md:text-[15px] line-clamp-2 mb-6 max-w-xl leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                        {trans.shortDescription}
                      </p>
                      
                      <Link 
                        href={`/${locale}/experience/${trans.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-[#0A2463] font-semibold text-[11px] uppercase tracking-wider hover:bg-[#007C91] hover:text-white transition-colors"
                      >
                        {dict.common.readMore}
                        <ArrowRight className="size-3.5" weight="bold" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/${locale}/experience`} />
          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
