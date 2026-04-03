import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateQuoteStatus } from "@/lib/notion";
import type { ApiResponse } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

const statusSchema = z.object({
  status: z.enum(["대기", "승인", "거절", "만료"]),
});

/** PATCH /api/quotes/[id]/status — 상태만 변경 */
export async function PATCH(
  request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다" }, { status: 400 });
  }

  try {
    await updateQuoteStatus(id, parsed.data.status);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "상태 변경에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
