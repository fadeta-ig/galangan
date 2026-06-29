"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function toggleSubscriberStatus(id: string, isActive: boolean) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) return;

  await prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive },
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "update",
      module: "newsletter",
      targetId: id,
      details: `Updated subscriber status to ${isActive}`,
    }
  });

  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriber(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  await prisma.newsletterSubscriber.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "delete",
      module: "newsletter",
      targetId: id,
    }
  });

  revalidatePath("/admin/newsletter");
}
