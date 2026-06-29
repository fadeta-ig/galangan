import { prisma } from "@/lib/prisma";
import GalleryForm from "./GalleryForm";
import { notFound } from "next/navigation";
import { Images } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit Gallery Item | Admin CMS",
};

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let media = null;

  if (!isNew) {
    media = await prisma.media.findUnique({
      where: { id },
      include: { translations: true, category: true },
    });

    if (!media) {
      notFound();
    }
  }

  const categories = await prisma.mediaCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Add Gallery Item" : "Edit Gallery Item"}
        description={isNew ? "Add a photo or video embed to the public gallery." : "Update gallery metadata and media."}
        icon={<Images className="size-5" weight="fill" />}
      />

      <GalleryForm mediaId={id} initialData={media} categories={categories} />
    </div>
  );
}
