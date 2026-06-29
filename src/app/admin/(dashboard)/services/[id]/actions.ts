"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { revalidatePath } from "next/cache";

export async function saveService(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    
    // Core fields
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as import("@prisma/client").ServiceStatus;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isFeatured = formData.get("isFeatured") === "true";
    const coverImage = formData.get("coverImage") as string || null;
    const icon = formData.get("icon") as string || null;

    // Translation ID
    const titleId = formData.get("title_id") as string;
    const slugId = formData.get("slug_id") as string;
    const shortDescId = formData.get("shortDesc_id") as string;
    const fullDescId = sanitizeRichText(formData.get("fullDesc_id") as string);
    
    // Translation EN
    const titleEn = formData.get("title_en") as string;
    const slugEn = formData.get("slug_en") as string;
    const shortDescEn = formData.get("shortDesc_en") as string;
    const fullDescEn = sanitizeRichText(formData.get("fullDesc_en") as string);

    const data = {
      categoryId: categoryId || null,
      status,
      sortOrder,
      isFeatured,
      coverImage,
      icon,
    };

    let serviceId = id;

    if (isNew) {
      const created = await prisma.service.create({
        data: {
          ...data,
          translations: {
            create: [
              { locale: "id", title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId },
              { locale: "en", title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn },
            ]
          }
        }
      });
      serviceId = created.id;
    } else {
      await prisma.service.update({
        where: { id },
        data,
      });

      // Update ID translation
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: id, locale: "id" } },
        update: { title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId },
        create: { serviceId: id, locale: "id", title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId },
      });

      // Update EN translation
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: id, locale: "en" } },
        update: { title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn },
        create: { serviceId: id, locale: "en", title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "service",
        targetId: serviceId,
        targetTitle: titleId,
      }
    });

    revalidatePath("/admin/services");
    revalidatePath("/id/layanan");
    revalidatePath("/en/services");
    
    return { success: true, message: "Service saved successfully" };
  } catch (error: unknown) {
    console.error("Save service error:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === 'P2002') {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save service" };
  }
}
