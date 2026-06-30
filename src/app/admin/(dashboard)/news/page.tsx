import { prisma } from "@/lib/prisma";
import { deleteNews } from "./actions";
import NewsClient from "./NewsClient";
import { Newspaper } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import type { Prisma, ContentStatus } from "@prisma/client";

export const metadata = {
  title: "News | Admin CMS",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { page, search, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const where: Prisma.NewsPostWhereInput = {};
  
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
    where.status = status as ContentStatus;
  }

  const [newsList, totalCount] = await Promise.all([
    prisma.newsPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        translations: true,
        author: true,
      },
    }),
    prisma.newsPost.count({ where }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="News & Articles"
        description="Manage company news and blog posts."
        icon={<Newspaper className="size-5" weight="fill" />}
      />
      
      <NewsClient 
        news={newsList} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
        searchQuery={search || ""}
        statusFilter={status || "ALL"}
        deleteAction={deleteNews}
      />
    </div>
  );
}
