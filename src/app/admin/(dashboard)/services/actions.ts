"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function deleteService(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!service) return;

  await prisma.service.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "archive",
      module: "service",
      targetId: id,
      targetTitle: service.translations.find(t => t.locale === "id")?.title || "Service",
    }
  });

  revalidatePath("/admin/services");
  revalidatePath("/id/layanan");
  revalidatePath("/en/services");
}
