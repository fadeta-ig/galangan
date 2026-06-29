import { prisma } from "@/lib/prisma";
import type { SeoMeta } from "@prisma/client";
import NewsForm from "./NewsForm";
import { notFound } from "next/navigation";
import { Newspaper } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit News | Admin CMS",
};

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  
  let news = null;

  if (!isNew) {
    news = await prisma.newsPost.findUnique({
      where: { id },
      include: { 
        translations: true,
        tags: { include: { tag: { include: { translations: true } } } },
        relatedPosts: true,
      },
    });

    if (!news) {
      notFound();
    }
  }

  const [categories, allPosts] = await Promise.all([
    prisma.newsCategory.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.newsPost.findMany({
      where: { status: "PUBLISHED", id: { not: isNew ? undefined : id } },
      include: { translations: { where: { locale: "id" } } },
      orderBy: { publishDate: "desc" },
    }),
  ]);

  let seoMeta: SeoMeta[] = [];
  if (!isNew) {
    seoMeta = await prisma.seoMeta.findMany({
      where: { entityType: "news", entityId: id }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create New Article" : "Edit Article"}
        description={isNew ? "Publish a new blog post or news article." : "Modify existing article details."}
        icon={<Newspaper className="size-5" weight="fill" />}
      />
      
      <NewsForm 
        newsId={id} 
        initialData={news} 
        categories={categories}
        allPosts={allPosts}
        seoMeta={seoMeta}
      />
    </div>
  );
}
