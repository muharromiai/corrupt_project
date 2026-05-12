# STEP 1 — ANALISIS SISTEM
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## 1. ANALISIS KEBUTUHAN FUNGSIONAL

### F01 — Authentication & Authorization
| ID    | Kebutuhan                                          | Prioritas |
|-------|-----------------------------------------------------|-----------|
| F01.1 | Sistem harus menyediakan registrasi pengguna        | Tinggi    |
| F01.2 | Sistem harus menyediakan login dengan email/password | Tinggi    |
| F01.3 | Sistem harus mengelola sesi dengan JWT               | Tinggi    |
| F01.4 | Sistem harus membatasi akses berdasarkan role        | Tinggi    |
| F01.5 | Sistem harus menyediakan logout                      | Tinggi    |

### F02 — Manajemen Anggaran (Pemerintah)
| ID    | Kebutuhan                                              | Prioritas |
|-------|--------------------------------------------------------|-----------|
| F02.1 | Pemerintah dapat membuat anggaran baru                 | Tinggi    |
| F02.2 | Pemerintah dapat mengedit anggaran                     | Tinggi    |
| F02.3 | Pemerintah dapat melihat daftar anggaran               | Tinggi    |
| F02.4 | Pemerintah dapat melihat detail anggaran               | Tinggi    |
| F02.5 | Setiap anggaran tercatat ke blockchain                 | Tinggi    |

### F03 — Manajemen Proyek (Pemerintah)
| ID    | Kebutuhan                                              | Prioritas |
|-------|--------------------------------------------------------|-----------|
| F03.1 | Pemerintah dapat membuat proyek                        | Tinggi    |
| F03.2 | Pemerintah dapat mengaitkan proyek dengan anggaran     | Tinggi    |
| F03.3 | Pemerintah dapat memperbarui status proyek             | Sedang    |
| F03.4 | Masyarakat dapat melihat daftar proyek                 | Tinggi    |

### F04 — Manajemen Transaksi
| ID    | Kebutuhan                                                   | Prioritas |
|-------|--------------------------------------------------------------|-----------|
| F04.1 | Operator dapat membuat transaksi pengeluaran                 | Tinggi    |
| F04.2 | Setiap transaksi dicatat ke blockchain                       | Tinggi    |
| F04.3 | Transaksi menyimpan hash blockchain                          | Tinggi    |
| F04.4 | Transaksi memiliki status (pending, approved, rejected)      | Tinggi    |
| F04.5 | Auditor dapat memverifikasi transaksi                        | Tinggi    |

### F05 — Audit System
| ID    | Kebutuhan                                                  | Prioritas |
|-------|-------------------------------------------------------------|-----------|
| F05.1 | Auditor dapat melihat audit trail                           | Tinggi    |
| F05.2 | Auditor dapat approve/reject transaksi                      | Tinggi    |
| F05.3 | Sistem menyediakan blockchain explorer internal             | Sedang    |
| F05.4 | Semua aksi pengguna dicatat sebagai activity log            | Tinggi    |

### F06 — Transparansi Publik
| ID    | Kebutuhan                                                  | Prioritas |
|-------|-------------------------------------------------------------|-----------|
| F06.1 | Masyarakat dapat melihat dashboard anggaran publik          | Tinggi    |
| F06.2 | Masyarakat dapat melihat statistik penggunaan dana          | Tinggi    |
| F06.3 | Masyarakat dapat melihat grafik visualisasi                 | Sedang    |
| F06.4 | Masyarakat dapat melaporkan dugaan penyimpangan             | Tinggi    |

### F07 — Admin Panel
| ID    | Kebutuhan                                                | Prioritas |
|-------|-----------------------------------------------------------|-----------|
| F07.1 | Admin dapat mengelola pengguna (CRUD)                     | Tinggi    |
| F07.2 | Admin dapat mengelola role pengguna                       | Tinggi    |
| F07.3 | Admin dapat memonitor aktivitas sistem                    | Sedang    |

