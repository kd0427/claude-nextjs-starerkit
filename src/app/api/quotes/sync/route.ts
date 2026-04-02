import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// TODO: Notion 견적서 동기화 API
// 1. NextAuth.js 세션 확인 (어드민 인증)
// 2. src/lib/notion.ts 의 fetchQuotesFromNotion() 호출
// 3. Prisma upsert로 Quote 데이터 저장
// 4. 신규/업데이트 건수 반환

/** POST /api/quotes/sync - Notion → DB 동기화 */
export async function POST(): Promise<NextResponse<ApiResponse>> {
  // TODO: 인증 확인
  // const session = await getServerSession(authOptions);
  // if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // TODO: Notion 데이터 패치 및 DB upsert

  return NextResponse.json(
    { success: false, error: "Not implemented" },
    { status: 501 }
  );
}
