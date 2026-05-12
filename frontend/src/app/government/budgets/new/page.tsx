"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const categories = [
  { value: "INFRASTRUCTURE", label: "Infrastruktur" },
  { value: "EDUCATION", label: "Pendidikan" },
  { value: "HEALTH", label: "Kesehatan" },
  { value: "DEFENSE", label: "Pertahanan" },
  { value: "SOCIAL_WELFARE", label: "Kesejahteraan Sosial" },
  { value: "AGRICULTURE", label: "Pertanian" },
  { value: "TECHNOLOGY", label: "Teknologi" },
  { value: "TRANSPORTATION", label: "Transportasi" },
  { value: "ENERGY", label: "Energi" },
  { value: "OTHER", label: "Lainnya" },
];

export default function NewBudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "INFRASTRUCTURE", fiscalYear: new Date().getFullYear(),
    totalAmount: 0, description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/budgets", { ...form, totalAmount: Number(form.totalAmount), fiscalYear: Number(form.fiscalYear) });
      toast.success("Anggaran berhasil dibuat!");
      router.push("/government/budgets");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat anggaran");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Anggaran Baru</h1>
            <p className="text-muted-foreground">Data anggaran akan dicatat ke blockchain</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Anggaran</Label>
                <Input placeholder="Contoh: Anggaran Infrastruktur Jalan 2025" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun Anggaran</Label>
                  <Input type="number" value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: parseInt(e.target.value) })} min={2020} max={2100} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Dana (Rp)</Label>
                <Input type="number" placeholder="0" value={form.totalAmount || ""} onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })} required min={1} />
                {form.totalAmount > 0 && (
                  <p className="text-xs text-muted-foreground">Rp {form.totalAmount.toLocaleString("id-ID")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan tujuan dan cakupan anggaran..."
                  className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  required minLength={10} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Batal</Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan & Catat ke Blockchain"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
