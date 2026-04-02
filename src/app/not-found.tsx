import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

/** 404 Not Found 페이지 */
export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          홈으로 돌아가기
        </Link>
      </Button>
    </div>
  );
}
