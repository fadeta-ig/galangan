import { prisma } from "@/lib/prisma";
import { deleteUser } from "./actions";
import UsersClient from "./UsersClient";
import { Users } from "@phosphor-icons/react/dist/ssr";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export const metadata = {
  title: "User Management | Admin CMS",
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        title="User Management"
        description="Manage admin accounts and their access roles."
        icon={<Users className="size-5" weight="fill" />}
      />
      
      <UsersClient 
        users={users} 
        deleteAction={deleteUser}
        currentUserId={session.user.id}
      />
    </div>
  );
}
