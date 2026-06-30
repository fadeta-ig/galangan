import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.meta.siteTitle,
    description: dict.meta.siteDescription,
    openGraph: {
      siteName: dict.meta.ogSiteName,
      locale: locale === "id" ? "id_ID" : "en_US",
    },
    alternates: {
      languages: {
        id: "/id",
        en: "/en",
      },
    },
  };
}

import { prisma } from "@/lib/prisma";
import Navbar from "@/components/public/layout/Navbar";
import Footer from "@/components/public/layout/Footer";

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);
  
  // Fetch site settings
  const rawSettings = await prisma.siteSetting.findMany();
  const settings = rawSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  // Fetch published services for Navbar dropdown
  const servicesData = await prisma.service.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { sortOrder: 'asc' },
    include: {
      translations: {
        where: { locale: locale as Locale },
        select: { title: true, slug: true }
      }
    }
  });

  const navbarServices = servicesData.map(s => {
    const trans = s.translations[0] || {};
    return {
      id: s.id,
      title: trans.title || '',
      slug: trans.slug || s.id
    };
  });

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": dict.meta.siteTitle,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://galangan.com",
    "logo": settings['site_logo'] || "",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings['company_phone'] || "",
      "contactType": "customer service"
    }
  };

  return (
    <div data-locale={locale} className="min-h-screen flex flex-col bg-gray-50 text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Navbar locale={locale} dict={dict} services={navbarServices} settings={settings} />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer locale={locale} dict={dict} settings={settings} />
    </div>
  );
}
