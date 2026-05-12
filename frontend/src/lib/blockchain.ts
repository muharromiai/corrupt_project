import { ethers } from "ethers";

const RPC_URLS: Record<string, string> = {
  localhost: "http://localhost:8545",
  hardhat: "http://localhost:8545",
  sepolia: "https://rpc.sepolia.org",
};

const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || "localhost";

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URLS[network] || RPC_URLS.localhost);
}

export async function getWalletSigner(): Promise<ethers.Signer | null> {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;
  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  } catch {
    return null;
  }
}

export async function isBlockchainAvailable(): Promise<boolean> {
  try {
    const provider = getProvider();
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

export const BUDGET_MANAGER_ABI = [
  "function getBudget(string _budgetId) external view returns (string name, string category, uint256 totalAmount, uint256 fiscalYear, address createdBy, uint256 createdAt)",
  "function getTotalBudgets() external view returns (uint256)",
  "event BudgetCreated(string indexed budgetId, string name, string category, uint256 totalAmount, uint256 fiscalYear, address indexed createdBy, uint256 timestamp)",
];

export const TRANSACTION_MANAGER_ABI = [
  "function getTransaction(string _txId) external view returns (string budgetId, string description, uint256 amount, string recipientName, uint8 status, address createdBy, uint256 createdAt)",
  "function getTransactionStatus(string _txId) external view returns (uint8)",
  "function getTotalTransactions() external view returns (uint256)",
  "event TransactionCreated(string indexed transactionId, string indexed budgetId, string description, uint256 amount, string recipientName, address indexed createdBy, uint256 timestamp)",
  "event TransactionStatusChanged(string indexed transactionId, uint8 oldStatus, uint8 newStatus, address indexed changedBy, uint256 timestamp)",
];

export const AUDIT_TRAIL_ABI = [
  "function getAuditEntry(string _auditId) external view returns (string transactionId, uint8 action, string notes, address auditor, uint256 timestamp)",
  "function getAuditSummary() external view returns (uint256 approved, uint256 rejected, uint256 reviewed, uint256 total)",
  "function getTotalAudits() external view returns (uint256)",
  "event AuditRecorded(string indexed auditId, string indexed transactionId, uint8 action, string notes, address indexed auditor, uint256 timestamp)",
];

export interface ContractAddresses {
  budgetManager: string;
  transactionManager: string;
  auditTrail: string;
}

export function getContractAddresses(): ContractAddresses {
  return {
    budgetManager: process.env.NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS || "",
    transactionManager: process.env.NEXT_PUBLIC_TRANSACTION_MANAGER_ADDRESS || "",
    auditTrail: process.env.NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS || "",
  };
}

export function getBudgetManagerContract(): ethers.Contract | null {
  const { budgetManager } = getContractAddresses();
  if (!budgetManager) return null;
  return new ethers.Contract(budgetManager, BUDGET_MANAGER_ABI, getProvider());
}

export function getTransactionManagerContract(): ethers.Contract | null {
  const { transactionManager } = getContractAddresses();
  if (!transactionManager) return null;
  return new ethers.Contract(transactionManager, TRANSACTION_MANAGER_ABI, getProvider());
}

export function getAuditTrailContract(): ethers.Contract | null {
  const { auditTrail } = getContractAddresses();
  if (!auditTrail) return null;
  return new ethers.Contract(auditTrail, AUDIT_TRAIL_ABI, getProvider());
}
