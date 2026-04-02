"use client";

// 견적서 목록 테이블 컴포넌트
// - shadcn/ui Table 사용
// - 링크 상태에 따라 버튼 또는 StatusBadge + CopyButton 표시
// - 빈 목록 상태 처리 포함

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatKRW } from "@/lib/utils";
import type { QuoteListItem } from "@/types";

interface QuoteTableProps {
  quotes: QuoteListItem[];
}

/**
 * 견적서 목록 테이블
 * - shareToken 상태에 따라 링크 생성/복사/재생성 액션 표시
 */
export function QuoteTable({ quotes }: QuoteTableProps) {
  // 빈 목록 상태
  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <FileText className="h-12 w-12 opacity-30" />
        <p className="text-sm">등록된 견적서가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* 견적서 번호 컬럼 */}
            <TableHead className="w-[160px]">견적서 번호</TableHead>
            {/* 고객사명 컬럼 */}
            <TableHead>고객사명</TableHead>
            {/* 견적일 컬럼 */}
            <TableHead className="w-[120px]">견적일</TableHead>
            {/* 합계금액 컬럼 */}
            <TableHead className="w-[140px] text-right">합계금액</TableHead>
            {/* 링크 상태 컬럼 */}
            <TableHead className="w-[220px] text-center">링크 상태</TableHead>
            {/* 액션 컬럼 */}
            <TableHead className="w-[80px] text-center">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            // 링크 만료 여부 판단
            const isExpired =
              !!quote.shareTokenExpiredAt &&
              new Date(quote.shareTokenExpiredAt) < new Date();

            // 공유 URL 생성 (클라이언트 환경에서만 origin 사용)
            const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/quote/${quote.shareToken}`;

            return (
              <TableRow key={quote.notionPageId}>
                {/* 견적서 번호 */}
                <TableCell className="font-medium">{quote.quoteNumber}</TableCell>

                {/* 고객사명 */}
                <TableCell>{quote.clientName}</TableCell>

                {/* 견적일 */}
                <TableCell>
                  {new Date(quote.quoteDate).toLocaleDateString("ko-KR")}
                </TableCell>

                {/* 합계금액 */}
                <TableCell className="text-right tabular-nums">
                  {formatKRW(quote.totalAmount)}
                </TableCell>

                {/* 링크 상태: shareToken 여부 및 만료 여부에 따라 분기 */}
                <TableCell className="text-center">
                  {quote.shareToken === null ? (
                    // 토큰 없음 → 링크 생성 버튼
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: TASK-011에서 링크 생성 API 연동 예정
                      }}
                    >
                      링크 생성
                    </Button>
                  ) : isExpired ? (
                    // 만료됨 → StatusBadge + 링크 재생성 버튼
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: TASK-011에서 링크 재생성 API 연동 예정
                        }}
                      >
                        링크 재생성
                      </Button>
                    </div>
                  ) : (
                    // 유효한 토큰 → StatusBadge + CopyButton
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <CopyButton text={shareUrl} label="링크 복사" />
                    </div>
                  )}
                </TableCell>

                {/* 견적서 상태 */}
                <TableCell className="text-center">
                  <span className="text-sm text-muted-foreground">
                    {quote.status}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
