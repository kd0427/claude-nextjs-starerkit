"use client";

// PDF 다운로드 버튼 컴포넌트 (클라이언트 컴포넌트)
// 실제 PDF 생성 로직은 TASK-013에서 구현 예정
// 옵션 A: @react-pdf/renderer - <PDFDownloadLink> 컴포넌트
// 옵션 B: html2canvas + jsPDF - DOM 캡처 후 변환

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quote } from "@/types";

interface PdfDownloadButtonProps {
  quote: Quote;
}

/** PDF 다운로드 버튼 - 아이콘 포함 골격 구현 */
export function PdfDownloadButton({ quote }: PdfDownloadButtonProps) {
  /** PDF 생성 및 다운로드 핸들러 */
  const handleDownload = async () => {
    // TODO: TASK-013에서 PDF 생성 및 다운로드 로직 구현
  };

  return (
    <Button onClick={handleDownload} variant="outline">
      {/* Download 아이콘 */}
      <Download className="mr-2 h-4 w-4" />
      PDF 다운로드
      <span className="sr-only">
        {quote.quoteNumber} {quote.clientName} PDF 다운로드
      </span>
    </Button>
  );
}
