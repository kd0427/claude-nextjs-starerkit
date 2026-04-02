import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// TODO: 견적서 공유 링크 생성/조회 API
// 1. NextAuth.js 세션 확인 (어드민 인증)
// 2. quoteId로 DB에서 Quote 조회
// 3. shareToken 없으면 신규 생성(uuid) 후 저장
// 4. 공유 URL 반환: {baseUrl}/quote/{shareToken}

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/quotes/[id]/share - 공유 링크 반환 */
export async function GET(
  _request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<{ shareUrl: string }>>> {
  const { id } = await params;

  // TODO: 인증 확인
  // TODO: Prisma 조회 및 shareToken 생성

  return NextResponse.json(
    { success: false, error: `Not implemented for id: ${id}` },
    { status: 501 }
  );
}
