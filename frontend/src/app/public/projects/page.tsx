"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Project } from "@/types";

const statusLabels: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Perencanaan", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  IN_PROGRESS: { label: "Berjalan", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
  COMPLETED: { label: "Selesai", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-400 border-red-400/30 bg-red-400/10" },
};

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProjects = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/projects?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setProjects(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(page); }, [page]);

  return (
    <DashboardLayout roles="PUBLIC">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Proyek Pemerintah</h1>
          <p className="text-muted-foreground">Pantau progres proyek yang didanai anggaran negara</p>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nama Proyek", render: (p: Project) => <span className="font-medium">{p.name}</span> },
            { key: "location", label: "Lokasi" },
            { key: "contractorName", label: "Kontraktor" },
            { key: "contractValue", label: "Nilai Kontrak", render: (p: Project) => formatCurrency(Number(p.contractValue)) },
            { key: "progress", label: "Progres", render: (p: Project) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.progress >= 100 ? "bg-emerald-400" : p.progress >= 50 ? "bg-blue-400" : "bg-yellow-400"}`} style={{ width: `${Math.min(p.progress, 100)}%` }} />
                </div>
                <span className="text-xs font-medium">{p.progress}%</span>
              </div>
            )},
            { key: "status", label: "Status", render: (p: Project) => {
              const s = statusLabels[p.status] || { label: p.status, color: "text-muted-foreground" };
              return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${s.color}`}>{s.label}</span>;
            }},
            { key: "period", label: "Periode", render: (p: Project) => <span className="text-xs text-muted-foreground">{new Date(p.startDate).toLocaleDateString("id-ID")} - {new Date(p.endDate).toLocaleDateString("id-ID")}</span> },
          ]}
          data={projects}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchProjects(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada data proyek"
        />
      </div>
    </DashboardLayout>
  );
}
