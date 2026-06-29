import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export type AdminPermission =
  | "content:write"
  | "content:delete"
  | "inquiry:update"
  | "inquiry:delete";

type AuthorizationResult =
  | { authorized: true; session: Session }
  | { authorized: false; message: string };

const permissionRoles: Record<AdminPermission, UserRole[]> = {
  "content:write": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  "content:delete": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "inquiry:update": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "inquiry:delete": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
};

function toUserRole(role: string | undefined): UserRole | null {
  if (!role) return null;
  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : null;
}

export async function authorizeAdmin(permission: AdminPermission): Promise<AuthorizationResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { authorized: false, message: "Unauthorized" };
  }

  const role = toUserRole(session.user.role);
  if (!role || !permissionRoles[permission].includes(role)) {
    return { authorized: false, message: "Forbidden" };
  }

  return { authorized: true, session };
}
