import { prisma } from "@/lib/prisma";
import type { SeoMeta } from "@prisma/client";
import ServiceForm from "./ServiceForm";
import { notFound } from "next/navigation";
import { Wrench } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit Service | Admin CMS",
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  
  let service = null;

  if (!isNew) {
    service = await prisma.service.findUnique({
      where: { id },
      include: { 
        translations: true,
        gallery: {
          include: { media: true },
          orderBy: { sortOrder: "asc" }
        },
        projectServices: true,
        relatedServices: true,
      },
    });

    if (!service) {
      notFound();
    }
  }

  const categories = await prisma.serviceCategory.findMany({
    include: { translations: true },
    orderBy: { sortOrder: "asc" },
  });

  const allProjects = await prisma.project.findMany({
    include: { translations: { where: { locale: "id" } } },
    orderBy: { sortOrder: "asc" }
  });

  const allServices = await prisma.service.findMany({
    where: { id: { not: isNew ? undefined : id } },
    include: { translations: { where: { locale: "id" } } },
    orderBy: { sortOrder: "asc" }
  });

  let seoMeta: SeoMeta[] = [];
  if (!isNew) {
    seoMeta = await prisma.seoMeta.findMany({
      where: { entityType: "service", entityId: id }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create New Service" : "Edit Service"}
        description={isNew ? "Add a new service offering to the website." : "Modify existing service details."}
        icon={<Wrench className="size-5" weight="fill" />}
      />
      
      <ServiceForm 
        serviceId={id} 
        initialData={service} 
        categories={categories} 
        allProjects={allProjects}
        allServices={allServices}
        seoMeta={seoMeta}
      />
    </div>
  );
}
