"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Transaction } from "@/types";

export default function AuditorTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchData = (p: number, search?: string) => {
    setLoading(true);
    const statusQuery = filter !== "ALL" ? `&status=${filter}` : "";
    api.get(`/transactions?page=${p}&limit=10${statusQuery}${search ? `&search=${search}` : ""}`)
      .then((res) => { setTransactions(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(page); }, [page, filter]);

  const handleVerify = async (txId: string, action: "APPROVED" | "REJECTED") => {
    setVerifying(txId);
    try {
      const notes = action === "APPROVED" ? "Dokumen lengkap dan valid." : "Dokumen tidak lengkap atau tidak sesuai.";
      await api.put(`/transactions/${txId}/verify`, { action, notes });
      toast.success(`Transaksi berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}`);
      fetchData(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memverifikasi");
    } finally { setVerifying(null); }
  };

  return (
    <DashboardLayout roles="AUDITOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Verifikasi Transaksi</h1>
          <p className="text-muted-foreground">Periksa dan verifikasi semua transaksi keuangan</p>
        </div>

        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => { setFilter(s); setPage(1); }}>
              {s === "ALL" ? "Semua" : s === "PENDING" ? "Menunggu" : s === "APPROVED" ? "Disetujui" : "Ditolak"}
            </Button>
          ))}
        </div>

        <DataTable
          columns={[
            { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium max-w-[200px] truncate block">{t.description}</span> },
            { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
            { key: "recipientName", label: "Penerima" },
            { key: "status", label: "Status", render: (t: Transaction) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>{t.status}</span> },
            { key: "blockchain", label: "On-Chain", render: (t: Transaction) => t.blockchainTxHash ? <span className="text-emerald-400 text-xs font-mono">{t.blockchainTxHash.slice(0, 10)}...</span> : <span className="text-muted-foreground text-xs">-</span> },
            { key: "actions", label: "Aksi", render: (t: Transaction) => t.status === "PENDING" ? (
              <div className="flex gap-1">
                <Button size="sm" disabled={verifying === t.id} onClick={(e) => { e.stopPropagation(); handleVerify(t.id, "APPROVED"); }}
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Setuju</Button>
                <Button size="sm" variant="destructive" disabled={verifying === t.id} onClick={(e) => { e.stopPropagation(); handleVerify(t.id, "REJECTED"); }}
                  className="h-7 text-xs"><XCircle className="w-3 h-3 mr-1" />Tolak</Button>
              </div>
            ) : <span className="text-xs text-muted-foreground">-</span> },
          ]}
          data={transactions}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchData(1, q); }}
          isLoading={loading}
          emptyMessage="Tidak ada transaksi ditemukan"
        />
      </div>
    </DashboardLayout>
  );
}
