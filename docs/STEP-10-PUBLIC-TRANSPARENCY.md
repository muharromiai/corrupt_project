# STEP 10 — Sistem Transparansi Publik

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│           PUBLIC TRANSPARENCY SYSTEM                │
│                                                     │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │  /transparency    │  │  /public/* (logged in) │  │
│  │  (No Auth)        │  │  Dashboard, Budgets,   │  │
│  │  Stats, Budgets,  │  │  Projects, Statistics, │  │
│  │  Projects, Tx,    │  │  Report                │  │
│  │  Blockchain       │  │                        │  │
│  └────────┬──────────┘  └──────────┬─────────────┘  │
│           │                        │                │
│  ┌────────┴────────────────────────┴─────────────┐  │
│  │         Backend API                           │  │
│  │  /api/transparency/* (No Auth)                │  │
│  │    - GET /stats                               │  │
│  │    - GET /budgets                             │  │
│  │    - GET /transactions (approved only)        │  │
│  │    - GET /projects                            │  │
│  │    - GET /blockchain                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Backend — Transparency Module

### File: `backend/src/modules/transparency/transparency.routes.ts`

API publik tanpa autentikasi:

| Endpoint | Deskripsi |
|----------|-----------|
| `GET /api/transparency/stats` | Ringkasan: anggaran, transaksi, proyek, laporan |
| `GET /api/transparency/budgets` | Daftar anggaran aktif (pagination) |
| `GET /api/transparency/transactions` | Transaksi yang sudah APPROVED saja |
| `GET /api/transparency/projects` | Daftar semua proyek (pagination) |
| `GET /api/transparency/blockchain` | Status koneksi blockchain + statistik |

### Keamanan Data Publik
- Hanya menampilkan anggaran dengan status ACTIVE
- Hanya menampilkan transaksi APPROVED (tidak PENDING/REJECTED)
- Tidak menampilkan data user sensitif (email, password hash)
- Rate limited (100 req per 15 menit)

## Frontend — Transparency Portal

### `/transparency` (No Login Required)
Halaman transparansi publik yang dapat diakses tanpa login:

1. **Header** — Logo + tombol Masuk/Daftar
2. **Hero Section** — Judul + deskripsi portal transparansi
3. **Stat Cards** — Total anggaran, anggaran aktif, penyerapan, transaksi terverifikasi
4. **Blockchain Status** — Koneksi, block number, data on-chain counts
5. **Anggaran Aktif** — Grid card dengan progress penyerapan
6. **Proyek Pemerintah** — Grid card dengan progress dan status
7. **Transaksi Terverifikasi** — Tabel transaksi approved terbaru
8. **CTA** — Ajakan untuk mendaftar dan melaporkan penyimpangan

### `/public/*` (Login Required, Role: PUBLIC)
Halaman dashboard untuk user yang sudah login dengan role PUBLIC:

| Halaman | Fitur |
|---------|-------|
| `/public/dashboard` | Stats + charts + spending trend |
| `/public/budgets` | DataTable anggaran + search + pagination |
| `/public/projects` | DataTable proyek + progress bar |
| `/public/statistics` | Stats lengkap + charts + distribusi kategori |
| `/public/report` | Form pelaporan penyimpangan |

## Landing Page Update

Tombol "Lihat Dashboard Publik" diubah menjadi "Lihat Transparansi Publik" yang mengarah ke `/transparency`.

## Alur Akses

```
Pengunjung (tanpa akun)
  → Buka / (landing page)
  → Klik "Lihat Transparansi Publik"
  → /transparency — melihat semua data publik tanpa login
  → Ingin lapor? → Daftar akun PUBLIC → Login
  → /public/report — kirim laporan
  → /public/dashboard — dashboard personal
```

## Integrasi

- Transparency API terdaftar di `app.ts`: `app.use("/api/transparency", transparencyRoutes)`
- Tidak memerlukan middleware `authenticate` atau `authorize`
- Menggunakan Prisma query langsung tanpa service layer (simple, read-only)
- Blockchain stats via `blockchainService.getBlockchainStats()`
