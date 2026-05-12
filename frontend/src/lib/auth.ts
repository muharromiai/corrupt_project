import Cookies from "js-cookie";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "GOVERNMENT" | "OPERATOR" | "AUDITOR" | "PUBLIC";
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export function getToken(): string | undefined {
  return Cookies.get("token");
}

export function setToken(token: string): void {
  Cookies.set("token", token, { expires: 7, sameSite: "lax" });
}

export function removeToken(): void {
  Cookies.remove("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function parseJwt(token: string): { id: string; email: string; role: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    ADMIN: "/admin/users",
    GOVERNMENT: "/government/dashboard",
    OPERATOR: "/operator/dashboard",
    AUDITOR: "/auditor/dashboard",
    PUBLIC: "/public/dashboard",
  };
  return paths[role] || "/public/dashboard";
}
