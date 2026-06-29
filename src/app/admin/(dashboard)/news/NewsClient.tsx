"use client";

import type { Prisma } from "@prisma/client";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type NewsRow = Prisma.NewsPostGetPayload<{
  include: {
    translations: true;
    author: true;
  };
}>;

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PUBLISHED": return "default";
    case "DRAFT": return "secondary";
    case "ARCHIVED": return "destructive";
    default: return "outline";
  }
}

export default function NewsClient({
  news,
  totalCount,
  currentPage,
  pageSize,
  deleteAction,
}: {
  news: NewsRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  deleteAction: (id: string) => Promise<void>;
}) {
  const router = useRouter();

  const columns: Column<NewsRow>[] = [
    {
      header: "Title (ID)",
      accessor: (row) => {
        const titleId = row.translations.find((t) => t.locale === "id")?.title;
        return <span className="font-medium">{titleId || "-"}</span>;
      },
    },
    {
      header: "Author",
      accessor: (row) => row.author?.name || "-",
    },
    {
      header: "Publish Date",
      accessor: (row) => (
        <span className="tabular-nums">{new Date(row.publishDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={getStatusVariant(row.status)} className="text-[11px]">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="All News"
      data={news}
      columns={columns}
      createUrl="/admin/news/new"
      editUrlBase="/admin/news"
      onDelete={deleteAction}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => router.push(`/admin/news?page=${page}`)}
    />
  );
}
