"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { savePage } from "./actions";
import { FloppyDisk } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PageFormData = Prisma.PageGetPayload<{
  include: { translations: true; sections: true };
}>;

export default function PageForm({ 
  pageId, 
  initialData 
}: { 
  pageId: string; 
  initialData?: PageFormData | null; 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [heroImage, setHeroImage] = useState(initialData?.heroImage ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "DRAFT");
  
  const idTrans = initialData?.translations.find((t) => t.locale === "id");
  const enTrans = initialData?.translations.find((t) => t.locale === "en");

  const [contentId, setContentId] = useState(idTrans?.content ?? "");
  const [contentEn, setContentEn] = useState(enTrans?.content ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("heroImage", heroImage);
    formData.set("content_id", contentId);
    formData.set("content_en", contentEn);
    formData.set("status", status);

    startTransition(async () => {
      const res = await savePage(pageId, formData);
      if (res.success) {
        router.push("/admin/pages");
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
              <CardTitle className="text-base font-medium">Page Content</CardTitle>
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
                        <Label>Content</Label>
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
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  name="sortOrder"
                  defaultValue={initialData?.sortOrder ?? 0}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Hero Image</Label>
                {heroImage ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-slate-50">
                    <Image src={heroImage} alt="Hero preview" fill className="object-cover" sizes="400px" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={() => setHeroImage("")}
                    >
                      <span className="text-xs">X</span>
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUploadSuccess={(media) => setHeroImage(media.url)}
                    categoryId="pages"
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
          onClick={() => router.push("/admin/pages")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Page"}
        </Button>
      </div>
    </form>
  );
}
