"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Trash, Copy, CheckCircle, File as FileIcon, Database } from "@phosphor-icons/react";
import type { Media, MediaCategory } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type MediaWithCategory = Media & { category: MediaCategory | null };

export default function MediaClient({
  initialMedia,
  categories,
  totalCount,
  currentPage,
  pageSize,
}: {
  initialMedia: MediaWithCategory[];
  categories: MediaCategory[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  const handleUploadSuccess = () => {
    router.refresh();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMedia = (id: string) => {
    setMediaToDelete(id);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    setIsDeleting(mediaToDelete);
    try {
      const res = await fetch(`/api/media/${mediaToDelete}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Media deleted successfully.");
        router.refresh();
      } else {
        toast.error("Failed to delete media.");
      }
    } catch {
      toast.error("Error deleting media.");
    } finally {
      setIsDeleting(null);
      setMediaToDelete(null);
    }
  };

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId && catId !== "all") {
      router.push(`/admin/media?categoryId=${catId}`);
    } else {
      router.push(`/admin/media`);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader className="border-b border-border/80 pb-3">
          <CardTitle className="text-sm">Upload New Media</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full sm:w-1/3 space-y-2">
              <Label className="text-xs">Select Category (Optional)</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- No Category --</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nameId} / {c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <ImageUploader 
                onUploadSuccess={handleUploadSuccess} 
                categoryId={selectedCategoryId !== "all" ? selectedCategoryId : undefined} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <div className="flex flex-col gap-3 border-b border-border/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold tracking-normal text-foreground">Media Files ({totalCount})</div>
          <div className="w-48">
            <Select value={selectedCategoryId} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nameId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="pt-3">
          {initialMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 px-4 py-10 text-center">
              <Database className="mb-2 size-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No media files found</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Upload images or documents to fill the library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {initialMedia.map((media) => (
                <div key={media.id} className="group relative flex h-40 flex-col overflow-hidden rounded-xl border border-border bg-muted/30">
                  <div className="flex-1 relative flex items-center justify-center bg-muted">
                    {media.mediaType === "image" ? (
                      <Image
                        src={media.thumbnailUrl || media.url}
                        alt={media.originalName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <FileIcon className="w-10 h-10 text-muted-foreground/50" />
                    )}
                    
                    {/* Actions Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(media.url, media.id)}
                        title="Copy URL"
                      >
                        {copiedId === media.id ? <CheckCircle className="h-4 w-4 text-emerald-500" weight="fill" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={() => deleteMedia(media.id)}
                        disabled={isDeleting === media.id}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="truncate border-t border-border bg-card px-2 py-1.5 text-[10px] text-muted-foreground" title={media.originalName}>
                    {media.originalName}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => router.push(`/admin/media?page=${i + 1}${selectedCategoryId && selectedCategoryId !== 'all' ? `&categoryId=${selectedCategoryId}` : ''}`)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mediaToDelete !== null} onOpenChange={(open) => !open && setMediaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this media file from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMediaToDelete(null)} disabled={!!isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={!!isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
