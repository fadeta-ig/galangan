import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeoMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Anchor, ShieldCheck, Wrench, PaintBrush, MagnifyingGlass, Nut } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";
import SearchFilter from "@/components/public/ui/SearchFilter";
import Pagination from "@/components/public/ui/Pagination";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return getSeoMetadata(
    "page",
    "services",
    locale as Locale,
    `${dict.services.pageTitle} | ${dict.meta.siteTitle}`,
    dict.services.pageSubtitle,
    "/images/hero_services.png"
  );
}

const getIcon = (slug: string) => {
  if (slug.includes("repair")) return <Anchor weight="fill" className="size-6 text-[#0A2463]" />;
  if (slug.includes("build")) return <Wrench weight="fill" className="size-6 text-[#0A2463]" />;
  if (slug.includes("dock")) return <ShieldCheck weight="fill" className="size-6 text-[#0A2463]" />;
  if (slug.includes("paint")) return <PaintBrush weight="fill" className="size-6 text-[#0A2463]" />;
  if (slug.includes("inspect")) return <MagnifyingGlass weight="fill" className="size-6 text-[#0A2463]" />;
  return <Nut weight="fill" className="size-6 text-[#0A2463]" />;
};

export default async function ServicesPage({ params, searchParams }: ServicesPageProps) {
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

  const total = await prisma.service.count({ where });
  const totalPages = Math.ceil(total / limit);

  const services = await prisma.service.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      translations: {
        where: { locale: locale as Locale }
      }
    }
  });

  const categories = await prisma.serviceCategory.findMany({
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
        title={dict.services.pageTitle}
        subtitle={dict.services.pageSubtitle}
        imageSrc="/images/hero_services.png"
      />

      {/* Services Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <SearchFilter 
            placeholder={dict.common?.search || "Search services..."} 
            categories={categoryOptions} 
            allLabel={dict.common?.all || "All Categories"} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const trans = service.translations[0];
              if (!trans) return null;

              return (
                <div 
                  key={service.id} 
                  className="group animate-reveal flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#0A2463]/30 hover:shadow-[0_18px_36px_rgba(10,36,99,0.08)]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {service.coverImage ? (
                    <div className="h-52 overflow-hidden relative border-b border-slate-100">
                      <Image 
                        src={service.coverImage} 
                        alt={trans.title}
                        fill
                        className="object-cover img-zoom"
                      />
                    </div>
                  ) : (
                    <div className="h-52 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <div className="w-16 h-16 rounded-lg bg-[#EBF5FB] flex items-center justify-center">
                        {getIcon(trans.slug)}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-7 flex flex-col flex-grow relative">
                    {service.coverImage && (
                      <div className="absolute -top-7 right-7 w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center z-20">
                        {getIcon(trans.slug)}
                      </div>
                    )}
                    
                    <h3 className="text-[18px] font-semibold text-[#0A2463] mb-3 line-clamp-2 pr-10" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                      {trans.title}
                    </h3>
                    
                    <p className="text-slate-600 text-[14px] leading-relaxed mb-8 flex-grow line-clamp-3" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                      {trans.shortDescription}
                    </p>
                    
                    <Link 
                      href={`/${locale}/services/${trans.slug}`}
                      className="group/btn inline-flex items-center gap-2 self-start rounded-md bg-[#0A2463] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#0D2F7A]"
                    >
                      {dict.common?.readMore || "Info Detail"}
                      <ArrowRight className="size-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" weight="bold" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/${locale}/services`} />
          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
