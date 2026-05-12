"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Building2, Calendar, Wallet, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Project } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Perencanaan", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  IN_PROGRESS: { label: "Berjalan", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
  COMPLETED: { label: "Selesai", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-400 border-red-400/30 bg-red-400/10" },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/projects/${params.id}`)
      .then((res) => setProject(res.data.data))
      .catch(() => router.push("/government/projects"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !project) {
    return (
      <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  const s = statusConfig[project.status] || { label: project.status, color: "text-muted-foreground" };

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/government/projects")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.budget?.name || "Anggaran terkait"}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${s.color}`}>{s.label}</span>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Progres Proyek</h3>
            <div className="w-full h-5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${project.progress >= 100 ? "bg-emerald-400" : project.progress >= 50 ? "bg-blue-400" : "bg-yellow-400"}`}
                style={{ width: `${Math.min(project.progress, 100)}%` }} />
            </div>
            <p className="text-lg font-bold mt-2">{project.progress}%</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Informasi Proyek</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lokasi</p>
                    <p className="text-sm font-medium">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Kontraktor</p>
                    <p className="text-sm font-medium">{project.contractorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nilai Kontrak</p>
                    <p className="text-sm font-medium">{formatCurrency(Number(project.contractValue))}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Jadwal</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                    <p className="text-sm font-medium">{new Date(project.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
                    <p className="text-sm font-medium">{new Date(project.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dibuat pada</p>
                  <p className="text-sm">{new Date(project.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {project.description && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {project.blockchainTxHash && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Blockchain</h3>
              <p className="text-xs font-mono text-emerald-400">{project.blockchainTxHash}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
