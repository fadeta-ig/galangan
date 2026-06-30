"use client";

import Image from "next/image";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent } from "@/components/ui/card";

export type SeoMetaData = {
  locale: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
};

interface SeoFormProps {
  seoId: SeoMetaData;
  seoEn: SeoMetaData;
  ogImageId: string;
  ogImageEn: string;
  setOgImageId: (val: string) => void;
  setOgImageEn: (val: string) => void;
  mediaCategoryId?: string;
}

export default function SeoForm({
  seoId,
  seoEn,
  ogImageId,
  ogImageEn,
  setOgImageId,
  setOgImageEn,
  mediaCategoryId = "general",
}: SeoFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <LanguageTabs>
          {(locale) => {
            const isId = locale === "id";
            const seo = isId ? seoId : seoEn;
            const suffix = isId ? "_id" : "_en";
            const ogImage = isId ? ogImageId : ogImageEn;
            const setOgImage = isId ? setOgImageId : setOgImageEn;

            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input name={`seoTitle${suffix}`} defaultValue={seo?.metaTitle || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea name={`seoDesc${suffix}`} defaultValue={seo?.metaDescription || ""} />
                </div>
                <div className="space-y-2">
                  <Label>OG Title</Label>
                  <Input name={`ogTitle${suffix}`} defaultValue={seo?.ogTitle || ""} />
                </div>
                <div className="space-y-2">
                  <Label>OG Description</Label>
                  <Textarea name={`ogDesc${suffix}`} defaultValue={seo?.ogDescription || ""} />
                </div>
                <div className="space-y-2">
                  <Label>OG Image</Label>
                  <input type="hidden" name={`ogImage${suffix}`} value={ogImage} />
                  {ogImage ? (
                    <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
                      <Image src={ogImage} alt="OG Image" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        className="absolute right-2 top-2 h-7 px-2" 
                        onClick={() => setOgImage("")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <ImageUploader 
                      onUploadSuccess={(media) => setOgImage(media.url)} 
                      categoryId={mediaCategoryId} 
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Canonical URL</Label>
                  <Input name={`canonical${suffix}`} defaultValue={seo?.canonicalUrl || ""} />
                </div>
              </div>
            );
          }}
        </LanguageTabs>
      </CardContent>
    </Card>
  );
}
