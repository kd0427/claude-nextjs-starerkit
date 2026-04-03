import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatKRW } from "@/lib/utils";
import type { QuoteListItem } from "@/types";

interface StatsCardsProps {
  quotes: QuoteListItem[];
}

/** 대시보드 통계 카드 4개 */
export function StatsCards({ quotes }: StatsCardsProps) {
  const totalCount = quotes.length;
  const approvedCount = quotes.filter((q) => q.status === "승인").length;
  const pendingCount = quotes.filter((q) => q.status === "대기").length;
  const totalRevenue = quotes
    .filter((q) => q.status === "승인")
    .reduce((sum, q) => sum + q.totalAmount, 0);

  const cards = [
    {
      label: "총 견적서",
      value: `${totalCount}건`,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "승인",
      value: `${approvedCount}건`,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "대기",
      value: `${pendingCount}건`,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "총 매출액",
      value: formatKRW(totalRevenue),
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="py-4">
          <CardContent className="flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-bold tabular-nums">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
