"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function subscribeNewsletter(formData: FormData) {
  try {
    const email = formData.get("email");
    const validated = subscribeSchema.safeParse({ email });

    if (!validated.success) {
      return { success: false, message: validated.error.issues[0]?.message || "Format tidak valid" };
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: validated.data.email },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email: validated.data.email },
          data: { isActive: true },
        });
      }
      return { success: true, message: "Terima kasih sudah berlangganan!" };
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: validated.data.email,
        isActive: true,
      },
    });

    return { success: true, message: "Pendaftaran berhasil!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}
