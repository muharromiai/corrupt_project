# STEP 12 — Deployment Guide

## Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL  │  │   Hardhat    │  │                  │  │
│  │   :5432       │  │   Node       │  │   Backend        │  │
│  │              ←├──│   :8545      │←─│   Express.js     │  │
│  │  Data Store   │  │  Blockchain  │  │   :5000          │  │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘  │
│                                               │             │
│                                      ┌────────┴─────────┐  │
│                                      │   Frontend       │  │
│                                      │   Next.js        │  │
│                                      │   :3000          │  │
│                                      └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start (Tanpa Docker)

### Prerequisites
- Node.js v20+
- PostgreSQL 16
- Git

### 1. Clone & Setup

```bash
# Clone project
git clone <repository-url>
cd corruption-killer

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Setup Database

```bash
# Buat database PostgreSQL
createdb corruption_killer

# Atau via psql
psql -U postgres -c "CREATE DATABASE corruption_killer;"
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Migrate database
npx prisma migrate dev --name init

# Seed data awal (5 user demo, budgets, projects, transactions)
npm run db:seed

# Jalankan backend
npm run dev
```

### 4. Setup Blockchain

```bash
cd blockchain

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Jalankan Hardhat node (terminal terpisah)
npx hardhat node

# Deploy contracts (terminal baru)
npx hardhat run scripts/deploy.ts --network localhost
```

Setelah deploy, salin contract addresses ke `.env`:

```env
BUDGET_MANAGER_ADDRESS="0x..."
TRANSACTION_MANAGER_ADDRESS="0x..."
AUDIT_TRAIL_ADDRESS="0x..."
```

### 5. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan frontend
npm run dev
```

### 6. Akses Aplikasi

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| API Health | http://localhost:5000/api/health |
| Transparansi Publik | http://localhost:3000/transparency |
| Prisma Studio | `cd backend && npx prisma studio` |

### 7. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@corruption-killer.go.id | password123 |
| Government | government@corruption-killer.go.id | password123 |
| Operator | operator@corruption-killer.go.id | password123 |
| Auditor | auditor@corruption-killer.go.id | password123 |
| Public | public@corruption-killer.go.id | password123 |

---

## Docker Deployment

### 1. Build & Run

```bash
# Dari root project
docker-compose up --build
```

### 2. Setup Database (dalam Docker)

```bash
# Migrate database
docker exec -it ck-backend npx prisma migrate dev --name init

# Seed data
docker exec -it ck-backend npx prisma db seed
```

### 3. Deploy Smart Contracts (dalam Docker)

```bash
# Deploy contracts ke Hardhat node
docker exec -it ck-hardhat npx hardhat run scripts/deploy.ts --network localhost
```

Setelah deploy, update `docker-compose.yml` dengan contract addresses.

### 4. Container Status

```bash
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Stop & Cleanup

```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop + hapus volumes (termasuk database)
```

---

## Struktur Project Lengkap

```
corruption-killer/
├── .env.example                    # Root environment template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Docker orchestration
│
├── docs/                           # Dokumentasi lengkap
│   ├── STEP-1-ANALISIS-SISTEM.md
│   ├── STEP-2-DESAIN-DATABASE.md
│   ├── STEP-3-SETUP-PROJECT.md
│   ├── STEP-4-AUTHENTICATION.md
│   ├── STEP-5-SMART-CONTRACT.md
│   ├── STEP-6-BACKEND-API.md
│   ├── STEP-8-BLOCKCHAIN-INTEGRATION.md
│   ├── STEP-9-AUDIT-SYSTEM.md
│   ├── STEP-10-PUBLIC-TRANSPARENCY.md
│   ├── STEP-11-TESTING.md
│   └── STEP-12-DEPLOYMENT.md
│
├── backend/                        # Express.js Backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma           # 8 models, 8 enums
│   │   └── seed.ts                 # Demo data
│   └── src/
│       ├── app.ts                  # Entry point + routes
│       ├── config/                 # Database, blockchain, env
│       ├── middleware/             # Auth, role, validation, error, activity
│       ├── services/
│       │   └── blockchain.service.ts
│       ├── utils/                  # Response helpers, pagination
│       ├── types/
│       ├── modules/
│       │   ├── auth/               # Register, login, profile
│       │   ├── user/               # CRUD, reset password
│       │   ├── budget/             # CRUD + blockchain
│       │   ├── project/            # CRUD
│       │   ├── transaction/        # CRUD + verify + blockchain
│       │   ├── audit/              # Read + blockchain compare
│       │   ├── report/             # CRUD + notifications
│       │   ├── notification/       # Read, mark as read
│       │   └── transparency/       # Public API (no auth)
│       └── __tests__/              # Jest tests
│
├── frontend/                       # Next.js Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── .env.example
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── login/page.tsx      # Login
│       │   ├── register/page.tsx   # Register
│       │   ├── transparency/       # Public (no auth)
│       │   ├── government/         # Government role pages
│       │   │   ├── dashboard/
│       │   │   ├── budgets/        # List, new, [id] detail
│       │   │   ├── projects/       # List, new, [id] detail
│       │   │   └── transactions/   # List, new
│       │   ├── operator/           # Operator role pages
│       │   │   ├── dashboard/
│       │   │   └── transactions/   # List, new
│       │   ├── auditor/            # Auditor role pages
│       │   │   ├── dashboard/
│       │   │   ├── transactions/   # Verify
│       │   │   ├── audit-trail/    # List, [id] detail
│       │   │   └── explorer/       # Blockchain explorer
│       │   ├── public/             # Public role (logged in)
│       │   │   ├── dashboard/
│       │   │   ├── budgets/
│       │   │   ├── projects/
│       │   │   ├── statistics/
│       │   │   └── report/
│       │   └── admin/              # Admin role pages
│       │       ├── users/          # User management
│       │       ├── reports/        # Report management
│       │       └── activity-logs/
│       ├── components/
│       │   ├── ui/                 # Button, Card, Input, Badge, etc.
│       │   ├── charts/            # Budget, Pie, Spending Trend
│       │   ├── tables/            # DataTable
│       │   └── layout/            # Sidebar, Navbar, AuthGuard
│       ├── hooks/                 # useAuth, useBlockchain
│       ├── stores/                # Zustand auth store
│       ├── lib/                   # API, auth, blockchain, utils
│       ├── styles/                # Global CSS (dark theme)
│       └── types/                 # TypeScript interfaces
│
└── blockchain/                     # Hardhat + Solidity
    ├── Dockerfile
    ├── package.json
    ├── hardhat.config.ts
    ├── contracts/
    │   ├── BudgetManager.sol
    │   ├── TransactionManager.sol
    │   └── AuditTrail.sol
    ├── scripts/
    │   └── deploy.ts
    └── test/
        └── contracts.test.ts       # 21 test cases
