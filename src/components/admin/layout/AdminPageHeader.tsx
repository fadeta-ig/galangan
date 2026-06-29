import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow = "",
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[11px] font-semibold leading-4 text-[#6b7280]">
            {eyebrow}
          </div>
        )}
        <div className="truncate text-[24px] font-semibold leading-8 tracking-normal text-[#171b23]">
          {title}
        </div>
        {description && (
          <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#6b7280]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
