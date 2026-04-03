// 견적서 합계 요약 컴포넌트
// - 총 금액(totalAmount) 표시
// - 공급가액 = totalAmount / 1.1, 부가세 = totalAmount - 공급가액 (역산)
// - 금액 포맷: formatKRW 유틸리티 사용

import type { Quote } from "@/types";
import { formatKRW } from "@/lib/utils";

interface QuoteSummaryProps {
  quote: Pick<Quote, "totalAmount" | "taxType">;
}

/** 견적서 합계 요약 (부가세 타입에 따라 계산 방식 분기) */
export function QuoteSummary({ quote }: QuoteSummaryProps) {
  const isTaxSeparate = quote.taxType === "별도";

  // 별도: 공급가액 = totalAmount, 부가세 = totalAmount * 0.1, 합계 = totalAmount * 1.1
  // 포함: 공급가액 = totalAmount / 1.1, 부가세 = totalAmount - 공급가액, 합계 = totalAmount
  const supplyAmount = isTaxSeparate
    ? quote.totalAmount
    : Math.round(quote.totalAmount / 1.1);
  const taxAmount = isTaxSeparate
    ? Math.round(quote.totalAmount * 0.1)
    : quote.totalAmount - supplyAmount;
  const totalWithTax = isTaxSeparate
    ? Math.round(quote.totalAmount * 1.1)
    : quote.totalAmount;

  return (
    <div className="flex flex-col items-end gap-2.5 text-base">
      <div className="flex items-center gap-14 w-[280px] justify-between">
        <span className="text-muted-foreground">공급가액</span>
        <span className="tabular-nums">{formatKRW(supplyAmount)}</span>
      </div>
      <div className="flex items-center gap-14 w-[280px] justify-between">
        <span className="text-muted-foreground">부가세 (10%){isTaxSeparate ? " 별도" : ""}</span>
        <span className="tabular-nums">{formatKRW(taxAmount)}</span>
      </div>
      <div className="flex items-center gap-14 w-[280px] justify-between font-bold text-lg border-t pt-3 mt-1">
        <span>합계</span>
        <span className="tabular-nums text-primary">{formatKRW(totalWithTax)}</span>
      </div>
    </div>
  );
}
