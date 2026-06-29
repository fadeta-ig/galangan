"use client";

import { type NewsletterSubscriber } from "@prisma/client";
import { Trash, CheckCircle, XCircle, Database } from "@phosphor-icons/react";
import { toggleSubscriberStatus, deleteSubscriber } from "./actions";
import { useTransition } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function NewsletterClient({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleSubscriberStatus(id, isActive);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this subscriber?")) return;
    startTransition(async () => {
      await deleteSubscriber(id);
    });
  };

  return (
    <Card size="sm" className="shadow-sm shadow-slate-950/5">
      <div className="flex items-center justify-between border-b border-border/80 px-3 py-3">
        <div className="text-sm font-semibold tracking-normal text-foreground">Newsletter Subscribers</div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
          {subscribers.length}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35 hover:bg-muted/35">
            <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Email</TableHead>
            <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Subscribed At</TableHead>
            <TableHead className="h-9 text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-36 text-center">
                <div className="mx-auto flex max-w-xs flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/25 px-4 py-5">
                  <Database className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No subscribers yet</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Newsletter signups will appear here.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="text-sm font-medium">{sub.email}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggle(sub.id, !sub.isActive)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${
                      sub.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {sub.isActive ? <CheckCircle weight="fill" className="h-3 w-3" /> : <XCircle weight="fill" className="h-3 w-3" />}
                    {sub.isActive ? "Active" : "Inactive"}
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {new Date(sub.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(sub.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="size-4" />
                    <span className="sr-only">Delete subscriber</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
