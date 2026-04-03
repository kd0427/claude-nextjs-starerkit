"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { QuoteListItem, QuoteStatus } from "@/types";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  "대기": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "승인": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "거절": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "만료": "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
};

interface QuoteTableProps {
  quotes: QuoteListItem[];
}

/**
 * 견적서 목록 테이블
 * - shareToken 상태에 따라 링크 생성/복사/재생성 액션 표시
 */
const PAGE_SIZE = 10;

export function QuoteTable({ quotes }: QuoteTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(quotes.length / PAGE_SIZE));
  const paginatedQuotes = quotes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /** 상태 변경 */
  const handleStatusChange = async (notionPageId: string, status: QuoteStatus) => {
    setLoadingId(notionPageId);
    try {
      const res = await fetch(`/api/quotes/${notionPageId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("상태가 변경되었습니다");
      router.refresh();
    } catch {
      toast.error("상태 변경에 실패했습니다");
    } finally {
      setLoadingId(null);
    }
  };

  /** 견적서 삭제 */
  const handleDelete = async (notionPageId: string) => {
    if (!window.confirm("정말 이 견적서를 삭제하시겠습니까?")) return;
    setLoadingId(notionPageId);
    try {
      const res = await fetch(`/api/quotes/${notionPageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("견적서가 삭제되었습니다");
      router.refresh();
    } catch {
      toast.error("견적서 삭제에 실패했습니다");
    } finally {
      setLoadingId(null);
    }
  };

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
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
        <div className="rounded-full bg-muted p-4">
          <FileText className="h-10 w-10 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">등록된 견적서가 없습니다</p>
          <p className="text-xs mt-1">새 견적서를 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">견적서 번호</TableHead>
            <TableHead className="w-[100px]">고객사명</TableHead>
            <TableHead className="w-[100px]">견적일</TableHead>
            <TableHead className="w-[120px] text-right">합계금액</TableHead>
            <TableHead className="w-[180px] text-center">링크</TableHead>
            <TableHead className="w-[100px] text-center">상태</TableHead>
            <TableHead className="w-[70px] text-center">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedQuotes.map((quote) => {
            const isExpired =
              !!quote.shareTokenExpiredAt &&
              new Date(quote.shareTokenExpiredAt) < new Date();

            const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/quote/${quote.shareToken}`;
            const isLoading = loadingId === quote.notionPageId;

            return (
              <TableRow key={quote.notionPageId} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs font-medium text-muted-foreground">{quote.quoteNumber}</TableCell>
                <TableCell className="font-medium">{quote.clientName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(quote.quoteDate).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {formatKRW(quote.totalAmount)}
                </TableCell>

                {/* 링크 상태 분기 — 승인 상태에서만 링크 생성 가능 */}
                <TableCell className="text-center">
                  {quote.status !== "승인" ? (
                    <span className="text-xs text-muted-foreground">승인 후 생성</span>
                  ) : quote.shareToken === null ? (
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isLoading}
                      onClick={() => handleCreateLink(quote.notionPageId)}
                    >
                      {isLoading ? "생성 중..." : "링크 생성"}
                    </Button>
                  ) : isExpired ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isLoading}
                        onClick={() => handleCreateLink(quote.notionPageId)}
                      >
                        {isLoading ? "..." : "재생성"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <StatusBadge
                        shareToken={quote.shareToken}
                        shareTokenExpiredAt={quote.shareTokenExpiredAt}
                      />
                      <CopyButton text={shareUrl} label="복사" />
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Select
                    value={quote.status}
                    onValueChange={(value) =>
                      handleStatusChange(quote.notionPageId, value as QuoteStatus)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className={`h-7 w-[90px] text-xs font-medium border-0 rounded-full justify-center gap-0 ${STATUS_STYLES[quote.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["대기", "승인", "거절", "만료"] as QuoteStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className={`inline-flex items-center gap-1.5`}>
                            <span className={`h-2 w-2 rounded-full ${
                              s === "대기" ? "bg-yellow-500" :
                              s === "승인" ? "bg-green-500" :
                              s === "거절" ? "bg-red-500" : "bg-gray-400"
                            }`} />
                            {s}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon-xs" asChild>
                      <Link href={`/quotes/${quote.notionPageId}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isLoading}
                      onClick={() => handleDelete(quote.notionPageId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            총 {quotes.length}건 중 {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, quotes.length)}건
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              이전
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
