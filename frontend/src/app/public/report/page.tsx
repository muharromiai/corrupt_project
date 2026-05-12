"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileWarning, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function PublicReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", evidence: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reports", form);
      setSubmitted(true);
      toast.success("Laporan berhasil dikirim! Terima kasih atas partisipasi Anda.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim laporan");
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <DashboardLayout roles="PUBLIC">
        <div className="max-w-lg mx-auto text-center py-20">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Laporan Terkirim!</h2>
          <p className="text-muted-foreground mb-6">Laporan Anda sedang ditinjau oleh tim kami. Anda akan mendapat notifikasi mengenai perkembangan laporan.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ title: "", description: "", evidence: "" }); }}>Buat Laporan Lain</Button>
            <Button onClick={() => router.push("/public/dashboard")}>Kembali ke Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout roles="PUBLIC">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileWarning className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Laporkan Dugaan Penyimpangan</h1>
            <p className="text-muted-foreground">Laporkan jika Anda menemukan kejanggalan dalam pengelolaan keuangan negara</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Laporan *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={10}
                  placeholder="Contoh: Dugaan mark-up harga pengadaan barang" />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Detail *</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara detail temuan Anda: apa yang Anda temukan, di mana, kapan, dan bukti apa yang mendukung dugaan Anda..."
                  required minLength={20}
                  className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="space-y-2">
                <Label>Bukti / Link Dokumen (opsional)</Label>
                <Input value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                  placeholder="URL dokumen atau deskripsi bukti yang Anda miliki" />
              </div>

              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 text-sm text-yellow-200">
                <p className="font-medium mb-1">Catatan Penting:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Laporan Anda bersifat rahasia dan akan ditinjau oleh tim</li>
                  <li>Pastikan informasi yang Anda berikan akurat</li>
                  <li>Anda akan menerima notifikasi tentang perkembangan laporan</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</> : "Kirim Laporan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
