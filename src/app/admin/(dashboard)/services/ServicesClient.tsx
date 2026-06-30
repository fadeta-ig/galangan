"use client";

import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PUBLISHED": return "default";
    case "DRAFT": return "secondary";
    case "ARCHIVED": return "destructive";
    default: return "outline";
  }
}

export default function ServicesClient({
  services,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
  deleteAction,
}: {
  services: Record<string, unknown>[];
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
    router.push(`/admin/services?${params.toString()}`);
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      header: "Title (ID)",
      accessor: (row) => {
        const translations = row.translations as Array<{ locale: string; title: string }>;
        const titleId = translations?.find((t) => t.locale === "id")?.title;
        return <span className="font-medium">{titleId || "-"}</span>;
      },
    },
    {
      header: "Category",
      accessor: (row) => {
        const category = row.category as { translations: Array<{ locale: string; name: string }> } | null;
        if (!category) return "-";
        return category.translations?.find((t) => t.locale === "id")?.name ?? "-";
      },
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={getStatusVariant(row.status as string)} className="text-[11px]">
          {row.status as string}
        </Badge>
      ),
    },
    {
      header: "Featured",
      accessor: (row) =>
        row.isFeatured ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" weight="fill" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground/40" weight="fill" />
        ),
    },
    {
      header: "Order",
      accessor: (row) => row.sortOrder as number,
    },
  ];

  return (
    <DataTable
      title="All Services"
      data={services}
      columns={columns}
      createUrl="/admin/services/new"
      editUrlBase="/admin/services"
      onDelete={deleteAction}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
        params.set("page", page.toString());
        router.push(`/admin/services?${params.toString()}`);
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
