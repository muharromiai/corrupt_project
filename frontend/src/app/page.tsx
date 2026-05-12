"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, BarChart3, Search, Lock, ArrowRight, Database, Globe } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Blockchain Immutable",
    description: "Setiap transaksi keuangan negara dicatat ke blockchain sehingga tidak dapat diubah atau dihapus.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Transparan",
    description: "Masyarakat dapat memantau penggunaan anggaran negara secara real-time melalui dashboard publik.",
  },
  {
    icon: Search,
    title: "Audit Digital",
    description: "Auditor dapat memverifikasi setiap transaksi dengan jejak audit lengkap di blockchain.",
  },
  {
    icon: Database,
    title: "Data Terdesentralisasi",
    description: "Data keuangan tersimpan di jaringan blockchain yang terdesentralisasi dan tahan manipulasi.",
  },
  {
    icon: Shield,
    title: "Keamanan Berlapis",
    description: "Autentikasi JWT, role-based access control, dan enkripsi end-to-end melindungi data sensitif.",
  },
  {
    icon: Globe,
    title: "Akses Publik",
    description: "Masyarakat dapat melaporkan dugaan penyimpangan dan memantau tindak lanjutnya.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">Corruption Killer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
              <Shield className="w-4 h-4" />
              Berbasis Teknologi Blockchain
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Sistem Keuangan Negara</span>
              <br />
              Anti Korupsi
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Platform transparansi keuangan negara yang memungkinkan pemerintah, auditor, dan masyarakat
              memantau transaksi anggaran secara transparan, aman, dan tidak dapat diubah.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all glow-blue"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 px-8 py-3 glass-card-hover font-medium"
              >
                Lihat Transparansi Publik
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fitur <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dibangun dengan teknologi terdepan untuk memastikan transparansi dan akuntabilitas pengelolaan keuangan negara.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "Rp 1T+", label: "Anggaran Dipantau" },
              { value: "10.000+", label: "Transaksi Tercatat" },
              { value: "100%", label: "Tercatat di Blockchain" },
              { value: "5 Role", label: "Akses Terkontrol" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Corruption Killer &copy; 2025</span>
          </div>
          <div>Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain</div>
        </div>
      </footer>
    </div>
  );
}
