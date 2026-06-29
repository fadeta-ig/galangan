import { prisma } from "@/lib/prisma";
import MediaClient from "./MediaClient";
import { FolderOpen } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Media Library | Admin CMS",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string }>;
}) {
  const { page, categoryId } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 24;

  const where = categoryId ? { categoryId } : {};

  const [mediaList, totalCount, categories] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.media.count({ where }),
    prisma.mediaCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <AdminPageHeader
        title="Media Library"
        description="Manage images and documents across the website."
        icon={<FolderOpen className="size-5" weight="fill" />}
      />
      
      <MediaClient 
        initialMedia={mediaList} 
        categories={categories} 
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
