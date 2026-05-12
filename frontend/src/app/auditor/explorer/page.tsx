"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Blocks, ArrowLeftRight, Shield, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { AuditLog, Transaction } from "@/types";

export default function BlockchainExplorerPage() {
  const [searchHash, setSearchHash] = useState("");
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/audit-logs?limit=10").catch(() => ({ data: { data: [] } })),
      api.get("/transactions?limit=10").catch(() => ({ data: { data: [] } })),
      api.get("/transactions/stats").catch(() => ({ data: { data: { total: 0, approved: 0, rejected: 0 } } })),
    ]).then(([audits, txs, s]) => {
      setRecentAudits(audits.data.data || []);
      setRecentTx(txs.data.data || []);
      setStats(s.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const onChainTx = recentTx.filter((t) => t.blockchainTxHash);
  const onChainAudits = recentAudits.filter((a) => a.blockchainTxHash);

  const filtered = searchHash
    ? [...onChainTx.filter((t) => t.blockchainTxHash?.toLowerCase().includes(searchHash.toLowerCase()))]
    : onChainTx;

  return (
    <DashboardLayout roles={["AUDITOR", "ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Blockchain Explorer</h1>
          <p className="text-muted-foreground">Jelajahi data yang tercatat di blockchain</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                <Blocks className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaksi On-Chain</p>
                <p className="text-2xl font-bold">{onChainTx.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit On-Chain</p>
                <p className="text-2xl font-bold">{onChainAudits.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Diverifikasi</p>
                <p className="text-2xl font-bold">{stats.approved + stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari berdasarkan hash transaksi blockchain..." className="pl-10" value={searchHash} onChange={(e) => setSearchHash(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Transaksi Blockchain Terbaru</h3>
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Tidak ada transaksi blockchain ditemukan</p>
                ) : (
                  filtered.map((tx) => (
                    <div key={tx.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === "APPROVED" ? "text-emerald-400 bg-emerald-400/10" : tx.status === "REJECTED" ? "text-red-400 bg-red-400/10" : "text-yellow-400 bg-yellow-400/10"}`}>
                              {tx.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatCurrency(Number(tx.amount))}</span>
                            <span className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                        {tx.blockchainTxHash && (
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Tx Hash</p>
                            <p className="text-xs font-mono text-emerald-400">{tx.blockchainTxHash.slice(0, 18)}...</p>
                            {tx.blockchainBlockNumber && <p className="text-xs text-muted-foreground">Block #{tx.blockchainBlockNumber}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {onChainAudits.length > 0 && (
          <Card className="glass-card">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Audit Trail On-Chain</h3>
              <div className="space-y-3">
                {onChainAudits.map((audit) => (
                  <div key={audit.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{audit.auditor?.name || "Auditor"}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${audit.action === "APPROVED" ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                          {audit.action}
                        </span>
                        {audit.notes && <p className="text-xs text-muted-foreground mt-1">{audit.notes}</p>}
                      </div>
                      {audit.blockchainTxHash && (
                        <p className="text-xs font-mono text-emerald-400">{audit.blockchainTxHash.slice(0, 18)}...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
