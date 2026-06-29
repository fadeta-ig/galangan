import { prisma } from "@/lib/prisma";
import { deleteService } from "./actions";
import ServicesClient from "./ServicesClient";
import { Wrench } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Services | Admin CMS",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const [services, totalCount] = await Promise.all([
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        translations: true,
        category: {
          include: { translations: true },
        },
      },
    }),
    prisma.service.count(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Services"
        description="Manage company services, their details, and categories."
        icon={<Wrench className="size-5" weight="fill" />}
      />
      
      <ServicesClient 
        services={services} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
        deleteAction={deleteService}
      />
    </div>
  );
}
