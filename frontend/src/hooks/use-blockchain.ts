"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProvider,
  getBudgetManagerContract,
  getTransactionManagerContract,
  getAuditTrailContract,
  isBlockchainAvailable,
} from "@/lib/blockchain";

export interface BlockchainStats {
  connected: boolean;
  blockNumber: number;
  totalBudgets: number;
  totalTransactions: number;
  totalAudits: number;
  auditSummary: { approved: number; rejected: number; reviewed: number; total: number } | null;
}

export function useBlockchainStats() {
  const [stats, setStats] = useState<BlockchainStats>({
    connected: false, blockNumber: 0, totalBudgets: 0,
    totalTransactions: 0, totalAudits: 0, auditSummary: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const connected = await isBlockchainAvailable();
    if (!connected) {
      setStats((s) => ({ ...s, connected: false }));
      setLoading(false);
      return;
    }

    try {
      const provider = getProvider();
      const blockNumber = await provider.getBlockNumber();

      const budgetContract = getBudgetManagerContract();
      const txContract = getTransactionManagerContract();
      const auditContract = getAuditTrailContract();

      const totalBudgets = budgetContract ? Number(await budgetContract.getTotalBudgets()) : 0;
      const totalTransactions = txContract ? Number(await txContract.getTotalTransactions()) : 0;
      const totalAudits = auditContract ? Number(await auditContract.getTotalAudits()) : 0;

      let auditSummary = null;
      if (auditContract) {
        const summary = await auditContract.getAuditSummary();
        auditSummary = {
          approved: Number(summary.approved),
          rejected: Number(summary.rejected),
          reviewed: Number(summary.reviewed),
          total: Number(summary.total),
        };
      }

      setStats({ connected: true, blockNumber, totalBudgets, totalTransactions, totalAudits, auditSummary });
    } catch {
      setStats((s) => ({ ...s, connected: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export interface OnChainBudget {
  name: string;
  category: string;
  totalAmount: number;
  fiscalYear: number;
  createdBy: string;
  createdAt: number;
}

export function useOnChainBudget(budgetId: string | null) {
  const [data, setData] = useState<OnChainBudget | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!budgetId) return;
    setLoading(true);
    const contract = getBudgetManagerContract();
    if (!contract) { setLoading(false); return; }

    contract.getBudget(budgetId)
      .then((result: any) => {
        setData({
          name: result.name,
          category: result.category,
          totalAmount: Number(result.totalAmount),
          fiscalYear: Number(result.fiscalYear),
          createdBy: result.createdBy,
          createdAt: Number(result.createdAt),
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [budgetId]);

  return { data, loading };
}

export function useOnChainTransaction(transactionId: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    const contract = getTransactionManagerContract();
    if (!contract) { setLoading(false); return; }

    const statusMap = ["PENDING", "APPROVED", "REJECTED"];
    contract.getTransaction(transactionId)
      .then((result: any) => {
        setData({
          budgetId: result.budgetId,
          description: result.description,
          amount: Number(result.amount),
          recipientName: result.recipientName,
          status: statusMap[result.status] || "UNKNOWN",
          createdBy: result.createdBy,
          createdAt: Number(result.createdAt),
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [transactionId]);

  return { data, loading };
}
