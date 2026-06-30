"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Prisma, SeoMeta } from "@prisma/client";
import { savePage } from "./actions";
import { FloppyDisk, Trash, DotsSixVertical } from "@phosphor-icons/react";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import SeoForm from "@/components/admin/ui/SeoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type PageFormData = Prisma.PageGetPayload<{
  include: { translations: true; sections: true };
}>;

type SectionState = {
  id: string;
  sectionType: string;
  contentId: string;
  contentEn: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  sortOrder: number;
  isActive: boolean;
};

export default function PageForm({ 
  pageId, 
  initialData,
  seoMeta = []
}: { 
  pageId: string; 
  initialData?: PageFormData | null; 
  seoMeta?: SeoMeta[];
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

  const initialSections: SectionState[] = (initialData?.sections || []).map((s) => ({
    id: s.id,
    sectionType: s.sectionType,
    contentId: s.contentId,
    contentEn: s.contentEn,
    config: s.config ? JSON.parse(s.config) : {},
    sortOrder: s.sortOrder,
    isActive: s.isActive
  }));

  const [sections, setSections] = useState<SectionState[]>(initialSections);

  const addSection = (type: string) => {
    setSections([
      ...sections,
      {
        id: `new_${Date.now()}`,
        sectionType: type,
        contentId: "",
        contentEn: "",
        config: {},
        sortOrder: sections.length * 10,
        isActive: true,
      }
    ]);
  };

  const updateSection = (id: string, updates: Partial<SectionState>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const seoId = seoMeta.find(s => s.locale === "id") || {} as SeoMeta;
  const seoEn = seoMeta.find(s => s.locale === "en") || {} as SeoMeta;

  const [ogImageId, setOgImageId] = useState(seoId.ogImage || "");
  const [ogImageEn, setOgImageEn] = useState(seoEn.ogImage || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("heroImage", heroImage);
    formData.set("content_id", contentId);
    formData.set("content_en", contentEn);
    formData.set("status", status);

    formData.set("sectionsData", JSON.stringify(sections));
    formData.set("ogImage_id", ogImageId);
    formData.set("ogImage_en", ogImageEn);

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
          <Tabs defaultValue="sections">
            <TabsList className="mb-4">
              <TabsTrigger value="sections">Section Builder</TabsTrigger>
              <TabsTrigger value="content">Legacy Content</TabsTrigger>
              <TabsTrigger value="seo">SEO Meta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Page Title & Intro</CardTitle>
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
                            <Label>Intro Content (Optional)</Label>
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
            </TabsContent>

            <TabsContent value="sections">
              <Card>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium">Page Sections</CardTitle>
                  <div className="flex gap-2">
                    <Select onValueChange={addSection} value="none">
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="Add Section..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>-- Choose Type --</SelectItem>
                        <SelectItem value="text">Text Block</SelectItem>
                        <SelectItem value="image">Image Block</SelectItem>
                        <SelectItem value="gallery">Gallery</SelectItem>
                        <SelectItem value="cta">Call To Action</SelectItem>
                        <SelectItem value="custom">Custom HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                      No sections added yet. Add a section to start building this page.
                    </div>
                  )}

                  {sections.map((section) => (
                    <div key={section.id} className="border rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab active:cursor-grabbing text-slate-400">
                            <DotsSixVertical size={20} />
                          </div>
                          <span className="font-semibold uppercase text-xs tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                            {section.sectionType}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Sort:</Label>
                            <Input 
                              type="number" 
                              className="w-16 h-7 text-xs" 
                              value={section.sortOrder} 
                              onChange={(e) => updateSection(section.id, { sortOrder: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Active:</Label>
                            <Switch 
                              checked={section.isActive} 
                              onCheckedChange={(checked) => updateSection(section.id, { isActive: checked })}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon-sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>

                      <LanguageTabs>
                        {(locale) => {
                          const isId = locale === "id";
                          
                          if (section.sectionType === "text" || section.sectionType === "custom") {
                            return (
                              <div className="space-y-2 mt-2">
                                <Label>{section.sectionType === "text" ? "Content" : "Custom HTML"}</Label>
                                {section.sectionType === "text" ? (
                                  <RichTextEditor 
                                    content={isId ? section.contentId : section.contentEn}
                                    onChange={(val) => updateSection(section.id, { [isId ? 'contentId' : 'contentEn']: val })}
                                  />
                                ) : (
                                  <Textarea 
                                    className="font-mono text-sm"
                                    rows={6}
                                    value={isId ? section.contentId : section.contentEn}
                                    onChange={(e) => updateSection(section.id, { [isId ? 'contentId' : 'contentEn']: e.target.value })}
                                  />
                                )}
                              </div>
                            );
                          }

                          if (section.sectionType === "cta") {
                            return (
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="col-span-2 space-y-2">
                                  <Label>Headline</Label>
                                  <Input 
                                    value={isId ? section.contentId : section.contentEn} 
                                    onChange={(e) => updateSection(section.id, { [isId ? 'contentId' : 'contentEn']: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Button Label</Label>
                                  <Input 
                                    value={section.config[`btnLabel_${locale}`] || ""} 
                                    onChange={(e) => updateSection(section.id, { config: { ...section.config, [`btnLabel_${locale}`]: e.target.value } })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Button URL</Label>
                                  <Input 
                                    value={section.config[`btnUrl_${locale}`] || ""} 
                                    onChange={(e) => updateSection(section.id, { config: { ...section.config, [`btnUrl_${locale}`]: e.target.value } })}
                                  />
                                </div>
                              </div>
                            );
                          }

                          if (isId) {
                            if (section.sectionType === "image") {
                              return (
                                <div className="space-y-2 mt-2">
                                  <Label>Image</Label>
                                  {section.config.url ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded border max-w-sm">
                                      <Image src={section.config.url} alt="Section Image" fill className="object-cover" />
                                      <Button type="button" variant="destructive" size="sm" className="absolute right-2 top-2 h-6 px-2 text-xs" onClick={() => updateSection(section.id, { config: { ...section.config, url: null } })}>Remove</Button>
                                    </div>
                                  ) : (
                                    <ImageUploader onUploadSuccess={(media) => updateSection(section.id, { config: { ...section.config, url: media.url } })} categoryId="pages" />
                                  )}
                                </div>
                              );
                            }

                            if (section.sectionType === "gallery") {
                              const galleryImages = section.config.images || [];
                              return (
                                <div className="space-y-2 mt-2">
                                  <Label>Gallery Images</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                    {galleryImages.map((img: string, idx: number) => (
                                      <div key={idx} className="relative aspect-square border rounded overflow-hidden">
                                        <Image src={img} alt="Gallery" fill className="object-cover" />
                                        <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-sm p-1 text-xs" onClick={() => {
                                          const newArr = [...galleryImages];
                                          newArr.splice(idx, 1);
                                          updateSection(section.id, { config: { ...section.config, images: newArr } });
                                        }}><Trash size={12}/></button>
                                      </div>
                                    ))}
                                  </div>
                                  <ImageUploader onUploadSuccess={(media) => updateSection(section.id, { config: { ...section.config, images: [...galleryImages, media.url] } })} categoryId="pages" />
                                </div>
                              );
                            }
                          }
                          
                          return <div className="text-xs text-muted-foreground mt-2">This section type uses shared non-text configuration (see ID tab).</div>;
                        }}
                      </LanguageTabs>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <SeoForm 
                seoId={seoId as any} 
                seoEn={seoEn as any} 
                ogImageId={ogImageId} 
                ogImageEn={ogImageEn} 
                setOgImageId={setOgImageId} 
                setOgImageEn={setOgImageEn} 
                mediaCategoryId="pages"
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
                <Label>Hero Image (Optional)</Label>
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
