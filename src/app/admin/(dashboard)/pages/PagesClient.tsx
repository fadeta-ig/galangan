"use client";

import type { Prisma } from "@prisma/client";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type PageRow = Prisma.PageGetPayload<{
  include: { translations: true };
}>;

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PUBLISHED": return "default";
    case "DRAFT": return "secondary";
    case "ARCHIVED": return "destructive";
    default: return "outline";
  }
}

export default function PagesClient({
  pages,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
  deleteAction,
}: {
  pages: PageRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const router = useRouter();

  const applyFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    router.push(`/admin/pages?${params.toString()}`);
  };

  const columns: Column<PageRow>[] = [
    {
      header: "Title (ID)",
      accessor: (row) => {
        const title = row.translations.find((t) => t.locale === "id")?.title;
        return <span className="font-medium">{title || "-"}</span>;
      },
    },
    {
      header: "Slug (ID)",
      accessor: (row) => {
        const slug = row.translations.find((t) => t.locale === "id")?.slug;
        return <span className="text-sm text-muted-foreground">{slug || "-"}</span>;
      },
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={getStatusVariant(row.status)} className="text-[11px]">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Order",
      accessor: (row) => row.sortOrder,
    },
  ];

  return (
    <DataTable
      title="All Pages"
      data={pages}
      columns={columns}
      createUrl="/admin/pages/new"
      editUrlBase="/admin/pages"
      onDelete={deleteAction}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
        params.set("page", page.toString());
        router.push(`/admin/pages?${params.toString()}`);
      }}
      searchQuery={searchQuery}
      onSearchChange={(q) => applyFilters(q, statusFilter)}
      statusFilter={statusFilter}
      onStatusFilterChange={(s) => applyFilters(searchQuery, s)}
      statusOptions={[
        { label: "Published", value: "PUBLISHED" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
      ]}
    />
  );
}
