// 견적서 헤더 문서 컴포넌트
// - 견적서 번호, 고객사명, 견적일, 유효기간 표시
// - 견적서 상태 텍스트 표시
// - id="quote-document" 속성으로 PDF 캡처 대상 지정

import { Separator } from "@/components/ui/separator";
import type { Quote } from "@/types";

interface QuoteDocumentProps {
  quote: Quote;
}

/** 견적서 헤더 정보 컴포넌트 */
export function QuoteDocument({ quote }: QuoteDocumentProps) {
  return (
    <div id="quote-document" className="mb-8">
      {/* 견적서 최상단: 번호 + 상태 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            견적서
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {quote.quoteNumber}
          </h1>
        </div>

        {/* 견적서 상태 텍스트 배지 */}
        <span
          className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-semibold"
          aria-label={`견적서 상태: ${quote.status}`}
        >
          {quote.status}
        </span>
      </div>

      <Separator className="mb-6" />

      {/* 고객사 정보 + 날짜 정보 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 고객사명 */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">고객사</p>
          <p className="text-base font-semibold">{quote.clientName}</p>
        </div>

        {/* 날짜 정보 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <p className="text-xs text-muted-foreground">견적일</p>
            <p className="text-sm tabular-nums">
              {new Date(quote.quoteDate).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <p className="text-xs text-muted-foreground">유효기간</p>
            <p className="text-sm tabular-nums">
              {new Date(quote.validUntil).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
