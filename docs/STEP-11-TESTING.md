# STEP 11 — Testing

## Ringkasan Test Suite

| Layer | Framework | Jumlah Test | File |
|-------|-----------|-------------|------|
| Smart Contract | Hardhat + Chai | 21 test | `blockchain/test/contracts.test.ts` |
| Backend Auth | Jest | 5 test | `backend/src/__tests__/auth.test.ts` |
| Backend Validation | Jest + Zod | 18 test | `backend/src/__tests__/validation.test.ts` |
| Backend Utils | Jest | 15 test | `backend/src/__tests__/utils.test.ts` |

**Total: 59 test cases**

## 1. Smart Contract Tests

File: `blockchain/test/contracts.test.ts`

```bash
cd blockchain && npx hardhat test
```

### BudgetManager (7 tests)
- Should create a budget with correct data
- Should emit BudgetCreated event
- Should get budget data
- Should update budget
- Should track total budgets
- Should not allow duplicate budget IDs
- Should not update non-existent budget

### TransactionManager (7 tests)
- Should create a transaction
- Should emit TransactionCreated event
- Should approve transaction
- Should reject transaction
- Should emit TransactionStatusChanged
- Should not double-approve
- Should track per-budget transactions

### AuditTrail (6 tests)
- Should record an audit entry
- Should emit AuditRecorded event
- Should get audit entry
- Should update audit summary (approved count)
- Should update audit summary (rejected count)
- Should track total audits

### Integration (1 test)
- Full workflow: create budget → create transaction → approve → record audit

## 2. Backend Auth Tests

File: `backend/src/__tests__/auth.test.ts`

```bash
cd backend && npx jest auth.test
```

### Password Hashing
- Hash password correctly
- Verify correct password
- Reject incorrect password

### JWT Token
- Generate valid JWT token
- Decode JWT token correctly
- Reject invalid JWT token
- Reject expired JWT token
- Reject token with wrong secret

## 3. Backend Validation Tests

File: `backend/src/__tests__/validation.test.ts`

```bash
cd backend && npx jest validation.test
```

### Register Schema
- Valid registration data → accept
- Short name → reject
- Invalid email → reject
- Weak password → reject
- Password without uppercase → reject
- Invalid role → reject
- All 5 valid roles → accept

### Login Schema
- Valid login → accept
- Empty password → reject

### Budget Schema
- Valid budget data → accept
- Negative amount → reject
- Invalid fiscal year → reject
- All 10 categories → accept

### Transaction Schema
- Valid transaction data → accept
- Invalid UUID → reject
- All 8 categories → accept

### Verify Transaction Schema
- Approve action → accept
- Reject action → accept
- Invalid action → reject

### Report Schema
- Valid report → accept
- Report with evidence → accept
- Short title → reject

## 4. Backend Utility Tests

File: `backend/src/__tests__/utils.test.ts`

```bash
cd backend && npx jest utils.test
```

### Pagination
- Default values
- Parse page and limit
- Cap limit at 100
- Minimum page = 1
- Correct skip calculation

### Response Formatters
- Success response format
- Paginated response format
- Error response format
- Total pages calculation

### Role Authorization
- Matching role → authorize
- Non-matching role → deny
- Multiple allowed roles

### Budget Calculations
- Remaining amount
- Absorption percentage
- Zero total edge case
- Cap at 100%

### Status Color Mapping
- Correct colors per status
- Unknown status fallback

## Menjalankan Semua Test

```bash
# Smart Contract Tests
cd blockchain && npx hardhat test

# Backend Tests
cd backend && npm test

# Semua backend test dengan coverage
cd backend && npx jest --coverage
```

## Konfigurasi

### Jest Config (`backend/jest.config.js`)
- Preset: `ts-jest`
- Environment: `node`
- Test match: `**/__tests__/**/*.test.ts`
- Timeout: 15 detik

### Dependencies Tambahan
```json
{
  "@types/jest": "^29.5.12",
  "@types/supertest": "^6.0.2",
  "jest": "^29.7.0",
  "supertest": "^7.0.0",
  "ts-jest": "^29.2.5"
}
```
