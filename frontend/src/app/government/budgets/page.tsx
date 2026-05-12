"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget } from "@/types";

export default function BudgetListPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/budgets?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setBudgets(res.data.data); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudgets(page); }, [page]);

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Anggaran</h1>
            <p className="text-muted-foreground">Kelola anggaran negara</p>
          </div>
          <Button onClick={() => router.push("/government/budgets/new")}><Plus className="w-4 h-4 mr-2" />Buat Anggaran</Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nama Anggaran", render: (b: Budget) => <span className="font-medium">{b.name}</span> },
            { key: "category", label: "Kategori", render: (b: Budget) => <Badge variant="secondary">{b.category.replace("_", " ")}</Badge> },
            { key: "fiscalYear", label: "Tahun" },
            { key: "totalAmount", label: "Total Dana", render: (b: Budget) => formatCurrency(Number(b.totalAmount)) },
            { key: "remainingAmount", label: "Sisa", render: (b: Budget) => formatCurrency(Number(b.remainingAmount)) },
            { key: "status", label: "Status", render: (b: Budget) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>{b.status}</span> },
            { key: "blockchain", label: "Blockchain", render: (b: Budget) => b.blockchainTxHash ? <span className="text-xs text-emerald-400">On-chain</span> : <span className="text-xs text-muted-foreground">Off-chain</span> },
          ]}
          data={budgets}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchBudgets(1, q); }}
          searchPlaceholder="Cari nama anggaran..."
          isLoading={loading}
          onRowClick={(b) => router.push(`/government/budgets/${b.id}`)}
          emptyMessage="Belum ada anggaran. Klik 'Buat Anggaran' untuk membuat."
        />
      </div>
    </DashboardLayout>
  );
}
