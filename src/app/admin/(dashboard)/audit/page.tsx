import { prisma } from "@/lib/prisma";
import AuditLogsClient from "./AuditLogsClient";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Audit Log | Admin CMS",
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 20;

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Audit Log"
        description="System activity tracking (Super Admin only)."
        icon={<ShieldCheck className="size-5" weight="fill" />}
      />
      
      <AuditLogsClient 
        logs={logs} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
