"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/** 견적서 목록 새로고침 버튼 — router.refresh()로 서버 컴포넌트 재실행 */
export function QuoteRefreshButton() {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.refresh()}>
      <RefreshCw className="mr-2 h-4 w-4" />
      새로고침
    </Button>
  );
}
