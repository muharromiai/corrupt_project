"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlockchainVerifier } from "@/components/ui/blockchain-verifier";
import { ArrowLeft, Shield, User, FileText, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { AuditLog } from "@/types";

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<AuditLog | null>(null);
  const [chainData, setChainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/audit-logs/${params.id}`)
      .then((res) => {
        setAudit(res.data.data);
        if (res.data.data?.transactionId) {
          api.get(`/audit-logs/blockchain/${res.data.data.transactionId}`)
            .then((r) => setChainData(r.data.data))
            .catch(() => {});
        }
      })
      .catch(() => router.push("/auditor/audit-trail"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !audit) {
    return (
      <DashboardLayout roles={["AUDITOR", "ADMIN"]}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout roles={["AUDITOR", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/auditor/audit-trail")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Detail Audit</h1>
            <p className="text-muted-foreground">Audit ID: {audit.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={audit.action === "APPROVED" ? "default" : "destructive"} className="text-sm">{audit.action}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Informasi Audit</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Aksi</p>
                  <Badge variant={audit.action === "APPROVED" ? "default" : "destructive"}>{audit.action}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Catatan Auditor</p>
                  <p className="text-sm">{audit.notes || "Tidak ada catatan"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Audit</p>
                  <p className="text-sm">{new Date(audit.createdAt).toLocaleString("id-ID")}</p>
                </div>
                {audit.blockchainTxHash && (
                  <div>
                    <p className="text-xs text-muted-foreground">Blockchain Hash</p>
                    <p className="text-xs font-mono text-emerald-400 break-all">{audit.blockchainTxHash}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold">Auditor</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="text-sm font-medium">{audit.auditor?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm">{audit.auditor?.role || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {audit.transaction && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold">Transaksi Terkait</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Deskripsi</p>
                  <p className="text-sm font-medium">{audit.transaction.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jumlah</p>
                  <p className="text-sm font-medium">{formatCurrency(Number(audit.transaction.amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Penerima</p>
                  <p className="text-sm">{audit.transaction.recipientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status Transaksi</p>
                  <Badge variant={audit.transaction.status === "APPROVED" ? "default" : audit.transaction.status === "REJECTED" ? "destructive" : "secondary"}>
                    {audit.transaction.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {audit.transactionId && (
          <BlockchainVerifier
            type="transaction"
            id={audit.transactionId}
            dbData={{ amount: Number(audit.transaction?.amount), status: audit.transaction?.status }}
          />
        )}

        {chainData && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Perbandingan Data (Database vs Blockchain)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Field</th>
                      <th className="text-left py-2 text-muted-foreground">Database</th>
                      <th className="text-left py-2 text-muted-foreground">Blockchain</th>
                      <th className="text-left py-2 text-muted-foreground">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainData.database && chainData.blockchain && (
                      <>
                        <tr className="border-b border-border/50">
                          <td className="py-2">Amount</td>
                          <td className="py-2">{formatCurrency(Number(chainData.database.amount))}</td>
                          <td className="py-2">{formatCurrency(chainData.blockchain.amount)}</td>
                          <td className="py-2">{Number(chainData.database.amount) === chainData.blockchain.amount ? <span className="text-emerald-400">OK</span> : <span className="text-red-400">MISMATCH</span>}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">Status</td>
                          <td className="py-2">{chainData.database.status}</td>
                          <td className="py-2">{chainData.blockchain.status}</td>
                          <td className="py-2">{chainData.database.status === chainData.blockchain.status ? <span className="text-emerald-400">OK</span> : <span className="text-red-400">MISMATCH</span>}</td>
                        </tr>
                        <tr>
                          <td className="py-2">Recipient</td>
                          <td className="py-2">{chainData.database.recipientName}</td>
                          <td className="py-2">{chainData.blockchain.recipientName}</td>
                          <td className="py-2">{chainData.database.recipientName === chainData.blockchain.recipientName ? <span className="text-emerald-400">OK</span> : <span className="text-red-400">MISMATCH</span>}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
