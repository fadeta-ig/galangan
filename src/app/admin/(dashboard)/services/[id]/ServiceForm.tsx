"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveService } from "./actions";
import { FloppyDisk } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { IconPicker } from "@/components/admin/ui/IconPicker";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Trans = {
  locale: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  name?: string;
};

type ServiceData = {
  status?: string;
  categoryId?: string | null;
  isFeatured?: boolean;
  coverImage?: string | null;
  icon?: string | null;
  sortOrder?: number;
  translations?: Trans[];
};

type CategoryData = {
  id: string;
  translations?: Trans[];
};

export default function ServiceForm({
  serviceId,
  initialData,
  categories,
}: {
  serviceId: string;
  initialData?: ServiceData | null;
  categories: CategoryData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  
  const translations = initialData?.translations || [];
  const idTrans = translations.find((t) => t.locale === "id") || {};
  const enTrans = translations.find((t) => t.locale === "en") || {};
  
  const [fullDescId, setFullDescId] = useState(idTrans.fullDescription || "");
  const [fullDescEn, setFullDescEn] = useState(enTrans.fullDescription || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "none");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    formData.set("coverImage", coverImage);
    formData.set("icon", icon);
    formData.set("fullDesc_id", fullDescId);
    formData.set("fullDesc_en", fullDescEn);
    formData.set("status", status);
    formData.set("categoryId", categoryId === "none" ? "" : categoryId);
    formData.set("isFeatured", isFeatured.toString());

    startTransition(async () => {
      const res = await saveService(serviceId, formData);
      if (res.success) {
        router.push("/admin/services");
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Service Content</CardTitle>
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
                          defaultValue={trans.title as string}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Slug</Label>
                        <Input
                          type="text"
                          name={`slug${suffix}`}
                          defaultValue={trans.slug as string}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Textarea
                          name={`shortDesc${suffix}`}
                          defaultValue={trans.shortDescription as string}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Description</Label>
                        <RichTextEditor 
                          content={isId ? fullDescId : fullDescEn}
                          onChange={isId ? setFullDescId : setFullDescEn}
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
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Category --</SelectItem>
                    {categories.map((c) => {
                      const translations = c.translations || [];
                      const name = translations.find((t) => t.locale === "id")?.name || c.id;
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="isFeatured" className="font-normal text-muted-foreground">Featured Service</Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  name="sortOrder"
                  defaultValue={(initialData?.sortOrder as number) || 0}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImage && (
                  <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
                    <Image src={coverImage} alt="Cover" fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2 h-7 px-2 text-xs"
                      onClick={() => setCoverImage("")}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                {!coverImage && (
                  <ImageUploader
                    onUploadSuccess={(media) => setCoverImage(media.url)}
                    categoryId="services"
                  />
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Icon</Label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/services")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Service"}
        </Button>
      </div>
    </form>
  );
}
