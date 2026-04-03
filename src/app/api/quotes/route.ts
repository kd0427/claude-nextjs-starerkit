import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createQuote } from "@/lib/notion";
import type { ApiResponse } from "@/types";

const createQuoteSchema = z.object({
  quoteNumber: z.string().min(1, "견적서 번호를 입력하세요"),
  clientName: z.string().min(1, "클라이언트명을 입력하세요"),
  quoteDate: z.string().min(1, "발행일을 입력하세요"),
  validUntil: z.string().min(1, "유효기간을 입력하세요"),
  status: z.enum(["대기", "승인", "거절", "만료"]),
  taxType: z.enum(["포함", "별도"]).default("포함"),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1, "항목명을 입력하세요"),
        quantity: z.number().int().positive("수량은 1 이상이어야 합니다"),
        unitPrice: z.number().positive("단가는 0보다 커야 합니다"),
      })
    )
    .min(1, "항목을 1개 이상 입력하세요"),
});

/** POST /api/quotes — 새 견적서 생성 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ notionPageId: string }>>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const parsed = createQuoteSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "유효하지 않은 입력입니다";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const notionPageId = await createQuote(parsed.data);
    return NextResponse.json({ data: { notionPageId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "견적서 생성에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
