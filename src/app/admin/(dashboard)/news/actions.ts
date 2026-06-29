"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function deleteNews(id: string) {
  const authorization = await authorizeAdmin("content:delete");
  if (!authorization.authorized) return;

  const news = await prisma.newsPost.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!news) return;

  await prisma.newsPost.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: authorization.session.user.id,
      action: "archive",
      module: "news",
      targetId: id,
      targetTitle: news.translations.find(t => t.locale === "id")?.title || "News",
    }
  });

  revalidatePath("/admin/news");
  revalidatePath("/id/berita");
  revalidatePath("/en/news");
}
