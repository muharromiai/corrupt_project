"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, removeToken, getDashboardPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types";

export function useAuth(requiredRole?: string | string[]) {
  const router = useRouter();
  const { user, setUser, setLoading, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setChecked(true);
      router.push("/login");
      return;
    }

    if (user) {
      setLoading(false);
      setChecked(true);

      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
          router.push(getDashboardPath(user.role));
        }
      }
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => {
        const userData = res.data.data as User;
        setUser(userData);

        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          if (!roles.includes(userData.role)) {
            router.push(getDashboardPath(userData.role));
          }
        }
      })
      .catch(() => {
        removeToken();
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
        setChecked(true);
      });
  }, [user, router, requiredRole, setUser, setLoading]);

  return { user, isLoading: isLoading || !checked };
}
