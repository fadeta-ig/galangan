"use client";

import { useState, useTransition } from "react";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Eye, FloppyDisk, MagnifyingGlass } from "@phosphor-icons/react";
import type { InquiryStatus, Inquiry } from "@prisma/client";

type InquiryItem = Omit<Inquiry, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function InquiriesClient({
  inquiries,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
  statusFilter,
  deleteAction,
  updateStatusAction,
  updateNoteAction,
}: {
  inquiries: InquiryItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string;
  deleteAction: (id: string) => Promise<void>;
  updateStatusAction: (id: string, status: InquiryStatus) => Promise<void>;
  updateNoteAction: (id: string, note: string) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  
  const [search, setSearch] = useState(searchQuery);
  const [internalNote, setInternalNote] = useState("");

  const applyFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    router.push(`/admin/inquiries?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, statusFilter);
  };

  const handleStatusFilterChange = (val: string) => {
    applyFilters(search, val);
  };

  const handleView = async (row: InquiryItem) => {
    setSelectedInquiry(row);
    setInternalNote(row.internalNotes || "");
    if (row.status === "NEW") {
      await updateStatusAction(row.id, "READ");
      router.refresh(); 
    }
  };

  const handleSaveNote = () => {
    if (!selectedInquiry) return;
    startTransition(async () => {
      await updateNoteAction(selectedInquiry.id as string, internalNote);
      setSelectedInquiry({ ...selectedInquiry, internalNotes: internalNote });
      router.refresh();
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW": return "destructive";
      case "READ": return "secondary";
      case "REPLIED": return "default";
      case "ARCHIVED": return "outline";
      default: return "outline";
    }
  };

  const columns: Column<InquiryItem>[] = [
    {
      header: "Sender",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.fullName}</span>
          <span className="text-[11px] text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Date",
      accessor: (row) => (
        <span className="tabular-nums">{new Date(row.createdAt as string).toLocaleDateString()}</span>
      ),
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
      header: "View",
      accessor: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          onClick={() => handleView(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="All Inquiries"
        data={inquiries}
        columns={columns}
        onDelete={deleteAction}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={(page) => {
          const params = new URLSearchParams();
          if (searchQuery) params.set("search", searchQuery);
          if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
          params.set("page", page.toString());
          router.push(`/admin/inquiries?${params.toString()}`);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => applyFilters(q, statusFilter)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => applyFilters(searchQuery, s)}
        statusOptions={[
          { label: "New", value: "NEW" },
          { label: "Read", value: "READ" },
          { label: "Replied", value: "REPLIED" },
          { label: "Archived", value: "ARCHIVED" },
        ]}
      />

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl sm:max-w-4xl gap-0 p-0 font-sans flex flex-col md:flex-row">
          <div className="flex-1 border-r border-border flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-border">
              <DialogTitle className="text-lg font-medium">Inquiry Details</DialogTitle>
            </DialogHeader>
            
            {selectedInquiry && (
              <div className="flex flex-col gap-6 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedInquiry.email}</p>
                    <p className="text-xs text-muted-foreground">{selectedInquiry.phone || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company & Interest</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.companyName || "-"}</p>
                    <p className="text-xs text-muted-foreground">Interest: {selectedInquiry.serviceInterest || "-"}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Subject</p>
                  <p className="text-base font-medium text-foreground">{selectedInquiry.subject}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Message</p>
                  <div className="rounded-md bg-muted/50 p-4 text-sm text-foreground whitespace-pre-wrap border border-border">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>
            )}
            
            {selectedInquiry && (
              <DialogFooter className="mt-auto px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Received: {new Date(selectedInquiry.createdAt as string).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateStatusAction(selectedInquiry.id as string, "ARCHIVED");
                      setSelectedInquiry({ ...selectedInquiry, status: "ARCHIVED" });
                      router.refresh();
                    }}
                    disabled={selectedInquiry.status === "ARCHIVED"}
                  >
                    Archive
                  </Button>
                  <Button
                    onClick={() => {
                      updateStatusAction(selectedInquiry.id as string, "REPLIED");
                      setSelectedInquiry({ ...selectedInquiry, status: "REPLIED" });
                      router.refresh();
                    }}
                    disabled={selectedInquiry.status === "REPLIED"}
                  >
                    Mark as Replied
                  </Button>
                </div>
              </DialogFooter>
            )}
          </div>
          
          {selectedInquiry && (
            <div className="w-full md:w-80 bg-slate-50 flex flex-col border-t md:border-t-0 border-border">
              <div className="px-5 py-4 border-b border-border bg-white">
                <h3 className="font-medium text-sm">Internal Note</h3>
                <p className="text-xs text-muted-foreground">Private notes for this lead</p>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-4">
                <Textarea 
                  className="flex-1 min-h-[150px] resize-none text-sm" 
                  placeholder="Add your internal notes here..." 
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
                <Button onClick={handleSaveNote} disabled={isPending} className="w-full">
                  <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
                  {isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
