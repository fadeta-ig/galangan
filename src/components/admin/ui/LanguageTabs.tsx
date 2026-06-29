"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LanguageTabsProps = {
  children: (activeLocale: "id" | "en") => React.ReactNode;
};

export default function LanguageTabs({ children }: LanguageTabsProps) {
  const [activeLocale, setActiveLocale] = useState<"id" | "en">("id");

  return (
    <Tabs
      value={activeLocale}
      onValueChange={(v) => setActiveLocale(v as "id" | "en")}
      className="w-full"
    >
      <TabsList className="h-9">
        <TabsTrigger value="id" className="text-xs px-4">
          ID - Indonesia
        </TabsTrigger>
        <TabsTrigger value="en" className="text-xs px-4">
          EN - English
        </TabsTrigger>
      </TabsList>
      <TabsContent value="id" className="mt-4">
        {children("id")}
      </TabsContent>
      <TabsContent value="en" className="mt-4">
        {children("en")}
      </TabsContent>
    </Tabs>
  );
}
