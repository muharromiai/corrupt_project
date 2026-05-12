"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: string | string[];
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const { user, isLoading } = useAuth(roles);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground text-sm">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
