"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Blocks, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useBlockchainStats } from "@/hooks/use-blockchain";

export function BlockchainStatusCard() {
  const { stats, loading } = useBlockchainStats();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Menghubungkan ke blockchain...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Blocks className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-sm">Status Blockchain</h3>
          {stats.connected ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" />Terhubung</span>
          ) : (
            <span className="ml-auto flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" />Tidak Terhubung</span>
          )}
        </div>

        {stats.connected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold">{stats.blockNumber}</p>
              <p className="text-xs text-muted-foreground">Block</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold">{stats.totalBudgets}</p>
              <p className="text-xs text-muted-foreground">Anggaran</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold">{stats.totalTransactions}</p>
              <p className="text-xs text-muted-foreground">Transaksi</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-lg font-bold">{stats.totalAudits}</p>
              <p className="text-xs text-muted-foreground">Audit</p>
            </div>
          </div>
        )}

        {stats.connected && stats.auditSummary && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Ringkasan Audit On-Chain</p>
            <div className="flex gap-4 text-xs">
              <span className="text-emerald-400">Disetujui: {stats.auditSummary.approved}</span>
              <span className="text-red-400">Ditolak: {stats.auditSummary.rejected}</span>
              <span className="text-blue-400">Ditinjau: {stats.auditSummary.reviewed}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
