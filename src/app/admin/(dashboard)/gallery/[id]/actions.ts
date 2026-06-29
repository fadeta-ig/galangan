"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";
import { Locale } from "@prisma/client";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function normalizeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
}

export async function saveGalleryItem(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    const mediaType = getString(formData, "mediaType") || "image";
    const categoryId = getOptionalString(formData, "categoryId");
    const isFeatured = formData.get("isFeatured") === "true";
    const sortOrder = Number.parseInt(getString(formData, "sortOrder"), 10) || 0;

    const titleId = getString(formData, "title_id");
    const captionId = getString(formData, "caption_id");
    const altTextId = getString(formData, "altText_id");

    const titleEn = getString(formData, "title_en");
    const captionEn = getString(formData, "caption_en");
    const altTextEn = getString(formData, "altText_en");

    const url = getString(formData, "url");
    const embedUrlRaw = getString(formData, "embedUrl");
    const embedUrl = mediaType === "video" ? normalizeEmbedUrl(embedUrlRaw) : null;

    if (mediaType === "image" && !url) {
      return { success: false, message: "Image URL is required" };
    }

    if (mediaType === "video" && !embedUrl) {
      return { success: false, message: "Valid video embed URL is required" };
    }

    const mediaUrl = mediaType === "video" ? embedUrl! : url;
    const filename = isNew
      ? `gallery-${Date.now()}`
      : (await prisma.media.findUnique({ where: { id } }))?.filename || `gallery-${Date.now()}`;

    const mediaData = {
      filename,
      originalName: titleId || titleEn || filename,
      mimeType: mediaType === "video" ? "video/embed" : "image/jpeg",
      size: 0,
      url: mediaUrl,
      thumbnailUrl: mediaType === "video" ? null : url,
      mediaType,
      embedUrl,
      categoryId,
      isFeatured,
      sortOrder,
    };

    const mediaId = await prisma.$transaction(async (tx) => {
      const saved = isNew
        ? await tx.media.create({ data: mediaData })
        : await tx.media.update({ where: { id }, data: mediaData });

      await tx.mediaTranslation.upsert({
        where: { mediaId_locale: { mediaId: saved.id, locale: Locale.id } },
        update: { title: titleId, caption: captionId, altText: altTextId },
        create: {
          mediaId: saved.id,
          locale: Locale.id,
          title: titleId,
          caption: captionId,
          altText: altTextId,
        },
      });

      await tx.mediaTranslation.upsert({
        where: { mediaId_locale: { mediaId: saved.id, locale: Locale.en } },
        update: { title: titleEn, caption: captionEn, altText: altTextEn },
        create: {
          mediaId: saved.id,
          locale: Locale.en,
          title: titleEn,
          caption: captionEn,
          altText: altTextEn,
        },
      });

      return saved.id;
    });

    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "gallery",
        targetId: mediaId,
        targetTitle: titleId || titleEn,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/id/gallery");
    revalidatePath("/en/gallery");

    return { success: true, message: "Gallery item saved successfully" };
  } catch (error) {
    console.error("Save gallery item error:", error);
    return { success: false, message: "Failed to save gallery item" };
  }
}
