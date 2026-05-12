# STEP 5 — SMART CONTRACT
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## TUJUAN

Membangun smart contract Solidity yang mencatat data keuangan negara secara immutable di blockchain:
- BudgetManager: Pencatatan dan update anggaran
- TransactionManager: Pencatatan transaksi, approval/rejection
- AuditTrail: Pencatatan audit dengan summary statistics

---

## SMART CONTRACTS

### 1. BudgetManager.sol

| Fungsi | Deskripsi |
|--------|-----------|
| `createBudget()` | Membuat anggaran baru di blockchain |
| `updateBudget()` | Mengupdate nama dan total amount |
| `getBudget()` | Mengambil data anggaran dari blockchain |
| `getTotalBudgets()` | Menghitung total anggaran yang tercatat |

**Events:**
- `BudgetCreated` — Emitted saat anggaran baru dibuat
- `BudgetUpdated` — Emitted saat anggaran diupdate

### 2. TransactionManager.sol

| Fungsi | Deskripsi |
|--------|-----------|
| `createTransaction()` | Membuat transaksi baru (status: PENDING) |
| `approveTransaction()` | Mengubah status menjadi APPROVED |
| `rejectTransaction()` | Mengubah status menjadi REJECTED |
| `getTransaction()` | Mengambil data transaksi |
| `getTransactionStatus()` | Mengambil status transaksi |
| `getBudgetTransactionCount()` | Menghitung transaksi per anggaran |

**Events:**
- `TransactionCreated` — Emitted saat transaksi dibuat
- `TransactionStatusChanged` — Emitted saat status berubah

### 3. AuditTrail.sol

| Fungsi | Deskripsi |
|--------|-----------|
| `recordAudit()` | Mencatat entry audit (APPROVED/REJECTED/REVIEWED) |
| `getAuditEntry()` | Mengambil data audit |
| `getAuditSummary()` | Mendapatkan statistik (approved, rejected, reviewed, total) |
| `getTransactionAuditCount()` | Menghitung audit per transaksi |

**Events:**
- `AuditRecorded` — Emitted saat audit dicatat
- `AuditSummaryUpdated` — Emitted dengan statistik terbaru

---

## FILE YANG DIBUAT

| File | Deskripsi |
|------|-----------|
| `contracts/BudgetManager.sol` | Smart contract untuk manajemen anggaran |
| `contracts/TransactionManager.sol` | Smart contract untuk manajemen transaksi |
| `contracts/AuditTrail.sol` | Smart contract untuk audit trail |
| `scripts/deploy.ts` | Script deploy semua contract + simpan addresses |
| `test/contracts.test.ts` | 20+ test cases untuk semua contract |
| `backend/src/services/blockchain.service.ts` | Service integrasi backend ke smart contract |

---

## CARA MENJALANKAN

### Compile Contracts
```bash
cd blockchain
npm install
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Deploy ke Local Node
```bash
# Terminal 1: Jalankan node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.ts --network localhost
```

### Setelah Deploy
1. Catat contract addresses dari output
2. Update `backend/.env`:
```
BUDGET_MANAGER_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
TRANSACTION_MANAGER_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
AUDIT_TRAIL_ADDRESS="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
```
3. Restart backend server

---

## TEST CASES (20+ tests)

### BudgetManager (6 tests)
- Create budget baru ✓
- Emit BudgetCreated event ✓
- Tolak duplicate budget ID ✓
- Tolak empty budget ID ✓
- Tolak zero amount ✓
- Update budget ✓
- Track total budgets ✓

### TransactionManager (6 tests)
- Create transaction baru ✓
- Emit TransactionCreated event ✓
- Approve pending transaction ✓
- Reject pending transaction ✓
- Tolak approve ulang ✓
- Tolak duplicate transaction ID ✓
- Track transactions per budget ✓

### AuditTrail (5 tests)
- Record audit entry ✓
- Emit AuditRecorded event ✓
- Track audit summary ✓
- Tolak duplicate audit ID ✓
- Track audits per transaction ✓
- Emit AuditSummaryUpdated event ✓

### Integration (1 test)
- Full workflow: budget → transaction → audit → approve ✓

---

## BLOCKCHAIN SERVICE (Backend)

`blockchain.service.ts` menyediakan wrapper untuk semua operasi blockchain:
- Graceful fallback jika contract belum di-deploy (skip blockchain, data tetap disimpan di DB)
- Auto-convert BigInt untuk amount
- Return txHash dan blockNumber untuk disimpan di database
- `getBlockchainStats()` untuk dashboard monitoring
