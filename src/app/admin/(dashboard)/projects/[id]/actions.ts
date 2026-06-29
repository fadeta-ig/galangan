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

function getOptionalInteger(formData: FormData, key: string): number | null {
  const value = getString(formData, key);
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getContentStatus(value: string): ContentStatus | null {
  return Object.values(ContentStatus).includes(value as ContentStatus)
    ? (value as ContentStatus)
    : null;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveProject(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    const status = getContentStatus(getString(formData, "status"));

    if (!status) {
      return { success: false, message: "Invalid project status" };
    }

    const categoryId = getOptionalString(formData, "categoryId");
    const coverImage = getOptionalString(formData, "coverImage");
    const sortOrder = getOptionalInteger(formData, "sortOrder") ?? 0;
    
    const clientName = getOptionalString(formData, "clientName");
    const showClientName = formData.get("showClientName") === "true";
    const projectYear = getOptionalInteger(formData, "projectYear");
    const vesselType = getOptionalString(formData, "vesselType");
    const location = getOptionalString(formData, "location");
    const isFeatured = formData.get("isFeatured") === "true";

    const titleId = getString(formData, "title_id");
    const slugId = getString(formData, "slug_id");
    const shortDescId = getString(formData, "shortDesc_id");
    const fullDescId = sanitizeRichText(getString(formData, "fullDesc_id"));
    const scopeSummaryId = sanitizeRichText(getString(formData, "scopeSummary_id"));

    const titleEn = getString(formData, "title_en");
    const slugEn = getString(formData, "slug_en");
    const shortDescEn = getString(formData, "shortDesc_en");
    const fullDescEn = sanitizeRichText(getString(formData, "fullDesc_en"));
    const scopeSummaryEn = sanitizeRichText(getString(formData, "scopeSummary_en"));

    if (!titleId || !slugId || !titleEn || !slugEn) {
      return { success: false, message: "Title and slug are required for both languages" };
    }

    let serviceIds: string[] = [];
    try { serviceIds = JSON.parse(getString(formData, "serviceIds") || "[]"); } catch {}

    let galleryData: { id: string, isBefore: boolean }[] = [];
    try { galleryData = JSON.parse(getString(formData, "galleryData") || "[]"); } catch {}

    const projectData = {
      coverImage,
      status,
      sortOrder,
      clientName,
      showClientName,
      projectYear,
      vesselType,
      location,
      isFeatured,
      projectServices: {
        deleteMany: {},
        create: serviceIds.map(sid => ({ serviceId: sid }))
      },
      gallery: {
        deleteMany: {},
        create: galleryData.map((item, index) => ({ mediaId: item.id, isBefore: item.isBefore, sortOrder: index }))
      },
    };

    let savedProjectId = id;

    if (isNew) {
      const created = await prisma.project.create({
        data: {
          ...projectData,
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          translations: {
            create: [
              { locale: Locale.id, title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId, scopeSummary: scopeSummaryId },
              { locale: Locale.en, title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn, scopeSummary: scopeSummaryEn },
            ],
          },
        },
      });
      savedProjectId = created.id;
    } else {
      await prisma.project.update({
        where: { id },
        data: {
          ...projectData,
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        },
      });

      await prisma.projectTranslation.upsert({
        where: { projectId_locale: { projectId: savedProjectId, locale: Locale.id } },
        update: { title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId, scopeSummary: scopeSummaryId },
        create: {
          projectId: savedProjectId,
          locale: Locale.id,
          title: titleId,
          slug: slugId,
          shortDescription: shortDescId,
          fullDescription: fullDescId,
          scopeSummary: scopeSummaryId,
        },
      });

      await prisma.projectTranslation.upsert({
        where: { projectId_locale: { projectId: savedProjectId, locale: Locale.en } },
        update: { title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn, scopeSummary: scopeSummaryEn },
        create: {
          projectId: savedProjectId,
          locale: Locale.en,
          title: titleEn,
          slug: slugEn,
          shortDescription: shortDescEn,
          fullDescription: fullDescEn,
          scopeSummary: scopeSummaryEn,
        },
      });
    }

    // SEO Meta
    const locales = ["id", "en"] as const;
    for (const loc of locales) {
      const metaTitle = formData.get(`seoTitle_${loc}`) as string || null;
      const metaDesc = formData.get(`seoDesc_${loc}`) as string || null;
      const ogTitle = formData.get(`ogTitle_${loc}`) as string || null;
      const ogDesc = formData.get(`ogDesc_${loc}`) as string || null;
      const ogImage = formData.get(`ogImage_${loc}`) as string || null;
      const canonicalUrl = formData.get(`canonical_${loc}`) as string || null;
      
      await prisma.seoMeta.upsert({
        where: { entityType_entityId_locale: { entityType: "project", entityId: savedProjectId, locale: loc } },
        update: { metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl },
        create: { entityType: "project", entityId: savedProjectId, locale: loc, metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "project",
        targetId: savedProjectId,
        targetTitle: titleId,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/id/pengalaman");
    revalidatePath("/en/experience");
    revalidatePath(`/id/experience/${slugId}`);
    revalidatePath(`/en/experience/${slugEn}`);

    return { success: true, message: "Project saved successfully" };
  } catch (error: unknown) {
    console.error("Save project error:", error);
    if (isUniqueConstraintError(error)) {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save project" };
  }
}
