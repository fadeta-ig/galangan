import { prisma } from "@/lib/prisma";

const WINDOW_MINUTES = 15;
const MAX_SUBMISSIONS = 3;

export async function isInquiryRateLimited(ipAddress: string): Promise<boolean> {
  if (!ipAddress) return false;

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentCount = await prisma.inquiry.count({
    where: {
      ipAddress,
      createdAt: { gte: windowStart },
    },
  });

  return recentCount >= MAX_SUBMISSIONS;
}
