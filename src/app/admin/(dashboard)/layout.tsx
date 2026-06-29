import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/layout/Sidebar";
import BFCacheBuster from "@/components/admin/BFCacheBuster";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-surface flex h-[100dvh] overflow-hidden bg-slate-50 font-sans text-foreground">
      <BFCacheBuster />
      <Sidebar userRole={session.user.role} user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white px-6 py-6 md:px-8 md:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
