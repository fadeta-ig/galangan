import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

  const getSectionConfig = (type: string) => {
    const sec = getSection(type);
    try {
      return sec ? JSON.parse(sec.config || "{}") : {};
    } catch {
      return {};
    }
  };

  // Fetch Stats
  const stats = await prisma.statistic.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // --- Services ---
  const srvConf = getSectionConfig("services");
  const srvSelection = srvConf.contentSelection || "featured";
  const srvQuery: Prisma.ServiceFindManyArgs = {
    where: { status: 'PUBLISHED' },
    include: { translations: { where: { locale: locale as Locale } } },
    take: 6,
  };
  if (srvSelection === "manual" && srvConf.selectedIds?.length) {
    srvQuery.where = { ...srvQuery.where, id: { in: srvConf.selectedIds } };
    srvQuery.take = undefined;
  } else if (srvSelection === "latest") {
    srvQuery.orderBy = { createdAt: 'desc' };
  } else {
    srvQuery.orderBy = [{ isFeatured: 'desc' }, { sortOrder: 'asc' }];
  }
  const servicesData = await prisma.service.findMany(srvQuery);
  const services = srvSelection === "manual" && srvConf.selectedIds?.length
    ? srvConf.selectedIds.map((id: string) => servicesData.find(s => s.id === id)).filter(Boolean) as typeof servicesData
    : servicesData;

  // --- Projects ---
  const expConf = getSectionConfig("experience");
  const expSelection = expConf.contentSelection || "featured";
  const projQuery: Prisma.ProjectFindManyArgs = {
    where: { status: 'PUBLISHED' },
    include: { translations: { where: { locale: locale as Locale } } },
    take: 4,
  };
  if (expSelection === "manual" && expConf.selectedIds?.length) {
    projQuery.where = { ...projQuery.where, id: { in: expConf.selectedIds } };
    projQuery.take = undefined;
  } else if (expSelection === "latest") {
    projQuery.orderBy = { createdAt: 'desc' };
  } else {
    projQuery.orderBy = [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { projectYear: 'desc' }];
  }
  const projectsData = await prisma.project.findMany(projQuery);
  const projects = expSelection === "manual" && expConf.selectedIds?.length
    ? expConf.selectedIds.map((id: string) => projectsData.find(p => p.id === id)).filter(Boolean) as typeof projectsData
    : projectsData;

  // --- News ---
  const newsConf = getSectionConfig("news");
  const newsSelection = newsConf.contentSelection || "latest";
  const newsQuery: Prisma.NewsPostFindManyArgs = {
    where: { status: 'PUBLISHED' },
    include: { translations: { where: { locale: locale as Locale } } },
    take: 3,
  };
  if (newsSelection === "manual" && newsConf.selectedIds?.length) {
    newsQuery.where = { ...newsQuery.where, id: { in: newsConf.selectedIds } };
    newsQuery.take = undefined;
  } else if (newsSelection === "featured") {
    newsQuery.orderBy = [{ isFeatured: 'desc' }, { publishDate: 'desc' }];
  } else {
    newsQuery.orderBy = { publishDate: 'desc' };
  }
  const newsData = await prisma.newsPost.findMany(newsQuery);
  const news = newsSelection === "manual" && newsConf.selectedIds?.length
    ? newsConf.selectedIds.map((id: string) => newsData.find(n => n.id === id)).filter(Boolean) as typeof newsData
    : newsData;

  // --- Experience Media ---
  const expMediaIds = expConf.selectedMediaIds || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let experienceMedia: any[] = [];
  if (expMediaIds.length > 0) {
    const mediaData = await prisma.media.findMany({
      where: { id: { in: expMediaIds } }
    });
    // Preserve manual sort order
    experienceMedia = expMediaIds.map((id: string) => mediaData.find(m => m.id === id)).filter(Boolean);
  }

  // Prepare configs to pass down
  const getSectionWithConfig = (type: string) => {
    const s = getSection(type);
    if (!s) return undefined;
    const baseConfig = getSectionConfig(type);
    return { 
      ...s, 
      configObj: type === "experience" ? { ...baseConfig, experienceMedia } : baseConfig 
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      {sections.map((section) => {
        const type = section.sectionType;
        const data = getSectionWithConfig(type);

        switch (type) {
          case "hero":
            return <HeroSection key={type} locale={locale} dict={dict} data={data} />;
          case "statistics":
            return <StatsSection key={type} locale={locale} dict={dict} stats={stats} data={data} />;
          case "services":
            return <ServicesSection key={type} locale={locale} dict={dict} services={services} data={data} />;
          case "news":
            return <NewsSection key={type} locale={locale} dict={dict} news={news} data={data} />;
          case "experience":
            return <ExperienceSection key={type} locale={locale} dict={dict} projects={projects} data={data} />;
          case "project_banner":
          case "barge_banner":
            return <BargeBannerSection key={type} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
