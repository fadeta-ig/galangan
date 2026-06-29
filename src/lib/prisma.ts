import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prismaNative: PrismaClient | undefined;
};

function getPrismaClient() {
  if (globalForPrisma.prismaNative) return globalForPrisma.prismaNative;

  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/galangan_kapal";
  const url = new URL(dbUrl);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port, 10) || 3306,
    user: url.username || "root",
    password: url.password || "",
    database: url.pathname.substring(1),
  } as unknown as ConstructorParameters<typeof PrismaMariaDb>[0]);

  globalForPrisma.prismaNative = new PrismaClient({ adapter });

  return globalForPrisma.prismaNative;
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaNative = prisma;
}
