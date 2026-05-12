"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction } from "@/types";

export default function OperatorTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTx = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/transactions?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setTransactions(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTx(page); }, [page]);

  return (
    <DashboardLayout roles={["OPERATOR", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Transaksi</h1>
            <p className="text-muted-foreground">Kelola semua transaksi keuangan</p>
          </div>
          <Button onClick={() => router.push("/operator/transactions/new")}><Plus className="w-4 h-4 mr-2" />Buat Transaksi</Button>
        </div>

        <DataTable
          columns={[
            { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium max-w-xs truncate block">{t.description}</span> },
            { key: "budget", label: "Anggaran", render: (t: Transaction) => t.budget?.name || "-" },
            { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
            { key: "recipientName", label: "Penerima" },
            { key: "status", label: "Status", render: (t: Transaction) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>{t.status}</span> },
            { key: "blockchain", label: "Blockchain", render: (t: Transaction) => t.blockchainTxHash ? <span className="text-xs text-emerald-400 font-mono">{t.blockchainTxHash.slice(0, 10)}...</span> : <span className="text-xs text-muted-foreground">-</span> },
            { key: "createdAt", label: "Tanggal", render: (t: Transaction) => new Date(t.createdAt).toLocaleDateString("id-ID") },
          ]}
          data={transactions}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchTx(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada transaksi"
        />
      </div>
    </DashboardLayout>
  );
}
