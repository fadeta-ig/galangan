import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { hashPassword, needsPasswordRehash, verifyPassword } from "@/lib/password";

const globalForAuth = global as unknown as { loginAttempts: Map<string, { count: number; lockUntil: number | null }> };
const loginAttempts = globalForAuth.loginAttempts || new Map();
if (process.env.NODE_ENV !== "production") globalForAuth.loginAttempts = loginAttempts;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getNextAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  const looksLikePlaceholder = secret
    ? /changeme|change-me|placeholder|secret-key|your|default/i.test(secret)
    : true;

  if (!secret || looksLikePlaceholder || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be set to a non-placeholder value with at least 32 characters.");
  }

  return secret;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailKey = credentials.email.toLowerCase();
        const attempt = loginAttempts.get(emailKey);

        if (attempt && attempt.lockUntil && attempt.lockUntil > Date.now()) {
          throw new Error("Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.");
        } else if (attempt && attempt.lockUntil && attempt.lockUntil <= Date.now()) {
          loginAttempts.delete(emailKey);
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = verifyPassword(credentials.password, user.password);

        if (!isPasswordValid) {
          const currentAttempt = loginAttempts.get(emailKey) || { count: 0, lockUntil: null };
          currentAttempt.count += 1;
          
          if (currentAttempt.count >= MAX_ATTEMPTS) {
            currentAttempt.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
            loginAttempts.set(emailKey, currentAttempt);
            throw new Error("Terlalu banyak percobaan gagal. Akun dikunci sementara selama 15 menit.");
          }
          
          loginAttempts.set(emailKey, currentAttempt);
          return null;
        }

        // Successful login, clear attempts
        loginAttempts.delete(emailKey);

        const upgradedPassword = needsPasswordRehash(user.password)
          ? hashPassword(credentials.password)
          : undefined;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            ...(upgradedPassword ? { password: upgradedPassword } : {}),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          remember: credentials.remember === "true",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Apply short expiration if "remember me" is not checked
        if ((user as Record<string, unknown>).remember === false) {
           token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: getNextAuthSecret(),
};
