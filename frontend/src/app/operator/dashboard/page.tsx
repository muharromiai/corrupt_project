"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeftRight, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction } from "@/types";

export default function OperatorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/transactions/stats").catch(() => ({ data: { data: stats } })),
      api.get("/transactions?limit=10").catch(() => ({ data: { data: [] } })),
    ]).then(([s, tx]) => {
      setStats(s.data.data);
      setTransactions(tx.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout roles="OPERATOR">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Operator</h1>
            <p className="text-muted-foreground">Selamat datang, {user?.name}.</p>
          </div>
          <Button onClick={() => router.push("/operator/transactions/new")}><Plus className="w-4 h-4 mr-2" />Buat Transaksi</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Transaksi" value={stats.total} icon={ArrowLeftRight} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="Menunggu" value={stats.pending} icon={Clock} color="text-yellow-400" bg="bg-yellow-400/10" index={1} />
          <StatCard label="Disetujui" value={stats.approved} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-400/10" index={2} />
          <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="text-red-400" bg="bg-red-400/10" index={3} />
        </div>

        <DataTable
          columns={[
            { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium">{t.description}</span> },
            { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
            { key: "recipientName", label: "Penerima" },
            { key: "status", label: "Status", render: (t: Transaction) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>{t.status}</span> },
            { key: "createdAt", label: "Tanggal", render: (t: Transaction) => new Date(t.createdAt).toLocaleDateString("id-ID") },
          ]}
          data={transactions}
          total={transactions.length}
          page={1}
          limit={10}
          onPageChange={() => {}}
          isLoading={loading}
          emptyMessage="Belum ada transaksi. Klik 'Buat Transaksi' untuk memulai."
        />
      </div>
    </DashboardLayout>
  );
}
