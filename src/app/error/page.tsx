// 에러 안내 페이지
// - reason 파라미터에 따라 에러 메시지 분기
//   · not_found  → 유효하지 않은 견적서 링크
//   · expired    → 만료된 견적서 링크
//   · 기본        → 일반 오류
// - 홈(로그인)으로 복귀 버튼 포함

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  searchParams: Promise<{ reason?: "not_found" | "expired"; code?: string; message?: string }>;
}

/** reason 파라미터에 따른 에러 메시지 설정 */
function getErrorContent(reason: string | undefined): {
  title: string;
  description: string;
} {
  switch (reason) {
    case "not_found":
      return {
        title: "유효하지 않은 견적서 링크입니다",
        description: "요청하신 견적서를 찾을 수 없습니다.",
      };
    case "expired":
      return {
        title: "만료된 견적서 링크입니다",
        description: "이 견적서 링크의 유효기간이 만료되었습니다.",
      };
    default:
      return {
        title: "오류가 발생했습니다",
        description: "요청하신 페이지를 찾을 수 없습니다.",
      };
  }
}

/** 에러 안내 페이지 */
export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { reason } = await searchParams;
  const { title, description } = getErrorContent(reason);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {/* 에러 아이콘 */}
      <AlertCircle
        className="h-12 w-12 text-destructive"
        aria-hidden="true"
      />

      {/* 에러 제목 */}
      <h1 className="text-2xl font-bold text-center">{title}</h1>

      {/* 에러 설명 */}
      <p className="text-muted-foreground text-center">{description}</p>

      {/* 홈으로 복귀 버튼 */}
      <Button asChild>
        <Link href="/login">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
