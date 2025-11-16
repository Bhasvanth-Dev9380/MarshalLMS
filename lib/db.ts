// // lib/prisma.ts
// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// lib/db.ts


import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// lib/db.ts
// import { PrismaClient } from "./generated/prisma"; // relative path to generated client
// export const prisma = new PrismaClient();
