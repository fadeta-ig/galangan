"use client";

import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | string | null;
};

export default function UsersClient({
  users,
  deleteAction,
  currentUserId,
}: {
  users: AdminUser[];
  deleteAction: (id: string) => Promise<void>;
  currentUserId: string;
}) {
  const columns: Column<AdminUser>[] = [
    {
      header: "Name",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          <span className="text-[11px] text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (row) => (
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
          {String(row.role).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        row.isActive ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" weight="fill" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <XCircle className="h-4 w-4" weight="fill" />
            Inactive
          </span>
        )
      ),
    },
    {
      header: "Last Login",
      accessor: (row) => {
        if (!row.lastLoginAt) return <span className="text-muted-foreground">Never</span>;
        return <span className="tabular-nums">{new Date(row.lastLoginAt as string | number | Date).toLocaleString()}</span>;
      }
    }
  ];

  return (
    <DataTable
      title="Admin Users"
      data={users}
      columns={columns}
      createUrl="/admin/users/new"
      editUrlBase="/admin/users"
      onDelete={(id) => {
        if (id === currentUserId) {
          toast.error("You cannot delete yourself.");
          return Promise.resolve();
        }
        return deleteAction(id);
      }}
    />
  );
}
