import { isValidLocale, type Locale, getLocalizedUrl } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeoMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";
import SearchFilter from "@/components/public/ui/SearchFilter";
import Pagination from "@/components/public/ui/Pagination";

type NewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const page = await prisma.page.findFirst({
    where: {
      status: "PUBLISHED",
      translations: { some: { slug: locale === "id" ? "berita" : "news", locale: locale as Locale } }
    }
  });

  return getSeoMetadata(
    "page",
    page ? page.id : "news",
    locale as Locale,
    `${dict.news.pageTitle} | ${dict.meta.siteTitle}`,
    dict.news.pageSubtitle,
    "/images/hero_news.png"
  );
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
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

  const total = await prisma.newsPost.count({ where });
  const totalPages = Math.ceil(total / limit);

  const posts = await prisma.newsPost.findMany({
    where,
    orderBy: { publishDate: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      translations: {
        where: { locale: locale as Locale }
      },
      category: {
        include: { translations: { where: { locale: locale as Locale } } }
      },
      tags: {
        include: { tag: { include: { translations: { where: { locale: locale as Locale } } } } }
      }
    }
  });

  const categories = await prisma.newsCategory.findMany({
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
        title={dict.news.pageTitle}
        subtitle={dict.news.pageSubtitle}
        imageSrc="/images/hero_news.png"
      />

      {/* News Grid - Flat Borders */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <SearchFilter 
            placeholder={dict.common?.search || "Search news..."} 
            categories={categoryOptions} 
            allLabel={dict.common?.all || "All Categories"} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((item, i) => {
              const trans = item.translations[0];
              if (!trans) return null;
              
              const date = new Date(item.publishDate).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                day: "numeric",
                month: "long",
                year: "numeric"
              });

              return (
                <Link 
                  key={item.id} 
                  href={`/${locale}/news/${trans.slug}`}
                  className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden animate-reveal transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#0A2463]/30 hover:shadow-[0_18px_36px_rgba(10,36,99,0.08)]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-56 overflow-hidden relative border-b border-slate-100">
                    {item.featuredImage ? (
                      <Image 
                        src={item.featuredImage} 
                        alt={trans.title}
                        fill
                        className="object-cover img-zoom"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <CalendarBlank className="size-3.5" weight="bold" />
                        {date}
                      </div>
                      {item.category?.translations[0]?.name && (
                        <div className="text-[11px] font-semibold text-cyan uppercase tracking-wider px-2 py-0.5 bg-cyan/10 rounded-full">
                          {item.category.translations[0].name}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-[18px] font-semibold text-[#0A2463] mb-3 line-clamp-2 transition-colors duration-200 group-hover:text-[#0D2F7A]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                      {trans.title}
                    </h3>
                    
                    <p className="text-slate-600 text-[14px] leading-relaxed mb-6 line-clamp-3 flex-grow" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                      {trans.excerpt || trans.content?.replace(/<[^>]+>/g, '').substring(0, 120) + "..."}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#0A2463]">
                        {dict.common?.readMore || "Read More"}
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                      </span>
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-[11px] text-slate-400 font-medium line-clamp-1 max-w-[50%]">
                          {item.tags.map(t => t.tag.translations[0]?.name).filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={getLocalizedUrl('/news', locale as Locale)} />
          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