### F08 — Fitur Pendukung
| ID    | Kebutuhan                                               | Prioritas |
|-------|----------------------------------------------------------|-----------|
| F08.1 | Sistem notifikasi in-app                                 | Sedang    |
| F08.2 | Search & filtering pada tabel                            | Sedang    |
| F08.3 | Export data ke PDF/CSV                                   | Rendah    |
| F08.4 | Pagination pada semua daftar data                        | Sedang    |

---

## 2. ANALISIS KEBUTUHAN NON-FUNGSIONAL

| ID     | Kategori         | Kebutuhan                                                         |
|--------|------------------|-------------------------------------------------------------------|
| NF01   | Keamanan         | Semua API dilindungi JWT authentication                           |
| NF02   | Keamanan         | Password di-hash menggunakan bcrypt                               |
| NF03   | Keamanan         | Input divalidasi di client dan server                             |
| NF04   | Keamanan         | CORS dikonfigurasi dengan benar                                   |
| NF05   | Performa         | Halaman dimuat dalam < 3 detik                                    |
| NF06   | Performa         | API response time < 500ms                                         |
| NF07   | Skalabilitas     | Arsitektur modular dan dapat di-scale secara horizontal           |
| NF08   | Imutabilitas     | Data transaksi di blockchain tidak dapat diubah                   |
| NF09   | Usability        | Antarmuka responsif (desktop & mobile)                            |
| NF10   | Usability        | Dark mode modern dan profesional                                  |
| NF11   | Ketersediaan     | Aplikasi dapat berjalan di Docker                                 |
| NF12   | Maintainability  | TypeScript strict mode di seluruh codebase                        |
| NF13   | Maintainability  | Clean architecture dengan separation of concerns                  |

---

## 3. SITEMAP

```
Corruption Killer App
│
├── / (Landing Page — Public)
│   ├── Informasi umum
│   └── Link login/register
│
├── /login
├── /register
│
├── /dashboard (Role-based redirect)
│
├── /admin
│   ├── /admin/users          — Manajemen user
│   ├── /admin/roles          — Manajemen role
│   └── /admin/activity-logs  — Log aktivitas sistem
│
├── /government
│   ├── /government/dashboard     — Overview statistik
│   ├── /government/budgets       — Daftar anggaran
│   ├── /government/budgets/new   — Buat anggaran baru
│   ├── /government/budgets/:id   — Detail anggaran
│   ├── /government/projects      — Daftar proyek
│   ├── /government/projects/new  — Buat proyek baru
│   ├── /government/projects/:id  — Detail proyek
│   ├── /government/transactions  — Daftar transaksi
│   └── /government/transactions/new — Buat transaksi
│
├── /auditor
│   ├── /auditor/dashboard        — Overview audit
│   ├── /auditor/transactions     — Verifikasi transaksi
│   ├── /auditor/audit-trail      — Jejak audit
│   └── /auditor/explorer         — Blockchain explorer
│
├── /public
│   ├── /public/dashboard         — Dashboard transparansi
│   ├── /public/budgets           — Anggaran publik
│   ├── /public/projects          — Proyek pemerintah
│   ├── /public/statistics        — Statistik dana
│   └── /public/report            — Lapor penyimpangan
│
└── /operator
    ├── /operator/dashboard       — Overview operator
    ├── /operator/transactions    — Kelola transaksi
    └── /operator/transactions/new — Input transaksi baru
```

---

## 4. USER FLOW

### 4.1 User Flow — Registrasi & Login
```
[User] → Buka Aplikasi → /login
  ├── Sudah punya akun → Input email & password → Validasi JWT → Redirect ke dashboard sesuai role
  └── Belum punya akun → /register → Isi form (nama, email, password, role request)
        → Submit → Admin approve → User bisa login
```

### 4.2 User Flow — Pemerintah Membuat Anggaran
```
[Pemerintah] → Login → /government/dashboard
  → Klik "Buat Anggaran" → Isi form anggaran (nama, kategori, nominal, tahun, deskripsi)
  → Submit → Backend menyimpan ke DB → Backend kirim ke Smart Contract
  → Blockchain mencatat → Hash tersimpan di DB → Anggaran muncul di daftar
  → Publik dapat melihat di /public/budgets
```

