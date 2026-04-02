"use client";

// 견적서 목록 새로고침 버튼 (클라이언트 컴포넌트)
// - 서버 컴포넌트인 QuotesPage에서 분리하여 onClick 처리

import { Button } from "@/components/ui/button";

/** 견적서 목록 새로고침 버튼 */
export function QuoteRefreshButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // TODO: TASK-010에서 router.refresh() 또는 서버 액션 연동 예정
      }}
    >
      새로고침
    </Button>
  );
}
