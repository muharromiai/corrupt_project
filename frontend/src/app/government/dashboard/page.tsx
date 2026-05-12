"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { BudgetChart } from "@/components/charts/budget-chart";
import { TransactionPieChart } from "@/components/charts/transaction-pie-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Wallet, FolderKanban, ArrowLeftRight, TrendingUp, Plus } from "lucide-react";
import { BlockchainStatusCard } from "@/components/ui/blockchain-status";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget, Transaction } from "@/types";

export default function GovernmentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ totalBudgets: 0, activeBudgets: 0, totalAmount: 0, allocatedAmount: 0, remainingAmount: 0 });
  const [txStats, setTxStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalApprovedAmount: 0 });
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/budgets/stats").catch(() => ({ data: { data: stats } })),
      api.get("/transactions/stats").catch(() => ({ data: { data: txStats } })),
      api.get("/budgets?limit=5").catch(() => ({ data: { data: [] } })),
      api.get("/transactions?limit=5").catch(() => ({ data: { data: [] } })),
    ]).then(([bStats, tStats, budgets, txs]) => {
      setStats(bStats.data.data);
      setTxStats(tStats.data.data);
      setRecentBudgets(budgets.data.data || []);
      setRecentTx(txs.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const absorption = stats.totalAmount > 0 ? ((stats.allocatedAmount / stats.totalAmount) * 100).toFixed(1) : "0";

  const budgetChartData = recentBudgets.map((b) => ({
    name: b.name.length > 20 ? b.name.substring(0, 20) + "..." : b.name,
    total: Number(b.totalAmount), allocated: Number(b.allocatedAmount), remaining: Number(b.remainingAmount),
  }));

  const txPieData = [
    { name: "Disetujui", value: txStats.approved, color: "#10b981" },
    { name: "Menunggu", value: txStats.pending, color: "#f59e0b" },
    { name: "Ditolak", value: txStats.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const trendData = [
    { month: "Jan", amount: 45000000000 }, { month: "Feb", amount: 52000000000 },
    { month: "Mar", amount: 48000000000 }, { month: "Apr", amount: 61000000000 },
    { month: "Mei", amount: 55000000000 }, { month: "Jun", amount: 67000000000 },
  ];

  return (
    <DashboardLayout roles="GOVERNMENT">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pemerintah</h1>
            <p className="text-muted-foreground">Selamat datang, {user?.name}.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/government/budgets/new")}><Plus className="w-4 h-4 mr-2" />Anggaran Baru</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Anggaran Aktif" value={stats.activeBudgets} icon={Wallet} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="Total Dana" value={formatCurrency(stats.totalAmount)} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-400/10" index={1} />
          <StatCard label="Total Proyek" value={recentBudgets.reduce((a, b) => a + (b._count?.projects || 0), 0)} icon={FolderKanban} color="text-yellow-400" bg="bg-yellow-400/10" index={2} />
          <StatCard label="Penyerapan" value={`${absorption}%`} icon={ArrowLeftRight} color="text-purple-400" bg="bg-purple-400/10" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetChart data={budgetChartData} />
          <TransactionPieChart data={txPieData.length > 0 ? txPieData : [{ name: "Belum ada", value: 1, color: "#374151" }]} />
        </div>

        <SpendingTrendChart data={trendData} />

        <BlockchainStatusCard />

        <DataTable
          columns={[
            { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium">{t.description}</span> },
            { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
            { key: "status", label: "Status", render: (t: Transaction) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>{t.status}</span> },
            { key: "createdAt", label: "Tanggal", render: (t: Transaction) => new Date(t.createdAt).toLocaleDateString("id-ID") },
          ]}
          data={recentTx}
          total={recentTx.length}
          page={1}
          limit={5}
          onPageChange={() => {}}
          isLoading={loading}
          emptyMessage="Belum ada transaksi"
          onRowClick={(t) => router.push(`/government/transactions?id=${t.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
