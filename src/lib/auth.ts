// TODO: NextAuth.js v5 (Auth.js) 설정
// 설치: pnpm add next-auth@beta
//
// 필요한 환경변수:
//   AUTH_SECRET          - openssl rand -base64 32 로 생성
//   AUTH_GOOGLE_ID       - Google OAuth Client ID (선택)
//   AUTH_GOOGLE_SECRET   - Google OAuth Client Secret (선택)
//
// 주요 구현 내용:
// - Credentials Provider (이메일/비밀번호) 또는 OAuth Provider 설정
// - Prisma Adapter 연결
// - 세션 전략: JWT 또는 database

// TODO:
// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "./prisma";
//
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     // TODO: Provider 설정
//   ],
//   session: { strategy: "jwt" },
// });

export const auth = null; // TODO: 위 코드로 교체
