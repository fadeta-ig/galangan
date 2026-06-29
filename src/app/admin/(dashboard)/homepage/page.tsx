import { prisma } from "@/lib/prisma";
import HomepageClient from "./HomepageClient";
import { Browser } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Homepage Builder | Admin CMS",
};

export default async function HomepagePage() {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <AdminPageHeader
        title="Homepage Builder"
        description="Configure texts, images, and settings for each section of the homepage."
        icon={<Browser className="size-5" weight="fill" />}
      />
      
      <HomepageClient sections={sections} />
    </div>
  );
}
