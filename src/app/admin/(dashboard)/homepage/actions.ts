"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitizeHtml";
import { revalidatePath } from "next/cache";

export async function updateHomepageSection(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const titleId = (formData.get("titleId") as string) || "";
    const titleEn = (formData.get("titleEn") as string) || "";
    const contentId = sanitizeRichText((formData.get("contentId") as string) || "");
    const contentEn = sanitizeRichText((formData.get("contentEn") as string) || "");
    const configRaw = formData.get("config") as string;
    const isActive = formData.get("isActive") === "true";
    const sortOrder = parseInt(formData.get("sortOrder") as string, 10);
    
    // We only update translation and config. SectionType is immutable via UI.
    const data = {
      titleId,
      titleEn,
      contentId,
      contentEn,
      config: configRaw,
      isActive,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
    };

    const updated = await prisma.homepageSection.update({
      where: { id },
      data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "update",
        module: "homepage_section",
        targetId: id,
        targetTitle: updated.sectionType,
      }
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");
    revalidatePath("/id");
    revalidatePath("/en");
    
    return { success: true, message: "Section updated successfully" };
  } catch (error) {
    console.error("Save section error:", error);
    return { success: false, message: "Failed to update section" };
  }
}
