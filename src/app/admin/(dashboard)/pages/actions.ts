"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function deletePage(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!page) return;

  await prisma.page.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "archive",
      module: "page",
      targetId: id,
      targetTitle: page.translations.find((t) => t.locale === "id")?.title || "Page",
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/id/pages");
  revalidatePath("/en/pages");
}
