"use client";

import { useState } from "react";
import * as Icons from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { MagnifyingGlass } from "@phosphor-icons/react";

const ICON_NAMES = [
  "Anchor", "Wrench", "ShieldCheck", "PaintBrush", "MagnifyingGlass", "Nut", 
  "Ship", "Users", "Gear", "Browser", "Newspaper", "FileText", "CheckCircle", 
  "Lightning", "Briefcase", "MapPin", "Phone", "Envelope", "Compass", "Drop",
  "Engine", "Factory", "GasPump", "HardDrives", "Headset", "Lifebuoy",
  "Lightbulb", "MapTrifold", "Package", "Ruler", "Scales", "Thermometer",
  "Toolbox", "Truck", "Warning", "Waves", "Archive", "Barcode", "ChartBar",
  "Cube", "Globe", "Wrench", "VideoCamera", "Screwdriver"
];

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredIcons = Array.from(new Set(ICON_NAMES)).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // Safely get icon component
  const CurrentIcon = value && value in Icons ? Icons[value as keyof typeof Icons] as React.ElementType : null;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start gap-2 h-10 px-3">
          {CurrentIcon ? (
            <>
              <CurrentIcon className="size-5 shrink-0" weight="fill" />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Select an icon...</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden" aria-describedby={undefined}>
        <div className="sr-only">
          <DialogTitle>Select Icon</DialogTitle>
        </div>
        <div className="flex items-center border-b px-3">
          <MagnifyingGlass className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-12 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="overflow-y-auto h-[300px] p-4">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((name) => {
              if (!(name in Icons)) return null;
              const IconComp = Icons[name as keyof typeof Icons] as React.ElementType;
              if (!IconComp) return null;
              
              return (
                <Button
                  key={name}
                  variant={value === name ? "default" : "outline"}
                  className="flex size-12 items-center justify-center p-0 hover:bg-primary/10 hover:border-primary/20 transition-all"
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                  }}
                  title={name}
                  type="button"
                >
                  <IconComp className="size-6" weight={value === name ? "fill" : "duotone"} />
                </Button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-6 py-10 text-center text-sm text-muted-foreground">
                No icons found.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
