"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Gear,
  Users,
  Browser,
  Wrench,
  Anchor,
  Newspaper,
  Images,
  Envelope,
  SignOut,
  FolderOpen,
  FileText,
  List,
  EnvelopeSimple,
  ClipboardText,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

const contentItems = [
  { name: "Dashboard", href: "/admin", icon: SquaresFour },
  { name: "Homepage Builder", href: "/admin/homepage", icon: Browser },
  { name: "Services", href: "/admin/services", icon: Wrench },
  { name: "Projects", href: "/admin/projects", icon: Anchor },
  { name: "News", href: "/admin/news", icon: Newspaper },
  { name: "Gallery", href: "/admin/gallery", icon: Images },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Media Library", href: "/admin/media", icon: FolderOpen },
] as const;

const operationItems = [
  { name: "Inquiries", href: "/admin/inquiries", icon: Envelope },
  { name: "Newsletter", href: "/admin/newsletter", icon: EnvelopeSimple },
  { name: "Audit Log", href: "/admin/audit", icon: ClipboardText },
] as const;

const adminItems = [
  { name: "Users", href: "/admin/users", icon: Users, requireSuperAdmin: true },
  { name: "Settings", href: "/admin/settings", icon: Gear, requireSuperAdmin: false },
] as const;

function getInitials(name?: string | null): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRole(role?: string): string {
  if (!role) return "Admin";
  return role.replace(/_/g, " ").toLowerCase();
}

type NavItem = {
  readonly name: string;
  readonly href: string;
  readonly icon: typeof SquaresFour;
  readonly requireSuperAdmin?: boolean;
};

function SidebarContent({
  userRole,
  user,
  onNavigate,
}: {
  userRole: string;
  user?: SidebarUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-all duration-200",
          active
            ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200/50"
            : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-900"
        )}
      >
        <item.icon
          className={cn(
            "size-[16px] shrink-0 transition-colors",
            active
              ? "text-slate-900"
              : "text-slate-400 group-hover:text-slate-900"
          )}
          weight={active ? "fill" : "regular"}
        />
        <span className="truncate">{item.name}</span>
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-slate-900" />
        )}
      </Link>
    );
  };

  const renderSection = (label: string, items: readonly NavItem[]) => (
    <div className="space-y-1.5">
      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="space-y-1">{items.map(renderNavItem)}</div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-white font-sans text-slate-900">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <GlobeHemisphereWest className="size-5" weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold leading-5 tracking-tight text-slate-900">
            Galangan Kapal
          </p>
          <p className="text-[11px] font-medium text-slate-500">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6 scrollbar-hide">
        {renderSection("Content", contentItems)}
        {renderSection("Operations", operationItems)}

        <Separator className="bg-slate-100 my-4" />

        {renderSection(
          "System",
          adminItems.filter(
            (item) => !item.requireSuperAdmin || userRole === "SUPER_ADMIN"
          )
        )}
      </nav>

      {/* Footer Profile */}
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-slate-900">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-[11px] capitalize font-medium text-slate-500">
              {formatRole(user?.role)}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.replace("/admin/login");
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
            title="Sign Out"
          >
            <SignOut className="size-4" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebarTrigger({
  userRole,
  user,
}: {
  userRole: string;
  user?: SidebarUser;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
          <List className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[260px] border-r-0 bg-white p-0 [&>button]:text-slate-500 [&>button]:hover:text-slate-900"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent
          userRole={userRole}
          user={user}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

export default function Sidebar({
  userRole,
  user,
}: {
  userRole: string;
  user?: SidebarUser;
}) {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <SidebarContent userRole={userRole} user={user} />
    </aside>
  );
}
