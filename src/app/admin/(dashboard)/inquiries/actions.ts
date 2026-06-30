"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const authorization = await authorizeAdmin("inquiry:update");
  if (!authorization.authorized) return;

  await prisma.inquiry.update({
    where: { id },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "update",
      module: "inquiry",
      targetId: id,
      details: `Updated inquiry status to ${status}`,
    }
  });

  revalidatePath("/admin/inquiries");
}

export async function updateInquiryNote(id: string, internalNotes: string) {
  const authorization = await authorizeAdmin("inquiry:update");
  if (!authorization.authorized) return;

  await prisma.inquiry.update({
    where: { id },
    data: { internalNotes },
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "update",
      module: "inquiry",
      targetId: id,
      details: "Updated inquiry internal notes",
    }
  });

  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  const authorization = await authorizeAdmin("inquiry:delete");
  if (!authorization.authorized) return;

  await prisma.inquiry.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "archive",
      module: "inquiry",
      targetId: id,
    }
  });

  revalidatePath("/admin/inquiries");
}
