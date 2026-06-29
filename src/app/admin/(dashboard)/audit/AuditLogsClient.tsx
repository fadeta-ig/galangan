"use client";

import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type AuditLogEntry = {
  id: string;
  createdAt: Date | string;
  action: string;
  module: string;
  targetId: string | null;
  targetTitle: string | null;
  details: string | null;
  user?: { name: string | null; email: string | null } | null;
};

export default function AuditLogsClient({
  logs,
  totalCount,
  currentPage,
  pageSize,
}: {
  logs: AuditLogEntry[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();

  const columns: Column<AuditLogEntry>[] = [
    {
      header: "Timestamp",
      accessor: (row) => (
        <span className="tabular-nums text-xs">
          {new Date(row.createdAt as string).toLocaleString()}
        </span>
      ),
    },
    {
      header: "User",
      accessor: (row) => {
        const user = row.user;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{user?.name || "System"}</span>
            <span className="text-[11px] text-muted-foreground">{user?.email || "-"}</span>
          </div>
        );
      },
    },
    {
      header: "Action",
      accessor: (row) => (
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
          {row.action as string}
        </Badge>
      ),
    },
    {
      header: "Module",
      accessor: (row) => <span className="capitalize text-sm">{String(row.module).replace("_", " ")}</span>,
    },
    {
      header: "Target / Details",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.targetTitle as string || row.targetId as string || "-"}</span>
          {row.details && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={row.details as string}>
              {row.details as string}
            </span>
          )}
        </div>
      ),
    }
  ];

  return (
    <DataTable
      title="System Activity Logs"
      data={logs}
      columns={columns}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={(page) => router.push(`/admin/audit?page=${page}`)}
    />
  );
}
