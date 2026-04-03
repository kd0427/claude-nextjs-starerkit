import { redirect } from "next/navigation";
import { QuoteDocument } from "@/components/quote/QuoteDocument";
import { QuoteItemTable } from "@/components/quote/QuoteItemTable";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { PdfDownloadButtonClient } from "@/components/pdf/PdfDownloadButtonClient";
import { getQuoteByShareToken, getQuoteWithItems } from "@/lib/notion";

interface QuotePageProps {
  params: Promise<{ token: string }>;
}

/** 공개 견적서 상세 페이지 — shareToken으로 Notion 데이터 조회 */
export default async function QuotePage({ params }: QuotePageProps) {
  const { token } = await params;

  // shareToken으로 견적서 조회
  const listItem = await getQuoteByShareToken(token);

  if (!listItem) {
    redirect("/error?reason=not_found");
  }

  // 만료 여부 확인
  if (
    listItem.shareTokenExpiredAt &&
    new Date(listItem.shareTokenExpiredAt) < new Date()
  ) {
    redirect("/error?reason=expired");
  }

  // 항목 포함 상세 조회
  const quote = await getQuoteWithItems(listItem.notionPageId);

  if (!quote) {
    redirect("/error?reason=not_found");
  }

  // sortOrder 오름차순 정렬
  const sortedItems = [...quote.items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="min-h-screen bg-muted/30 py-14 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 바 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-base font-bold text-primary-foreground">US</span>
            </div>
            <span className="font-semibold text-xl">견적서</span>
          </div>
          <PdfDownloadButtonClient quote={{ ...quote, items: sortedItems }} />
        </div>

        {/* 견적서 카드 */}
        <div id="quote-document" className="rounded-xl border bg-card shadow-sm p-10 space-y-10">
          <QuoteDocument quote={quote} />
          <QuoteItemTable items={sortedItems} />
          <QuoteSummary quote={quote} />
        </div>
      </div>
    </div>
  );
}
