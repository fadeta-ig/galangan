"use client";

import type { Prisma } from "@prisma/client";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

type GalleryRow = Prisma.MediaGetPayload<{
  include: {
    translations: true;
    category: true;
  };
}>;

export default function GalleryClient({
  items,
  totalCount,
  currentPage,
  pageSize,
  deleteAction,
}: {
  items: GalleryRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  deleteAction: (id: string) => Promise<void>;
}) {
  const router = useRouter();

  const columns: Column<GalleryRow>[] = [
    {
      header: "Preview",
      accessor: (row) => (
        <div className="relative flex h-12 w-16 items-center justify-center overflow-hidden rounded bg-muted">
          {row.mediaType === "video" ? (
            <PlayCircle className="h-8 w-8 text-primary/40" weight="fill" />
          ) : row.thumbnailUrl || row.url ? (
            <Image
              src={row.thumbnailUrl || row.url}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Title (ID)",
      accessor: (row) => {
        const title = row.translations.find((t) => t.locale === "id")?.title;
        return <span className="font-medium">{title || "-"}</span>;
      },
    },
    {
      header: "Type",
      accessor: (row) => (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {row.mediaType}
        </Badge>
      ),
    },
    {
      header: "Category",
      accessor: (row) => row.category?.nameEn || "-",
    },
    {
      header: "Featured",
      accessor: (row) => (
        row.isFeatured ? (
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
            Yes
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        )
      ),
    },
    {
      header: "Order",
      accessor: (row) => row.sortOrder,
    },
  ];

  return (
    <DataTable
      title="Gallery Items"
      data={items}
      columns={columns}
      createUrl="/admin/gallery/new"
      editUrlBase="/admin/gallery"
      onDelete={deleteAction}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => router.push(`/admin/gallery?page=${page}`)}
    />
  );
}
