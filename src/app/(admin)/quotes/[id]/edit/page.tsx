import { redirect } from "next/navigation";
import { getQuoteWithItems } from "@/lib/notion";
import { QuoteForm } from "@/components/quote/QuoteForm";

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params;
  const quote = await getQuoteWithItems(id);

  if (!quote) {
    redirect("/quotes");
  }

  const initialData = {
    quoteNumber: quote.quoteNumber,
    clientName: quote.clientName,
    quoteDate: new Date(quote.quoteDate).toISOString().split("T")[0],
    validUntil: new Date(quote.validUntil).toISOString().split("T")[0],
    status: quote.status as "대기" | "승인" | "거절" | "만료",
    taxType: quote.taxType ?? "포함",
    items: quote.items.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 w-full">
      <h1 className="text-2xl font-bold tracking-tight">견적서 수정</h1>
      <div className="rounded-xl border bg-card shadow-sm p-6">
      <QuoteForm
        mode="edit"
        notionPageId={id}
        initialData={initialData}
        defaultQuoteNumber={quote.quoteNumber}
      />
      </div>
    </div>
  );
}
