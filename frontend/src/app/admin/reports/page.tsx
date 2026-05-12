"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { AlertTriangle, FileText, CheckCircle, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Report } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Diajukan", color: "text-yellow-400 bg-yellow-400/10" },
  UNDER_REVIEW: { label: "Ditinjau", color: "text-blue-400 bg-blue-400/10" },
  RESOLVED: { label: "Selesai", color: "text-emerald-400 bg-emerald-400/10" },
  DISMISSED: { label: "Ditolak", color: "text-red-400 bg-red-400/10" },
};

export default function AdminReportsPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const fetchReports = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/reports?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setReports(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(page); }, [page]);

  const handleUpdate = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      await api.put(`/reports/${selected.id}`, { status: newStatus, adminNotes });
      toast.success("Status laporan berhasil diperbarui");
      setSelected(null);
      fetchReports(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui laporan");
    } finally { setUpdating(false); }
  };

  const stats = {
    submitted: reports.filter((r) => r.status === "SUBMITTED").length,
    underReview: reports.filter((r) => r.status === "UNDER_REVIEW").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
    dismissed: reports.filter((r) => r.status === "DISMISSED").length,
  };

  return (
    <DashboardLayout roles="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Laporan</h1>
          <p className="text-muted-foreground">Kelola laporan penyimpangan dari masyarakat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Baru Masuk" value={stats.submitted} icon={AlertTriangle} color="text-yellow-400" bg="bg-yellow-400/10" index={0} />
          <StatCard label="Sedang Ditinjau" value={stats.underReview} icon={Clock} color="text-blue-400" bg="bg-blue-400/10" index={1} />
          <StatCard label="Selesai" value={stats.resolved} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-400/10" index={2} />
          <StatCard label="Total Laporan" value={total} icon={FileText} color="text-purple-400" bg="bg-purple-400/10" index={3} />
        </div>

        <DataTable
          columns={[
            { key: "title", label: "Judul", render: (r: Report) => <span className="font-medium max-w-[250px] truncate block">{r.title}</span> },
            { key: "reporter", label: "Pelapor", render: (r: Report) => r.reporter?.name || "Anonim" },
            { key: "status", label: "Status", render: (r: Report) => {
              const s = statusConfig[r.status] || { label: r.status, color: "" };
              return <span className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{s.label}</span>;
            }},
            { key: "evidence", label: "Bukti", render: (r: Report) => r.evidence ? <span className="text-xs text-blue-400">Ada</span> : <span className="text-xs text-muted-foreground">-</span> },
            { key: "createdAt", label: "Tanggal", render: (r: Report) => new Date(r.createdAt).toLocaleDateString("id-ID") },
            { key: "actions", label: "Aksi", render: (r: Report) => (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelected(r); setNewStatus(r.status); setAdminNotes(r.adminNotes || ""); }}>
                Tinjau
              </Button>
            )},
          ]}
          data={reports}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchReports(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada laporan masuk"
        />
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <Card className="glass-card w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detail Laporan</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Judul</p>
                  <p className="font-medium">{selected.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deskripsi</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pelapor</p>
                  <p className="text-sm">{selected.reporter?.name || "Anonim"}</p>
                </div>
                {selected.evidence && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bukti</p>
                    <p className="text-sm text-blue-400">{selected.evidence}</p>
                  </div>
                )}

                <hr className="border-border" />

                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="SUBMITTED">Diajukan</option>
                    <option value="UNDER_REVIEW">Sedang Ditinjau</option>
                    <option value="RESOLVED">Selesai</option>
                    <option value="DISMISSED">Ditolak</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Catatan Admin</Label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan tentang tindak lanjut laporan ini..."
                    className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setSelected(null)} className="flex-1">Batal</Button>
                  <Button onClick={handleUpdate} disabled={updating} className="flex-1">
                    {updating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
