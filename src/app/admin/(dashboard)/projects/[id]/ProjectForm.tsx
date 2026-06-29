"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { saveProject } from "./actions";
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

type ProjectFormData = Prisma.ProjectGetPayload<{
  include: {
    translations: true;
    projectServices: true;
  };
}>;

type ProjectCategoryOption = Prisma.ProjectCategoryGetPayload<{
  include: { translations: true };
}>;

type ServiceOption = Prisma.ServiceGetPayload<{
  include: { translations: true };
}>;

export default function ProjectForm({
  projectId,
  initialData,
  categories,
  services,
}: {
  projectId: string;
  initialData?: ProjectFormData | null;
  categories: ProjectCategoryOption[];
  services: ServiceOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "none");
  const [serviceId, setServiceId] = useState(initialData?.projectServices[0]?.serviceId ?? "none");

  const idTrans = initialData?.translations.find((translation) => translation.locale === "id");
  const enTrans = initialData?.translations.find((translation) => translation.locale === "en");

  const [fullDescId, setFullDescId] = useState(idTrans?.fullDescription ?? "");
  const [fullDescEn, setFullDescEn] = useState(enTrans?.fullDescription ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("coverImage", coverImage);
    formData.set("fullDesc_id", fullDescId);
    formData.set("fullDesc_en", fullDescEn);
    formData.set("status", status);
    formData.set("categoryId", categoryId === "none" ? "" : categoryId);
    formData.set("serviceId", serviceId === "none" ? "" : serviceId);

    startTransition(async () => {
      const res = await saveProject(projectId, formData);
      if (res.success) {
        router.push("/admin/projects");
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
              <CardTitle className="text-base font-medium">Project Content</CardTitle>
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
                        <Label>Project Title</Label>
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
                        <Label>Project Details / Content</Label>
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
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.translations.find((t) => t.locale === "id")?.name ?? "-"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Related Service</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Service --</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.translations.find((t) => t.locale === "id")?.title ?? "-"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Client Name</Label>
                <Input
                  type="text"
                  name="clientName"
                  defaultValue={initialData?.clientName ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label>Project Year</Label>
                <Input
                  type="number"
                  name="projectYear"
                  defaultValue={initialData?.projectYear ?? ""}
                  min="1900"
                  max="2100"
                />
              </div>

              <div className="space-y-2">
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
              <CardTitle className="text-base font-medium">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coverImage ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-slate-50">
                    <Image src={coverImage} alt="Cover preview" fill className="object-cover" sizes="400px" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={() => setCoverImage("")}
                    >
                      <span className="text-xs">X</span>
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUploadSuccess={(media) => setCoverImage(media.url)}
                    categoryId="projects"
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
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
