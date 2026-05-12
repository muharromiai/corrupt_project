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
import type { Project } from "@/types";

export default function ProjectListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProjects = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/projects?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setProjects(res.data.data); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(page); }, [page]);

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Proyek</h1>
            <p className="text-muted-foreground">Kelola proyek pemerintah</p>
          </div>
          <Button onClick={() => router.push("/government/projects/new")}><Plus className="w-4 h-4 mr-2" />Buat Proyek</Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nama Proyek", render: (p: Project) => <span className="font-medium">{p.name}</span> },
            { key: "location", label: "Lokasi" },
            { key: "contractorName", label: "Kontraktor" },
            { key: "contractValue", label: "Nilai Kontrak", render: (p: Project) => formatCurrency(Number(p.contractValue)) },
            { key: "progress", label: "Progress", render: (p: Project) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-xs">{p.progress}%</span>
              </div>
            )},
            { key: "status", label: "Status", render: (p: Project) => <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>{p.status.replace("_", " ")}</span> },
          ]}
          data={projects}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchProjects(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada proyek"
        />
      </div>
    </DashboardLayout>
  );
}
