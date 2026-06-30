"use client";

import type { Prisma } from "@prisma/client";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type ProjectRow = Prisma.ProjectGetPayload<{
  include: {
    translations: true;
    category: {
      include: { translations: true };
    };
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

export default function ProjectsClient({
  projects,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
  deleteAction,
}: {
  projects: ProjectRow[];
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
    router.push(`/admin/projects?${params.toString()}`);
  };

  const columns: Column<ProjectRow>[] = [
    {
      header: "Project Title (ID)",
      accessor: (row) => {
        const titleId = row.translations.find((t) => t.locale === "id")?.title;
        return <span className="font-medium">{titleId || "-"}</span>;
      },
    },
    {
      header: "Category",
      accessor: (row) => {
        if (!row.category) return "-";
        return row.category.translations.find((t) => t.locale === "id")?.name ?? "-";
      },
    },
    {
      header: "Client",
      accessor: "clientName",
    },
    {
      header: "Year",
      accessor: (row) => (
        <span className="tabular-nums">{row.projectYear ?? "-"}</span>
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
      title="All Projects"
      data={projects}
      columns={columns}
      createUrl="/admin/projects/new"
      editUrlBase="/admin/projects"
      onDelete={deleteAction}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
        params.set("page", page.toString());
        router.push(`/admin/projects?${params.toString()}`);
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
