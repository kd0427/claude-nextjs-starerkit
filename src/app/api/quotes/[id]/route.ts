import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateQuote, archiveQuote } from "@/lib/notion";
import type { ApiResponse } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

const updateQuoteSchema = z.object({
  clientName: z.string().min(1),
  quoteDate: z.string().min(1),
  validUntil: z.string().min(1),
  status: z.enum(["대기", "승인", "거절", "만료"]),
  taxType: z.enum(["포함", "별도"]).default("포함"),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
});

/** PUT /api/quotes/[id] — 견적서 수정 */
export async function PUT(
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

  const parsed = updateQuoteSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "유효하지 않은 입력입니다";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await updateQuote(id, parsed.data);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "견적서 수정에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/quotes/[id] — 견적서 삭제 (아카이브) */
export async function DELETE(
  _request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await archiveQuote(id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "견적서 삭제에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
