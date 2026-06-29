import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Anchor,
  ArrowRight,
  Browser,
  EnvelopeOpen,
  FolderOpen,
  Newspaper,
  SquaresFour,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";

const statConfig = [
  { key: "services", label: "Services", href: "/admin/services", icon: Wrench },
  { key: "projects", label: "Projects", href: "/admin/projects", icon: Anchor },
  { key: "news", label: "News Articles", href: "/admin/news", icon: Newspaper },
  { key: "inquiries", label: "Inquiries", href: "/admin/inquiries", icon: EnvelopeOpen },
] as const;

const quickActions = [
  { label: "Edit homepage", href: "/admin/homepage", icon: Browser },
  { label: "Upload media", href: "/admin/media", icon: FolderOpen },
  { label: "Add service", href: "/admin/services/new", icon: Wrench },
  { label: "Add project", href: "/admin/projects/new", icon: Anchor },
] as const;

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "NEW":
      return "destructive";
    case "READ":
      return "secondary";
    case "REPLIED":
      return "default";
    default:
      return "outline";
  }
}

export default async function AdminDashboard() {
  const [
    servicesCount,
    projectsCount,
    newsCount,
    inquiriesCount,
    newInquiriesCount,
    recentInquiries,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.project.count(),
    prisma.newsPost.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const counts: Record<string, number> = {
    services: servicesCount,
    projects: projectsCount,
    news: newsCount,
    inquiries: inquiriesCount,
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan konten, lead masuk, dan pintasan operasional CMS."
        icon={<SquaresFour className="size-5" weight="fill" />}
        actions={
          <Button asChild size="sm" className="h-8 px-3">
            <Link href="/admin/inquiries">
              Review inquiries
              {newInquiriesCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1.5 text-[10px]">
                  {newInquiriesCount}
                </Badge>
              )}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <Link key={stat.key} href={stat.href} className="group">
            <Card size="sm" className="h-full rounded-lg border border-[#e7eaf0] bg-white py-0 shadow-none transition-colors group-hover:bg-[#f8fafc]">
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f5] text-[#1f2937]">
                  <stat.icon className="size-[18px]" weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium leading-4 text-[#4b5563]">{stat.label}</p>
                  <p className="text-[24px] font-semibold leading-7 tabular-nums text-[#111827]">
                    {counts[stat.key]}
                  </p>
                </div>
                <ArrowRight className="size-4 text-[#9aa3af] opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card size="sm" className="rounded-lg border border-[#e7eaf0] bg-white py-0 shadow-none">
          <CardHeader className="border-b border-[#e7eaf0] px-4 py-3">
            <CardTitle className="text-[15px] font-semibold text-[#171b23]">Recent Inquiries</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-[#e7eaf0] bg-[#f8fafc] hover:bg-[#f8fafc]">
                <TableHead className="h-9 px-4 text-[11px] font-semibold text-[#6b7280]">Name</TableHead>
                <TableHead className="h-9 px-4 text-[11px] font-semibold text-[#6b7280]">Subject</TableHead>
                <TableHead className="h-9 px-4 text-[11px] font-semibold text-[#6b7280]">Status</TableHead>
                <TableHead className="h-9 px-4 text-[11px] font-semibold text-[#6b7280]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">
                    No inquiries yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} className="border-[#eef1f4] hover:bg-[#f8fafc]">
                    <TableCell className="px-4 py-3 text-[12px] font-medium text-[#111827]">{inquiry.fullName}</TableCell>
                    <TableCell className="max-w-[360px] truncate px-4 py-3 text-[12px] text-[#4b5563]">
                      {inquiry.subject}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant={getStatusVariant(inquiry.status)} className="text-[11px]">
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[12px] tabular-nums text-[#4b5563]">
                      {new Date(inquiry.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="border-t border-[#e7eaf0] px-3 py-2.5">
            <Button asChild variant="ghost" size="sm" className="w-full justify-between">
              <Link href="/admin/inquiries">
                Open inquiry inbox
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card size="sm" className="rounded-lg border border-[#e7eaf0] bg-white py-0 shadow-none">
          <CardHeader className="border-b border-[#e7eaf0] px-4 py-3">
            <CardTitle className="text-[15px] font-semibold text-[#171b23]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 px-3 py-3">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                asChild
                variant="outline"
                size="sm"
                className="h-10 justify-start bg-white text-[12px]"
              >
                <Link href={action.href}>
                  <action.icon className="size-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
