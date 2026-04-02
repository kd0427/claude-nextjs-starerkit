// 견적서 항목 테이블 컴포넌트
// - shadcn/ui Table 사용
// - sortOrder 기준 오름차순 정렬
// - 단가, 금액에 formatKRW 적용

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKRW } from "@/lib/utils";
import type { QuoteItem } from "@/types";

interface QuoteItemTableProps {
  items: QuoteItem[];
}

/**
 * 견적서 항목 목록 테이블
 * - sortOrder 기준 정렬 (없으면 0으로 처리)
 */
export function QuoteItemTable({ items }: QuoteItemTableProps) {
  // sortOrder 기준 오름차순 정렬 (원본 배열 변경 방지를 위해 복사 후 정렬)
  const sortedItems = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="mb-6 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* 항목명 컬럼 */}
            <TableHead>항목명</TableHead>
            {/* 수량 컬럼 */}
            <TableHead className="w-[80px] text-right">수량</TableHead>
            {/* 단가 컬럼 */}
            <TableHead className="w-[140px] text-right">단가</TableHead>
            {/* 금액 컬럼 */}
            <TableHead className="w-[140px] text-right">금액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={`${item.itemName}-${item.sortOrder}`}>
              {/* 항목명 */}
              <TableCell className="font-medium">{item.itemName}</TableCell>

              {/* 수량 */}
              <TableCell className="text-right tabular-nums">
                {item.quantity}
              </TableCell>

              {/* 단가 (formatKRW 적용) */}
              <TableCell className="text-right tabular-nums">
                {formatKRW(item.unitPrice)}
              </TableCell>

              {/* 금액 (formatKRW 적용) */}
              <TableCell className="text-right tabular-nums">
                {formatKRW(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
