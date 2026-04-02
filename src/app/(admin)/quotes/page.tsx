// 견적서 목록 대시보드 페이지 (어드민 전용)
// - 더미 데이터로 QuoteTable 렌더링 (TASK-010에서 Notion API 연동 예정)
// - 새로고침 버튼 포함 (TASK-010에서 실제 연동 예정)

import { AdminHeader } from "@/components/layout/AdminHeader";
import { QuoteTable } from "@/components/quote/QuoteTable";
import { QuoteRefreshButton } from "@/components/quote/QuoteRefreshButton";
import type { QuoteListItem } from "@/types";

// 하드코딩 더미 데이터 (TASK-010에서 Notion API로 교체 예정)
const dummyQuotes: QuoteListItem[] = [
  {
    notionPageId: "1",
    quoteNumber: "QT-2026-001",
    clientName: "(주)테스트컴퍼니",
    quoteDate: new Date("2026-03-01"),
    validUntil: new Date("2026-04-01"),
    status: "승인",
    totalAmount: 5500000,
    shareToken: null,
    shareTokenExpiredAt: null,
  },
  {
    notionPageId: "2",
    quoteNumber: "QT-2026-002",
    clientName: "스타트업ABC",
    quoteDate: new Date("2026-03-10"),
    validUntil: new Date("2026-05-10"),
    status: "대기",
    totalAmount: 2200000,
    shareToken: "abc123token",
    shareTokenExpiredAt: new Date("2099-12-31"),
  },
  {
    notionPageId: "3",
    quoteNumber: "QT-2026-003",
    clientName: "글로벌XYZ",
    quoteDate: new Date("2026-01-15"),
    validUntil: new Date("2026-02-15"),
    status: "만료",
    totalAmount: 8800000,
    shareToken: "expiredtoken",
    shareTokenExpiredAt: new Date("2026-02-15"),
  },
];

/** 견적서 목록 페이지 */
export default async function QuotesPage() {
  // TODO: TASK-010에서 Notion API 연동 - getQuotes() 호출 예정
  const quotes: QuoteListItem[] = dummyQuotes;

  return (
    <>
      {/* 어드민 헤더 */}
      <AdminHeader />

      <div className="container mx-auto px-4 py-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">견적서 목록</h1>

          {/* 새로고침 버튼 (클라이언트 컴포넌트로 분리) */}
          <QuoteRefreshButton />
        </div>

        {/* 견적서 목록 테이블 */}
        <QuoteTable quotes={quotes} />
      </div>
    </>
  );
}
