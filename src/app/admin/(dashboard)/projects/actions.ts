"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function deleteProject(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!project) return;

  await prisma.project.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "archive",
      module: "project",
      targetId: id,
      targetTitle: project.translations.find(t => t.locale === "id")?.title || "Project",
    }
  });

  revalidatePath("/admin/projects");
  revalidatePath("/id/pengalaman");
  revalidatePath("/en/experience");
}
