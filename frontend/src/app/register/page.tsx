"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";
import { setToken, getDashboardPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

const roles = [
  { value: "PUBLIC", label: "Masyarakat", description: "Pantau transparansi anggaran" },
  { value: "GOVERNMENT", label: "Pemerintah", description: "Kelola anggaran & proyek" },
  { value: "OPERATOR", label: "Operator", description: "Input transaksi keuangan" },
  { value: "AUDITOR", label: "Auditor", description: "Verifikasi & audit transaksi" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken: setStoreToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PUBLIC",
  });

  const selectedRole = roles.find((r) => r.value === form.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      const { token, user } = response.data.data;

      setToken(token);
      setStoreToken(token);
      setUser(user);

      toast.success("Registrasi berhasil! Selamat datang.");
      router.push(getDashboardPath(user.role));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold gradient-text">Corruption Killer</span>
          </Link>
          <p className="text-muted-foreground text-sm">Daftar untuk bergabung dalam transparansi</p>
        </div>

        <Card className="glass-card border-white/5">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
            <CardDescription>Isi data diri Anda untuk mendaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="pl-10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 karakter, huruf besar & angka"
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimal 8 karakter, mengandung huruf besar dan angka
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role / Peran</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoles(!showRoles)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors"
                  >
                    <span>{selectedRole?.label} — {selectedRole?.description}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showRoles ? "rotate-180" : ""}`} />
                  </button>

                  {showRoles && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 w-full mt-1 py-1 rounded-lg border border-border bg-card shadow-xl"
                    >
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, role: role.value });
                            setShowRoles(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                            form.role === role.value ? "bg-accent text-accent-foreground" : ""
                          }`}
                        >
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
