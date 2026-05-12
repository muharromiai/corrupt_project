"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { Users, Shield, Activity, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { User, Report } from "@/types";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator", GOVERNMENT: "Pemerintah", OPERATOR: "Operator", AUDITOR: "Auditor", PUBLIC: "Publik",
};
const roleColors: Record<string, string> = {
  ADMIN: "text-red-400 bg-red-400/10", GOVERNMENT: "text-blue-400 bg-blue-400/10",
  OPERATOR: "text-yellow-400 bg-yellow-400/10", AUDITOR: "text-emerald-400 bg-emerald-400/10",
  PUBLIC: "text-purple-400 bg-purple-400/10",
};

export default function AdminUsersPage() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "OPERATOR" });

  const fetchUsers = (p: number, search?: string) => {
    setLoading(true);
    api.get(`/users?page=${p}&limit=10${search ? `&search=${search}` : ""}`)
      .then((res) => { setUsers(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page);
    api.get("/reports?limit=5").then((res) => setReports(res.data.data || [])).catch(() => {});
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/auth/register", form);
      toast.success("User berhasil ditambahkan");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "OPERATOR" });
      fetchUsers(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambah user");
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(`User berhasil ${isActive ? "dinonaktifkan" : "diaktifkan"}`);
      fetchUsers(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/reset-password`);
      toast.success("Password berhasil direset ke 'password123'");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal reset password");
    }
  };

  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <DashboardLayout roles="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manajemen User</h1>
            <p className="text-muted-foreground">Kelola pengguna dan hak akses sistem</p>
          </div>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" />Tambah User</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total User" value={total} icon={Users} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="User Aktif" value={activeUsers} icon={Shield} color="text-emerald-400" bg="bg-emerald-400/10" index={1} />
          <StatCard label="Laporan Masuk" value={reports.length} icon={AlertTriangle} color="text-red-400" bg="bg-red-400/10" index={2} />
          <StatCard label="Role Tersedia" value="5" icon={Activity} color="text-yellow-400" bg="bg-yellow-400/10" index={3} />
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nama", render: (u: User) => (
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            )},
            { key: "role", label: "Role", render: (u: User) => <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[u.role] || ""}`}>{roleLabels[u.role] || u.role}</span> },
            { key: "isActive", label: "Status", render: (u: User) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.isActive ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "text-red-400 border-red-400/30 bg-red-400/10"}`}>
                {u.isActive ? "Aktif" : "Nonaktif"}
              </span>
            )},
            { key: "createdAt", label: "Bergabung", render: (u: User) => new Date(u.createdAt).toLocaleDateString("id-ID") },
            { key: "actions", label: "Aksi", render: (u: User) => u.id !== me?.id ? (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleToggleActive(u.id, u.isActive); }}>
                  {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleResetPassword(u.id); }}>
                  Reset Pass
                </Button>
              </div>
            ) : <span className="text-xs text-muted-foreground">Anda</span> },
          ]}
          data={users}
          total={total}
          page={page}
          limit={10}
          onPageChange={setPage}
          onSearch={(q) => { setPage(1); fetchUsers(1, q); }}
          isLoading={loading}
          emptyMessage="Belum ada user terdaftar"
        />

        {reports.length > 0 && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Laporan Terbaru</h3>
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.reporter?.name || "Anonim"} — {new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === "SUBMITTED" ? "text-yellow-400 bg-yellow-400/10" : r.status === "RESOLVED" ? "text-emerald-400 bg-emerald-400/10" : "text-blue-400 bg-blue-400/10"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <Card className="glass-card w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tambah User Baru</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} placeholder="Nama lengkap" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="Min. 8 karakter" />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="GOVERNMENT">Pemerintah</option>
                    <option value="OPERATOR">Operator</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="PUBLIC">Publik</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Batal</Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Tambah User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
