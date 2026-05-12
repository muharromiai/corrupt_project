"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { TransactionPieChart } from "@/components/charts/transaction-pie-chart";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { ClipboardCheck, ArrowLeftRight, CheckCircle, XCircle } from "lucide-react";
import { BlockchainStatusCard } from "@/components/ui/blockchain-status";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Transaction } from "@/types";

export default function AuditorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalApprovedAmount: 0 });
  const [pendingTx, setPendingTx] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/transactions/stats").catch(() => ({ data: { data: stats } })),
      api.get(`/transactions?status=PENDING&page=${page}&limit=10`).catch(() => ({ data: { data: [], meta: { total: 0 } } })),
    ]).then(([s, tx]) => {
      setStats(s.data.data);
      setPendingTx(tx.data.data || []);
      setTotal(tx.data.meta?.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleVerify = async (txId: string, action: "APPROVED" | "REJECTED") => {
    setVerifying(txId);
    try {
      const notes = action === "APPROVED" ? "Dokumen lengkap dan valid. Transaksi disetujui." : "Dokumen tidak lengkap atau tidak sesuai.";
      await api.put(`/transactions/${txId}/verify`, { action, notes });
      toast.success(`Transaksi berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memverifikasi");
    } finally { setVerifying(null); }
  };

  const pieData = [
    { name: "Disetujui", value: stats.approved, color: "#10b981" },
    { name: "Menunggu", value: stats.pending, color: "#f59e0b" },
    { name: "Ditolak", value: stats.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout roles="AUDITOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Auditor</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.name}. Verifikasi transaksi keuangan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Menunggu Verifikasi" value={stats.pending} icon={ClipboardCheck} color="text-yellow-400" bg="bg-yellow-400/10" index={0} />
          <StatCard label="Total Transaksi" value={stats.total} icon={ArrowLeftRight} color="text-blue-400" bg="bg-blue-400/10" index={1} />
          <StatCard label="Disetujui" value={stats.approved} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-400/10" index={2} />
          <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="text-red-400" bg="bg-red-400/10" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataTable
              columns={[
                { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium max-w-[200px] truncate block">{t.description}</span> },
                { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
                { key: "recipientName", label: "Penerima" },
                { key: "blockchain", label: "On-Chain", render: (t: Transaction) => t.blockchainTxHash ? <span className="text-emerald-400 text-xs">Verified</span> : <span className="text-muted-foreground text-xs">-</span> },
                { key: "actions", label: "Aksi", render: (t: Transaction) => (
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" disabled={verifying === t.id} onClick={(e) => { e.stopPropagation(); handleVerify(t.id, "APPROVED"); }}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Setuju</Button>
                    <Button size="sm" variant="destructive" disabled={verifying === t.id} onClick={(e) => { e.stopPropagation(); handleVerify(t.id, "REJECTED"); }}
                      className="h-7 text-xs"><XCircle className="w-3 h-3 mr-1" />Tolak</Button>
                  </div>
                )},
              ]}
              data={pendingTx}
              total={total}
              page={page}
              limit={10}
              onPageChange={setPage}
              isLoading={loading}
              emptyMessage="Tidak ada transaksi yang perlu diverifikasi"
            />
          </div>
          <TransactionPieChart data={pieData.length > 0 ? pieData : [{ name: "Belum ada", value: 1, color: "#374151" }]} title="Ringkasan Verifikasi" />
        </div>

        <BlockchainStatusCard />
      </div>
    </DashboardLayout>
  );
}
