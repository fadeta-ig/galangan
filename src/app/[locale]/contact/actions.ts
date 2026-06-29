"use server";

import { prisma } from "@/lib/prisma";
import { parseInquiryInput } from "@/lib/validation/inquiry";
import { isInquiryRateLimited } from "@/lib/rateLimit/inquiryRateLimit";
import { sendInquiryNotification } from "@/lib/email/sendInquiryNotification";
import { getClientIp } from "@/lib/request/clientIp";

export type InquirySubmitResult =
  | { success: true }
  | { success: false; errorCode: "validation" | "rate_limit" | "server"; error?: string };

export async function submitInquiry(formData: FormData): Promise<InquirySubmitResult> {
  try {
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return { success: true };
    }

    const parsed = parseInquiryInput({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone") ?? "",
      companyName: formData.get("companyName") ?? "",
      serviceInterest: formData.get("serviceInterest") ?? "",
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      return {
        success: false,
        errorCode: "validation",
        error: firstError,
      };
    }

    const ipAddress = await getClientIp();
    if (ipAddress && (await isInquiryRateLimited(ipAddress))) {
      return { success: false, errorCode: "rate_limit" };
    }

    const data = parsed.data;

    const inquiry = await prisma.inquiry.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        companyName: data.companyName || null,
        serviceInterest: data.serviceInterest || null,
        subject: data.subject,
        message: data.message,
        status: "NEW",
        ipAddress,
      },
    });

    try {
      await sendInquiryNotification({ ...data, id: inquiry.id });
    } catch (emailError) {
      console.error("Failed to send inquiry notification:", emailError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return { success: false, errorCode: "server" };
  }
}
