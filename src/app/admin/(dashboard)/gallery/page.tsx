import { prisma } from "@/lib/prisma";
import { deleteGalleryItem } from "./actions";
import GalleryClient from "./GalleryClient";
import { Images } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Gallery | Admin CMS",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string }>;
}) {
  const { page, categoryId } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 12;

  const where = categoryId ? { categoryId } : {};

  const [items, totalCount] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        translations: true,
        category: true,
      },
    }),
    prisma.media.count({ where }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <AdminPageHeader
        title="Gallery"
        description="Curate public gallery photos and video embeds."
        icon={<Images className="size-5" weight="fill" />}
      />

      <GalleryClient
        items={items}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        deleteAction={deleteGalleryItem}
      />
    </div>
  );
}
