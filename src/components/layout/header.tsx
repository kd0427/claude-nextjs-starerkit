import Link from "next/link";
import { FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

/** 상단 고정 헤더 컴포넌트 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto w-full flex h-14 items-center justify-between px-4 md:px-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5" />
          <span>견적서 공유</span>
        </Link>

        {/* 테마 토글 */}
        <ThemeToggle />
      </div>
    </header>
  );
}
