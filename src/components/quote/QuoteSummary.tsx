// 견적서 합계 요약 컴포넌트
// - 총 금액(totalAmount) 표시
// - 공급가액 = totalAmount / 1.1, 부가세 = totalAmount - 공급가액 (역산)
// - 금액 포맷: formatKRW 유틸리티 사용

import type { Quote } from "@/types";
import { formatKRW } from "@/lib/utils";

interface QuoteSummaryProps {
  quote: Pick<Quote, "totalAmount">;
}

/** 견적서 합계 요약 (총 금액 기준 공급가액/부가세 역산) */
export function QuoteSummary({ quote }: QuoteSummaryProps) {
  const supplyAmount = Math.round(quote.totalAmount / 1.1);
  const taxAmount = quote.totalAmount - supplyAmount;

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <div className="flex gap-8">
        <span className="text-muted-foreground">공급가액</span>
        <span>{formatKRW(supplyAmount)}</span>
      </div>
      <div className="flex gap-8">
        <span className="text-muted-foreground">부가세 (10%)</span>
        <span>{formatKRW(taxAmount)}</span>
      </div>
      <div className="flex gap-8 font-bold text-base border-t pt-2 mt-1">
        <span>합계</span>
        <span>{formatKRW(quote.totalAmount)}</span>
      </div>
    </div>
  );
}
