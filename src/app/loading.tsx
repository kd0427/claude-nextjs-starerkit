import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/** 페이지 전환 로딩 상태 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
