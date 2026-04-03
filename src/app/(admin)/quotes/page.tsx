import { StatsCards } from "@/components/dashboard/StatsCards";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import type { MonthlyData } from "@/components/dashboard/MonthlyChart";
import { getQuotes } from "@/lib/notion";

/** 최근 6개월 월별 매출 데이터 집계 */
function getMonthlyRevenue(
  quotes: Awaited<ReturnType<typeof getQuotes>>
): MonthlyData[] {
  const now = new Date();
  const months: MonthlyData[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = `${year}.${String(month + 1).padStart(2, "0")}`;

    const amount = quotes
      .filter((q) => {
        if (q.status !== "승인") return false;
        const qDate = new Date(q.quoteDate);
        return qDate.getFullYear() === year && qDate.getMonth() === month;
      })
      .reduce((sum, q) => sum + q.totalAmount, 0);

    months.push({ month: label, amount });
  }

  return months;
}

/** 견적서 목록 페이지 — 서버 컴포넌트, Notion API 직접 조회 */
export default async function QuotesPage() {
  const quotes = await getQuotes();
  const monthlyData = getMonthlyRevenue(quotes);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl w-full">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          총 {quotes.length}건의 견적서
        </p>
      </div>

      {/* 대시보드 통계 */}
      <StatsCards quotes={quotes} />
      <MonthlyChart data={monthlyData} />
    </div>
  );
}
