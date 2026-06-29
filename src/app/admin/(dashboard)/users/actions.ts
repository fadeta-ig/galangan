"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";

export async function saveUser(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized. Super Admin only." };
  }

  try {
    const isNew = id === "new";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as import("@prisma/client").UserRole;
    const isActive = formData.get("isActive") === "true";
    const passwordRaw = formData.get("password") as string;

    const data: {
      name: string;
      email: string;
      role: import("@prisma/client").UserRole;
      isActive: boolean;
      password?: string;
    } = {
      name,
      email,
      role,
      isActive,
    };

    if (passwordRaw) {
      data.password = hashPassword(passwordRaw);
    } else if (isNew) {
      return { success: false, message: "Password is required for new users" };
    }

    if (isNew) {
      await prisma.user.create({ data });
    } else {
      // Prevent deactivating or changing role of the last SUPER_ADMIN
      if (role !== "SUPER_ADMIN" || !isActive) {
        const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
        const thisUser = await prisma.user.findUnique({ where: { id } });
        if (superAdmins <= 1 && thisUser?.role === "SUPER_ADMIN") {
           return { success: false, message: "Cannot modify the last active Super Admin." };
        }
      }

      await prisma.user.update({
        where: { id },
        data,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: isNew ? "create" : "update",
        module: "user",
        targetTitle: email,
      }
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User saved successfully" };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === 'P2002') {
      return { success: false, message: "Email is already in use" };
    }
    return { success: false, message: "Failed to save user" };
  }
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") return;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return;

  // Prevent deleting self or last super admin
  if (id === session.user.id) return;
  
  if (targetUser.role === "SUPER_ADMIN") {
    const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdmins <= 1) return;
  }

  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "delete",
      module: "user",
      targetTitle: targetUser.email,
    }
  });

  revalidatePath("/admin/users");
}
