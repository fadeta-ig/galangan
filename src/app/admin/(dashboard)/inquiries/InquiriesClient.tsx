"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { useRouter } from "next/navigation";
import { Eye } from "@phosphor-icons/react";
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

export default function InquiriesClient({
  inquiries,
  totalCount,
  currentPage,
  pageSize,
  deleteAction,
  updateStatusAction,
}: {
  inquiries: InquiryItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  deleteAction: (id: string) => Promise<void>;
  updateStatusAction: (id: string, status: InquiryStatus) => Promise<void>;
}) {
  const router = useRouter();
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);

  const handleView = async (row: InquiryItem) => {
    setSelectedInquiry(row);
    if (row.status === "NEW") {
      await updateStatusAction(row.id, "READ");
      router.refresh(); 
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW": return "destructive";
      case "READ": return "secondary";
      case "REPLIED": return "default";
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
    <>
      <DataTable
        title="All Inquiries"
        data={inquiries}
        columns={columns}
        onDelete={deleteAction}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={(page) => router.push(`/admin/inquiries?page=${page}`)}
      />

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl sm:max-w-2xl gap-0 p-0 font-sans">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg font-medium">Inquiry Details</DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <>
              <div className="flex flex-col gap-6 p-6 max-h-[70vh] overflow-y-auto">
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

              <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Received: {new Date(selectedInquiry.createdAt as string).toLocaleString()}
                </div>
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
