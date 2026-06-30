"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Database,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  statusOptions?: { label: string; value: string }[];
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
  
  searchQuery = "",
  onSearchChange,
  statusFilter = "ALL",
  onStatusFilterChange,
  statusOptions,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!onDelete) return;
    setRecordToDelete(id);
  };

  const confirmDelete = async () => {
    if (!onDelete || !recordToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(recordToDelete);
      toast.success("Record deleted successfully.");
    } catch {
      toast.error("Failed to delete record.");
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchValue);
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

      {statusOptions && statusOptions.length > 0 && (
        <div className="border-b border-[#e7eaf0] px-5 flex overflow-x-auto no-scrollbar">
          <div className="flex h-9 items-end gap-6 text-[11px] font-medium text-[#6b7280]">
            <button
              onClick={() => onStatusFilterChange?.("ALL")}
              className={`pb-2 whitespace-nowrap ${statusFilter === "ALL" || !statusFilter ? "border-b-2 border-[#1677ff] text-[#1677ff]" : "hover:text-foreground"}`}
            >
              All Records
            </button>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusFilterChange?.(opt.value)}
                className={`pb-2 whitespace-nowrap ${statusFilter === opt.value ? "border-b-2 border-[#1677ff] text-[#1677ff]" : "hover:text-foreground"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(onSearchChange) && (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[280px]">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input 
              type="text" 
              placeholder="Search records..." 
              className="h-8 w-full pl-8 text-[11px] placeholder:text-[#9aa3af] border-[#e2e6ec] focus-visible:ring-1 focus-visible:ring-primary/30"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>
      )}

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

      <Dialog open={recordToDelete !== null} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this record from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