### 4.3 User Flow — Operator Membuat Transaksi
```
[Operator] → Login → /operator/dashboard
  → Klik "Buat Transaksi" → Pilih anggaran → Isi detail transaksi
  → Submit → Status = "pending" → Backend simpan ke DB
  → Backend kirim ke Smart Contract → Hash tersimpan
  → Notifikasi ke Auditor
```

### 4.4 User Flow — Auditor Memverifikasi Transaksi
```
[Auditor] → Login → /auditor/dashboard
  → Lihat daftar transaksi pending → Klik transaksi
  → Lihat detail + hash blockchain → Verifikasi kesesuaian data
  → Klik "Approve" atau "Reject" → Status terupdate
  → Blockchain mencatat verifikasi → Notifikasi ke Operator & Pemerintah
```

### 4.5 User Flow — Masyarakat Melihat Transparansi
```
[Masyarakat] → Login → /public/dashboard
  → Lihat grafik penggunaan dana → Klik "Lihat Anggaran"
  → Lihat daftar anggaran dan proyek → Klik detail
  → Lihat riwayat transaksi + hash blockchain
  → Jika menemukan kejanggalan → Klik "Laporkan" → Isi form laporan → Submit
```

### 4.6 User Flow — Admin Mengelola User
```
[Admin] → Login → /admin/users
  → Lihat daftar user → Klik user
  → Edit role / status → Simpan → Perubahan aktif
  → Lihat activity logs di /admin/activity-logs
```

---

## 5. USE CASE

### 5.1 Daftar Aktor
| Aktor       | Deskripsi                                              |
|-------------|--------------------------------------------------------|
| Admin       | Mengelola user, role, dan monitoring sistem             |
| Pemerintah  | Membuat anggaran, proyek, dan transaksi                 |
| Operator    | Menginput transaksi keuangan harian                     |
| Auditor     | Memverifikasi dan mengaudit transaksi                   |
| Masyarakat  | Melihat transparansi dan melaporkan penyimpangan        |
| Blockchain  | Mencatat dan memvalidasi transaksi secara immutable     |

### 5.2 Use Case Table

| UC ID  | Use Case                    | Aktor                    | Deskripsi                                          |
|--------|------------------------------|---------------------------|-----------------------------------------------------|
| UC01   | Register                    | Semua                     | Mendaftarkan akun baru                              |
| UC02   | Login                       | Semua                     | Masuk ke sistem                                     |
| UC03   | Logout                      | Semua                     | Keluar dari sistem                                  |
| UC04   | Buat Anggaran               | Pemerintah                | Membuat data anggaran baru                          |
| UC05   | Edit Anggaran               | Pemerintah                | Mengubah data anggaran                              |
| UC06   | Lihat Anggaran              | Pemerintah, Auditor, Publik | Melihat daftar dan detail anggaran                |
| UC07   | Buat Proyek                 | Pemerintah                | Membuat proyek yang terkait anggaran                |
| UC08   | Update Status Proyek        | Pemerintah                | Memperbarui progress proyek                         |
| UC09   | Buat Transaksi              | Operator                  | Menginput transaksi pengeluaran                     |
| UC10   | Verifikasi Transaksi        | Auditor                   | Menyetujui/menolak transaksi                        |
| UC11   | Lihat Audit Trail           | Auditor                   | Melihat jejak audit                                 |
| UC12   | Blockchain Explorer         | Auditor                   | Melihat data langsung dari blockchain               |
| UC13   | Lihat Dashboard Publik      | Masyarakat                | Melihat statistik transparansi                      |
| UC14   | Lapor Penyimpangan          | Masyarakat                | Melaporkan dugaan korupsi                           |
| UC15   | Kelola User                 | Admin                     | CRUD data pengguna                                  |
| UC16   | Kelola Role                 | Admin                     | Mengatur role pengguna                              |
| UC17   | Monitoring Sistem           | Admin                     | Melihat log aktivitas                               |
| UC18   | Catat ke Blockchain         | Blockchain (System)       | Menyimpan transaksi ke smart contract               |
| UC19   | Export Data                 | Pemerintah, Auditor       | Export data ke PDF/CSV                              |
| UC20   | Notifikasi                  | Semua                     | Menerima notifikasi perubahan status                |

