"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useOnChainBudget, useOnChainTransaction } from "@/hooks/use-blockchain";
import { formatCurrency } from "@/lib/utils";

interface Props {
  type: "budget" | "transaction";
  id: string;
  dbData?: { name?: string; totalAmount?: number; amount?: number; status?: string };
}

export function BlockchainVerifier({ type, id, dbData }: Props) {
  const budgetHook = useOnChainBudget(type === "budget" ? id : null);
  const txHook = useOnChainTransaction(type === "transaction" ? id : null);

  const data = type === "budget" ? budgetHook.data : txHook.data;
  const loading = type === "budget" ? budgetHook.loading : txHook.loading;

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Memverifikasi data on-chain...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="glass-card border-yellow-400/20">
        <CardContent className="p-4 flex items-center gap-3">
          <XCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">Data belum tercatat di blockchain</span>
        </CardContent>
      </Card>
    );
  }

  const isMatch = type === "budget"
    ? data.name === dbData?.name && data.totalAmount === dbData?.totalAmount
    : data.amount === dbData?.amount && data.status === dbData?.status;

  return (
    <Card className={`glass-card border ${isMatch ? "border-emerald-400/20" : "border-red-400/20"}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Verifikasi Blockchain</span>
          {isMatch ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" />Data Cocok</span>
          ) : (
            <span className="ml-auto flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" />Data Berbeda</span>
          )}
        </div>

        <div className="space-y-1 text-xs">
          {type === "budget" && (
            <>
              <div className="flex justify-between"><span className="text-muted-foreground">Nama (On-Chain):</span><span>{data.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total (On-Chain):</span><span>{formatCurrency(data.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Kategori:</span><span>{data.category}</span></div>
            </>
          )}
          {type === "transaction" && (
            <>
              <div className="flex justify-between"><span className="text-muted-foreground">Jumlah (On-Chain):</span><span>{formatCurrency(data.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status (On-Chain):</span><span>{data.status}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Penerima:</span><span>{data.recipientName}</span></div>
            </>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Dibuat oleh:</span><span className="font-mono">{data.createdBy?.slice(0, 10)}...</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Timestamp:</span><span>{new Date(data.createdAt * 1000).toLocaleString("id-ID")}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
