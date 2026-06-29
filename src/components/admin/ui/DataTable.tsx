"use client";

import Link from "next/link";
import {
  CalendarBlank,
  Database,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

type DataTableProps<T> = {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  createUrl?: string;
  createLabel?: string;
  editUrlBase?: string;
  onDelete?: (id: string) => Promise<void>;
  idAccessor?: keyof T;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export default function DataTable<T extends Record<string, unknown>>({
  title,
  description,
  data,
  columns,
  createUrl,
  createLabel = "Create New",
  editUrlBase,
  onDelete,
  idAccessor = "id" as keyof T,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      await onDelete(id);
    }
  };

  const hasActions = Boolean(editUrlBase || onDelete);

  return (
    <Card size="sm" className="rounded-lg border border-[#e7eaf0] bg-white py-0 shadow-none">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-[22px] font-semibold leading-7 tracking-normal text-[#171b23]">{title}</div>
            <Badge variant="secondary" className="h-5 bg-[#eef6ff] px-1.5 text-[10px] text-[#1677ff]">
              {data.length}
            </Badge>
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {createUrl && (
          <Button asChild size="sm" className="h-8 bg-[#1677ff] px-3 text-white hover:bg-[#0f66df]">
            <Link href={createUrl}>
              <Plus className="size-3.5" weight="bold" />
              {createLabel}
            </Link>
          </Button>
        )}
      </div>

      <div className="border-b border-[#e7eaf0] px-5">
        <div className="flex h-9 items-end gap-6 text-[11px] font-medium text-[#6b7280]">
          <span className="border-b-2 border-[#1677ff] pb-2 text-[#1677ff]">
            All Records <span className="ml-1 text-[#97a0ad]">{data.length}</span>
          </span>
          <span className="pb-2">Published</span>
          <span className="pb-2">Draft</span>
          <span className="pb-2">Archived</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-8 w-full max-w-[280px] items-center gap-2 rounded-md border border-[#e2e6ec] bg-white px-3 text-[11px] text-[#9aa3af]">
          <MagnifyingGlass className="size-4" />
          <span>Search records</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 bg-white text-[11px] text-[#374151]">
            <CalendarBlank className="size-3.5" />
            Mar 01, 2024 - Mar 30, 2024
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-white text-[11px] text-[#374151]">
            <FunnelSimple className="size-3.5" />
            Filters
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-y border-[#e7eaf0] bg-[#f8fafc] hover:bg-[#f8fafc]">
            {columns.map((col, i) => (
              <TableHead key={i} className={`h-9 px-5 text-[11px] font-semibold text-[#6b7280] ${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className="h-9 w-[92px] px-5 text-xs">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="h-36 text-center"
              >
                <div className="mx-auto flex max-w-xs flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/25 px-4 py-5">
                  <Database className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No records found</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Data will appear here after it is created.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = String(row[idAccessor] || rowIndex);

              return (
                <TableRow key={rowId} className="border-[#eef1f4] hover:bg-[#f8fafc]">
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={`px-5 py-3 text-[12px] text-[#374151] ${col.className ?? ""}`}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {editUrlBase && (
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`${editUrlBase}/${rowId}`} title="Edit">
                              <PencilSimple className="size-4" />
                              <span className="sr-only">Edit record</span>
                            </Link>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(rowId)}
                            title="Delete"
                          >
                            <Trash className="size-4" />
                            <span className="sr-only">Delete record</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col gap-2 border-t border-[#e7eaf0] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="h-7 w-7 text-xs p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
