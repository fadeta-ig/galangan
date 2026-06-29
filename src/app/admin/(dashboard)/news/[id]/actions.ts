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

function getPublishDate(formData: FormData): Date {
  const rawDate = getString(formData, "publishDate");
  if (!rawDate) return new Date();

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveNews(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    const status = getContentStatus(getString(formData, "status"));

    if (!status) {
      return { success: false, message: "Invalid news status" };
    }

    const isFeatured = formData.get("isFeatured") === "true";
    const featuredImage = getOptionalString(formData, "featuredImage");
    const publishDate = getPublishDate(formData);

    const titleId = getString(formData, "title_id");
    const slugId = getString(formData, "slug_id");
    const excerptId = getString(formData, "excerpt_id");
    const contentId = sanitizeRichText(getString(formData, "content_id"));

    const titleEn = getString(formData, "title_en");
    const slugEn = getString(formData, "slug_en");
    const excerptEn = getString(formData, "excerpt_en");
    const contentEn = sanitizeRichText(getString(formData, "content_en"));

    if (!titleId || !slugId || !titleEn || !slugEn) {
      return { success: false, message: "Title and slug are required for both languages" };
    }

    const newsData = {
      status,
      isFeatured,
      featuredImage,
      publishDate,
      author: { connect: { id: authorization.session.user.id } },
    };

    const newsId = await prisma.$transaction(async (tx) => {
      const savedPost = isNew
        ? await tx.newsPost.create({
            data: {
              ...newsData,
              translations: {
                create: [
                  { locale: Locale.id, title: titleId, slug: slugId, excerpt: excerptId, content: contentId },
                  { locale: Locale.en, title: titleEn, slug: slugEn, excerpt: excerptEn, content: contentEn },
                ],
              },
            },
          })
        : await tx.newsPost.update({
            where: { id },
            data: newsData,
          });

      await tx.newsPostTranslation.upsert({
        where: { postId_locale: { postId: savedPost.id, locale: Locale.id } },
        update: { title: titleId, slug: slugId, excerpt: excerptId, content: contentId },
        create: {
          postId: savedPost.id,
          locale: Locale.id,
          title: titleId,
          slug: slugId,
          excerpt: excerptId,
          content: contentId,
        },
      });

      await tx.newsPostTranslation.upsert({
        where: { postId_locale: { postId: savedPost.id, locale: Locale.en } },
        update: { title: titleEn, slug: slugEn, excerpt: excerptEn, content: contentEn },
        create: {
          postId: savedPost.id,
          locale: Locale.en,
          title: titleEn,
          slug: slugEn,
          excerpt: excerptEn,
          content: contentEn,
        },
      });

      return savedPost.id;
    });

    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "news",
        targetId: newsId,
        targetTitle: titleId,
      },
    });

    revalidatePath("/admin/news");
    revalidatePath("/id/berita");
    revalidatePath("/en/news");

    return { success: true, message: "News saved successfully" };
  } catch (error: unknown) {
    console.error("Save news error:", error);
    if (isUniqueConstraintError(error)) {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save news" };
  }
}
