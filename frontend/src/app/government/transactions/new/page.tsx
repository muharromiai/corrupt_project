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

const categories = [
  { value: "DISBURSEMENT", label: "Pencairan Dana" }, { value: "PROCUREMENT", label: "Pengadaan Barang" },
  { value: "SALARY", label: "Gaji / Upah" }, { value: "GRANT", label: "Hibah" },
  { value: "SUBSIDY", label: "Subsidi" }, { value: "MAINTENANCE", label: "Pemeliharaan" },
  { value: "OPERATIONAL", label: "Operasional" }, { value: "OTHER", label: "Lainnya" },
];

export default function GovernmentNewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState({
    budgetId: "", description: "", amount: 0,
    category: "DISBURSEMENT", recipientName: "", recipientAccount: "",
  });

  useEffect(() => {
    api.get("/budgets?status=ACTIVE&limit=100").then((res) => setBudgets(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/transactions", { ...form, amount: Number(form.amount) });
      toast.success("Transaksi berhasil dibuat dan dicatat ke blockchain!");
      router.push("/government/transactions");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat transaksi");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout roles={["GOVERNMENT", "ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Transaksi Baru</h1>
            <p className="text-muted-foreground">Transaksi akan dicatat ke blockchain secara otomatis</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Anggaran *</Label>
                <select value={form.budgetId} onChange={(e) => setForm({ ...form, budgetId: e.target.value })} required
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Pilih anggaran...</option>
                  {budgets.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.category})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah (Rp) *</Label>
                  <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required min={1} />
                  {form.amount > 0 && <p className="text-xs text-muted-foreground">Rp {form.amount.toLocaleString("id-ID")}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Transaksi *</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan detail transaksi..." required minLength={10}
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penerima *</Label>
                  <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} required minLength={2} placeholder="PT / CV / Nama" />
                </div>
                <div className="space-y-2">
                  <Label>No. Rekening Penerima *</Label>
                  <Input value={form.recipientAccount} onChange={(e) => setForm({ ...form, recipientAccount: e.target.value })} required minLength={5} placeholder="BANK-1234567890" />
                </div>
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
