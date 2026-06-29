"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const keys = Array.from(formData.keys());
    
    // Group updates in a transaction
    const updatePromises = keys
      .filter((key) => !key.startsWith("$ACTION_ID_")) // Filter out internal Next.js action IDs
      .map((key) => {
        const value = formData.get(key) as string;
        return prisma.siteSetting.update({
          where: { key },
          data: { value },
        });
      });

    await prisma.$transaction(updatePromises);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "settings_update",
        module: "settings",
        details: "Updated global site settings",
      }
    });

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Revalidate frontend as well
    
    return { success: true, message: "Settings updated successfully" };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, message: "Failed to update settings" };
  }
}
