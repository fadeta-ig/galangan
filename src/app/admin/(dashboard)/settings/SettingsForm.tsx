"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "./actions";
import { FloppyDisk } from "@phosphor-icons/react";
import type { SiteSetting } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import Image from "next/image";

export default function SettingsForm({ settings }: { settings: SiteSetting[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ success: boolean; message: string } | null>(null);

  const getVal = (key: string) => settings.find((s) => s.key === key)?.value || "";
  
  const [siteLogo, setSiteLogo] = useState(getVal("site_logo"));
  const [siteFavicon, setSiteFavicon] = useState(getVal("site_favicon"));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("site_logo", siteLogo);
    formData.set("site_favicon", siteFavicon);
    
    startTransition(async () => {
      const res = await updateSiteSettings(formData);
      setMessage(res);
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message?.message && (
        <Alert variant={message.success ? "default" : "destructive"} className={message.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}>
          <AlertDescription>{message.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-medium">General Information</CardTitle>
          <CardDescription>Basic information about the shipyard.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Site Logo</Label>
              <div className="mt-2">
                {siteLogo ? (
                  <div className="relative aspect-video w-full max-w-[200px] overflow-hidden rounded-lg border border-border bg-slate-50">
                    <Image src={siteLogo} alt="Logo" fill className="object-contain p-2" sizes="200px" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={() => setSiteLogo("")}
                    >
                      <FloppyDisk className="size-3" /> {/* Using whatever icon, maybe X but Floppy is imported, let's use a text 'X' or import X */}
                    </Button>
                  </div>
                ) : (
                  <ImageUploader onUploadSuccess={(m) => setSiteLogo(m.url)} categoryId="general" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Site Favicon</Label>
              <div className="mt-2">
                {siteFavicon ? (
                  <div className="relative aspect-square w-[100px] overflow-hidden rounded-lg border border-border bg-slate-50">
                    <Image src={siteFavicon} alt="Favicon" fill className="object-cover" sizes="100px" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-1 top-1 h-5 w-5 rounded-full"
                      onClick={() => setSiteFavicon("")}
                    >
                      X
                    </Button>
                  </div>
                ) : (
                  <ImageUploader onUploadSuccess={(m) => setSiteFavicon(m.url)} categoryId="general" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                type="text"
                name="site_name"
                defaultValue={getVal("site_name")}
              />
            </div>
            <div className="space-y-2">
              <Label>Site Tagline (ID)</Label>
              <Input
                type="text"
                name="site_tagline_id"
                defaultValue={getVal("site_tagline_id")}
              />
            </div>
            <div className="space-y-2">
              <Label>Site Tagline (EN)</Label>
              <Input
                type="text"
                name="site_tagline_en"
                defaultValue={getVal("site_tagline_en")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-medium">Contact & Location</CardTitle>
          <CardDescription>Details shown in footer and contact page.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                name="company_email"
                defaultValue={getVal("company_email")}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="text"
                name="company_phone"
                defaultValue={getVal("company_phone")}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number (e.g. 62812...)</Label>
              <Input
                type="text"
                name="company_whatsapp"
                defaultValue={getVal("company_whatsapp")}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Company Address</Label>
              <Textarea
                name="company_address"
                rows={3}
                defaultValue={getVal("company_address")}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Hours (ID)</Label>
              <Input
                type="text"
                name="business_hours_id"
                defaultValue={getVal("business_hours_id")}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Hours (EN)</Label>
              <Input
                type="text"
                name="business_hours_en"
                defaultValue={getVal("business_hours_en")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-medium">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                type="url"
                name="social_linkedin"
                defaultValue={getVal("social_linkedin")}
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                type="url"
                name="social_instagram"
                defaultValue={getVal("social_instagram")}
              />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                type="url"
                name="social_facebook"
                defaultValue={getVal("social_facebook")}
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input
                type="url"
                name="social_youtube"
                defaultValue={getVal("social_youtube")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-medium">SEO Defaults</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <Label>Default Meta Title (ID)</Label>
              <Input
                type="text"
                name="default_meta_title_id"
                defaultValue={getVal("default_meta_title_id")}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Default Meta Description (ID)</Label>
              <Textarea
                name="default_meta_description_id"
                rows={2}
                defaultValue={getVal("default_meta_description_id")}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Default Meta Title (EN)</Label>
              <Input
                type="text"
                name="default_meta_title_en"
                defaultValue={getVal("default_meta_title_en")}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Default Meta Description (EN)</Label>
              <Textarea
                name="default_meta_description_en"
                rows={2}
                defaultValue={getVal("default_meta_description_en")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
