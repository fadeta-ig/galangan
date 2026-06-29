"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveNews } from "./actions";
import { Prisma } from "@prisma/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Trans = {
  locale: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
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

export default function NewsForm({ 
  newsId, 
  initialData,
  categories = [],
  allPosts = [],
  seoMeta = [],
}: { 
  newsId: string; 
  initialData?: Prisma.NewsPostGetPayload<{
    include: { 
      translations: true;
      tags: { include: { tag: { include: { translations: true } } } };
      relatedPosts: true;
    }
  }> | null;
  categories?: Prisma.NewsCategoryGetPayload<{ include: { translations: true } }>[];
  allPosts?: Prisma.NewsPostGetPayload<{ include: { translations: true } }>[];
  seoMeta?: SeoMeta[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "DRAFT");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId ?? "none");
  
  const translations = initialData?.translations || [];
  const idTrans = translations.find((t: Trans) => t.locale === "id") || ({} as Trans);
  const enTrans = translations.find((t: Trans) => t.locale === "en") || ({} as Trans);

  const [contentId, setContentId] = useState(idTrans?.content ?? "");
  const [contentEn, setContentEn] = useState(enTrans?.content ?? "");

  // Extract initial tags
  const initialTagsId = (initialData?.tags || []).map(t => t.tag?.translations?.find(tr => tr.locale === "id")?.name).filter(Boolean).join(", ");
  const initialTagsEn = (initialData?.tags || []).map(t => t.tag?.translations?.find(tr => tr.locale === "en")?.name).filter(Boolean).join(", ");

  const [tagsId, setTagsId] = useState(initialTagsId);
  const [tagsEn, setTagsEn] = useState(initialTagsEn);

  // Extract initial related posts
  const initialRelatedPosts = (initialData?.relatedPosts || []).map(rp => rp.id);
  const [relatedPosts, setRelatedPosts] = useState<string[]>(initialRelatedPosts);

  const seoId = seoMeta.find(s => s.locale === "id") || {} as SeoMeta;
  const seoEn = seoMeta.find(s => s.locale === "en") || {} as SeoMeta;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    formData.set("featuredImage", featuredImage);
    formData.set("content_id", contentId);
    formData.set("content_en", contentEn);
    formData.set("status", status);
    formData.set("categoryId", categoryId === "none" ? "" : categoryId);
    formData.set("isFeatured", isFeatured.toString());
    formData.set("tags_id", tagsId);
    formData.set("tags_en", tagsEn);
    formData.set("relatedPosts", JSON.stringify(relatedPosts));

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
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Article Content</TabsTrigger>
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
                            <Input type="text" name={`title${suffix}`} defaultValue={trans.title || ""} required />
                          </div>
                          <div className="space-y-2">
                            <Label>URL Slug</Label>
                            <Input type="text" name={`slug${suffix}`} defaultValue={trans.slug || ""} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Textarea name={`excerpt${suffix}`} defaultValue={trans.excerpt || ""} rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Tags (Comma separated)</Label>
                            <Input 
                              type="text" 
                              value={isId ? tagsId : tagsEn}
                              onChange={(e) => isId ? setTagsId(e.target.value) : setTagsEn(e.target.value)}
                              placeholder="industri, maritim, inovasi"
                            />
                            <p className="text-xs text-muted-foreground">Separate tags with a comma.</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Full Article</Label>
                            <RichTextEditor content={isId ? contentId : contentEn} onChange={isId ? setContentId : setContentEn} />
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
                      const name = c.translations?.find(t => t.locale === "id")?.name || c.id;
                      return <SelectItem key={c.id} value={c.id}>{name}</SelectItem>;
                    })}
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
                  <ImageUploader onUploadSuccess={(media) => setFeaturedImage(media.url)} categoryId="news" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Related Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto border p-3 rounded-md space-y-2 text-sm">
                {allPosts.map((p) => {
                  const title = p.translations?.find(t => t.locale === "id")?.title || "Untitled";
                  return (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={relatedPosts.includes(p.id)} onChange={(e) => {
                        if (e.target.checked) setRelatedPosts([...relatedPosts, p.id]);
                        else setRelatedPosts(relatedPosts.filter(id => id !== p.id));
                      }} />
                      <span className="line-clamp-1">{title}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/news")}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save News"}
        </Button>
      </div>
    </form>
  );
}
