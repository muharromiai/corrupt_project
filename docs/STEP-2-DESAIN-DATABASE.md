# STEP 2 — DESAIN DATABASE
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## 1. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────────┐       ┌─────────────────────────┐
│       USER          │       │      NOTIFICATION       │
├─────────────────────┤       ├─────────────────────────┤
│ PK id               │──┐    │ PK id                   │
│    name              │  │    │ FK userId               │──┐
│    email             │  │    │    title                 │  │
│    password          │  │    │    message               │  │
│    role              │  │    │    type                   │  │
│    isActive          │  │    │    isRead                 │  │
│    createdAt         │  │    │    createdAt              │  │
│    updatedAt         │  │    └─────────────────────────┘  │
└─────────────────────┘  │                                  │
         │               │    ┌─────────────────────────┐   │
         │               └───>│     ACTIVITY_LOG        │   │
         │                    ├─────────────────────────┤   │
         │                    │ PK id                   │   │
         │                    │ FK userId               │   │
         │                    │    action                │   │
         │                    │    entity                │   │
         │                    │    entityId              │   │
         │                    │    details               │   │
         │                    │    ipAddress             │   │
         │                    │    createdAt             │   │
         │                    └─────────────────────────┘   │
         │                                                  │
         │  ┌───────────────────────────────────────────────┘
         │  │
         ▼  ▼
┌─────────────────────┐       ┌─────────────────────────┐
│      BUDGET         │       │       PROJECT           │
├─────────────────────┤       ├─────────────────────────┤
│ PK id               │──────>│ PK id                   │
│ FK createdById      │       │ FK budgetId             │
│    name              │       │ FK createdById          │
│    category          │       │    name                  │
│    fiscalYear        │       │    description           │
│    totalAmount       │       │    location              │
│    allocatedAmount   │       │    startDate             │
│    remainingAmount   │       │    endDate               │
│    description       │       │    status                │
│    status            │       │    progress              │
│    blockchainTxHash  │       │    contractorName        │
│    createdAt         │       │    contractValue         │
│    updatedAt         │       │    blockchainTxHash      │
└─────────────────────┘       │    createdAt             │
         │                    │    updatedAt             │
         │                    └─────────────────────────┘
         │
         ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│     TRANSACTION         │       │    AUDIT_LOG            │
├─────────────────────────┤       ├─────────────────────────┤
│ PK id                   │──────>│ PK id                   │
│ FK budgetId             │       │ FK transactionId        │
│ FK projectId            │       │ FK auditorId            │
│ FK createdById          │       │    action                │
│    description          │       │    status                │
│    amount               │       │    notes                 │
│    category             │       │    blockchainTxHash      │
│    recipientName        │       │    createdAt             │
│    recipientAccount     │       └─────────────────────────┘
│    status               │
│    blockchainTxHash     │
│    blockchainBlockNumber│
│    createdAt            │
│    updatedAt            │
└─────────────────────────┘
         │
         │
         ▼