---

## 6. ARSITEKTUR SISTEM

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    Next.js Frontend                          │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │  │
│   │  │  Admin   │ │Government│ │ Auditor  │ │  Public/      │   │  │
│   │  │Dashboard │ │Dashboard │ │Dashboard │ │  Masyarakat   │   │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │  │
│   │                                                              │  │
│   │  ┌──────────────────────────────────────────────────────┐    │  │
│   │  │  Shared: Auth, Sidebar, Navbar, Charts, Tables       │    │  │
│   │  └──────────────────────────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                    REST API (HTTP/JSON)                              │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                          SERVER LAYER                                │
│                              │                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │               Express.js Backend (Node.js)                   │  │
│   │                                                              │  │
│   │  ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐   │  │
│   │  │   Auth    │ │  Budget    │ │Transaction│ │   Audit    │   │  │
│   │  │  Module   │ │  Module    │ │  Module   │ │  Module    │   │  │
│   │  └───────────┘ └────────────┘ └──────────┘ └────────────┘   │  │
│   │                                                              │  │
│   │  ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐   │  │
│   │  │  Project  │ │   User     │ │  Report  │ │Notification│   │  │
│   │  │  Module   │ │  Module    │ │  Module  │ │  Module    │   │  │
│   │  └───────────┘ └────────────┘ └──────────┘ └────────────┘   │  │
│   │                                                              │  │
│   │  ┌──────────────────────────────────────────────────────┐    │  │
│   │  │  Middleware: JWT Auth, Role Guard, Validation,       │    │  │
│   │  │              Error Handler, Activity Logger          │    │  │
│   │  └──────────────────────────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                    │                           │                     │
│              ┌─────┘                           └──────┐             │
│              │                                        │             │
└──────────────┼────────────────────────────────────────┼─────────────┘
               │                                        │
