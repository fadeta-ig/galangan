"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function deleteGalleryItem(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  const media = await prisma.media.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!media) return;

  await prisma.media.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "delete",
      module: "gallery",
      targetId: id,
      targetTitle: media.translations.find((t) => t.locale === "id")?.title || media.originalName,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/id/gallery");
  revalidatePath("/en/gallery");
}
