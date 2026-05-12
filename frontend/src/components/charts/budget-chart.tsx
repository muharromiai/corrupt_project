"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetChartProps {
  data: { name: string; total: number; allocated: number; remaining: number }[];
  title?: string;
}

const formatCurrency = (v: number) => {
  if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}Jt`;
  return v.toLocaleString("id-ID");
};

export function BudgetChart({ data, title = "Distribusi Anggaran" }: BudgetChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "0.5rem", color: "hsl(210 40% 98%)" }}
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
            />
            <Legend wrapperStyle={{ color: "hsl(215 20% 65%)" }} />
            <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="allocated" name="Teralokasi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="remaining" name="Sisa" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
