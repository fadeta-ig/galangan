"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Media, MediaCategory, MediaTranslation } from "@prisma/client";
import { saveGalleryItem } from "./actions";
import { FloppyDisk, PlayCircle } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type GalleryFormData = Media & {
  translations: MediaTranslation[];
  category: MediaCategory | null;
};

export default function GalleryForm({ 
  mediaId, 
  initialData, 
  categories 
}: { 
  mediaId: string; 
  initialData?: GalleryFormData | null; 
  categories: MediaCategory[]; 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [mediaType, setMediaType] = useState(initialData?.mediaType || "image");
  const [url, setUrl] = useState(initialData?.url || "");
  const [embedUrl, setEmbedUrl] = useState(initialData?.embedUrl || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "none");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  const idTrans = initialData?.translations.find((t) => t.locale === "id");
  const enTrans = initialData?.translations.find((t) => t.locale === "en");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("mediaType", mediaType);
    formData.set("url", url);
    formData.set("embedUrl", embedUrl);
    formData.set("categoryId", categoryId === "none" ? "" : categoryId);
    formData.set("isFeatured", isFeatured.toString());

    startTransition(async () => {
      const res = await saveGalleryItem(mediaId, formData);
      if (res.success) {
        router.push("/admin/gallery");
        router.refresh();
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Media Details</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageTabs>
                {(locale) => {
                  const isId = locale === "id";
                  const trans = isId ? idTrans : enTrans;
                  const suffix = isId ? "_id" : "_en";

                  return (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          type="text"
                          name={`title${suffix}`}
                          defaultValue={trans?.title ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Caption</Label>
                        <Textarea
                          name={`caption${suffix}`}
                          defaultValue={trans?.caption ?? ""}
                          rows={3}
                        />
                      </div>
                      {mediaType === "image" && (
                        <div className="space-y-2">
                          <Label>Alt Text</Label>
                          <Input
                            type="text"
                            name={`altText${suffix}`}
                            defaultValue={trans?.altText ?? ""}
                          />
                        </div>
                      )}
                    </div>
                  );
                }}
              </LanguageTabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select value={mediaType} onValueChange={setMediaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video Embed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="isFeatured" className="font-normal text-muted-foreground">Featured</Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  name="sortOrder"
                  defaultValue={initialData?.sortOrder ?? 0}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Media Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediaType === "image" ? (
                <div className="space-y-2">
                  <input type="hidden" name="url" value={url} />
                  {url ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-slate-50">
                      <Image src={url} alt="Preview" fill className="object-cover" sizes="400px" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => setUrl("")}
                      >
                        <span className="text-xs">X</span>
                      </Button>
                    </div>
                  ) : (
                    <ImageUploader onUploadSuccess={(media) => setUrl(media.url)} />
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center w-full aspect-video rounded border border-border bg-muted mb-4">
                    <PlayCircle className="w-12 h-12 text-muted-foreground/40" weight="fill" />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube / Vimeo URL</Label>
                    <Input
                      type="url"
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/gallery")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Gallery Item"}
        </Button>
      </div>
    </form>
  );
}
