import Link from "next/link";
import { Plus } from "lucide-react";
import { QuoteTable } from "@/components/quote/QuoteTable";
import { QuoteRefreshButton } from "@/components/quote/QuoteRefreshButton";
import { Button } from "@/components/ui/button";
import { getQuotes } from "@/lib/notion";

/** 견적서 목록 페이지 — 서버 컴포넌트, Notion API 직접 조회 */
export default async function QuoteListPage() {
  const quotes = await getQuotes();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">견적서 목록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {quotes.length}건의 견적서
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuoteRefreshButton />
          <Button asChild>
            <Link href="/quotes/new">
              <Plus className="h-4 w-4 mr-2" />
              새 견적서
            </Link>
          </Button>
        </div>
      </div>

      {/* 테이블 카드 */}
      <div className="rounded-xl border bg-card shadow-sm">
        <QuoteTable quotes={quotes} />
      </div>
    </div>
  );
}
