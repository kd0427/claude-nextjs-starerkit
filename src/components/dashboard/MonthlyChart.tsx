"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MonthlyData {
  month: string;
  amount: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

/** 원화 축약 포맷 (만원 단위) */
function formatAxisValue(value: number): string {
  if (value >= 10000) return `${Math.round(value / 10000)}만`;
  if (value >= 1000) return `${Math.round(value / 1000)}천`;
  return String(value);
}

/** 툴팁 포맷 */
function formatTooltipValue(value: number): string {
  return value.toLocaleString("ko-KR") + "원";
}

/** 월별 매출 바 차트 */
export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">월별 매출 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={formatAxisValue}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                width={50}
              />
              <Tooltip
                formatter={(value) => [formatTooltipValue(Number(value)), "매출"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
