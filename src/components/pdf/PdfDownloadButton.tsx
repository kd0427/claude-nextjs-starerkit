"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { QuotePdfDocument } from "@/components/pdf/QuotePdfDocument";
import type { Quote } from "@/types";

interface PdfDownloadButtonProps {
  quote: Quote;
}

/** PDF 다운로드 버튼 — @react-pdf/renderer 기반 */
export function PdfDownloadButton({ quote }: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<QuotePdfDocument quote={quote} />}
      fileName="어스 견적서.pdf"
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              생성 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              PDF 다운로드
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