┌──────────────┼──────────────┐  ┌──────────────────────┼─────────────┐
│         DATA LAYER          │  │       BLOCKCHAIN LAYER              │
│              │              │  │              │                      │
│   ┌──────────────────────┐  │  │   ┌──────────────────────────┐     │
│   │     PostgreSQL       │  │  │   │   Ethereum (Hardhat)     │     │
│   │                      │  │  │   │                          │     │
│   │  ┌────────────────┐  │  │  │   │  ┌──────────────────┐   │     │
│   │  │  Prisma ORM    │  │  │  │   │  │  Smart Contract  │   │     │
│   │  │                │  │  │  │   │  │                  │   │     │
│   │  │  • Users       │  │  │  │   │  │ • BudgetManager  │   │     │
│   │  │  • Budgets     │  │  │  │   │  │ • TransactionMgr │   │     │
│   │  │  • Projects    │  │  │  │   │  │ • AuditTrail     │   │     │
│   │  │  • Transactions│  │  │  │   │  │                  │   │     │
│   │  │  • AuditLogs   │  │  │  │   │  └──────────────────┘   │     │
│   │  │  • Reports     │  │  │  │   │          │              │     │
│   │  │  • Notifications│ │  │  │   │    Ethers.js            │     │
│   │  └────────────────┘  │  │  │   └──────────────────────────┘     │
│   └──────────────────────┘  │  │                                    │
│                              │  │                                    │
└──────────────────────────────┘  └────────────────────────────────────┘
```

### 6.2 Technology Stack Detail

```
┌────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                           │
├────────────────┬───────────────────────────────────────────────┤
│ Layer          │ Technology                                     │
├────────────────┼───────────────────────────────────────────────┤
│ Frontend       │ Next.js 14, TypeScript, Tailwind CSS,         │
│                │ Shadcn UI, Framer Motion, Recharts            │
├────────────────┼───────────────────────────────────────────────┤
│ Backend        │ Node.js, Express.js, TypeScript               │
├────────────────┼───────────────────────────────────────────────┤
│ Database       │ PostgreSQL, Prisma ORM                        │
├────────────────┼───────────────────────────────────────────────┤
│ Blockchain     │ Solidity, Hardhat, Ethers.js                  │
├────────────────┼───────────────────────────────────────────────┤
│ Authentication │ JWT (jsonwebtoken), bcrypt                    │
├────────────────┼───────────────────────────────────────────────┤
│ Deployment     │ Docker, Vercel, Railway/Render                │
├────────────────┼───────────────────────────────────────────────┤
│ Testing        │ Jest, Supertest, Hardhat Test, Vitest         │
└────────────────┴───────────────────────────────────────────────┘
```

### 6.3 Folder Structure (Full Project)

```
corruption-killer/
│
├── docs/                          # Dokumentasi proyek
│   ├── STEP-1-ANALISIS-SISTEM.md
│   └── ...
│
├── frontend/                      # Next.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── app/                   # App Router (Next.js 14)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── admin/
│   │   │   │   ├── government/
│   │   │   │   ├── auditor/
│   │   │   │   ├── operator/
│   │   │   │   └── public/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn UI components
│   │   │   ├── layout/            # Sidebar, Navbar, Footer
│   │   │   ├── charts/            # Recharts components
│   │   │   ├── tables/            # Data tables
│   │   │   └── forms/             # Form components
│   │   ├── lib/
│   │   │   ├── api.ts             # API client (axios)
│   │   │   ├── auth.ts            # Auth utilities
│   │   │   ├── blockchain.ts      # Ethers.js utils
│   │   │   └── utils.ts           # Helper functions
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── types/                 # TypeScript types
│   │   ├── stores/                # State management
│   │   └── styles/
│   │       └── globals.css
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                       # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── blockchain.ts
│   │   │   └── env.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── budget/
│   │   │   │   ├── budget.controller.ts
│   │   │   │   ├── budget.service.ts
│   │   │   │   ├── budget.routes.ts
│   │   │   │   └── budget.validation.ts
│   │   │   ├── transaction/
│   │   │   │   ├── transaction.controller.ts
│   │   │   │   ├── transaction.service.ts
│   │   │   │   ├── transaction.routes.ts
│   │   │   │   └── transaction.validation.ts
│   │   │   ├── project/
│   │   │   ├── audit/
│   │   │   ├── user/
│   │   │   ├── report/
│   │   │   └── notification/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── activity.middleware.ts
│   │   ├── services/
│   │   │   └── blockchain.service.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── response.ts
│   │   │   └── pagination.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── tsconfig.json
│   └── package.json
│
├── blockchain/                    # Hardhat + Solidity
│   ├── contracts/
│   │   ├── BudgetManager.sol
│   │   ├── TransactionManager.sol
│   │   └── AuditTrail.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── test/
│   │   └── contracts.test.ts
│   ├── hardhat.config.ts
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### 6.4 Data Flow — Transaksi ke Blockchain

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ Frontend │────>│ Backend  │────>│  PostgreSQL   │     │  Blockchain  │
│ (Form)   │POST │ (API)    │     │  (Prisma)     │     │  (Hardhat)   │
└──────────┘     └────┬─────┘     └──────────────┘     └──────┬───────┘
                      │                                        │
                      │  1. Validasi input                     │
                      │  2. Simpan ke DB (status: pending)     │
                      │  3. Kirim ke Smart Contract ──────────>│
                      │  4. Terima tx hash <───────────────────│
                      │  5. Update DB dengan tx hash           │
                      │  6. Return response ke frontend        │
                      │                                        │
                      └────────────────────────────────────────┘
