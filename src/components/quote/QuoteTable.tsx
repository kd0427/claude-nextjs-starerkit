"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";
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
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /** 공유 링크 생성 API 호출 후 목록 갱신 */
  const handleCreateLink = async (notionPageId: string) => {
    setLoadingId(notionPageId);
    try {
      const res = await fetch(`/api/quotes/${notionPageId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("링크 생성에 실패했습니다");
      toast.success("공유 링크가 생성되었습니다");
      router.refresh();
    } catch {
      toast.error("링크 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoadingId(null);
    }
  };

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
            <TableHead className="w-[160px]">견적서 번호</TableHead>
            <TableHead>고객사명</TableHead>
            <TableHead className="w-[120px]">견적일</TableHead>
            <TableHead className="w-[140px] text-right">합계금액</TableHead>
            <TableHead className="w-[220px] text-center">링크 상태</TableHead>
            <TableHead className="w-[80px] text-center">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const isExpired =
              !!quote.shareTokenExpiredAt &&
              new Date(quote.shareTokenExpiredAt) < new Date();

            const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/quote/${quote.shareToken}`;
            const isLoading = loadingId === quote.notionPageId;

            return (
              <TableRow key={quote.notionPageId}>
                <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                <TableCell>{quote.clientName}</TableCell>
                <TableCell>
                  {new Date(quote.quoteDate).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatKRW(quote.totalAmount)}
                </TableCell>

                {/* 링크 상태 분기 */}
                <TableCell className="text-center">
                  {quote.shareToken === null ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleCreateLink(quote.notionPageId)}
                    >
                      {isLoading ? "생성 중..." : "링크 생성"}
                    </Button>
                  ) : isExpired ? (
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleCreateLink(quote.notionPageId)}
                      >
                        {isLoading ? "생성 중..." : "링크 재생성"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <CopyButton text={shareUrl} label="링크 복사" />
                    </div>
                  )}
                </TableCell>

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
