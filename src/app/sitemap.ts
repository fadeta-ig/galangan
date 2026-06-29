import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locales = ["id", "en"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static Pages
  const staticPages = ["", "/about", "/services", "/experience", "/news", "/gallery", "/contact"];

  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  // Dynamic Services
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: true },
  });

  services.forEach((service) => {
    service.translations.forEach((t) => {
      sitemapEntries.push({
        url: `${baseUrl}/${t.locale}/services/${t.slug}`,
        lastModified: service.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  // Dynamic Projects
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: true },
  });

  projects.forEach((project) => {
    project.translations.forEach((t) => {
      sitemapEntries.push({
        url: `${baseUrl}/${t.locale}/experience/${t.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  // Dynamic News
  const news = await prisma.newsPost.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: true },
  });

  news.forEach((post) => {
    post.translations.forEach((t) => {
      sitemapEntries.push({
        url: `${baseUrl}/${t.locale}/news/${t.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  });

  // Dynamic Pages
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: true },
  });

  pages.forEach((page) => {
    page.translations.forEach((t) => {
      sitemapEntries.push({
        url: `${baseUrl}/${t.locale}/pages/${t.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    });
  });

  return sitemapEntries;
}
