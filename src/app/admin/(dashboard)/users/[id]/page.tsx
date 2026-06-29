import { prisma } from "@/lib/prisma";
import UserForm from "./UserForm";
import { notFound, redirect } from "next/navigation";
import { Users } from "@phosphor-icons/react/dist/ssr";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "Edit User | Admin CMS",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const { id } = await params;
  const isNew = id === "new";
  
  let user = null;

  if (!isNew) {
    user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      notFound();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title={isNew ? "Create New User" : "Edit User"}
        description={isNew ? "Add a new admin account." : "Modify existing admin account."}
        icon={<Users className="size-5" weight="fill" />}
      />
      
      <UserForm userId={id} initialData={user} />
    </div>
  );
}
