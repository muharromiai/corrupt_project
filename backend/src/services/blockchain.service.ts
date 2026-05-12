import { ethers } from "ethers";
import { getProvider, getSigner, isBlockchainConnected } from "../config/blockchain";
import { env } from "../config/env";

const BUDGET_MANAGER_ABI = [
  "function createBudget(string _budgetId, string _name, string _category, uint256 _totalAmount, uint256 _fiscalYear) external",
  "function updateBudget(string _budgetId, string _name, uint256 _totalAmount) external",
  "function getBudget(string _budgetId) external view returns (string name, string category, uint256 totalAmount, uint256 fiscalYear, address createdBy, uint256 createdAt)",
  "function getTotalBudgets() external view returns (uint256)",
  "event BudgetCreated(string indexed budgetId, string name, string category, uint256 totalAmount, uint256 fiscalYear, address indexed createdBy, uint256 timestamp)",
];

const TRANSACTION_MANAGER_ABI = [
  "function createTransaction(string _transactionId, string _budgetId, string _description, uint256 _amount, string _recipientName) external",
  "function approveTransaction(string _txId) external",
  "function rejectTransaction(string _txId) external",
  "function getTransaction(string _txId) external view returns (string budgetId, string description, uint256 amount, string recipientName, uint8 status, address createdBy, uint256 createdAt)",
  "function getTransactionStatus(string _txId) external view returns (uint8)",
  "function getTotalTransactions() external view returns (uint256)",
  "event TransactionCreated(string indexed transactionId, string indexed budgetId, string description, uint256 amount, string recipientName, address indexed createdBy, uint256 timestamp)",
  "event TransactionStatusChanged(string indexed transactionId, uint8 oldStatus, uint8 newStatus, address indexed changedBy, uint256 timestamp)",
];

const AUDIT_TRAIL_ABI = [
  "function recordAudit(string _auditId, string _transactionId, uint8 _action, string _notes) external",
  "function getAuditEntry(string _auditId) external view returns (string transactionId, uint8 action, string notes, address auditor, uint256 timestamp)",
  "function getAuditSummary() external view returns (uint256 approved, uint256 rejected, uint256 reviewed, uint256 total)",
  "function getTotalAudits() external view returns (uint256)",
  "event AuditRecorded(string indexed auditId, string indexed transactionId, uint8 action, string notes, address indexed auditor, uint256 timestamp)",
];

function getBudgetManagerContract(): ethers.Contract | null {
  if (!env.BUDGET_MANAGER_ADDRESS) return null;
  return new ethers.Contract(env.BUDGET_MANAGER_ADDRESS, BUDGET_MANAGER_ABI, getSigner());
}

function getTransactionManagerContract(): ethers.Contract | null {
  if (!env.TRANSACTION_MANAGER_ADDRESS) return null;
  return new ethers.Contract(env.TRANSACTION_MANAGER_ADDRESS, TRANSACTION_MANAGER_ABI, getSigner());
}

function getAuditTrailContract(): ethers.Contract | null {
  if (!env.AUDIT_TRAIL_ADDRESS) return null;
  return new ethers.Contract(env.AUDIT_TRAIL_ADDRESS, AUDIT_TRAIL_ABI, getSigner());
}

export class BlockchainService {
  async createBudgetOnChain(budgetId: string, name: string, category: string, totalAmount: number, fiscalYear: number) {
    const contract = getBudgetManagerContract();
    if (!contract) {
      console.warn("BudgetManager contract not configured, skipping blockchain");
      return null;
    }

    try {
      const tx = await contract.createBudget(budgetId, name, category, BigInt(totalAmount), BigInt(fiscalYear));
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain createBudget error:", error);
      throw new Error("Failed to record budget on blockchain");
    }
  }

  async updateBudgetOnChain(budgetId: string, name: string, totalAmount: number) {
    const contract = getBudgetManagerContract();
    if (!contract) return null;

    try {
      const tx = await contract.updateBudget(budgetId, name, BigInt(totalAmount));
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain updateBudget error:", error);
      throw new Error("Failed to update budget on blockchain");
    }
  }

