"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { ArrowLeft, Wallet, BarChart3, FolderKanban, Loader2 } from "lucide-react";
import { BlockchainVerifier } from "@/components/ui/blockchain-verifier";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget, Transaction } from "@/types";

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: "Infrastruktur", EDUCATION: "Pendidikan", HEALTH: "Kesehatan",
  DEFENSE: "Pertahanan", SOCIAL_WELFARE: "Kesejahteraan Sosial", AGRICULTURE: "Pertanian",
  TECHNOLOGY: "Teknologi", TRANSPORTATION: "Transportasi", ENERGY: "Energi", OTHER: "Lainnya",
};

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/budgets/${params.id}`)
      .then((res) => setBudget(res.data.data))
      .catch(() => router.push("/government/budgets"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      api.get(`/transactions?budgetId=${params.id}&page=${txPage}&limit=10`)
        .then((res) => { setTransactions(res.data.data || []); setTxTotal(res.data.meta?.total || 0); })
        .catch(() => {});
    }
  }, [params.id, txPage]);

  if (loading || !budget) {
    return (
      <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  const absorption = Number(budget.totalAmount) > 0 ? (Number(budget.allocatedAmount) / Number(budget.totalAmount)) * 100 : 0;

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/government/budgets")}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{budget.name}</h1>
            <p className="text-muted-foreground">{categoryLabels[budget.category] || budget.category} — Tahun Fiskal {budget.fiscalYear}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border ${budget.status === "ACTIVE" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : budget.status === "CLOSED" ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>
            {budget.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center"><Wallet className="w-6 h-6 text-blue-400" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Anggaran</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(budget.totalAmount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-emerald-400" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Terpakai</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(budget.allocatedAmount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center"><FolderKanban className="w-6 h-6 text-yellow-400" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Anggaran</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(budget.remainingAmount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Penyerapan Anggaran</h3>
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${absorption >= 80 ? "bg-emerald-400" : absorption >= 50 ? "bg-blue-400" : "bg-yellow-400"}`} style={{ width: `${Math.min(absorption, 100)}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{absorption.toFixed(1)}% dari total anggaran telah terserap</p>
          </CardContent>
        </Card>

        {budget.description && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground">{budget.description}</p>
            </CardContent>
          </Card>
        )}

        {budget.blockchainTxHash && (
          <BlockchainVerifier type="budget" id={budget.id} dbData={{ name: budget.name, totalAmount: Number(budget.totalAmount) }} />
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Transaksi pada Anggaran Ini</h3>
          <DataTable
            columns={[
              { key: "description", label: "Deskripsi", render: (t: Transaction) => <span className="font-medium max-w-xs truncate block">{t.description}</span> },
              { key: "amount", label: "Jumlah", render: (t: Transaction) => formatCurrency(Number(t.amount)) },
              { key: "recipientName", label: "Penerima" },
              { key: "status", label: "Status", render: (t: Transaction) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>{t.status}</span> },
              { key: "createdAt", label: "Tanggal", render: (t: Transaction) => new Date(t.createdAt).toLocaleDateString("id-ID") },
            ]}
            data={transactions}
            total={txTotal}
            page={txPage}
            limit={10}
            onPageChange={setTxPage}
            isLoading={false}
            emptyMessage="Belum ada transaksi pada anggaran ini"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
