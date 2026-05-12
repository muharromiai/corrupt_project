"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { BudgetChart } from "@/components/charts/budget-chart";
import { TransactionPieChart } from "@/components/charts/transaction-pie-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { Wallet, FolderKanban, BarChart3, FileWarning } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget } from "@/types";

export default function PublicDashboard() {
  const [budgetStats, setBudgetStats] = useState({ totalAmount: 0, allocatedAmount: 0, activeBudgets: 0 });
  const [txStats, setTxStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/budgets/stats").catch(() => ({ data: { data: budgetStats } })),
      api.get("/transactions/stats").catch(() => ({ data: { data: txStats } })),
      api.get("/budgets?status=ACTIVE&limit=6").catch(() => ({ data: { data: [] } })),
    ]).then(([bs, ts, b]) => {
      setBudgetStats(bs.data.data);
      setTxStats(ts.data.data);
      setBudgets(b.data.data || []);
    });
  }, []);

  const absorption = budgetStats.totalAmount > 0 ? ((budgetStats.allocatedAmount / budgetStats.totalAmount) * 100).toFixed(1) : "0";

  const chartData = budgets.map((b) => ({
    name: b.name.length > 15 ? b.name.substring(0, 15) + "..." : b.name,
    total: Number(b.totalAmount), allocated: Number(b.allocatedAmount), remaining: Number(b.remainingAmount),
  }));

  const pieData = [
    { name: "Disetujui", value: txStats.approved, color: "#10b981" },
    { name: "Menunggu", value: txStats.pending, color: "#f59e0b" },
    { name: "Ditolak", value: txStats.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const trendData = [
    { month: "Jan", amount: 45e9 }, { month: "Feb", amount: 52e9 }, { month: "Mar", amount: 48e9 },
    { month: "Apr", amount: 61e9 }, { month: "Mei", amount: 55e9 }, { month: "Jun", amount: 67e9 },
  ];

  return (
    <DashboardLayout roles="PUBLIC">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Transparansi Publik</h1>
          <p className="text-muted-foreground">Pantau penggunaan anggaran negara secara transparan dan real-time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Anggaran Aktif" value={budgetStats.activeBudgets} icon={Wallet} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="Total Dana Negara" value={formatCurrency(budgetStats.totalAmount)} icon={BarChart3} color="text-emerald-400" bg="bg-emerald-400/10" index={1} />
          <StatCard label="Penyerapan" value={`${absorption}%`} icon={FolderKanban} color="text-yellow-400" bg="bg-yellow-400/10" index={2} />
          <StatCard label="Total Transaksi" value={txStats.total} icon={FileWarning} color="text-purple-400" bg="bg-purple-400/10" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetChart data={chartData} title="Anggaran Aktif" />
          <TransactionPieChart data={pieData.length > 0 ? pieData : [{ name: "Belum ada", value: 1, color: "#374151" }]} />
        </div>

        <SpendingTrendChart data={trendData} title="Tren Pengeluaran Bulanan" />
      </div>
    </DashboardLayout>
  );
}