  async createTransactionOnChain(transactionId: string, budgetId: string, description: string, amount: number, recipientName: string) {
    const contract = getTransactionManagerContract();
    if (!contract) {
      console.warn("TransactionManager contract not configured, skipping blockchain");
      return null;
    }

    try {
      const tx = await contract.createTransaction(transactionId, budgetId, description, BigInt(amount), recipientName);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain createTransaction error:", error);
      throw new Error("Failed to record transaction on blockchain");
    }
  }

  async approveTransactionOnChain(transactionId: string) {
    const contract = getTransactionManagerContract();
    if (!contract) return null;

    try {
      const tx = await contract.approveTransaction(transactionId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain approveTransaction error:", error);
      throw new Error("Failed to approve transaction on blockchain");
    }
  }

  async rejectTransactionOnChain(transactionId: string) {
    const contract = getTransactionManagerContract();
    if (!contract) return null;

    try {
      const tx = await contract.rejectTransaction(transactionId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain rejectTransaction error:", error);
      throw new Error("Failed to reject transaction on blockchain");
    }
  }

  async recordAuditOnChain(auditId: string, transactionId: string, action: number, notes: string) {
    const contract = getAuditTrailContract();
    if (!contract) {
      console.warn("AuditTrail contract not configured, skipping blockchain");
      return null;
    }

    try {
      const tx = await contract.recordAudit(auditId, transactionId, action, notes);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Blockchain recordAudit error:", error);
      throw new Error("Failed to record audit on blockchain");
    }
  }

  async getBudgetFromChain(budgetId: string) {
    const contract = getBudgetManagerContract();
    if (!contract) return null;

    try {
      const result = await contract.getBudget(budgetId);
      return {
        name: result.name,
        category: result.category,
        totalAmount: Number(result.totalAmount),
        fiscalYear: Number(result.fiscalYear),
        createdBy: result.createdBy,
        createdAt: Number(result.createdAt),
      };
    } catch (error) {
      console.error("Blockchain getBudget error:", error);
      return null;
    }
  }

  async getTransactionFromChain(transactionId: string) {
    const contract = getTransactionManagerContract();
    if (!contract) return null;

    try {
      const result = await contract.getTransaction(transactionId);
      const statusMap = ["PENDING", "APPROVED", "REJECTED"];
      return {
        budgetId: result.budgetId,
        description: result.description,
        amount: Number(result.amount),
        recipientName: result.recipientName,
        status: statusMap[result.status] || "UNKNOWN",
        createdBy: result.createdBy,
        createdAt: Number(result.createdAt),
      };
    } catch (error) {
      console.error("Blockchain getTransaction error:", error);
      return null;
    }
  }

  async getAuditSummaryFromChain() {
    const contract = getAuditTrailContract();
    if (!contract) return null;

    try {
      const result = await contract.getAuditSummary();
      return {
        approved: Number(result.approved),
        rejected: Number(result.rejected),
        reviewed: Number(result.reviewed),
        total: Number(result.total),
      };
    } catch (error) {
      console.error("Blockchain getAuditSummary error:", error);
      return null;
    }
  }

  async getBlockchainStats() {
    const connected = await isBlockchainConnected();
    if (!connected) return { connected: false, blockNumber: 0, budgets: 0, transactions: 0, audits: 0 };

    const budgetContract = getBudgetManagerContract();
    const txContract = getTransactionManagerContract();
    const auditContract = getAuditTrailContract();
    const provider = getProvider();

    const blockNumber = await provider.getBlockNumber();
    const budgets = budgetContract ? Number(await budgetContract.getTotalBudgets()) : 0;
    const transactions = txContract ? Number(await txContract.getTotalTransactions()) : 0;
    const audits = auditContract ? Number(await auditContract.getTotalAudits()) : 0;

    return { connected: true, blockNumber, budgets, transactions, audits };
  }
}

export const blockchainService = new BlockchainService();