```

### 6.5 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│ Frontend │────>│ Backend  │────>│  PostgreSQL   │
│ (Login)  │POST │ (Auth)   │     │  (Users)      │
└──────────┘     └────┬─────┘     └──────────────┘
                      │
                      │  1. Terima email & password
                      │  2. Cari user di DB
                      │  3. Verifikasi password (bcrypt.compare)
                      │  4. Generate JWT token (payload: id, email, role)
                      │  5. Return token ke frontend
                      │
                      │  Setiap request selanjutnya:
                      │  → Frontend kirim JWT di header Authorization
                      │  → Middleware verifikasi token
                      │  → Middleware cek role permission
                      │  → Lanjut ke controller jika valid
```

### 6.6 Role-Based Access Matrix

```
┌──────────────────────────┬───────┬───────────┬─────────┬──────────┬──────────┐
│ Fitur                    │ Admin │ Pemerintah│ Operator│ Auditor  │Masyarakat│
├──────────────────────────┼───────┼───────────┼─────────┼──────────┼──────────┤
│ Kelola User              │  ✅   │    ❌     │   ❌    │    ❌    │    ❌    │
│ Kelola Role              │  ✅   │    ❌     │   ❌    │    ❌    │    ❌    │
│ Monitoring Sistem        │  ✅   │    ❌     │   ❌    │    ❌    │    ❌    │
│ Buat Anggaran            │  ❌   │    ✅     │   ❌    │    ❌    │    ❌    │
│ Edit Anggaran            │  ❌   │    ✅     │   ❌    │    ❌    │    ❌    │
│ Lihat Anggaran           │  ✅   │    ✅     │   ✅    │    ✅    │    ✅    │
│ Buat Proyek              │  ❌   │    ✅     │   ❌    │    ❌    │    ❌    │
│ Buat Transaksi           │  ❌   │    ❌     │   ✅    │    ❌    │    ❌    │
│ Verifikasi Transaksi     │  ❌   │    ❌     │   ❌    │    ✅    │    ❌    │
│ Lihat Audit Trail        │  ✅   │    ❌     │   ❌    │    ✅    │    ❌    │
│ Blockchain Explorer      │  ✅   │    ❌     │   ❌    │    ✅    │    ❌    │
│ Dashboard Publik         │  ✅   │    ✅     │   ✅    │    ✅    │    ✅    │
│ Lapor Penyimpangan       │  ❌   │    ❌     │   ❌    │    ❌    │    ✅    │
│ Export Data              │  ✅   │    ✅     │   ❌    │    ✅    │    ❌    │
│ Notifikasi               │  ✅   │    ✅     │   ✅    │    ✅    │    ✅    │
└──────────────────────────┴───────┴───────────┴─────────┴──────────┴──────────┘
```

### 6.7 Integrasi IPFS (Penjelasan)

Untuk prototype ini, file disimpan di local storage. Namun, untuk production, integrasi IPFS dapat dilakukan sebagai berikut:

1. **Upload dokumen bukti transaksi** → File di-upload ke IPFS via Pinata/Infura gateway
2. **IPFS mengembalikan CID** (Content Identifier) → CID unik dan immutable
3. **CID disimpan ke smart contract** → Menjadi bagian dari data on-chain
4. **CID juga disimpan di database** → Untuk query cepat
5. **Akses file** → Frontend mengambil file dari IPFS gateway menggunakan CID

```
File Upload → IPFS Gateway → CID → Smart Contract (on-chain)
                                 → PostgreSQL (off-chain index)
```

---

## Ringkasan

Analisis sistem ini mencakup:
- **8 kelompok kebutuhan fungsional** dengan 20 use case
- **13 kebutuhan non-fungsional**
- **Sitemap lengkap** dengan 25+ halaman
- **6 user flow** untuk semua role
- **Arsitektur 4 layer**: Client → Server → Data → Blockchain
- **Role-based access matrix** untuk 5 role pengguna
- **Clean architecture** dengan separation of concerns

Selanjutnya: **STEP 2 — Desain Database** (ERD, Relasi Tabel, Schema Prisma)
