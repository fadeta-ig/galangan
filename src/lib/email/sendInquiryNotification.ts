import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import type { InquiryInput } from "@/lib/validation/inquiry";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !from) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
  };
}

async function getNotifyEmail(): Promise<string | null> {
  const envEmail = process.env.INQUIRY_NOTIFY_EMAIL;
  if (envEmail) return envEmail;

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "company_email" },
  });

  return setting?.value || null;
}

export async function sendInquiryNotification(
  inquiry: InquiryInput & { id: string }
): Promise<void> {
  const smtp = getSmtpConfig();
  const to = await getNotifyEmail();

  if (!smtp || !to) {
    console.warn("Inquiry notification skipped: SMTP or recipient not configured");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  const lines = [
    `New inquiry received (ID: ${inquiry.id})`,
    "",
    `Name: ${inquiry.fullName}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.companyName ? `Company: ${inquiry.companyName}` : null,
    inquiry.serviceInterest ? `Service Interest: ${inquiry.serviceInterest}` : null,
    `Subject: ${inquiry.subject}`,
    "",
    "Message:",
    inquiry.message,
  ].filter(Boolean);

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject: `[Galangan Kapal] New Inquiry: ${inquiry.subject}`,
    text: lines.join("\n"),
  });
}
