import { QuoteTable } from "@/components/quote/QuoteTable";
import { QuoteRefreshButton } from "@/components/quote/QuoteRefreshButton";
import { getQuotes } from "@/lib/notion";

/** 견적서 목록 페이지 — 서버 컴포넌트, Notion API 직접 조회 */
export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">견적서 목록</h1>
        <QuoteRefreshButton />
      </div>
      <QuoteTable quotes={quotes} />
    </div>
  );
}
