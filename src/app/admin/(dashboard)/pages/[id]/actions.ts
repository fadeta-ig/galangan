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

    const sectionsRaw = getString(formData, "sectionsData");
    const sections = sectionsRaw ? JSON.parse(sectionsRaw) : [];

    // SEO Data
    const seoDataId = {
      metaTitle: getOptionalString(formData, "seoTitle_id"),
      metaDescription: getOptionalString(formData, "seoDesc_id"),
      ogTitle: getOptionalString(formData, "ogTitle_id"),
      ogDescription: getOptionalString(formData, "ogDesc_id"),
      ogImage: getOptionalString(formData, "ogImage_id"),
      canonicalUrl: getOptionalString(formData, "canonical_id"),
    };

    const seoDataEn = {
      metaTitle: getOptionalString(formData, "seoTitle_en"),
      metaDescription: getOptionalString(formData, "seoDesc_en"),
      ogTitle: getOptionalString(formData, "ogTitle_en"),
      ogDescription: getOptionalString(formData, "ogDesc_en"),
      ogImage: getOptionalString(formData, "ogImage_en"),
      canonicalUrl: getOptionalString(formData, "canonical_en"),
    };

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

      // Handle Sections
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const incomingSectionIds = sections.map((s: any) => s.id).filter((i: string) => !i.startsWith("new_"));
      
      if (!isNew) {
        await tx.pageSection.deleteMany({
          where: {
            pageId: saved.id,
            id: { notIn: incomingSectionIds }
          }
        });
      }

      for (const sec of sections) {
        const secData = {
          sectionType: sec.sectionType,
          contentId: sec.sectionType === "text" ? sanitizeRichText(sec.contentId) : sec.contentId,
          contentEn: sec.sectionType === "text" ? sanitizeRichText(sec.contentEn) : sec.contentEn,
          config: JSON.stringify(sec.config),
          sortOrder: sec.sortOrder,
          isActive: sec.isActive,
        };

        if (sec.id.startsWith("new_")) {
          await tx.pageSection.create({
            data: {
              ...secData,
              pageId: saved.id,
            }
          });
        } else {
          await tx.pageSection.update({
            where: { id: sec.id },
            data: secData,
          });
        }
      }

      // Handle SEO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const upsertSeo = async (locale: Locale, data: any) => {
        await tx.seoMeta.upsert({
          where: { entityType_entityId_locale: { entityType: "page", entityId: saved.id, locale } },
          update: data,
          create: { ...data, entityType: "page", entityId: saved.id, locale },
        });
      };

      await upsertSeo(Locale.id, seoDataId);
      await upsertSeo(Locale.en, seoDataEn);

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
