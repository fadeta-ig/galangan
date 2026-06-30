import { prisma } from "@/lib/prisma";
import type { SeoMeta } from "@prisma/client";
import PageForm from "./PageForm";
import { notFound } from "next/navigation";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit Page | Admin CMS",
};

export default async function EditPageAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let page = null;
  let seoMeta: SeoMeta[] = [];

  if (!isNew) {
    page = await prisma.page.findUnique({
      where: { id },
      include: { translations: true, sections: { orderBy: { sortOrder: "asc" } } },
    });

    if (!page) {
      notFound();
    }

    seoMeta = await prisma.seoMeta.findMany({
      where: { entityType: "page", entityId: id }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create Page" : "Edit Page"}
        description={isNew ? "Create a new bilingual page." : "Update page content and settings."}
        icon={<FileText className="size-5" weight="fill" />}
      />

      <PageForm pageId={id} initialData={page} seoMeta={seoMeta} />
    </div>
  );
}
