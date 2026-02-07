import { PrismaClient } from "@/lib/generated/prisma";

type PrismaClientWithExtras = PrismaClient & {
  faq: any;
  contact: any;
};

// import { PrismaClient } from "@prisma/client";
// Prevent multiple instances during hot reload
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  (global.prisma as PrismaClientWithExtras | undefined) ||
  (new PrismaClient({
    log: ["query"],
  }) as PrismaClientWithExtras);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma as PrismaClient;
}

export default prisma;
