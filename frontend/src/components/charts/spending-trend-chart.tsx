"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingTrendChartProps {
  data: { month: string; amount: number }[];
  title?: string;
}

export function SpendingTrendChart({ data, title = "Tren Pengeluaran" }: SpendingTrendChartProps) {
  const formatCurrency = (v: number) => {
    if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`;
    return v.toLocaleString("id-ID");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "0.5rem", color: "hsl(210 40% 98%)" }} formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Pengeluaran"]} />
            <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorAmount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
