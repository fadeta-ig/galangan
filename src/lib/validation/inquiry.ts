import { z } from "zod";

export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Invalid email address").max(254),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  serviceInterest: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message is required").max(5000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export function parseInquiryInput(data: Record<string, unknown>) {
  return inquirySchema.safeParse(data);
}
