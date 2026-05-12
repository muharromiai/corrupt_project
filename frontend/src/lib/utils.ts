import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncateHash(hash: string, chars = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    APPROVED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    COMPLETED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    RESOLVED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    DRAFT: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    PLANNING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    SUBMITTED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    IN_PROGRESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    UNDER_REVIEW: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
    CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
    DISMISSED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    CLOSED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };
  return colors[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrator",
    GOVERNMENT: "Pemerintah",
    OPERATOR: "Operator",
    AUDITOR: "Auditor",
    PUBLIC: "Masyarakat",
  };
  return labels[role] || role;
}
