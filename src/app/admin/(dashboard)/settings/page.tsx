import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import { Gear } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Site Settings | Admin CMS",
};

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <AdminPageHeader
        title="Site Settings"
        description="Manage global configuration, contact details, and SEO metadata."
        icon={<Gear className="size-5" weight="fill" />}
      />
      
      <SettingsForm settings={settings} />
    </div>
  );
}
