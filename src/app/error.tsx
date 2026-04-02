"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router 전역 에러 바운더리
 * 렌더링 중 발생한 에러를 캡처해 사용자 친화적 UI로 표시
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
      <h2 className="text-xl font-bold text-center">문제가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
