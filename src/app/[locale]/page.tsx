import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import HeroSection from "@/components/public/sections/HeroSection";
import StatsSection from "@/components/public/sections/StatsSection";
import ServicesSection from "@/components/public/sections/ServicesSection";
import ExperienceSection from "@/components/public/sections/ExperienceSection";
import NewsSection from "@/components/public/sections/NewsSection";
import BargeBannerSection from "@/components/public/sections/BargeBannerSection";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  // Fetch Homepage Configs
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  const getSection = (type: string) => sections.find(s => s.sectionType === type);

  // Fetch Stats
  const stats = await prisma.statistic.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // Fetch 3 Featured Services
  const services = await prisma.service.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    take: 6,
    include: {
      translations: {
        where: { locale: locale as Locale }
      }
    }
  });

  // Fetch 4 Featured Projects
  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { projectYear: 'desc' }],
    take: 4,
    include: {
      translations: {
        where: { locale: locale as Locale }
      }
    }
  });

  // Fetch Latest 3 News
  const news = await prisma.newsPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishDate: 'desc' },
    take: 3,
    include: {
      translations: {
        where: { locale: locale as Locale }
      }
    }
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection 
        locale={locale} 
        dict={dict} 
        data={getSection("hero")} 
      />
      
      <StatsSection 
        locale={locale} 
        dict={dict} 
        stats={stats} 
        data={getSection("statistics")} 
      />
      
      <ServicesSection 
        locale={locale} 
        dict={dict} 
        services={services} 
        data={getSection("services")} 
      />
      
      <NewsSection 
        locale={locale} 
        dict={dict} 
        news={news} 
        data={getSection("news")} 
      />

      <BargeBannerSection />
      
      <ExperienceSection 
        locale={locale} 
        dict={dict} 
        projects={projects} 
        data={getSection("experience")} 
      />
    </div>
  );
}
