"use client";

import { ArrowSquareOut, GearSix, SignOut } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarTrigger } from "./Sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

type TopbarUser = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRole(role?: string): string {
  if (!role) return "";
  return role.replace(/_/g, " ").toLowerCase();
}

const sectionLabels = [
  { href: "/admin/homepage", title: "Homepage Builder" },
  { href: "/admin/services", title: "Services" },
  { href: "/admin/projects", title: "Projects" },
  { href: "/admin/newsletter", title: "Newsletter" },
  { href: "/admin/news", title: "News & Articles" },
  { href: "/admin/gallery", title: "Gallery" },
  { href: "/admin/pages", title: "Pages" },
  { href: "/admin/media", title: "Media Library" },
  { href: "/admin/inquiries", title: "Inquiries" },
  { href: "/admin/audit", title: "Audit Log" },
  { href: "/admin/users", title: "User Management" },
  { href: "/admin/settings", title: "Site Settings" },
];

function getSectionTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  return sectionLabels.find((section) => pathname.startsWith(section.href))?.title ?? "Admin CMS";
}

export default function Topbar({ user }: { user: TopbarUser }) {
  const pathname = usePathname();
  const sectionTitle = getSectionTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border/80 bg-background/95 px-3.5 font-sans shadow-sm shadow-slate-950/5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-5">
      <div className="flex flex-1 items-center gap-3">
        <MobileSidebarTrigger userRole={user.role ?? ""} />
        <div className="min-w-0">
          <p className="hidden text-[11px] font-medium leading-4 text-muted-foreground sm:block">
            Workspace
          </p>
          <div className="truncate text-sm font-semibold leading-4 tracking-normal text-foreground">
            {sectionTitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/" target="_blank" rel="noreferrer">
            <ArrowSquareOut className="size-3.5" />
            View site
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-transparent px-1.5 text-sm outline-none transition-colors hover:border-border hover:bg-card">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-[13px] font-medium text-foreground leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize leading-tight">
                  {formatRole(user.role)}
                </span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/8 text-primary text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                <GearSix className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              <SignOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
