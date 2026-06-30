"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveService } from "./actions";
import { FloppyDisk, Plus, Trash } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import SeoForm from "@/components/admin/ui/SeoForm";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Trans = {
  locale: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  benefits?: string;
  processSteps?: string;
  faq?: string;
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


export default function ServiceForm({
  serviceId,
  initialData,
  categories,
  allProjects = [],
  allServices = [],
  seoMeta = []
}: {
  serviceId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allProjects?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allServices?: any[];
  seoMeta?: SeoMeta[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "none");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  const translations = initialData?.translations || [];
  const idTrans = translations.find((t: Trans) => t.locale === "id") || ({} as Trans);
  const enTrans = translations.find((t: Trans) => t.locale === "en") || ({} as Trans);
  
  const [fullDescId, setFullDescId] = useState(idTrans.fullDescription || "");
  const [fullDescEn, setFullDescEn] = useState(enTrans.fullDescription || "");

  const safeParse = (str?: string) => {
    try { return JSON.parse(str || "[]"); } catch { return []; }
  };

  const [benefitsId, setBenefitsId] = useState<string[]>(safeParse(idTrans.benefits));
  const [benefitsEn, setBenefitsEn] = useState<string[]>(safeParse(enTrans.benefits));

  const [processId, setProcessId] = useState<{title: string; desc: string}[]>(safeParse(idTrans.processSteps));
  const [processEn, setProcessEn] = useState<{title: string; desc: string}[]>(safeParse(enTrans.processSteps));

  const [faqId, setFaqId] = useState<{question: string; answer: string}[]>(safeParse(idTrans.faq));
  const [faqEn, setFaqEn] = useState<{question: string; answer: string}[]>(safeParse(enTrans.faq));

  const initialGallery = (initialData?.gallery || []).map((g: { media: { id: string; url: string } }) => ({ id: g.media.id, url: g.media.url }));
  const [gallery, setGallery] = useState<{id: string, url: string}[]>(initialGallery);

  const initialProjectIds = (initialData?.projectServices || []).map((ps: { projectId: string }) => ps.projectId);
  const [projectIds, setProjectIds] = useState<string[]>(initialProjectIds);

  const initialRelatedIds = (initialData?.relatedServices || []).map((s: { id: string }) => s.id);
  const [relatedIds, setRelatedIds] = useState<string[]>(initialRelatedIds);

  const seoId = seoMeta.find(s => s.locale === "id") || {} as SeoMeta;
  const seoEn = seoMeta.find(s => s.locale === "en") || {} as SeoMeta;

  const [ogImageId, setOgImageId] = useState(seoId.ogImage || "");
  const [ogImageEn, setOgImageEn] = useState(seoEn.ogImage || "");

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
    formData.set("sortOrder", sortOrder.toString());

    formData.set("benefits_id", JSON.stringify(benefitsId));
    formData.set("benefits_en", JSON.stringify(benefitsEn));
    formData.set("processSteps_id", JSON.stringify(processId));
    formData.set("processSteps_en", JSON.stringify(processEn));
    formData.set("faq_id", JSON.stringify(faqId));
    formData.set("faq_en", JSON.stringify(faqEn));

    formData.set("galleryIds", JSON.stringify(gallery.map(g => g.id)));
    formData.set("projectIds", JSON.stringify(projectIds));
    formData.set("relatedServiceIds", JSON.stringify(relatedIds));
    
    formData.set("ogImage_id", ogImageId);
    formData.set("ogImage_en", ogImageEn);

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
        <div className="lg:col-span-2 space-y-6">
          
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="benefits">Benefits & Process</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="seo">SEO Meta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
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

            <TabsContent value="benefits">
              <Card>
                <CardContent className="pt-6">
                  <LanguageTabs>
                    {(locale) => {
                      const isId = locale === "id";
                      const benefits = isId ? benefitsId : benefitsEn;
                      const setBenefits = isId ? setBenefitsId : setBenefitsEn;
                      const process = isId ? processId : processEn;
                      const setProcess = isId ? setProcessId : setProcessEn;

                      return (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label>Benefits</Label>
                            {benefits.map((ben, i) => (
                              <div key={i} className="flex gap-2">
                                <Input value={ben} onChange={(e) => {
                                  const n = [...benefits];
                                  n[i] = e.target.value;
                                  setBenefits(n);
                                }} />
                                <Button type="button" variant="ghost" onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))}>
                                  <Trash className="text-red-500" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => setBenefits([...benefits, ""])}>
                              <Plus className="mr-2 h-4 w-4" /> Add Benefit
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <Label>Process Steps</Label>
                            {process.map((step, i) => (
                              <div key={i} className="flex flex-col gap-2 p-4 border rounded-md relative">
                                <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => setProcess(process.filter((_, idx) => idx !== i))}>
                                  <Trash className="text-red-500" />
                                </Button>
                                <Input placeholder="Step Title" value={step.title} onChange={(e) => {
                                  const n = [...process];
                                  n[i].title = e.target.value;
                                  setProcess(n);
                                }} />
                                <Textarea placeholder="Step Description" value={step.desc} onChange={(e) => {
                                  const n = [...process];
                                  n[i].desc = e.target.value;
                                  setProcess(n);
                                }} />
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => setProcess([...process, {title: "", desc: ""}])}>
                              <Plus className="mr-2 h-4 w-4" /> Add Step
                            </Button>
                          </div>
                        </div>
                      );
                    }}
                  </LanguageTabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6">
                  <LanguageTabs>
                    {(locale) => {
                      const isId = locale === "id";
                      const faq = isId ? faqId : faqEn;
                      const setFaq = isId ? setFaqId : setFaqEn;

                      return (
                        <div className="space-y-4">
                          <Label>FAQ</Label>
                          {faq.map((item, i) => (
                            <div key={i} className="flex flex-col gap-2 p-4 border rounded-md relative">
                              <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => setFaq(faq.filter((_, idx) => idx !== i))}>
                                <Trash className="text-red-500" />
                              </Button>
                              <Input placeholder="Question" value={item.question} onChange={(e) => {
                                const n = [...faq];
                                n[i].question = e.target.value;
                                setFaq(n);
                              }} />
                              <Textarea placeholder="Answer" value={item.answer} onChange={(e) => {
                                const n = [...faq];
                                n[i].answer = e.target.value;
                                setFaq(n);
                              }} />
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => setFaq([...faq, {question: "", answer: ""}])}>
                            <Plus className="mr-2 h-4 w-4" /> Add FAQ
                          </Button>
                        </div>
                      );
                    }}
                  </LanguageTabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <SeoForm 
                seoId={seoId} 
                seoEn={seoEn} 
                ogImageId={ogImageId} 
                ogImageEn={ogImageEn} 
                setOgImageId={setOgImageId} 
                setOgImageEn={setOgImageEn} 
                mediaCategoryId="services"
              />
            </TabsContent>
          </Tabs>
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
                      const name = c.translations?.find((t: { locale: string; name: string }) => t.locale === "id")?.name || c.id;
                      return <SelectItem key={c.id} value={c.id}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="isFeatured">Featured Service</Label>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Sort Order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Media & Gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImage && (
                  <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
                    <Image src={coverImage} alt="Cover" fill className="object-cover" />
                    <Button type="button" variant="destructive" size="sm" className="absolute right-2 top-2 h-7 px-2" onClick={() => setCoverImage("")}>Remove</Button>
                  </div>
                )}
                {!coverImage && <ImageUploader onUploadSuccess={(media) => setCoverImage(media.url)} categoryId="services" />}
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Gallery</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((g, i) => (
                    <div key={i} className="relative aspect-square border rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.url} alt="" className="object-cover w-full h-full" />
                      <button type="button" onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1"><Trash size={12} /></button>
                    </div>
                  ))}
                </div>
                <ImageUploader onUploadSuccess={(media) => setGallery([...gallery, {id: media.id, url: media.url}])} categoryId="services" />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Icon</Label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Relations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Related Projects</Label>
                <div className="max-h-48 overflow-y-auto border p-3 rounded-md space-y-2 text-sm">
                  {allProjects.map((p) => {
                    const title = p.translations?.find((t: { locale: string; title: string }) => t.locale === "id")?.title || "Untitled";
                    return (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={projectIds.includes(p.id)} onChange={(e) => {
                          if (e.target.checked) setProjectIds([...projectIds, p.id]);
                          else setProjectIds(projectIds.filter(id => id !== p.id));
                        }} />
                        {title}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related Services</Label>
                <div className="max-h-48 overflow-y-auto border p-3 rounded-md space-y-2 text-sm">
                  {allServices.map((s) => {
                    const title = s.translations?.find((t: { locale: string; title: string }) => t.locale === "id")?.title || "Untitled";
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={relatedIds.includes(s.id)} onChange={(e) => {
                          if (e.target.checked) setRelatedIds([...relatedIds, s.id]);
                          else setRelatedIds(relatedIds.filter(id => id !== s.id));
                        }} />
                        {title}
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/services")}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Service"}
        </Button>
      </div>
    </form>
  );
}
