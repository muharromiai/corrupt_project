"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionPieChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
}

export function TransactionPieChart({ data, title = "Status Transaksi" }: TransactionPieChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "0.5rem", color: "hsl(210 40% 98%)" }} />
            <Legend wrapperStyle={{ color: "hsl(215 20% 65%)" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
