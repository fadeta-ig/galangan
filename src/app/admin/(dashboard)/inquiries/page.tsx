import { prisma } from "@/lib/prisma";
import { deleteInquiry, updateInquiryStatus, updateInquiryNote } from "./actions";
import InquiriesClient from "./InquiriesClient";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import type { Prisma, InquiryStatus } from "@prisma/client";

export const metadata = {
  title: "Inquiries | Admin CMS",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { page, search, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const where: Prisma.InquiryWhereInput = {};
  
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { companyName: { contains: search } },
      { subject: { contains: search } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status as InquiryStatus;
  }

  const [inquiries, totalCount] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inquiry.count({ where }),
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
        searchQuery={search || ""}
        statusFilter={status || "ALL"}
        deleteAction={deleteInquiry}
        updateStatusAction={updateInquiryStatus}
        updateNoteAction={updateInquiryNote}
      />
    </div>
  );
}
