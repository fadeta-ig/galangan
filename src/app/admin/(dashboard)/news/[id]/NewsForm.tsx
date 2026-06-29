"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { saveNews } from "./actions";
import { FloppyDisk } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type NewsFormData = Prisma.NewsPostGetPayload<{
  include: { translations: true };
}>;

export default function NewsForm({ 
  newsId, 
  initialData 
}: { 
  newsId: string; 
  initialData?: NewsFormData | null; 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "DRAFT");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  
  const idTrans = initialData?.translations.find((translation) => translation.locale === "id");
  const enTrans = initialData?.translations.find((translation) => translation.locale === "en");

  const [contentId, setContentId] = useState(idTrans?.content ?? "");
  const [contentEn, setContentEn] = useState(enTrans?.content ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("featuredImage", featuredImage);
    formData.set("content_id", contentId);
    formData.set("content_en", contentEn);
    formData.set("status", status);
    formData.set("isFeatured", isFeatured.toString());

    startTransition(async () => {
      const res = await saveNews(newsId, formData);
      if (res.success) {
        router.push("/admin/news");
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
              <CardTitle className="text-base font-medium">Article Content</CardTitle>
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
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Slug</Label>
                        <Input
                          type="text"
                          name={`slug${suffix}`}
                          defaultValue={trans?.slug ?? ""}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Excerpt (Short description)</Label>
                        <Textarea
                          name={`excerpt${suffix}`}
                          defaultValue={trans?.excerpt ?? ""}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Article</Label>
                        <RichTextEditor
                          content={isId ? contentId : contentEn}
                          onChange={isId ? setContentId : setContentEn}
                        />
                      </div>
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
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Input
                  type="date"
                  name="publishDate"
                  defaultValue={initialData?.publishDate ? new Date(initialData.publishDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="isFeatured" className="font-normal text-muted-foreground">Featured Article</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {featuredImage ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-slate-50">
                    <Image src={featuredImage} alt="Cover" fill className="object-cover" sizes="400px" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={() => setFeaturedImage("")}
                    >
                      <span className="text-xs">X</span>
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUploadSuccess={(media) => setFeaturedImage(media.url)}
                    categoryId="news"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save News"}
        </Button>
      </div>
    </form>
  );
}
