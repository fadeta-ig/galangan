import { prisma } from "@/lib/prisma";
import { deletePage } from "./actions";
import PagesClient from "./PagesClient";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Pages | Admin CMS",
};

export default async function PagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const [pages, totalCount] = await Promise.all([
    prisma.page.findMany({
      orderBy: { sortOrder: "asc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { translations: true },
    }),
    prisma.page.count(),
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
        deleteAction={deletePage}
      />
    </div>
  );
}
