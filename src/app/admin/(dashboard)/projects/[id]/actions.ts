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
    const serviceId = getOptionalString(formData, "serviceId");
    const coverImage = getOptionalString(formData, "coverImage");
    const sortOrder = getOptionalInteger(formData, "sortOrder") ?? 0;
    const clientName = getOptionalString(formData, "clientName");
    const projectYear = getOptionalInteger(formData, "projectYear");

    const titleId = getString(formData, "title_id");
    const slugId = getString(formData, "slug_id");
    const fullDescId = sanitizeRichText(getString(formData, "fullDesc_id"));
    const scopeSummaryId = sanitizeRichText(getString(formData, "scopeSummary_id"));
    const scopeSummaryEn = sanitizeRichText(getString(formData, "scopeSummary_en"));

    const titleEn = getString(formData, "title_en");
    const slugEn = getString(formData, "slug_en");
    const fullDescEn = sanitizeRichText(getString(formData, "fullDesc_en"));

    if (!titleId || !slugId || !titleEn || !slugEn) {
      return { success: false, message: "Title and slug are required for both languages" };
    }

    const projectData = {
      coverImage,
      status,
      sortOrder,
      clientName,
      projectYear,
    };

    const projectId = await prisma.$transaction(async (tx) => {
      const savedProject = isNew
        ? await tx.project.create({
            data: {
              ...projectData,
              ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
              translations: {
                create: [
                  { locale: Locale.id, title: titleId, slug: slugId, fullDescription: fullDescId, scopeSummary: scopeSummaryId },
                  { locale: Locale.en, title: titleEn, slug: slugEn, fullDescription: fullDescEn, scopeSummary: scopeSummaryEn },
                ],
              },
            },
          })
        : await tx.project.update({
            where: { id },
            data: {
              ...projectData,
              category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
            },
          });

      await tx.projectService.deleteMany({
        where: { projectId: savedProject.id },
      });

      if (serviceId) {
        await tx.projectService.create({
          data: {
            projectId: savedProject.id,
            serviceId,
          },
        });
      }

      await tx.projectTranslation.upsert({
        where: { projectId_locale: { projectId: savedProject.id, locale: Locale.id } },
        update: { title: titleId, slug: slugId, fullDescription: fullDescId, scopeSummary: scopeSummaryId },
        create: {
          projectId: savedProject.id,
          locale: Locale.id,
          title: titleId,
          slug: slugId,
          fullDescription: fullDescId,
          scopeSummary: scopeSummaryId,
        },
      });

      await tx.projectTranslation.upsert({
        where: { projectId_locale: { projectId: savedProject.id, locale: Locale.en } },
        update: { title: titleEn, slug: slugEn, fullDescription: fullDescEn, scopeSummary: scopeSummaryEn },
        create: {
          projectId: savedProject.id,
          locale: Locale.en,
          title: titleEn,
          slug: slugEn,
          fullDescription: fullDescEn,
          scopeSummary: scopeSummaryEn,
        },
      });

      return savedProject.id;
    });

    await prisma.auditLog.create({
      data: {
        userId: authorization.session.user.id,
        action: isNew ? "create" : "update",
        module: "project",
        targetId: projectId,
        targetTitle: titleId,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/id/pengalaman");
    revalidatePath("/en/experience");

    return { success: true, message: "Project saved successfully" };
  } catch (error: unknown) {
    console.error("Save project error:", error);
    if (isUniqueConstraintError(error)) {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save project" };
  }
}
