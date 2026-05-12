"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { DataTable } from "@/components/tables/data-table";
import api from "@/lib/api";
import type { ActivityLog } from "@/types";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/activity-logs?page=${page}&limit=20`)
      .then((res) => { setLogs(res.data.data || []); setTotal(res.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action === "REGISTER") return "text-emerald-400 bg-emerald-400/10";
    if (action.includes("UPDATE") || action === "APPROVE") return "text-blue-400 bg-blue-400/10";
    if (action.includes("DELETE") || action === "REJECT") return "text-red-400 bg-red-400/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <DashboardLayout roles="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">Log aktivitas semua pengguna sistem</p>
        </div>

        <DataTable
          columns={[
            { key: "createdAt", label: "Waktu", render: (l: ActivityLog) => new Date(l.createdAt).toLocaleString("id-ID"), className: "whitespace-nowrap" },
            { key: "user", label: "User", render: (l: ActivityLog) => (
              <div><p className="font-medium">{l.user?.name}</p><p className="text-xs text-muted-foreground">{l.user?.role}</p></div>
            )},
            { key: "action", label: "Aksi", render: (l: ActivityLog) => <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(l.action)}`}>{l.action}</span> },
            { key: "entity", label: "Entitas" },
            { key: "ipAddress", label: "IP", render: (l: ActivityLog) => <span className="text-xs font-mono">{l.ipAddress || "-"}</span> },
          ]}
          data={logs}
          total={total}
          page={page}
          limit={20}
          onPageChange={setPage}
          isLoading={loading}
          emptyMessage="Belum ada aktivitas tercatat"
        />
      </div>
    </DashboardLayout>
  );
}
