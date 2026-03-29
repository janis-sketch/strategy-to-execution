import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string {
  // On Vercel (serverless), the filesystem is read-only except /tmp.
  // Copy the bundled SQLite database to /tmp so Prisma can open it.
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/dev.db";
    if (!fs.existsSync(tmpDb)) {
      const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      }
    }
    return "file:/tmp/dev.db";
  }
  return process.env.DATABASE_URL || "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
