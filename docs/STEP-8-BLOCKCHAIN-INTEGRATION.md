# STEP 8 — Integrasi Blockchain Frontend

## Arsitektur Integrasi

```
┌─────────────────────────────────────────┐
│              Frontend (Next.js)         │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ lib/         │  │ hooks/          │  │
│  │ blockchain.ts│──│ use-blockchain  │  │
│  │  - Provider  │  │  - Stats        │  │
│  │  - Contracts │  │  - Budget data  │  │
│  │  - ABIs      │  │  - Tx data      │  │
│  └──────┬───────┘  └────────┬────────┘  │
│         │                   │           │
│  ┌──────┴───────────────────┴────────┐  │
│  │         UI Components             │  │
│  │  - BlockchainStatusCard           │  │
│  │  - BlockchainVerifier             │  │
│  └──────────────┬────────────────────┘  │
│                 │                       │
│     ┌───────────┴─────────────┐         │
│     │   Dashboard Pages       │         │
│     │   - Government          │         │
│     │   - Auditor             │         │
│     │   - Explorer            │         │
│     └─────────────────────────┘         │
└──────────────────┬──────────────────────┘
                   │ ethers.js (JSON-RPC)
┌──────────────────┴──────────────────────┐
│          Hardhat Local Node             │
│  ┌───────────────────────────────────┐  │
│  │  BudgetManager     (0x...)        │  │
│  │  TransactionManager (0x...)       │  │
│  │  AuditTrail         (0x...)       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## File yang Dibuat

### 1. `frontend/src/lib/blockchain.ts`
- Provider setup (JSON-RPC ke Hardhat node)
- MetaMask wallet signer integration
- ABI definitions untuk 3 smart contracts
- Contract factory functions
- Connection status check

### 2. `frontend/src/hooks/use-blockchain.ts`
- `useBlockchainStats()` — Stats on-chain: block number, total budgets/tx/audits, audit summary
- `useOnChainBudget(id)` — Fetch budget data langsung dari smart contract
- `useOnChainTransaction(id)` — Fetch transaction data langsung dari smart contract

### 3. `frontend/src/components/ui/blockchain-status.tsx`
- Card status koneksi blockchain (connected/disconnected)
- Ringkasan data on-chain: block number, counts, audit summary
- Diintegrasikan ke Government & Auditor dashboard

### 4. `frontend/src/components/ui/blockchain-verifier.tsx`
- Komponen verifikasi data DB vs on-chain
- Membandingkan nama, jumlah, status antara database dan blockchain
- Menampilkan indikator "Data Cocok" / "Data Berbeda"
- Diintegrasikan ke Budget Detail page

## Environment Variables (Frontend)

```env
NEXT_PUBLIC_BLOCKCHAIN_NETWORK="localhost"
NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS="0x..."
NEXT_PUBLIC_TRANSACTION_MANAGER_ADDRESS="0x..."
NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS="0x..."
```

## Alur Data Blockchain

### Write Path (Backend → Blockchain)
```
User Action → Backend API → Database Save → blockchain.service.ts
  → Smart Contract → txHash → Save to DB (blockchainTxHash)
```

### Read Path (Frontend ← Blockchain)
```
Frontend → ethers.js → JSON-RPC → Smart Contract → Data On-Chain
  → use-blockchain hooks → UI Components
```

### Verification Path
```
Frontend → DB Data (via API) + On-Chain Data (via ethers.js)
  → BlockchainVerifier → Compare → Show Match/Mismatch
```

## Fitur Integrasi

| Fitur | Lokasi | Deskripsi |
|-------|--------|-----------|
| Status Card | Gov & Auditor Dashboard | Menampilkan status koneksi & statistik blockchain |
| Data Verifier | Budget Detail | Membandingkan data DB vs on-chain |
| Explorer | Auditor Explorer | Browse transaksi & audit yang tercatat di blockchain |
| On-Chain Stats | Public Statistics | Ringkasan data transparan dari blockchain |

## Cara Setup

1. Jalankan Hardhat node:
```bash
cd blockchain && npx hardhat node
```

2. Deploy smart contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Salin contract addresses ke `.env`:
```env
NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS="<address>"
NEXT_PUBLIC_TRANSACTION_MANAGER_ADDRESS="<address>"
NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS="<address>"
```

4. Jalankan frontend:
```bash
cd frontend && npm run dev
```

## Graceful Fallback

Jika blockchain tidak tersedia:
- Backend: data tetap tersimpan ke database, blockchain field null
- Frontend: BlockchainStatusCard menampilkan "Tidak Terhubung"
- BlockchainVerifier menampilkan "Data belum tercatat di blockchain"
- Semua fitur non-blockchain tetap berfungsi normal
