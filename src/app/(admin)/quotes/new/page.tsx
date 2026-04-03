import { QuoteForm } from "@/components/quote/QuoteForm";
import { getNextQuoteNumber } from "@/lib/notion";

export default async function NewQuotePage() {
  const nextQuoteNumber = await getNextQuoteNumber();

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 w-full">
      <h1 className="text-2xl font-bold tracking-tight">새 견적서</h1>
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <QuoteForm defaultQuoteNumber={nextQuoteNumber} />
      </div>
    </div>
  );
}
