// 견적서 상세 공개 페이지 (인증 불필요)
// - shareToken으로 Quote 조회 (TASK-012에서 Prisma 연동 예정)
// - 토큰이 없거나 만료된 경우 /error 로 리디렉션 예정
// - 더미 데이터로 QuoteDocument, QuoteItemTable, QuoteSummary, PdfDownloadButton 렌더링

import { notFound } from "next/navigation";
import { QuoteDocument } from "@/components/quote/QuoteDocument";
import { QuoteItemTable } from "@/components/quote/QuoteItemTable";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { PdfDownloadButton } from "@/components/pdf/PdfDownloadButton";
import type { Quote } from "@/types";

interface QuotePageProps {
  params: Promise<{ token: string }>;
}

/** 공개 견적서 상세 페이지 */
export default async function QuotePage({ params }: QuotePageProps) {
  const { token } = await params;

  // TODO: TASK-012에서 Prisma 연동 - prisma.quote.findUnique({ where: { shareToken: token } })
  // TODO: 토큰 없거나 만료 시 redirect("/error?reason=not_found") 또는 redirect("/error?reason=expired")
  const dummyQuote: Quote = {
    notionPageId: "dummy-1",
    quoteNumber: "QT-2026-002",
    clientName: "스타트업ABC",
    quoteDate: new Date("2026-03-10"),
    validUntil: new Date("2026-05-10"),
    status: "대기",
    totalAmount: 2200000,
    shareToken: token,
    shareTokenExpiredAt: new Date("2099-12-31"),
    items: [
      {
        itemName: "웹사이트 개발",
        quantity: 1,
        unitPrice: 1500000,
        amount: 1500000,
        sortOrder: 1,
      },
      {
        itemName: "유지보수 (월)",
        quantity: 2,
        unitPrice: 350000,
        amount: 700000,
        sortOrder: 2,
      },
    ],
  };

  // 실제 연동 시 null 체크 (더미 데이터로 인해 현재는 항상 통과)
  const quote: Quote | null = dummyQuote;

  if (!quote) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* PDF 다운로드 버튼 - 우측 정렬 */}
      <div className="flex justify-end mb-4">
        <PdfDownloadButton quote={quote} />
      </div>

      {/* 견적서 헤더 정보 */}
      <QuoteDocument quote={quote} />

      {/* 견적서 항목 테이블 */}
      <QuoteItemTable items={quote.items} />

      {/* 견적서 합계 요약 */}
      <QuoteSummary quote={quote} />
    </div>
  );
}
