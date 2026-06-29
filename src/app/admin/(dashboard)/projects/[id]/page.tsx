import { prisma } from "@/lib/prisma";
import type { SeoMeta } from "@prisma/client";
import ProjectForm from "./ProjectForm";
import { notFound } from "next/navigation";
import { Anchor } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit Project | Admin CMS",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  
  let project = null;

  if (!isNew) {
    project = await prisma.project.findUnique({
      where: { id },
      include: {
        translations: true,
        projectServices: true,
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    if (!project) {
      notFound();
    }
  }

  const [categories, services] = await Promise.all([
    prisma.projectCategory.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  let seoMeta: SeoMeta[] = [];
  if (!isNew) {
    seoMeta = await prisma.seoMeta.findMany({
      where: { entityType: "project", entityId: id }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create New Project" : "Edit Project"}
        description={isNew ? "Add a new portfolio project." : "Modify existing project details."}
        icon={<Anchor className="size-5" weight="fill" />}
      />
      
      <ProjectForm 
        projectId={id} 
        initialData={project} 
        categories={categories} 
        services={services} 
        seoMeta={seoMeta}
      />
    </div>
  );
}
