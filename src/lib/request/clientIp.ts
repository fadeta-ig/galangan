import { headers } from "next/headers";

export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return headerList.get("x-real-ip")?.trim() || null;
}
