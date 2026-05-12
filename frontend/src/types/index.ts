export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Budget {
  id: string;
  createdById: string;
  name: string;
  category: BudgetCategory;
  fiscalYear: number;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  description: string;
  status: BudgetStatus;
  blockchainTxHash: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  projects?: Project[];
  _count?: { transactions: number; projects: number };
}

export interface Project {
  id: string;
  budgetId: string;
  createdById: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  contractorName: string;
  contractValue: number;
  blockchainTxHash: string | null;
  createdAt: string;
  updatedAt: string;
  budget?: Budget;
  createdBy?: User;
}

export interface Transaction {
  id: string;
  budgetId: string;
  projectId: string | null;
  createdById: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  recipientName: string;
  recipientAccount: string;
  status: TransactionStatus;
  blockchainTxHash: string | null;
  blockchainBlockNumber: number | null;
  createdAt: string;
  updatedAt: string;
  budget?: Budget;
  project?: Project;
  createdBy?: User;
  auditLogs?: AuditLog[];
}

export interface AuditLog {
  id: string;
  transactionId: string;
  auditorId: string;
  action: AuditAction;
  status: string;
  notes: string | null;
  blockchainTxHash: string | null;
  createdAt: string;
  transaction?: Transaction;
  auditor?: User;
}

export interface Report {
  id: string;
  reporterId: string;
  transactionId: string | null;
  budgetId: string | null;
  title: string;
  description: string;
  evidence: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: User;
  transaction?: Transaction;
  budget?: Budget;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Role = "ADMIN" | "GOVERNMENT" | "OPERATOR" | "AUDITOR" | "PUBLIC";
export type BudgetCategory = "INFRASTRUCTURE" | "EDUCATION" | "HEALTH" | "DEFENSE" | "SOCIAL_WELFARE" | "AGRICULTURE" | "TECHNOLOGY" | "TRANSPORTATION" | "ENERGY" | "OTHER";
export type BudgetStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TransactionCategory = "DISBURSEMENT" | "PROCUREMENT" | "SALARY" | "GRANT" | "SUBSIDY" | "MAINTENANCE" | "OPERATIONAL" | "OTHER";
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AuditAction = "APPROVED" | "REJECTED" | "REVIEWED";
export type ReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export interface DashboardStats {
  totalBudget: number;
  totalSpent: number;
  totalProjects: number;
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  totalReports: number;
}
