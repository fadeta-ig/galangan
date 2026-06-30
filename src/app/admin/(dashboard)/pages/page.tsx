import { prisma } from "@/lib/prisma";
import { deletePage } from "./actions";
import PagesClient from "./PagesClient";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import type { Prisma, ContentStatus } from "@prisma/client";

export const metadata = {
  title: "Pages | Admin CMS",
};

export default async function PagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { page, search, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const where: Prisma.PageWhereInput = {};
  
  if (search) {
    where.translations = {
      some: {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
        ]
      }
    };
  }

  if (status && status !== "ALL") {
    const validStatuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    if (validStatuses.includes(status as ContentStatus)) {
      where.status = status as ContentStatus;
    }
  }

  const [pages, totalCount] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { translations: true },
    }),
    prisma.page.count({ where }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Pages"
        description="Manage custom pages and legal content."
        icon={<FileText className="size-5" weight="fill" />}
      />

      <PagesClient
        pages={pages}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        searchQuery={search || ""}
        statusFilter={status || "ALL"}
        deleteAction={deletePage}
      />
    </div>
  );
}
