import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import Link from "next/link";
import { ArrowRight, CalendarBlank, UserCircle, Tag } from "@phosphor-icons/react/dist/ssr";
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

  const dict = await getDictionary(locale as Locale);
  return {
    title: `${post.title} | ${dict.news.pageTitle} | ${dict.meta.siteTitle}`,
    description: post.excerpt,
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
          
          {/* Share or Back Button */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center animate-reveal" style={{ animationDelay: "200ms" }}>
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
