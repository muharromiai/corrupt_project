"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface AuditLogEntry {
  id: string;
  action: string;
  status: string;
  notes: string | null;
  blockchainTxHash: string | null;
  createdAt: string;
  transaction: { id: string; description: string; amount: number; status: string; recipientName: string };
  auditor: { id: string; name: string };
}

export default function AuditTrailPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/audit-logs?page=${page}&limit=15`),
      api.get("/audit-logs/stats").catch(() => null),
    ]).then(([res, s]) => {
      setLogs(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
      if (s) setStats(s.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const approved = stats?.database?.find((s: any) => s.action === "APPROVED")?._count || 0;
  const rejected = stats?.database?.find((s: any) => s.action === "REJECTED")?._count || 0;
  const reviewed = stats?.database?.find((s: any) => s.action === "REVIEWED")?._count || 0;

  return (
    <DashboardLayout roles={["AUDITOR", "ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Jejak audit seluruh transaksi keuangan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Audit" value={total} icon={Shield} color="text-blue-400" bg="bg-blue-400/10" index={0} />
          <StatCard label="Disetujui" value={approved} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-400/10" index={1} />
          <StatCard label="Ditolak" value={rejected} icon={XCircle} color="text-red-400" bg="bg-red-400/10" index={2} />
          <StatCard label="Ditinjau" value={reviewed} icon={Eye} color="text-yellow-400" bg="bg-yellow-400/10" index={3} />
        </div>

        <DataTable
          columns={[
            { key: "createdAt", label: "Waktu", render: (l: AuditLogEntry) => new Date(l.createdAt).toLocaleString("id-ID"), className: "whitespace-nowrap" },
            { key: "auditor", label: "Auditor", render: (l: AuditLogEntry) => l.auditor?.name || "-" },
            { key: "transaction", label: "Transaksi", render: (l: AuditLogEntry) => (
              <div>
                <span className="max-w-[200px] truncate block text-sm">{l.transaction?.description || "-"}</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(Number(l.transaction?.amount || 0))}</span>
              </div>
            )},
            { key: "action", label: "Aksi", render: (l: AuditLogEntry) => (
              <Badge variant={l.action === "APPROVED" ? "default" : l.action === "REJECTED" ? "destructive" : "secondary"}>{l.action}</Badge>
            )},
            { key: "notes", label: "Catatan", render: (l: AuditLogEntry) => <span className="text-xs max-w-[200px] truncate block">{l.notes || "-"}</span> },
            { key: "blockchain", label: "Blockchain", render: (l: AuditLogEntry) => l.blockchainTxHash ? <span className="text-xs text-emerald-400 font-mono">{l.blockchainTxHash.slice(0, 10)}...</span> : <span className="text-xs text-muted-foreground">-</span> },
          ]}
          data={logs}
          total={total}
          page={page}
          limit={15}
          onPageChange={setPage}
          isLoading={loading}
          emptyMessage="Belum ada audit trail"
          onRowClick={(l) => router.push(`/auditor/audit-trail/${l.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
