import { prisma } from "@/lib/prisma";
import HomepageClient from "./HomepageClient";
import { Browser } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Homepage Builder | Admin CMS",
};

export default async function HomepagePage() {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: { where: { locale: "id" }, select: { title: true } } },
    orderBy: { sortOrder: "asc" }
  });

  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: { where: { locale: "id" }, select: { title: true } } },
    orderBy: { sortOrder: "asc" }
  });

  const news = await prisma.newsPost.findMany({
    where: { status: "PUBLISHED" },
    include: { translations: { where: { locale: "id" }, select: { title: true } } },
    orderBy: { publishDate: "desc" }
  });

  const mediaList = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, thumbnailUrl: true, url: true }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapToOption = (items: any[]) => items.map(item => ({
    id: item.id,
    title: item.translations?.[0]?.title || item.filename || "Untitled"
  }));

  const options = {
    services: mapToOption(services),
    projects: mapToOption(projects),
    news: mapToOption(news),
    media: mediaList.map(m => ({ id: m.id, title: m.filename, url: m.thumbnailUrl || m.url })),
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <AdminPageHeader
        title="Homepage Builder"
        description="Configure texts, images, and settings for each section of the homepage."
        icon={<Browser className="size-5" weight="fill" />}
      />
      
      <HomepageClient sections={sections} options={options} />
    </div>
  );
}
