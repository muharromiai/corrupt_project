"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LayoutDashboard, Wallet, FolderKanban, ArrowLeftRight,
  ClipboardCheck, Users, Activity, BarChart3, FileWarning,
  Eye, ChevronLeft, LogOut, PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken, getDashboardPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Manajemen User", href: "/admin/users", icon: Users },
    { label: "Laporan", href: "/admin/reports", icon: FileWarning },
    { label: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
  ],
  GOVERNMENT: [
    { label: "Dashboard", href: "/government/dashboard", icon: LayoutDashboard },
    { label: "Anggaran", href: "/government/budgets", icon: Wallet },
    { label: "Proyek", href: "/government/projects", icon: FolderKanban },
    { label: "Transaksi", href: "/government/transactions", icon: ArrowLeftRight },
  ],
  OPERATOR: [
    { label: "Dashboard", href: "/operator/dashboard", icon: LayoutDashboard },
    { label: "Transaksi", href: "/operator/transactions", icon: ArrowLeftRight },
    { label: "Buat Transaksi", href: "/operator/transactions/new", icon: PlusCircle },
  ],
  AUDITOR: [
    { label: "Dashboard", href: "/auditor/dashboard", icon: LayoutDashboard },
    { label: "Verifikasi", href: "/auditor/transactions", icon: ClipboardCheck },
    { label: "Audit Trail", href: "/auditor/audit-trail", icon: Activity },
    { label: "Explorer", href: "/auditor/explorer", icon: Eye },
  ],
  PUBLIC: [
    { label: "Dashboard", href: "/public/dashboard", icon: LayoutDashboard },
    { label: "Anggaran", href: "/public/budgets", icon: Wallet },
    { label: "Proyek", href: "/public/projects", icon: FolderKanban },
    { label: "Statistik", href: "/public/statistics", icon: BarChart3 },
    { label: "Lapor", href: "/public/report", icon: FileWarning },
  ],
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const items = user ? navByRole[user.role] || [] : [];

  const handleLogout = () => {
    removeToken();
    logout();
    router.push("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href={user ? getDashboardPath(user.role) : "/"} className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold gradient-text whitespace-nowrap overflow-hidden"
              >
                Corruption Killer
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Keluar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
