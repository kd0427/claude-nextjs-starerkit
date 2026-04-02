"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Quote } from "@/types";

// react-pdf는 브라우저 전용 — 클라이언트 컴포넌트 내에서만 ssr: false 허용
const PdfDownloadButton = dynamic(
  () =>
    import("@/components/pdf/PdfDownloadButton").then((m) => ({
      default: m.PdfDownloadButton,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <LoadingSpinner size="sm" />
        로딩 중...
      </div>
    ),
  }
);

interface PdfDownloadButtonClientProps {
  quote: Quote;
}

/** react-pdf SSR 방지용 클라이언트 래퍼 */
export function PdfDownloadButtonClient({ quote }: PdfDownloadButtonClientProps) {
  return <PdfDownloadButton quote={quote} />;
}
