# STEP 9 — Sistem Audit

## Arsitektur Audit

```
┌─────────────────────────────────────────────────┐
│                  AUDIT SYSTEM                   │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │ Audit Trail │  │ Blockchain  │  │ Report │  │
│  │ (DB Logs)   │──│ Verifier    │  │ Mgmt   │  │
│  └──────┬──────┘  └──────┬──────┘  └───┬────┘  │
│         │                │             │        │
│  ┌──────┴────────────────┴─────────────┴────┐   │
│  │              Backend API                 │   │
│  │  - GET /audit-logs (list + pagination)   │   │
│  │  - GET /audit-logs/:id (detail)          │   │
│  │  - GET /audit-logs/stats (ringkasan)     │   │
│  │  - GET /audit-logs/blockchain/:txId      │   │
│  │  - PUT /reports/:id (update status)      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Frontend Pages

### 1. Audit Trail Enhanced (`auditor/audit-trail/page.tsx`)
- **Stat cards**: Total audit, disetujui, ditolak, ditinjau
- **DataTable**: Waktu, auditor, transaksi (deskripsi + jumlah), aksi, catatan, blockchain hash
- **Row click**: Navigasi ke detail audit
- **Pagination**: 15 items per halaman

### 2. Audit Detail (`auditor/audit-trail/[id]/page.tsx`)
- **Info audit**: Aksi, catatan, waktu, blockchain hash
- **Info auditor**: Nama dan role
- **Transaksi terkait**: Deskripsi, jumlah, penerima, status
- **BlockchainVerifier**: Verifikasi data DB vs on-chain
- **Comparison table**: Tabel perbandingan field Database vs Blockchain dengan indikator match/mismatch

### 3. Admin Reports Management (`admin/reports/page.tsx`)
- **Stat cards**: Baru masuk, sedang ditinjau, selesai, total
- **DataTable**: Judul, pelapor, status, bukti, tanggal, tombol tinjau
- **Modal detail**: View full report + update status + admin notes
- **Status options**: SUBMITTED → UNDER_REVIEW → RESOLVED/DISMISSED
- **Auto notifikasi**: Reporter mendapat notifikasi saat status berubah

## Alur Audit

### Verifikasi Transaksi
```
Operator → Buat Transaksi → DB + Blockchain
    ↓
Auditor → Dashboard / Halaman Verifikasi
    ↓
Approve/Reject → AuditLog dibuat (DB)
    ↓
recordAuditOnChain() → Blockchain (immutable)
    ↓
Notification → Operator
```

### Pelaporan Masyarakat
```
Public → Form Laporan → POST /reports
    ↓
Notification → All Admin
    ↓
Admin → Tinjau Laporan → Update Status
    ↓
Notification → Reporter
```

### Verifikasi Blockchain
```
Frontend → API (DB data) + ethers.js (On-chain data)
    ↓
Compare fields (amount, status, recipient)
    ↓
Show Match/Mismatch indicators
```

## Sidebar Navigation Update

Admin sidebar now includes:
1. Manajemen User (`/admin/users`)
2. **Laporan** (`/admin/reports`) — NEW
3. Activity Logs (`/admin/activity-logs`)

## Keamanan

- Audit logs hanya bisa dibaca oleh AUDITOR dan ADMIN
- Audit logs tidak bisa diubah/dihapus (append-only)
- Data blockchain bersifat immutable — menjamin integritas
- Report management hanya untuk ADMIN
- Setiap aksi verifikasi tercatat di activity log
