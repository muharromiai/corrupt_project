# STEP 3 — SETUP PROJECT
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## PRASYARAT

Pastikan software berikut sudah terinstall:

| Software     | Versi Minimum | Cara Cek              | Download                          |
|-------------|---------------|------------------------|------------------------------------|
| Node.js     | 20.x          | `node --version`       | https://nodejs.org                 |
| npm         | 10.x          | `npm --version`        | Sudah termasuk Node.js             |
| PostgreSQL  | 16.x          | `psql --version`       | https://www.postgresql.org         |
| Git         | 2.x           | `git --version`        | https://git-scm.com                |
| Docker      | 24.x (opsional)| `docker --version`    | https://www.docker.com             |

---

## CARA SETUP (LANGKAH DEMI LANGKAH)

### 1. Clone / Buka Folder Project

```bash
cd "D:/B CLASS ASSIGNMENT 2/SEMESTER 4/corruption-killer"
```

### 2. Setup Database PostgreSQL

**Opsi A — Menggunakan Docker (Direkomendasikan):**
```bash
docker compose up postgres -d
```

**Opsi B — PostgreSQL lokal:**
```bash
# Buat database baru
psql -U postgres -c "CREATE DATABASE corruption_killer;"
```

### 3. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Jalankan seed data
npm run db:seed

# Jalankan server development
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

Cek health: `http://localhost:5000/api/health`

### 4. Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 5. Setup Blockchain (Hardhat)

```bash
# Buka terminal baru, masuk ke folder blockchain
cd blockchain

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Jalankan local blockchain node
npx hardhat node
```

Hardhat node akan berjalan di `http://127.0.0.1:8545`

Setelah node berjalan, buka terminal baru:
```bash
cd blockchain

# Deploy smart contracts ke local node
npx hardhat run scripts/deploy.ts --network localhost
```

Catat contract addresses yang muncul, lalu update file `backend/.env`:
```
BUDGET_MANAGER_ADDRESS="0x..."
TRANSACTION_MANAGER_ADDRESS="0x..."
AUDIT_TRAIL_ADDRESS="0x..."
```

### 6. Setup dengan Docker (All-in-One)

```bash
# Dari root folder project
docker compose up --build
```

Ini akan menjalankan:
- PostgreSQL di port 5432
- Backend di port 5000
- Frontend di port 3000
- Hardhat node di port 8545

---

## STRUKTUR FOLDER LENGKAP

```
corruption-killer/
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── docs/
│   ├── STEP-1-ANALISIS-SISTEM.md
│   ├── STEP-2-DESAIN-DATABASE.md
│   └── STEP-3-SETUP-PROJECT.md
│
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── app.ts                    # Entry point
│       ├── config/
│       │   ├── env.ts                # Environment variables
│       │   ├── database.ts           # Prisma client
│       │   └── blockchain.ts         # Ethers.js provider
│       ├── middleware/
│       │   ├── auth.middleware.ts     # JWT authentication
│       │   ├── role.middleware.ts     # Role-based access
│       │   ├── validation.middleware.ts # Zod validation
│       │   ├── error.middleware.ts    # Global error handler
│       │   └── activity.middleware.ts # Activity logging
│       ├── modules/
│       │   ├── auth/                 # Authentication module
│       │   ├── user/                 # User management
│       │   ├── budget/               # Budget management
│       │   ├── project/              # Project management
│       │   ├── transaction/          # Transaction management
│       │   ├── audit/                # Audit system
│       │   ├── report/               # Report system
│       │   └── notification/         # Notification system
│       ├── services/                 # Shared services
│       ├── utils/
│       │   ├── response.ts           # API response helpers
│       │   └── pagination.ts         # Pagination helper
│       └── types/
│           └── index.ts              # TypeScript types
│
├── frontend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── app/                      # Next.js App Router
│       │   ├── layout.tsx            # Root layout
│       │   ├── page.tsx              # Landing page
│       │   ├── login/                # Login page
│       │   ├── register/             # Register page
│       │   ├── admin/                # Admin dashboard
│       │   ├── government/           # Government dashboard
│       │   ├── auditor/              # Auditor dashboard
│       │   ├── operator/             # Operator dashboard
│       │   └── public/               # Public dashboard
│       ├── components/
│       │   ├── ui/                   # Shadcn UI components
│       │   ├── layout/               # Layout components
│       │   ├── charts/               # Chart components
│       │   ├── tables/               # Table components
│       │   └── forms/                # Form components
│       ├── lib/
│       │   ├── api.ts                # Axios API client
│       │   ├── auth.ts               # Auth utilities
│       │   └── utils.ts              # Helper functions
│       ├── hooks/                    # Custom hooks
│       ├── types/                    # TypeScript types
│       ├── stores/                   # Zustand stores
│       └── styles/
│           └── globals.css           # Global styles (dark mode)
│
└── blockchain/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── hardhat.config.ts
    ├── contracts/                    # Solidity contracts
    ├── scripts/                      # Deploy scripts
    └── test/                         # Contract tests
```

---

## TESTING SETUP

Setelah semua berjalan, cek:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Response harus menunjukkan `"status": "healthy"`

2. **Frontend:** Buka `http://localhost:3000` → Harus muncul landing page

3. **Database:** Jalankan Prisma Studio untuk melihat data:
   ```bash
   cd backend && npx prisma studio
   ```
   Buka `http://localhost:5555`

4. **Blockchain:** Cek Hardhat node berjalan:
   ```bash
   curl -X POST http://127.0.0.1:8545 -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

---

## POTENSI ERROR & SOLUSI

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `ECONNREFUSED :5432` | PostgreSQL belum berjalan | Jalankan `docker compose up postgres -d` atau start PostgreSQL lokal |
| `P1001: Can't reach database` | DATABASE_URL salah | Cek file `.env`, pastikan username/password benar |
| `Module not found` | Dependencies belum diinstall | Jalankan `npm install` di folder yang bersangkutan |
| `EADDRINUSE :5000` | Port sudah digunakan | Kill proses lama atau ganti port di `.env` |
| `Cannot find module '@prisma/client'` | Prisma belum digenerate | Jalankan `npx prisma generate` |
| `HardhatError: network localhost` | Hardhat node belum berjalan | Jalankan `npx hardhat node` di terminal terpisah |

---

## AKUN SEED (untuk testing)

| Role        | Email                              | Password     |
|-------------|-------------------------------------|-------------|
| Admin       | admin@corruption-killer.id         | password123  |
| Pemerintah  | pemerintah@corruption-killer.id    | password123  |
| Operator    | operator@corruption-killer.id      | password123  |
| Auditor     | auditor@corruption-killer.id       | password123  |
| Masyarakat  | masyarakat@corruption-killer.id    | password123  |
