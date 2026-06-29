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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
    const categoryId = getOptionalString(formData, "categoryId");
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

    let relatedPosts: string[] = [];
    try { relatedPosts = JSON.parse(getString(formData, "relatedPosts") || "[]"); } catch {}

    const tagsId = getString(formData, "tags_id").split(",").map(t => t.trim()).filter(Boolean);
    const tagsEn = getString(formData, "tags_en").split(",").map(t => t.trim()).filter(Boolean);
    
    const maxLength = Math.max(tagsId.length, tagsEn.length);
    const tagPairs = Array.from({ length: maxLength }).map((_, i) => {
      const idTag = tagsId[i] || tagsEn[i] || "tag";
      const enTag = tagsEn[i] || tagsId[i] || "tag";
      const baseSlug = slugify(idTag);
      return { id: idTag, en: enTag, slug: baseSlug };
    });

    const newsData = {
      status,
      isFeatured,
      featuredImage,
      publishDate,
      author: { connect: { id: authorization.session.user.id } },
      ...(categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }),
    };

    const newsId = await prisma.$transaction(async (tx) => {
      const savedPost = isNew
        ? await tx.newsPost.create({
            data: {
              ...newsData,
              category: categoryId ? { connect: { id: categoryId } } : undefined, // create handles undefined
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

      // Handle Related Posts
      await tx.newsPost.update({
        where: { id: savedPost.id },
        data: {
          relatedPosts: {
            set: relatedPosts.map(id => ({ id }))
          }
        }
      });

      // Handle Tags
      await tx.newsPostTag.deleteMany({ where: { postId: savedPost.id } });
      
      for (const pair of tagPairs) {
        const tag = await tx.tagTranslation.findFirst({ where: { slug: pair.slug, locale: Locale.id } });
        let tagId;
        
        if (tag) {
          tagId = tag.tagId;
        } else {
          const newTag = await tx.tag.create({ data: {} });
          tagId = newTag.id;
          await tx.tagTranslation.createMany({
            data: [
              { tagId, locale: Locale.id, name: pair.id, slug: pair.slug },
              { tagId, locale: Locale.en, name: pair.en, slug: slugify(pair.en) },
            ]
          });
        }

        await tx.newsPostTag.upsert({
          where: { postId_tagId: { postId: savedPost.id, tagId } },
          update: {},
          create: { postId: savedPost.id, tagId }
        });
      }

      return savedPost.id;
    });

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
        where: { entityType_entityId_locale: { entityType: "news", entityId: newsId, locale: loc } },
        update: { metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl },
        create: { entityType: "news", entityId: newsId, locale: loc, metaTitle, metaDescription: metaDesc, ogTitle, ogDescription: ogDesc, ogImage, canonicalUrl }
      });
    }

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
    revalidatePath(`/id/news/${slugId}`);
    revalidatePath(`/en/news/${slugEn}`);

    return { success: true, message: "News saved successfully" };
  } catch (error: unknown) {
    console.error("Save news error:", error);
    if (isUniqueConstraintError(error)) {
      return { success: false, message: "Slug must be unique" };
    }
    return { success: false, message: "Failed to save news" };
  }
}
