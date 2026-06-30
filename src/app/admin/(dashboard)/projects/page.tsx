import { prisma } from "@/lib/prisma";
import { deleteProject } from "./actions";
import ProjectsClient from "./ProjectsClient";
import { Anchor } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import type { Prisma, ContentStatus } from "@prisma/client";

export const metadata = {
  title: "Projects | Admin CMS",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { page, search, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const where: Prisma.ProjectWhereInput = {};
  
  if (search) {
    where.OR = [
      { clientName: { contains: search } },
      { vesselType: { contains: search } },
      { location: { contains: search } },
      {
        translations: {
          some: {
            OR: [
              { title: { contains: search } },
              { slug: { contains: search } },
            ]
          }
        }
      }
    ];
  }

  if (status && status !== "ALL") {
    const validStatuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    if (validStatuses.includes(status as ContentStatus)) {
      where.status = status as ContentStatus;
    }
  }

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
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
    prisma.project.count({ where }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Projects (Experience)"
        description="Manage portfolio projects and past experiences."
        icon={<Anchor className="size-5" weight="fill" />}
      />
      
      <ProjectsClient 
        projects={projects} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
        searchQuery={search || ""}
        statusFilter={status || "ALL"}
        deleteAction={deleteProject}
      />
    </div>
  );
}
