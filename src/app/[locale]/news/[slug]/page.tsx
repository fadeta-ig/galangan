import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import Link from "next/link";
import { ArrowRight, CalendarBlank, UserCircle, Tag } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";

type NewsDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  
  const post = await prisma.newsPostTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { post: true }
  });

  if (!post) return {};

  const seoMeta = await prisma.seoMeta.findUnique({
    where: { entityType_entityId_locale: { entityType: "news", entityId: post.postId, locale: locale as Locale } }
  });

  const dict = await getDictionary(locale as Locale);
  return {
    title: seoMeta?.metaTitle || `${post.title} | ${dict.news.pageTitle} | ${dict.meta.siteTitle}`,
    description: seoMeta?.metaDescription || post.excerpt,
    openGraph: {
      title: seoMeta?.ogTitle || post.title,
      description: seoMeta?.ogDescription || post.excerpt,
      images: seoMeta?.ogImage ? [{ url: seoMeta.ogImage }] : undefined,
    },
    alternates: {
      canonical: seoMeta?.canonicalUrl || undefined
    }
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  const trans = await prisma.newsPostTranslation.findFirst({
    where: { slug, locale: locale as Locale },
    include: { 
      post: {
        include: {
          author: true,
          category: {
            include: { translations: { where: { locale: locale as Locale } } }
          },
          tags: {
            include: { tag: { include: { translations: { where: { locale: locale as Locale } } } } }
          },
          relatedPosts: {
            where: { status: 'PUBLISHED' },
            include: { translations: { where: { locale: locale as Locale } } }
          }
        }
      }
    }
  });

  if (!trans || trans.post.status !== "PUBLISHED") {
    notFound();
  }

  const { post } = trans;
  const categoryName = post.category?.translations[0]?.name;
  
  const date = new Date(post.publishDate).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        backHref={`/${locale}/news`}
        backLabel={dict.news.pageTitle}
        title={trans.title}
        imageSrc={post.featuredImage}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-blue-100/90">
          <div className="flex items-center gap-2">
            <CalendarBlank className="w-5 h-5 text-[#9EEFFC]" />
            {date}
          </div>
          {post.author && (
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#9EEFFC]" />
              {post.author.name}
            </div>
          )}
          {categoryName && (
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#9EEFFC]" />
              {categoryName}
            </div>
          )}
        </div>
      </PageHero>

      {/* Article Content */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-3xl">
          <article 
            className="prose-content animate-reveal"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(trans.content) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 animate-reveal" style={{ animationDelay: "100ms" }}>
              <span className="text-sm font-semibold text-slate-500 mr-2 flex items-center gap-1"><Tag size={16}/> Tags:</span>
              {post.tags.map(t => {
                const name = t.tag.translations[0]?.name;
                if (!name) return null;
                return (
                  <span key={t.id} className="text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {name}
                  </span>
                );
              })}
            </div>
          )}
          
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-16 animate-reveal" style={{ animationDelay: "200ms" }}>
              <h3 className="text-2xl font-bold text-navy mb-6">{locale === "id" ? "Artikel Terkait" : "Related Articles"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {post.relatedPosts.map(rp => {
                  const rTrans = rp.translations[0];
                  if (!rTrans) return null;
                  return (
                    <Link key={rp.id} href={`/${locale}/news/${rTrans.slug}`} className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-cyan/30 hover:bg-cyan/5 transition-all">
                      {rp.featuredImage && (
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative">
                          <Image src={rp.featuredImage} alt={rTrans.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="80px" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-navy text-sm mb-2 line-clamp-2 group-hover:text-cyan transition-colors">{rTrans.title}</h4>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan/70 flex items-center gap-1">
                          {dict.common.readMore || "Read More"} <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share or Back Button */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center animate-reveal" style={{ animationDelay: "300ms" }}>
            <Link href={`/${locale}/news`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-cyan transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              {dict.common.back}
            </Link>
          </div>
        </div>
      </section>

      <CTASection locale={locale} dict={dict} />
    </div>
  );
}
