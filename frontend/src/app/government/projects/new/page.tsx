"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Budget } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState({
    budgetId: "", name: "", description: "", location: "",
    startDate: "", endDate: "", contractorName: "", contractValue: 0,
  });

  useEffect(() => {
    api.get("/budgets?status=ACTIVE&limit=100").then((res) => setBudgets(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/projects", { ...form, contractValue: Number(form.contractValue) });
      toast.success("Proyek berhasil dibuat!");
      router.push("/government/projects");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat proyek");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Proyek Baru</h1>
            <p className="text-muted-foreground">Proyek akan terhubung dengan anggaran yang dipilih</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Anggaran Terkait *</Label>
                <select value={form.budgetId} onChange={(e) => setForm({ ...form, budgetId: e.target.value })} required
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih anggaran...</option>
                  {budgets.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.category})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Nama Proyek *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={3}
                  placeholder="Contoh: Pembangunan Jalan Tol Ruas A-B" />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Proyek *</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan detail dan tujuan proyek..."
                  required minLength={10}
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lokasi *</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="Kota / Provinsi" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Kontraktor *</Label>
                  <Input value={form.contractorName} onChange={(e) => setForm({ ...form, contractorName: e.target.value })} required placeholder="PT / CV" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai *</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai *</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nilai Kontrak (Rp) *</Label>
                <Input type="number" value={form.contractValue || ""} onChange={(e) => setForm({ ...form, contractValue: parseFloat(e.target.value) || 0 })} required min={1} />
                {form.contractValue > 0 && <p className="text-xs text-muted-foreground">Rp {form.contractValue.toLocaleString("id-ID")}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Batal</Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Proyek"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
