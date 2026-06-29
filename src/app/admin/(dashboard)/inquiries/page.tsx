import { prisma } from "@/lib/prisma";
import { deleteInquiry, updateInquiryStatus } from "./actions";
import InquiriesClient from "./InquiriesClient";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Inquiries | Admin CMS",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const [inquiries, totalCount] = await Promise.all([
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inquiry.count(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Inquiries"
        description="Manage messages and leads from the contact form."
        icon={<Envelope className="size-5" weight="fill" />}
      />
      
      <InquiriesClient 
        inquiries={inquiries} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
        deleteAction={deleteInquiry}
        updateStatusAction={updateInquiryStatus}
      />
    </div>
  );
}