┌─────────────────────────┐
│       REPORT            │
├─────────────────────────┤
│ PK id                   │
│ FK reporterId           │
│ FK transactionId (opt)  │
│ FK budgetId (opt)       │
│    title                │
│    description          │
│    evidence             │
│    status               │
│    adminNotes           │
│    createdAt            │
│    updatedAt            │
└─────────────────────────┘
```

---

## 2. RELASI ANTAR TABEL

| Relasi                          | Tipe           | Keterangan                                          |
|---------------------------------|----------------|------------------------------------------------------|
| User → Budget                   | One-to-Many    | Satu user (pemerintah) dapat membuat banyak anggaran |
| User → Project                  | One-to-Many    | Satu user (pemerintah) dapat membuat banyak proyek   |
| User → Transaction              | One-to-Many    | Satu user (operator) dapat membuat banyak transaksi  |
| User → AuditLog                 | One-to-Many    | Satu auditor dapat membuat banyak audit log          |
| User → Notification             | One-to-Many    | Satu user dapat memiliki banyak notifikasi           |
| User → ActivityLog              | One-to-Many    | Satu user dapat memiliki banyak activity log         |
| User → Report                   | One-to-Many    | Satu user (masyarakat) dapat membuat banyak laporan  |
| Budget → Project                | One-to-Many    | Satu anggaran dapat memiliki banyak proyek           |
| Budget → Transaction            | One-to-Many    | Satu anggaran dapat memiliki banyak transaksi        |
| Budget → Report                 | One-to-Many    | Satu anggaran dapat dilaporkan berkali-kali          |
| Project → Transaction           | One-to-Many    | Satu proyek dapat memiliki banyak transaksi          |
| Transaction → AuditLog          | One-to-Many    | Satu transaksi dapat diaudit berkali-kali            |
| Transaction → Report            | One-to-Many    | Satu transaksi dapat dilaporkan berkali-kali         |

---

## 3. PENJELASAN SETIAP TABEL

### 3.1 Tabel `User`
Menyimpan data pengguna sistem. Setiap pengguna memiliki satu role yang menentukan akses mereka.

| Kolom      | Tipe        | Keterangan                                        |
|------------|-------------|---------------------------------------------------|
| id         | UUID        | Primary key, auto-generated                       |
| name       | String      | Nama lengkap pengguna                             |
| email      | String      | Email unik untuk login                            |
| password   | String      | Password ter-hash (bcrypt)                        |
| role       | Enum        | ADMIN, GOVERNMENT, OPERATOR, AUDITOR, PUBLIC      |
| isActive   | Boolean     | Status aktif akun (default: true)                 |
| createdAt  | DateTime    | Waktu pembuatan akun                              |
| updatedAt  | DateTime    | Waktu terakhir diupdate                           |

### 3.2 Tabel `Budget`
Menyimpan data anggaran negara. Dibuat oleh user dengan role GOVERNMENT.

| Kolom            | Tipe        | Keterangan                                    |
|------------------|-------------|-----------------------------------------------|
| id               | UUID        | Primary key                                   |
| createdById      | UUID        | FK ke User yang membuat                       |
| name             | String      | Nama anggaran                                 |
| category         | Enum        | Kategori: INFRASTRUCTURE, EDUCATION, dll      |
| fiscalYear       | Int         | Tahun anggaran                                |
| totalAmount      | Decimal     | Total dana yang dialokasikan                  |
| allocatedAmount  | Decimal     | Dana yang sudah dialokasikan ke proyek        |
| remainingAmount  | Decimal     | Sisa dana                                     |
| description      | String      | Deskripsi anggaran                            |
| status           | Enum        | DRAFT, ACTIVE, CLOSED                         |
| blockchainTxHash | String?     | Hash transaksi di blockchain                  |
| createdAt        | DateTime    | Waktu pembuatan                               |
| updatedAt        | DateTime    | Waktu update terakhir                         |

### 3.3 Tabel `Project`
Menyimpan data proyek pemerintah yang terkait dengan anggaran tertentu.

| Kolom            | Tipe        | Keterangan                                    |
|------------------|-------------|-----------------------------------------------|
| id               | UUID        | Primary key                                   |
| budgetId         | UUID        | FK ke Budget                                  |
| createdById      | UUID        | FK ke User yang membuat                       |
| name             | String      | Nama proyek                                   |
| description      | String      | Deskripsi proyek                              |
| location         | String      | Lokasi proyek                                 |
| startDate        | DateTime    | Tanggal mulai                                 |
| endDate          | DateTime    | Tanggal target selesai                        |
| status           | Enum        | PLANNING, IN_PROGRESS, COMPLETED, CANCELLED   |
| progress         | Int         | Persentase progress (0-100)                   |
| contractorName   | String      | Nama kontraktor pelaksana                     |
| contractValue    | Decimal     | Nilai kontrak                                 |
| blockchainTxHash | String?     | Hash transaksi di blockchain                  |
| createdAt        | DateTime    | Waktu pembuatan                               |
| updatedAt        | DateTime    | Waktu update terakhir                         |

### 3.4 Tabel `Transaction`
Menyimpan data transaksi keuangan. Setiap transaksi dicatat ke blockchain.

| Kolom                  | Tipe        | Keterangan                                |
|------------------------|-------------|-------------------------------------------|
| id                     | UUID        | Primary key                               |
| budgetId               | UUID        | FK ke Budget                              |
| projectId              | UUID?       | FK ke Project (opsional)                  |
| createdById            | UUID        | FK ke User (operator)                     |
| description            | String      | Deskripsi transaksi                       |
| amount                 | Decimal     | Jumlah dana                               |
| category               | Enum        | DISBURSEMENT, PROCUREMENT, SALARY, dll    |
| recipientName          | String      | Nama penerima dana                        |
| recipientAccount       | String      | Nomor rekening penerima                   |
| status                 | Enum        | PENDING, APPROVED, REJECTED               |
| blockchainTxHash       | String?     | Hash transaksi blockchain                 |
| blockchainBlockNumber  | Int?        | Nomor block di blockchain                 |
| createdAt              | DateTime    | Waktu pembuatan                           |
| updatedAt              | DateTime    | Waktu update terakhir                     |

### 3.5 Tabel `AuditLog`
Menyimpan jejak audit untuk setiap transaksi yang diverifikasi auditor.

| Kolom            | Tipe        | Keterangan                                    |
|------------------|-------------|-----------------------------------------------|
| id               | UUID        | Primary key                                   |
| transactionId    | UUID        | FK ke Transaction                             |
| auditorId        | UUID        | FK ke User (auditor)                          |
| action           | Enum        | APPROVED, REJECTED, REVIEWED                  |
| status           | String      | Status hasil audit                            |
| notes            | String?     | Catatan auditor                               |
| blockchainTxHash | String?     | Hash verifikasi di blockchain                 |
| createdAt        | DateTime    | Waktu audit                                   |

### 3.6 Tabel `Report`
Menyimpan laporan dugaan penyimpangan dari masyarakat.

| Kolom          | Tipe        | Keterangan                                      |
|----------------|-------------|--------------------------------------------------|
| id             | UUID        | Primary key                                      |
| reporterId     | UUID        | FK ke User (masyarakat)                          |
| transactionId  | UUID?       | FK ke Transaction (opsional)                     |
| budgetId       | UUID?       | FK ke Budget (opsional)                          |
| title          | String      | Judul laporan                                    |
| description    | String      | Deskripsi dugaan penyimpangan                    |
| evidence       | String?     | Path file bukti (lokal / IPFS CID)              |
| status         | Enum        | SUBMITTED, UNDER_REVIEW, RESOLVED, DISMISSED    |
| adminNotes     | String?     | Catatan admin terkait laporan                    |
| createdAt      | DateTime    | Waktu pelaporan                                  |
| updatedAt      | DateTime    | Waktu update terakhir                            |

### 3.7 Tabel `Notification`
Menyimpan notifikasi in-app untuk setiap pengguna.

| Kolom      | Tipe        | Keterangan                                        |
|------------|-------------|---------------------------------------------------|
| id         | UUID        | Primary key                                       |
| userId     | UUID        | FK ke User penerima                               |
| title      | String      | Judul notifikasi                                  |
| message    | String      | Isi notifikasi                                    |
| type       | Enum        | INFO, WARNING, SUCCESS, ERROR                     |
| isRead     | Boolean     | Status sudah dibaca (default: false)              |
| createdAt  | DateTime    | Waktu notifikasi                                  |

### 3.8 Tabel `ActivityLog`
Menyimpan log semua aktivitas pengguna di sistem.

| Kolom      | Tipe        | Keterangan                                        |
|------------|-------------|---------------------------------------------------|
| id         | UUID        | Primary key                                       |
| userId     | UUID        | FK ke User yang melakukan aksi                    |
| action     | String      | Aksi yang dilakukan (CREATE, UPDATE, DELETE, dll) |
| entity     | String      | Entitas target (Budget, Transaction, dll)         |
| entityId   | String?     | ID entitas target                                 |
| details    | JSON?       | Detail tambahan dalam JSON                        |
| ipAddress  | String?     | IP address pengguna                               |
| createdAt  | DateTime    | Waktu aktivitas                                   |

---

## 4. SCHEMA PRISMA LENGKAP

File ini akan ditempatkan di `backend/prisma/schema.prisma`.
