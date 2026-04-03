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
    <div>
      {/* 견적서 번호 + 회사명 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            {quote.quoteNumber}
          </h1>
          <p className="text-base text-muted-foreground mt-1">견적서</p>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">어스</span>
      </div>

      <Separator className="my-4 sm:my-6 md:my-8" />

      {/* 정보 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-10 sm:gap-y-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">고객사</p>
          <p className="text-base font-semibold">{quote.clientName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">견적일</p>
          <p className="text-base tabular-nums">
            {new Date(quote.quoteDate).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">유효기간</p>
          <p className="text-base tabular-nums">
            {new Date(quote.validUntil).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}
