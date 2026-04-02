import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  shareToken: string | null;
  shareTokenExpiredAt: Date | null;
}

type LinkStatus = "none" | "generated" | "expiring" | "expired";

const EXPIRING_THRESHOLD_DAYS = 7;

/** shareToken 상태에 따른 링크 상태 배지 (만료 임박 7일 이내 경고 포함) */
export function StatusBadge({ shareToken, shareTokenExpiredAt }: StatusBadgeProps) {
  const status: LinkStatus = (() => {
    if (!shareToken) return "none";
    if (!shareTokenExpiredAt) return "generated";
    const now = new Date();
    const expiredAt = new Date(shareTokenExpiredAt);
    if (expiredAt < now) return "expired";
    const daysLeft = (expiredAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= EXPIRING_THRESHOLD_DAYS) return "expiring";
    return "generated";
  })();

  const config: Record<LinkStatus, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
    none:      { label: "미생성",    variant: "secondary" },
    generated: { label: "생성됨",   variant: "default" },
    expiring:  { label: "만료 임박", variant: "outline" },
    expired:   { label: "만료",     variant: "destructive" },
  };

  const { label, variant } = config[status];

  return (
    <Badge variant={variant} className={status === "expiring" ? "border-orange-400 text-orange-500" : undefined}>
      {label}
    </Badge>
  );
}
