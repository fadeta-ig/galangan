import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin/permissions";
import { notFound } from "next/navigation";
import NewsletterClient from "./NewsletterClient";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export default async function AdminNewsletterPage() {
  const authorization = await authorizeAdmin("content:write");
  if (!authorization.authorized) notFound();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="Newsletter"
        description="Kelola pendaftar newsletter website Anda."
        icon={<EnvelopeSimple className="size-5" weight="fill" />}
      />

      <NewsletterClient subscribers={subscribers} />
    </div>
  );
}
