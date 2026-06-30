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
  Users,
  ImageSquare,
  Plus
} from "@phosphor-icons/react/dist/ssr";

const statConfig = [
  { key: "pages", label: "Published Pages", href: "/admin/pages", icon: Browser },
  { key: "services", label: "Published Services", href: "/admin/services", icon: Wrench },
  { key: "projects", label: "Published Projects", href: "/admin/projects", icon: Anchor },
  { key: "news", label: "Published News", href: "/admin/news", icon: Newspaper },
  { key: "media", label: "Gallery Media", href: "/admin/media", icon: ImageSquare },
  { key: "inquiries", label: "New Inquiries", href: "/admin/inquiries", icon: EnvelopeOpen },
  { key: "subscribers", label: "Subscribers", href: "/admin/newsletter", icon: Users },
] as const;

const quickActions = [
  { label: "Create Page", href: "/admin/pages/new", icon: Browser },
  { label: "Create Service", href: "/admin/services/new", icon: Wrench },
  { label: "Create Project", href: "/admin/projects/new", icon: Anchor },
  { label: "Create News", href: "/admin/news/new", icon: Newspaper },
  { label: "Upload Media", href: "/admin/media", icon: FolderOpen },
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
    publishedPages,
    publishedServices,
    publishedProjects,
    publishedNews,
    mediaCount,
    newInquiries,
    subscribersCount,
    recentInquiries,
    draftPages,
    draftServices,
    draftProjects,
    draftNews
  ] = await Promise.all([
    prisma.page.count({ where: { status: "PUBLISHED" } }),
    prisma.service.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.newsPost.count({ where: { status: "PUBLISHED" } }),
    prisma.media.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.count(),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.page.findMany({
      where: { status: "DRAFT" },
      include: { translations: { where: { locale: "id" } } },
      take: 3,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.service.findMany({
      where: { status: "DRAFT" },
      include: { translations: { where: { locale: "id" } } },
      take: 3,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.project.findMany({
      where: { status: "DRAFT" },
      include: { translations: { where: { locale: "id" } } },
      take: 3,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.newsPost.findMany({
      where: { status: "DRAFT" },
      include: { translations: { where: { locale: "id" } } },
      take: 3,
      orderBy: { updatedAt: "desc" }
    }),
  ]);

  const counts: Record<string, number> = {
    pages: publishedPages,
    services: publishedServices,
    projects: publishedProjects,
    news: publishedNews,
    media: mediaCount,
    inquiries: newInquiries,
    subscribers: subscribersCount,
  };

  // Merge and sort drafts
  const recentDrafts = [
    ...draftPages.map(p => ({ 
      id: p.id, 
      title: p.translations[0]?.title || 'Untitled Page', 
      type: 'Page', 
      updatedAt: p.updatedAt, 
      href: `/admin/pages/${p.id}` 
    })),
    ...draftServices.map(s => ({ 
      id: s.id, 
      title: s.translations[0]?.title || 'Untitled Service', 
      type: 'Service', 
      updatedAt: s.updatedAt, 
      href: `/admin/services/${s.id}` 
    })),
    ...draftProjects.map(p => ({ 
      id: p.id, 
      title: p.translations[0]?.title || 'Untitled Project', 
      type: 'Project', 
      updatedAt: p.updatedAt, 
      href: `/admin/projects/${p.id}` 
    })),
    ...draftNews.map(n => ({ 
      id: n.id, 
      title: n.translations[0]?.title || 'Untitled News', 
      type: 'News', 
      updatedAt: n.updatedAt, 
      href: `/admin/news/${n.id}` 
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan performa CMS, pengelolaan draft, dan inkuiri pelanggan."
        icon={<SquaresFour className="size-5" weight="fill" />}
        actions={
          <Button asChild size="sm" className="h-8 px-3">
            <Link href="/admin/inquiries">
              Review inquiries
              {newInquiries > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1.5 text-[10px]">
                  {newInquiries}
                </Badge>
              )}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <Link key={stat.key} href={stat.href} className="group">
            <Card size="sm" className="h-full rounded-xl border border-[#e7eaf0] bg-white py-0 shadow-sm transition-all hover:shadow-md hover:border-cyan/30">
              <CardContent className="flex items-center gap-4 px-5 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan group-hover:bg-cyan group-hover:text-white transition-colors">
                  <stat.icon className="size-5" weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-navy">
                    {counts[stat.key]}
                  </p>
                </div>
                <ArrowRight className="size-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-cyan" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {/* Recent Inquiries */}
          <Card size="sm" className="rounded-xl border border-[#e7eaf0] bg-white py-0 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#e7eaf0] px-5 py-4 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-navy">Recent Inquiries</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-[#e7eaf0] hover:bg-transparent">
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500">Name</TableHead>
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500">Subject</TableHead>
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-slate-400">
                      Belum ada inkuiri masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="border-[#eef1f4] hover:bg-slate-50/80">
                      <TableCell className="px-5 py-3.5 text-xs font-medium text-navy">{inquiry.fullName}</TableCell>
                      <TableCell className="max-w-[280px] truncate px-5 py-3.5 text-xs text-slate-600">
                        {inquiry.subject}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <Badge variant={getStatusVariant(inquiry.status)} className="text-[10px] uppercase tracking-wider h-5">
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs text-slate-500 text-right">
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
            <div className="border-t border-[#e7eaf0] px-4 py-3 bg-slate-50/30">
              <Button asChild variant="ghost" size="sm" className="w-full justify-center text-cyan hover:text-cyan-dark hover:bg-cyan/5">
                <Link href="/admin/inquiries">
                  Lihat Semua Inkuiri
                  <ArrowRight className="ml-2 size-3.5" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Recent Drafts */}
          <Card size="sm" className="rounded-xl border border-[#e7eaf0] bg-white py-0 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#e7eaf0] px-5 py-4 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-navy">Draft Terbaru</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-[#e7eaf0] hover:bg-transparent">
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500">Judul Konten</TableHead>
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500">Tipe</TableHead>
                  <TableHead className="h-10 px-5 text-xs font-semibold text-slate-500 text-right">Terakhir Diubah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDrafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-sm text-slate-400">
                      Tidak ada draft konten yang tertunda.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDrafts.map((draft) => (
                    <TableRow key={draft.id} className="border-[#eef1f4] hover:bg-slate-50/80 cursor-pointer transition-colors">
                      <TableCell className="px-5 py-3.5">
                        <Link href={draft.href} className="block text-xs font-medium text-navy hover:text-cyan transition-colors">
                          {draft.title}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-500 border-slate-200 bg-slate-50">
                          {draft.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs text-slate-500 text-right">
                        {new Date(draft.updatedAt).toLocaleDateString("id-ID", {
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
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card size="sm" className="rounded-xl border border-[#e7eaf0] bg-white py-0 shadow-sm">
            <CardHeader className="border-b border-[#e7eaf0] px-5 py-4 bg-slate-50/50">
              <CardTitle className="text-[15px] font-semibold text-navy">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-4 py-4">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-11 justify-start bg-white text-xs font-medium text-slate-600 hover:text-cyan hover:border-cyan/30 hover:bg-cyan/5 transition-colors border-slate-200"
                >
                  <Link href={action.href}>
                    <div className="flex size-6 items-center justify-center rounded bg-slate-100 mr-2 text-slate-500">
                      <Plus className="size-3" weight="bold" />
                    </div>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
