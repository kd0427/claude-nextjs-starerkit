// TODO: Prisma 클라이언트 싱글턴
// 설치: pnpm add prisma @prisma/client && pnpm dlx prisma init
//
// Next.js 개발 환경에서 HMR 시 다중 인스턴스 생성 방지를 위해
// globalThis에 캐싱하는 표준 패턴 사용

// TODO: import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const prisma = null; // TODO: 위 코드로 교체
