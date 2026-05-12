"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Wallet, ArrowLeftRight, FolderKanban, BarChart3, Blocks, CheckCircle, FileWarning, ChevronRight, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface TransparencyStats {
  budgets: { active: number; totalAmount: number; allocatedAmount: number; remainingAmount: number };
  transactions: { total: number; pending: number; approved: number; rejected: number; totalApprovedAmount: number };
  projects: number;
  reports: number;
}

interface PublicBudget {
  id: string; name: string; category: string; fiscalYear: number;
  totalAmount: number; allocatedAmount: number; remainingAmount: number;
  status: string; blockchainTxHash: string | null; _count: { projects: number; transactions: number };
}

interface PublicTransaction {
  id: string; description: string; amount: number; category: string;
  recipientName: string; status: string; blockchainTxHash: string | null; createdAt: string;
  budget: { name: string; category: string };
}

interface PublicProject {
  id: string; name: string; location: string; status: string;
  progress: number; contractorName: string; contractValue: number;
  budget: { name: string };
}

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: "Infrastruktur", EDUCATION: "Pendidikan", HEALTH: "Kesehatan",
  DEFENSE: "Pertahanan", SOCIAL_WELFARE: "Kesejahteraan Sosial", AGRICULTURE: "Pertanian",
  TECHNOLOGY: "Teknologi", TRANSPORTATION: "Transportasi", ENERGY: "Energi", OTHER: "Lainnya",
  DISBURSEMENT: "Pencairan", PROCUREMENT: "Pengadaan", SALARY: "Gaji", GRANT: "Hibah",
  SUBSIDY: "Subsidi", MAINTENANCE: "Pemeliharaan", OPERATIONAL: "Operasional",
};

const statusColors: Record<string, string> = {
  PLANNING: "text-blue-400", IN_PROGRESS: "text-yellow-400", COMPLETED: "text-emerald-400", CANCELLED: "text-red-400",
};

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats | null>(null);
  const [budgets, setBudgets] = useState<PublicBudget[]>([]);
  const [transactions, setTransactions] = useState<PublicTransaction[]>([]);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [blockchain, setBlockchain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/transparency/stats`).catch(() => null),
      axios.get(`${API}/transparency/budgets?limit=6`).catch(() => null),
      axios.get(`${API}/transparency/transactions?limit=5`).catch(() => null),
      axios.get(`${API}/transparency/projects?limit=6`).catch(() => null),
      axios.get(`${API}/transparency/blockchain`).catch(() => null),
    ]).then(([s, b, tx, p, bc]) => {
      if (s) setStats(s.data.data);
      if (b) setBudgets(b.data.data || []);
      if (tx) setTransactions(tx.data.data || []);
      if (p) setProjects(p.data.data || []);
      if (bc) setBlockchain(bc.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const absorption = stats && stats.budgets.totalAmount > 0
    ? ((stats.budgets.allocatedAmount / stats.budgets.totalAmount) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-lg font-bold gradient-text">Corruption Killer</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="outline" size="sm">Masuk</Button></Link>
            <Link href="/register"><Button size="sm">Daftar</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <h1 className="text-4xl font-bold mb-3">Transparansi Keuangan Negara</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Portal transparansi publik untuk memantau penggunaan anggaran negara secara real-time.
            Semua data tercatat di blockchain dan tidak dapat dimanipulasi.
          </p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Anggaran Negara", value: formatCurrency(stats.budgets.totalAmount), icon: Wallet, color: "text-blue-400", bg: "bg-blue-400/10" },
              { label: "Anggaran Aktif", value: stats.budgets.active, icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { label: "Penyerapan Anggaran", value: `${absorption}%`, icon: FolderKanban, color: "text-yellow-400", bg: "bg-yellow-400/10" },
              { label: "Transaksi Diverifikasi", value: stats.transactions.approved, icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-400/10" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Blockchain Status */}
        {blockchain && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Blocks className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-semibold">Status Blockchain</h2>
                {blockchain.connected ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 ml-auto"><CheckCircle className="w-3 h-3" />Aktif & Terhubung</span>
                ) : (
                  <span className="text-xs text-red-400 ml-auto">Tidak Terhubung</span>
                )}
              </div>
              {blockchain.connected && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold">{blockchain.blockNumber}</p>
                    <p className="text-xs text-muted-foreground">Block Number</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold">{blockchain.budgets}</p>
                    <p className="text-xs text-muted-foreground">Anggaran On-Chain</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold">{blockchain.transactions}</p>
                    <p className="text-xs text-muted-foreground">Transaksi On-Chain</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold">{blockchain.audits}</p>
                    <p className="text-xs text-muted-foreground">Audit On-Chain</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Budgets */}
        {budgets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Anggaran Aktif</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b) => {
                const pct = Number(b.totalAmount) > 0 ? (Number(b.allocatedAmount) / Number(b.totalAmount)) * 100 : 0;
                return (
                  <Card key={b.id} className="glass-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{b.name}</h3>
                          <p className="text-xs text-muted-foreground">{categoryLabels[b.category] || b.category} — {b.fiscalYear}</p>
                        </div>
                        {b.blockchainTxHash && <Blocks className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-lg font-bold mb-2">{formatCurrency(Number(b.totalAmount))}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Penyerapan</span>
                          <span>{pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{b._count.projects} proyek</span>
                        <span>{b._count.transactions} transaksi</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Proyek Pemerintah</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Card key={p.id} className="glass-card">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{p.location} — {p.budget?.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.progress >= 100 ? "bg-emerald-400" : p.progress >= 50 ? "bg-blue-400" : "bg-yellow-400"}`}
                          style={{ width: `${Math.min(p.progress, 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium">{p.progress}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{p.contractorName}</span>
                      <span className={statusColors[p.status] || "text-muted-foreground"}>{p.status}</span>
                    </div>
                    <p className="text-sm font-medium mt-2">{formatCurrency(Number(p.contractValue))}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Transaksi Terverifikasi Terbaru</h2>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-muted-foreground font-medium">Deskripsi</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Anggaran</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Jumlah</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Penerima</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Blockchain</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-4 font-medium max-w-[200px] truncate">{tx.description}</td>
                          <td className="p-4 text-muted-foreground">{tx.budget?.name || "-"}</td>
                          <td className="p-4">{formatCurrency(Number(tx.amount))}</td>
                          <td className="p-4 text-muted-foreground">{tx.recipientName}</td>
                          <td className="p-4">
                            {tx.blockchainTxHash
                              ? <span className="text-xs font-mono text-emerald-400">{tx.blockchainTxHash.slice(0, 10)}...</span>
                              : <span className="text-xs text-muted-foreground">-</span>}
                          </td>
                          <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Call to Action */}
        <Card className="glass-card border-yellow-400/20">
          <CardContent className="p-8 text-center">
            <FileWarning className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Lihat Kejanggalan?</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Jika Anda menemukan dugaan penyimpangan dalam pengelolaan keuangan negara,
              Anda dapat melaporkannya secara aman dan rahasia.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/register"><Button>Daftar & Laporkan</Button></Link>
              <Link href="/login"><Button variant="outline">Sudah Punya Akun</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Corruption Killer — Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain</p>
          <p className="mt-1">Data ditampilkan secara real-time dan tercatat di blockchain untuk menjamin transparansi.</p>
        </div>
      </footer>
    </div>
  );
}