```

## API Endpoints Summary

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | /api/auth/register | No | - |
| POST | /api/auth/login | No | - |
| GET | /api/auth/profile | Yes | All |
| PUT | /api/auth/profile | Yes | All |
| PUT | /api/auth/change-password | Yes | All |
| GET | /api/users | Yes | ADMIN |
| GET | /api/users/:id | Yes | ADMIN |
| PUT | /api/users/:id | Yes | ADMIN |
| PUT | /api/users/:id/reset-password | Yes | ADMIN |
| DELETE | /api/users/:id | Yes | ADMIN |
| GET | /api/users/activity-logs | Yes | ADMIN |
| GET | /api/budgets | Yes | All |
| POST | /api/budgets | Yes | GOV, ADMIN |
| GET | /api/budgets/stats | Yes | All |
| GET | /api/budgets/:id | Yes | All |
| PUT | /api/budgets/:id | Yes | GOV, ADMIN |
| GET | /api/projects | Yes | All |
| POST | /api/projects | Yes | GOV, ADMIN |
| GET | /api/projects/:id | Yes | All |
| PUT | /api/projects/:id | Yes | GOV, ADMIN |
| GET | /api/transactions | Yes | All |
| POST | /api/transactions | Yes | OPR, ADMIN |
| GET | /api/transactions/stats | Yes | All |
| GET | /api/transactions/:id | Yes | All |
| PUT | /api/transactions/:id/verify | Yes | AUD, ADMIN |
| GET | /api/audit-logs | Yes | AUD, ADMIN |
| GET | /api/audit-logs/stats | Yes | AUD, ADMIN |
| GET | /api/audit-logs/:id | Yes | AUD, ADMIN |
| GET | /api/audit-logs/blockchain/:txId | Yes | AUD, ADMIN |
| GET | /api/reports | Yes | All |
| POST | /api/reports | Yes | PUBLIC |
| GET | /api/reports/:id | Yes | All |
| PUT | /api/reports/:id | Yes | ADMIN |
| GET | /api/notifications | Yes | All |
| PUT | /api/notifications/:id/read | Yes | All |
| PUT | /api/notifications/read-all | Yes | All |
| GET | /api/notifications/unread-count | Yes | All |
| GET | /api/transparency/stats | No | - |
| GET | /api/transparency/budgets | No | - |
| GET | /api/transparency/transactions | No | - |
| GET | /api/transparency/projects | No | - |
| GET | /api/transparency/blockchain | No | - |
| GET | /api/health | No | - |

## Troubleshooting

### Database Connection Error
```bash
# Pastikan PostgreSQL berjalan
pg_isready -U postgres

# Reset database jika perlu
cd backend && npm run db:reset
```

### Blockchain Not Connected
```bash
# Pastikan Hardhat node berjalan
cd blockchain && npx hardhat node

# Deploy ulang contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Frontend Build Error
```bash
# Clear cache dan reinstall
cd frontend && rm -rf .next node_modules && npm install && npm run dev
```

### Port Already In Use
```bash
# Kill process yang menggunakan port
npx kill-port 3000 5000 8545 5432
```

## Teknologi Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend | Next.js (App Router) | 14+ |
| UI | Tailwind CSS + Shadcn | 3.4+ |
| Animation | Framer Motion | 11+ |
| Charts | Recharts | 2.12+ |
| State | Zustand | 5+ |
| Backend | Express.js + TypeScript | 4.21+ |
| Database | PostgreSQL + Prisma | 16 / 5.22 |
| Blockchain | Solidity + Hardhat | 0.8.24 |
| Blockchain SDK | Ethers.js | 6.13+ |
| Auth | JWT + bcrypt | 9 / 5 |
| Validation | Zod | 3.23+ |
| Testing | Jest + Hardhat Test | 29 |
| Container | Docker + Docker Compose | 3.8 |
