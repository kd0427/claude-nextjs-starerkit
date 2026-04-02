import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  shareToken: string | null;
  shareTokenExpiredAt: Date | null;
}

type LinkStatus = "none" | "generated" | "expired";

/** shareToken 상태에 따른 링크 상태 배지 */
export function StatusBadge({ shareToken, shareTokenExpiredAt }: StatusBadgeProps) {
  const status: LinkStatus = (() => {
    if (!shareToken) return "none";
    if (shareTokenExpiredAt && new Date(shareTokenExpiredAt) < new Date()) return "expired";
    return "generated";
  })();

  const config = {
    none: { label: "미생성", variant: "secondary" as const },
    generated: { label: "생성됨", variant: "default" as const },
    expired: { label: "만료", variant: "destructive" as const },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
