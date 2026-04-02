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
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex justify-end mb-4">
        <PdfDownloadButtonClient quote={{ ...quote, items: sortedItems }} />
      </div>
      {/* id="quote-document" — html2canvas PDF 캡처 대상 */}
      <div id="quote-document" className="bg-background">
        <QuoteDocument quote={quote} />
        <QuoteItemTable items={sortedItems} />
        <QuoteSummary quote={quote} />
      </div>
    </div>
  );
}
