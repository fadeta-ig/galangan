"use client";

import { useState, useTransition } from "react";
import { updateHomepageSection } from "./actions";
import { FloppyDisk, CaretDown, CaretUp } from "@phosphor-icons/react";
import type { HomepageSection } from "@prisma/client";
import LanguageTabs from "@/components/admin/ui/LanguageTabs";
import RichTextEditor from "@/components/admin/ui/RichTextEditor";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUploader from "@/components/admin/ui/ImageUploader";

type HomepageSectionConfig = {
  bgImage?: string;
};

function SectionEditor({ section }: { section: HomepageSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [titleId, setTitleId] = useState(section.titleId || "");
  const [titleEn, setTitleEn] = useState(section.titleEn || "");
  const [contentId, setContentId] = useState(section.contentId || "");
  const [contentEn, setContentEn] = useState(section.contentEn || "");
  const [isActive, setIsActive] = useState(section.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(section.sortOrder ?? 0);

  const config = JSON.parse(section.config || "{}") as HomepageSectionConfig;
  const [bgImage, setBgImage] = useState(config.bgImage || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    
    formData.set("titleId", titleId);
    formData.set("titleEn", titleEn);
    formData.set("contentId", contentId);
    formData.set("contentEn", contentEn);
    formData.set("isActive", isActive.toString());
    formData.set("sortOrder", sortOrder.toString());
    
    const updatedConfig = { ...config, bgImage };
    formData.set("config", JSON.stringify(updatedConfig));

    startTransition(async () => {
      const res = await updateHomepageSection(section.id as string, formData);
      setMessage({ type: res.success ? "success" : "error", text: res.message });
      if (res.success) {
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  const formatSectionType = (type: string) => {
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <Card size="sm" className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-card px-3 py-2.5 transition-colors hover:bg-accent/50 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
            {section.sortOrder}
          </span>
          <div className="text-sm font-medium text-foreground">{formatSectionType(section.sectionType)}</div>
        </div>
        {isOpen ? <CaretUp className="size-4 text-muted-foreground" /> : <CaretDown className="size-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"} className={message.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <LanguageTabs>
              {(locale) => {
                const isId = locale === "id";
                return (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Headline ({locale.toUpperCase()})</Label>
                      <Input
                        type="text"
                        name={isId ? "titleId" : "titleEn"}
                        value={isId ? titleId : titleEn}
                        onChange={(e) => isId ? setTitleId(e.target.value) : setTitleEn(e.target.value)}
                        placeholder="Leave blank to use default"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description / Content ({locale.toUpperCase()})</Label>
                      {section.sectionType === "hero" || section.sectionType === "cta" ? (
                        <Textarea
                          name={isId ? "contentId" : "contentEn"}
                          value={isId ? contentId : contentEn}
                          onChange={(e) => isId ? setContentId(e.target.value) : setContentEn(e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <RichTextEditor 
                          content={isId ? contentId : contentEn}
                          onChange={isId ? setContentId : setContentEn}
                        />
                      )}
                    </div>
                  </div>
                );
              }}
            </LanguageTabs>

            <div className="grid grid-cols-1 gap-5 border-t border-border pt-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Label>Visibility</Label>
                <div className="flex items-center gap-2">
                  <Switch 
                    id={`isActive-${section.id}`} 
                    checked={isActive} 
                    onCheckedChange={setIsActive} 
                  />
                  <Label htmlFor={`isActive-${section.id}`} className="font-normal text-muted-foreground">
                    Active (Show on Homepage)
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full sm:w-24"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Background Image</Label>
              {bgImage && (
                <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <Image src={bgImage} alt="Preview" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2 h-7 px-2 text-xs"
                    onClick={() => setBgImage("")}
                  >
                    Remove
                  </Button>
                </div>
              )}
              {!bgImage && (
                <ImageUploader
                  onUploadSuccess={(media) => setBgImage(media.url)}
                  categoryId="homepage"
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
                {isPending ? "Saving..." : "Save Section"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

export default function HomepageClient({ sections }: { sections: HomepageSection[] }) {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionEditor key={section.id} section={section} />
      ))}
    </div>
  );
}
