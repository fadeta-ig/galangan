"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { revalidatePath } from "next/cache";
import { ContentStatus, Locale, Prisma } from "@prisma/client";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getContentStatus(value: string): ContentStatus | null {
  return Object.values(ContentStatus).includes(value as ContentStatus)
    ? (value as ContentStatus)
    : null;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function savePage(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    const status = getContentStatus(getString(formData, "status"));

    if (!status) {
      return { success: false, message: "Invalid page status" };
    }

    const heroImage = getOptionalString(formData, "heroImage");
    const sortOrder = Number.parseInt(getString(formData, "sortOrder"), 10) || 0;

    const titleId = getString(formData, "title_id");
    const slugId = getString(formData, "slug_id");
    const contentId = sanitizeRichText(getString(formData, "content_id"));

    const titleEn = getString(formData, "title_en");
    const slugEn = getString(formData, "slug_en");
    const contentEn = sanitizeRichText(getString(formData, "content_en"));

    if (!titleId || !slugId || !titleEn || !slugEn) {
      return { success: false, message: "Title and slug are required for both languages" };
    }

    const pageData = {
      heroImage,
      status,
      sortOrder,
    };

    const pageId = await prisma.$transaction(async (tx) => {
      const saved = isNew
        ? await tx.page.create({
            data: {
              ...pageData,
              translations: {
                create: [
                  { locale: Locale.id, title: titleId, slug: slugId, content: contentId },
                  { locale: Locale.en, title: titleEn, slug: slugEn, content: contentEn },
                ],
              },
            },
          })
        : await tx.page.update({
            where: { id },
            data: pageData,
          });

      if (!isNew) {
        await tx.pageTranslation.upsert({
          where: { pageId_locale: { pageId: saved.id, locale: Locale.id } },
          update: { title: titleId, slug: slugId, content: contentId },
          create: {
            pageId: saved.id,
            locale: Locale.id,
            title: titleId,
            slug: slugId,
            content: contentId,
          },
        });

        await tx.pageTranslation.upsert({
          where: { pageId_locale: { pageId: saved.id, locale: Locale.en } },
          update: { title: titleEn, slug: slugEn, content: contentEn },
          create: {
            pageId: saved.id,
            locale: Locale.en,
            title: titleEn,
            slug: slugEn,
            content: contentEn,
          },
        });
      }

      return saved.id;
    });

    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "page",
        targetId: pageId,
        targetTitle: titleId,
      },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/id/pages/${slugId}`);
    revalidatePath(`/en/pages/${slugEn}`);

    return { success: true, message: "Page saved successfully" };
  } catch (error: unknown) {
    console.error("Save page error:", error);
    if (isUniqueConstraintError(error)) {
      return { success: false, message: "Slug must be unique per locale" };
    }
    return { success: false, message: "Failed to save page" };
  }
}
