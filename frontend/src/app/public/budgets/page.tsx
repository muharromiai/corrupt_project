"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Budget } from "@/types";

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: "Infrastruktur", EDUCATION: "Pendidikan", HEALTH: "Kesehatan",
  DEFENSE: "Pertahanan", SOCIAL_WELFARE: "Kesejahteraan Sosial", AGRICULTURE: "Pertanian",
  TECHNOLOGY: "Teknologi", TRANSPORTATION: "Transportasi", ENERGY: "Energi", OTHER: "Lainnya",
};

export default function PublicBudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/budgets?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setBudgets(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudgets(page); }, [page]);

  return (
    <DashboardLayout roles="PUBLIC">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Transparansi Anggaran</h1>
          <p className="text-muted-foreground">Informasi anggaran negara yang dapat diakses publik</p>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nama Anggaran", render: (b: Budget) => <span className="font-medium">{b.name}</span> },
            { key: "category", label: "Kategori", render: (b: Budget) => <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">{categoryLabels[b.category] || b.category}</span> },
            { key: "fiscalYear", label: "Tahun" },
            { key: "totalAmount", label: "Total Dana", render: (b: Budget) => formatCurrency(Number(b.totalAmount)) },
            { key: "allocatedAmount", label: "Terpakai", render: (b: Budget) => formatCurrency(Number(b.allocatedAmount)) },
            { key: "absorption", label: "Penyerapan", render: (b: Budget) => {
              const pct = Number(b.totalAmount) > 0 ? (Number(b.allocatedAmount) / Number(b.totalAmount)) * 100 : 0;
              return (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium">{pct.toFixed(1)}%</span>
                </div>
              );
            }},
            { key: "status", label: "Status", render: (b: Budget) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${b.status === "ACTIVE" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : b.status === "CLOSED" ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>{b.status}</span> },
          ]}
          data={budgets}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchBudgets(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada data anggaran"
        />
      </div>
    </DashboardLayout>
  );
}
