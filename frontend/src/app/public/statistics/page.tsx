"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { BudgetChart } from "@/components/charts/budget-chart";
import { TransactionPieChart } from "@/components/charts/transaction-pie-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Wallet, ArrowLeftRight, FolderKanban } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget } from "@/types";

export default function PublicStatisticsPage() {
  const [budgetStats, setBudgetStats] = useState({ totalAmount: 0, allocatedAmount: 0, activeBudgets: 0 });
  const [txStats, setTxStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalApprovedAmount: 0 });
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/budgets/stats").catch(() => ({ data: { data: { totalAmount: 0, allocatedAmount: 0, activeBudgets: 0 } } })),
      api.get("/transactions/stats").catch(() => ({ data: { data: { total: 0, pending: 0, approved: 0, rejected: 0, totalApprovedAmount: 0 } } })),
      api.get("/budgets?status=ACTIVE&limit=10").catch(() => ({ data: { data: [] } })),
    ]).then(([bs, ts, b]) => {
      setBudgetStats(bs.data.data);
      setTxStats(ts.data.data);
      setBudgets(b.data.data || []);
    });
  }, []);

  const absorption = budgetStats.totalAmount > 0 ? ((budgetStats.allocatedAmount / budgetStats.totalAmount) * 100).toFixed(1) : "0";
  const approvalRate = txStats.total > 0 ? ((txStats.approved / txStats.total) * 100).toFixed(1) : "0";

  const chartData = budgets.map((b) => ({
    name: b.name.length > 15 ? b.name.substring(0, 15) + "..." : b.name,
    total: Number(b.totalAmount), allocated: Number(b.allocatedAmount), remaining: Number(b.remainingAmount),
  }));

  const pieData = [
    { name: "Disetujui", value: txStats.approved, color: "#10b981" },
    { name: "Menunggu", value: txStats.pending, color: "#f59e0b" },
    { name: "Ditolak", value: txStats.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const categoryBreakdown = budgets.reduce<Record<string, number>>((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + Number(b.totalAmount);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    INFRASTRUCTURE: "Infrastruktur", EDUCATION: "Pendidikan", HEALTH: "Kesehatan",
    DEFENSE: "Pertahanan", SOCIAL_WELFARE: "Kesejahteraan Sosial", AGRICULTURE: "Pertanian",
    TECHNOLOGY: "Teknologi", TRANSPORTATION: "Transportasi", ENERGY: "Energi", OTHER: "Lainnya",
  };

  const trendData = [
    { month: "Jan", amount: 45e9 }, { month: "Feb", amount: 52e9 }, { month: "Mar", amount: 48e9 },
    { month: "Apr", amount: 61e9 }, { month: "Mei", amount: 55e9 }, { month: "Jun", amount: 67e9 },
  ];

  return (
    <DashboardLayout roles="PUBLIC">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistik Keuangan Negara</h1>
          <p className="text-muted-foreground">Data statistik komprehensif tentang pengelolaan anggaran</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Anggaran" value={formatCurrency(budgetStats.totalAmount)} icon={Wallet} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="Total Penyerapan" value={formatCurrency(budgetStats.allocatedAmount)} icon={BarChart3} color="text-emerald-400" bg="bg-emerald-400/10" index={1} />
          <StatCard label="Rasio Penyerapan" value={`${absorption}%`} icon={FolderKanban} color="text-yellow-400" bg="bg-yellow-400/10" index={2} />
          <StatCard label="Tingkat Persetujuan" value={`${approvalRate}%`} icon={ArrowLeftRight} color="text-purple-400" bg="bg-purple-400/10" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetChart data={chartData} title="Perbandingan Anggaran Aktif" />
          <TransactionPieChart data={pieData.length > 0 ? pieData : [{ name: "Belum ada", value: 1, color: "#374151" }]} title="Distribusi Status Transaksi" />
        </div>

        <SpendingTrendChart data={trendData} title="Tren Pengeluaran Bulanan" />

        {Object.keys(categoryBreakdown).length > 0 && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribusi Anggaran per Kategori</h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([cat, amount]) => {
                  const pct = budgetStats.totalAmount > 0 ? (amount / budgetStats.totalAmount) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-4">
                      <span className="text-sm w-40 shrink-0">{categoryLabels[cat] || cat}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">{pct.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground w-32 text-right">{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
