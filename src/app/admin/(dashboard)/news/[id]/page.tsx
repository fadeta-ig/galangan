import { prisma } from "@/lib/prisma";
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
      include: { translations: true },
    });

    if (!news) {
      notFound();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create New Article" : "Edit Article"}
        description={isNew ? "Publish a new blog post or news article." : "Modify existing article details."}
        icon={<Newspaper className="size-5" weight="fill" />}
      />
      
      <NewsForm newsId={id} initialData={news} />
    </div>
  );
}
