"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveProject } from "./actions";
import { FloppyDisk, Trash } from "@phosphor-icons/react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Trans = {
  locale: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  scopeSummary?: string;
};

type SeoMeta = {
  locale: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
};

export default function ProjectForm({
  projectId,
  initialData,
  categories,
  services,
  seoMeta = [],
}: {
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  services: any[];
  seoMeta?: SeoMeta[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "none");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  const [vesselType, setVesselType] = useState(initialData?.vesselType || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [projectYear, setProjectYear] = useState(initialData?.projectYear || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [showClientName, setShowClientName] = useState(initialData?.showClientName || false);

  const translations = initialData?.translations || [];
  const idTrans = translations.find((t: Trans) => t.locale === "id") || ({} as Trans);
  const enTrans = translations.find((t: Trans) => t.locale === "en") || ({} as Trans);
  
  const [fullDescId, setFullDescId] = useState(idTrans.fullDescription || "");
  const [fullDescEn, setFullDescEn] = useState(enTrans.fullDescription || "");
  const [scopeSummaryId, setScopeSummaryId] = useState(idTrans.scopeSummary || "");
  const [scopeSummaryEn, setScopeSummaryEn] = useState(enTrans.scopeSummary || "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialGallery = (initialData?.gallery || []).map((g: any) => ({ id: g.media.id, url: g.media.url, isBefore: g.isBefore }));
  const [gallery, setGallery] = useState<{id: string, url: string, isBefore: boolean}[]>(initialGallery);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialServiceIds = (initialData?.projectServices || []).map((ps: any) => ps.serviceId);
  const [serviceIds, setServiceIds] = useState<string[]>(initialServiceIds);

  const seoId = seoMeta.find(s => s.locale === "id") || {} as SeoMeta;
  const seoEn = seoMeta.find(s => s.locale === "en") || {} as SeoMeta;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    formData.set("coverImage", coverImage);
    formData.set("fullDesc_id", fullDescId);
    formData.set("fullDesc_en", fullDescEn);
    formData.set("scopeSummary_id", scopeSummaryId);
    formData.set("scopeSummary_en", scopeSummaryEn);
    formData.set("status", status);
    formData.set("categoryId", categoryId === "none" ? "" : categoryId);
    formData.set("isFeatured", isFeatured.toString());
    formData.set("showClientName", showClientName.toString());
    formData.set("sortOrder", sortOrder.toString());
    formData.set("vesselType", vesselType);
    formData.set("location", location);
    formData.set("projectYear", projectYear.toString());
    formData.set("clientName", clientName);

    formData.set("galleryData", JSON.stringify(gallery.map(g => ({ id: g.id, isBefore: g.isBefore }))));
    formData.set("serviceIds", JSON.stringify(serviceIds));

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
          
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Project Content</TabsTrigger>
              <TabsTrigger value="seo">SEO Meta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Bilingual Contents</CardTitle>
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
                            <Input type="text" name={`title${suffix}`} defaultValue={trans.title as string} required />
                          </div>
                          <div className="space-y-2">
                            <Label>URL Slug</Label>
                            <Input type="text" name={`slug${suffix}`} defaultValue={trans.slug as string} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Short Description</Label>
                            <Textarea name={`shortDesc${suffix}`} defaultValue={trans.shortDescription as string} rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Scope Summary</Label>
                            <RichTextEditor content={isId ? scopeSummaryId : scopeSummaryEn} onChange={isId ? setScopeSummaryId : setScopeSummaryEn} />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Description</Label>
                            <RichTextEditor content={isId ? fullDescId : fullDescEn} onChange={isId ? setFullDescId : setFullDescEn} />
                          </div>
                        </div>
                      );
                    }}
                  </LanguageTabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardContent className="pt-6">
                  <LanguageTabs>
                    {(locale) => {
                      const isId = locale === "id";
                      const seo = isId ? seoId : seoEn;
                      const suffix = isId ? "_id" : "_en";

                      return (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input name={`seoTitle${suffix}`} defaultValue={seo.metaTitle || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea name={`seoDesc${suffix}`} defaultValue={seo.metaDescription || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label>OG Title</Label>
                            <Input name={`ogTitle${suffix}`} defaultValue={seo.ogTitle || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label>OG Description</Label>
                            <Textarea name={`ogDesc${suffix}`} defaultValue={seo.ogDescription || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label>Canonical URL</Label>
                            <Input name={`canonical${suffix}`} defaultValue={seo.canonicalUrl || ""} />
                          </div>
                        </div>
                      );
                    }}
                  </LanguageTabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Gallery & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Gallery Files</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((g, i) => (
                    <div key={i} className="relative aspect-[4/3] border rounded-lg overflow-hidden group">
                      <Image src={g.url} alt="Gallery" fill className="object-cover" />
                      <button type="button" onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash size={14} /></button>
                      <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 flex items-center justify-between text-white text-xs">
                        <Label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={g.isBefore} onChange={(e) => {
                            const n = [...gallery];
                            n[i].isBefore = e.target.checked;
                            setGallery(n);
                          }} />
                          Mark as Before
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <ImageUploader onUploadSuccess={(media) => setGallery([...gallery, {id: media.id, url: media.url, isBefore: false}])} categoryId="projects" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Project Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Category --</SelectItem>
                    {categories.map((c) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const name = c.translations?.find((t: any) => t.locale === "id")?.name || c.id;
                      return <SelectItem key={c.id} value={c.id}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="isFeatured">Featured Project</Label>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Client Name</Label>
                <Input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="showClientName" checked={showClientName} onCheckedChange={setShowClientName} />
                <Label htmlFor="showClientName">Show Client Name Publicly</Label>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Vessel Type</Label>
                <Input type="text" value={vesselType} onChange={(e) => setVesselType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Project Year</Label>
                <Input type="number" value={projectYear} onChange={(e) => setProjectYear(e.target.value)} min="1900" max="2100" />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
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
                    <Button type="button" variant="destructive" size="icon-sm" className="absolute right-2 top-2 h-6 w-6 rounded-full" onClick={() => setCoverImage("")}>
                      <span className="text-xs">X</span>
                    </Button>
                  </div>
                ) : (
                  <ImageUploader onUploadSuccess={(media) => setCoverImage(media.url)} categoryId="projects" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Related Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto border p-3 rounded-md space-y-2 text-sm">
                {services.map((s) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const title = s.translations?.find((t: any) => t.locale === "id")?.title || "Untitled";
                  return (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={(e) => {
                        if (e.target.checked) setServiceIds([...serviceIds, s.id]);
                        else setServiceIds(serviceIds.filter(id => id !== s.id));
                      }} />
                      {title}
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
