"use server";

import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { revalidatePath } from "next/cache";
import { ContentStatus } from "@prisma/client";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getContentStatus(value: string): ContentStatus | null {
  return Object.values(ContentStatus).includes(value as ContentStatus)
    ? (value as ContentStatus)
    : null;
}

export async function saveService(id: string, formData: FormData) {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) {
    return { success: false, message: authorization.message };
  }

  try {
    const isNew = id === "new";
    
    // Core fields
    const categoryId = formData.get("categoryId") as string;
    const status = getContentStatus(getString(formData, "status"));

    if (!status) {
      return { success: false, message: "Invalid service status" };
    }

    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isFeatured = formData.get("isFeatured") === "true";
    const coverImage = formData.get("coverImage") as string || null;
    const icon = formData.get("icon") as string || null;

    // Translation ID
    const titleId = formData.get("title_id") as string;
    const slugId = formData.get("slug_id") as string;
    const shortDescId = formData.get("shortDesc_id") as string;
    const fullDescId = sanitizeRichText(formData.get("fullDesc_id") as string);
    const benefitsId = formData.get("benefits_id") as string || "[]";
    const processStepsId = formData.get("processSteps_id") as string || "[]";
    const faqId = formData.get("faq_id") as string || "[]";
    
    // Translation EN
    const titleEn = formData.get("title_en") as string;
    const slugEn = formData.get("slug_en") as string;
    const shortDescEn = formData.get("shortDesc_en") as string;
    const fullDescEn = sanitizeRichText(formData.get("fullDesc_en") as string);
    const benefitsEn = formData.get("benefits_en") as string || "[]";
    const processStepsEn = formData.get("processSteps_en") as string || "[]";
    const faqEn = formData.get("faq_en") as string || "[]";

    // Relations
    let galleryIds: string[] = [];
    try { galleryIds = JSON.parse(formData.get("galleryIds") as string || "[]"); } catch {}
    
    let projectIds: string[] = [];
    try { projectIds = JSON.parse(formData.get("projectIds") as string || "[]"); } catch {}

    let relatedServiceIds: string[] = [];
    try { relatedServiceIds = JSON.parse(formData.get("relatedServiceIds") as string || "[]"); } catch {}

    const baseData = {
      categoryId: categoryId || null,
      status,
      sortOrder,
      isFeatured,
      coverImage,
      icon,
      projectServices: {
        deleteMany: {}, // remove old
        create: projectIds.map(projectId => ({ projectId }))
      },
      gallery: {
        deleteMany: {},
        create: galleryIds.map((mediaId, index) => ({ mediaId, sortOrder: index }))
      },
    };

    let serviceId = id;

    if (isNew) {
      const created = await prisma.service.create({
        data: {
          ...baseData,
          relatedServices: {
            connect: relatedServiceIds.map(id => ({ id }))
          },
          translations: {
            create: [
              { locale: "id", title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId, benefits: benefitsId, processSteps: processStepsId, faq: faqId },
              { locale: "en", title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn, benefits: benefitsEn, processSteps: processStepsEn, faq: faqEn },
            ]
          }
        }
      });
      serviceId = created.id;
    } else {
      await prisma.service.update({
        where: { id },
        data: {
          ...baseData,
          relatedServices: {
            set: relatedServiceIds.map(id => ({ id }))
          }
        },
      });

      // Update ID translation
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: id, locale: "id" } },
        update: { title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId, benefits: benefitsId, processSteps: processStepsId, faq: faqId },
        create: { serviceId: id, locale: "id", title: titleId, slug: slugId, shortDescription: shortDescId, fullDescription: fullDescId, benefits: benefitsId, processSteps: processStepsId, faq: faqId },
      });

      // Update EN translation
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: id, locale: "en" } },
        update: { title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn, benefits: benefitsEn, processSteps: processStepsEn, faq: faqEn },
        create: { serviceId: id, locale: "en", title: titleEn, slug: slugEn, shortDescription: shortDescEn, fullDescription: fullDescEn, benefits: benefitsEn, processSteps: processStepsEn, faq: faqEn },
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
        where: { entityType_entityId_locale: { entityType: "service", entityId: serviceId, locale: loc } },
        update: { metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl },
        create: { entityType: "service", entityId: serviceId, locale: loc, metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl }
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
    revalidatePath(`/id/services/${slugId}`);
    revalidatePath(`/en/services/${slugEn}`);
    
    return { success: true, message: "Service saved successfully" };
  } catch (error: unknown) {
    console.error("Save service error:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === 'P2002') {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save service" };
  }
}
