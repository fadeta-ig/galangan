import { prisma } from "@/lib/prisma";
import { deleteNews } from "./actions";
import NewsClient from "./NewsClient";
import { Newspaper } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "News | Admin CMS",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const [newsList, totalCount] = await Promise.all([
    prisma.newsPost.findMany({
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        translations: true,
        author: true,
      },
    }),
    prisma.newsPost.count(),
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
        deleteAction={deleteNews}
      />
    </div>
  );
}
