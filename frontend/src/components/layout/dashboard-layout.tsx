"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { AuthGuard } from "./auth-guard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  roles?: string | string[];
}

export function DashboardLayout({ children, roles }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthGuard roles={roles}>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <motion.div
          animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-screen"
        >
          <Navbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

          <main className="p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
