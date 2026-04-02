import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateShareToken } from "@/lib/notion";
import type { ApiResponse, ShareLinkResult } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

/** POST /api/quotes/[id]/share — shareToken 생성 후 Notion 속성 업데이트 */
export async function POST(
  request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<ShareLinkResult>>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: notionPageId } = await params;

  const token = crypto.randomUUID();
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 30);

  await updateShareToken(notionPageId, token, expiredAt);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const url = `${baseUrl}/quote/${token}`;

  return NextResponse.json({
    data: { url, token, expiredAt },
  });
}
