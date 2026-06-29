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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/admin/ui/ImageUploader";

export type Option = { id: string; title: string; url?: string | null };

type HomepageSectionConfig = {
  bgImage?: string;
  contentSelection?: "latest" | "featured" | "manual";
  selectedIds?: string[];
  selectedMediaIds?: string[];
  ctaPrimaryLabelId?: string;
  ctaPrimaryLabelEn?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryLabelId?: string;
  ctaSecondaryLabelEn?: string;
  ctaSecondaryUrl?: string;
};

type HomepageClientProps = {
  sections: HomepageSection[];
  options: {
    services: Option[];
    projects: Option[];
    news: Option[];
    media: Option[];
  };
};

function SectionEditor({ section, options }: { section: HomepageSection; options: HomepageClientProps["options"] }) {
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
  const [contentSelection, setContentSelection] = useState<string>(config.contentSelection || "featured");
  const [selectedIds, setSelectedIds] = useState<string[]>(config.selectedIds || []);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(config.selectedMediaIds || []);

  const [ctaPrimaryLabelId, setCtaPrimaryLabelId] = useState(config.ctaPrimaryLabelId || "");
  const [ctaPrimaryLabelEn, setCtaPrimaryLabelEn] = useState(config.ctaPrimaryLabelEn || "");
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(config.ctaPrimaryUrl || "");
  
  const [ctaSecondaryLabelId, setCtaSecondaryLabelId] = useState(config.ctaSecondaryLabelId || "");
  const [ctaSecondaryLabelEn, setCtaSecondaryLabelEn] = useState(config.ctaSecondaryLabelEn || "");
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(config.ctaSecondaryUrl || "");

  const optionsKey = section.sectionType === "experience" ? "projects" : section.sectionType;
  const hasContentSelection = ["services", "projects", "experience", "news", "gallery"].includes(section.sectionType) || optionsKey in options;
  const availableOptions = hasContentSelection ? options[optionsKey as keyof typeof options] || [] : [];
  
  // Hardcoded for gallery if sectionType is media/gallery, but we'll use `media`
  const selectionOptions = section.sectionType === "gallery" || section.sectionType === "media" 
    ? options.media 
    : availableOptions;

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
    
    const updatedConfig: HomepageSectionConfig = {
      ...config,
      bgImage,
      contentSelection: contentSelection as "latest" | "featured" | "manual",
      selectedIds,
      selectedMediaIds,
      ctaPrimaryLabelId,
      ctaPrimaryLabelEn,
      ctaPrimaryUrl,
      ctaSecondaryLabelId,
      ctaSecondaryLabelEn,
      ctaSecondaryUrl,
    };
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      {section.sectionType === "hero" || section.sectionType === "cta" || section.sectionType === "services" || section.sectionType === "statistics" || section.sectionType === "news" || section.sectionType === "experience" ? (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2 border p-3 rounded-md">
                        <Label>Primary CTA ({locale.toUpperCase()})</Label>
                        <Input
                          placeholder="Label (e.g. Learn More)"
                          value={isId ? ctaPrimaryLabelId : ctaPrimaryLabelEn}
                          onChange={(e) => isId ? setCtaPrimaryLabelId(e.target.value) : setCtaPrimaryLabelEn(e.target.value)}
                        />
                        {isId && (
                           <Input
                             placeholder="URL (e.g. /services)"
                             value={ctaPrimaryUrl}
                             onChange={(e) => setCtaPrimaryUrl(e.target.value)}
                           />
                        )}
                      </div>
                      <div className="space-y-2 border p-3 rounded-md">
                        <Label>Secondary CTA ({locale.toUpperCase()})</Label>
                        <Input
                          placeholder="Label (e.g. Contact Us)"
                          value={isId ? ctaSecondaryLabelId : ctaSecondaryLabelEn}
                          onChange={(e) => isId ? setCtaSecondaryLabelId(e.target.value) : setCtaSecondaryLabelEn(e.target.value)}
                        />
                        {isId && (
                           <Input
                             placeholder="URL (e.g. /contact)"
                             value={ctaSecondaryUrl}
                             onChange={(e) => setCtaSecondaryUrl(e.target.value)}
                           />
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            </LanguageTabs>

            {hasContentSelection && (
              <div className="space-y-3 border-t border-border pt-4">
                <Label>Content Selection Mode</Label>
                <Select value={contentSelection} onValueChange={setContentSelection}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured Items</SelectItem>
                    <SelectItem value="latest">Latest Items</SelectItem>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                  </SelectContent>
                </Select>

                {contentSelection === "manual" && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border border-border p-3 rounded-md bg-muted/20">
                    <Label className="mb-2 block text-xs text-muted-foreground">Select items to display:</Label>
                    {selectionOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No items available.</p>
                    ) : (
                      selectionOptions.map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-sm">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
                            checked={selectedIds.includes(opt.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds([...selectedIds, opt.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== opt.id));
                            }}
                          />
                          <span className="flex-1 truncate">{opt.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {section.sectionType === "experience" && (
              <div className="space-y-3 border-t border-border pt-4">
                <Label>Media / Gallery Selection (7 images recommended)</Label>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border border-border p-3 rounded-md bg-muted/20">
                  <Label className="mb-2 block text-xs text-muted-foreground">Select media items for the gallery:</Label>
                  {options.media.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No media available.</p>
                  ) : (
                    options.media.map(opt => (
                      <label key={opt.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-sm">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
                          checked={selectedMediaIds.includes(opt.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMediaIds([...selectedMediaIds, opt.id]);
                            else setSelectedMediaIds(selectedMediaIds.filter(id => id !== opt.id));
                          }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {opt.url && <img src={opt.url} alt={opt.title} className="w-8 h-8 object-cover rounded" />}
                        <span className="flex-1 truncate">{opt.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

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

export default function HomepageClient({ sections, options }: HomepageClientProps) {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionEditor key={section.id} section={section} options={options} />
      ))}
    </div>
  );
}
