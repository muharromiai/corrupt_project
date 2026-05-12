# STEP 6 — BACKEND API
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## TUJUAN

Membangun REST API lengkap untuk 7 module dengan CRUD, blockchain integration, validation, dan error handling.

---

## DAFTAR API ENDPOINTS

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| POST | `/register` | No | — | Registrasi user baru |
| POST | `/login` | No | — | Login, return JWT |
| GET | `/profile` | Yes | All | Get current profile |
| PUT | `/profile` | Yes | All | Update nama/email |
| PUT | `/change-password` | Yes | All | Ganti password |

### Budget (`/api/budgets`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | All | List anggaran + filter + search + pagination |
| GET | `/stats` | Yes | All | Statistik anggaran |
| GET | `/:id` | Yes | All | Detail anggaran + proyek + transaksi |
| POST | `/` | Yes | GOVERNMENT, ADMIN | Buat anggaran (+ blockchain) |
| PUT | `/:id` | Yes | GOVERNMENT, ADMIN | Update anggaran (+ blockchain) |

### Project (`/api/projects`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | All | List proyek + filter |
| GET | `/:id` | Yes | All | Detail proyek + transaksi |
| POST | `/` | Yes | GOVERNMENT, ADMIN | Buat proyek (validasi sisa anggaran) |
| PUT | `/:id` | Yes | GOVERNMENT, ADMIN | Update proyek/progress |

### Transaction (`/api/transactions`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | All | List transaksi + filter |
| GET | `/stats` | Yes | All | Statistik transaksi |
| GET | `/:id` | Yes | All | Detail transaksi + audit logs |
| POST | `/` | Yes | OPERATOR, ADMIN | Buat transaksi (+ blockchain + notif auditor) |
| PUT | `/:id/verify` | Yes | AUDITOR, ADMIN | Approve/reject (+ blockchain + notif operator) |

### Audit (`/api/audits`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | AUDITOR, ADMIN | List audit logs |
| GET | `/stats` | Yes | AUDITOR, ADMIN | Statistik audit (DB + blockchain) |
| GET | `/blockchain/:transactionId` | Yes | AUDITOR, ADMIN | Bandingkan data DB vs blockchain |
| GET | `/:id` | Yes | AUDITOR, ADMIN | Detail audit log |

### User (`/api/users`) — Admin Only
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | ADMIN | List semua user |
| GET | `/activity-logs` | Yes | ADMIN | Activity logs semua user |
| GET | `/:id` | Yes | ADMIN | Detail user |
| PUT | `/:id` | Yes | ADMIN | Update user (name, email, role, isActive) |
| PUT | `/:id/reset-password` | Yes | ADMIN | Reset password user |
| DELETE | `/:id` | Yes | ADMIN | Nonaktifkan user (soft delete) |

### Report (`/api/reports`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/my` | Yes | All | Laporan milik user |
| GET | `/` | Yes | ADMIN, AUDITOR | Semua laporan |
| GET | `/:id` | Yes | All | Detail laporan |
| POST | `/` | Yes | PUBLIC | Submit laporan penyimpangan |
| PUT | `/:id` | Yes | ADMIN | Update status laporan |

### Notification (`/api/notifications`)
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | Yes | All | List notifikasi user |
| GET | `/unread-count` | Yes | All | Jumlah notifikasi belum dibaca |
| PUT | `/read-all` | Yes | All | Tandai semua sudah dibaca |
| PUT | `/:id/read` | Yes | All | Tandai satu sudah dibaca |

---

## TOTAL: 30 API Endpoints

---

## FITUR YANG TERINTEGRASI

1. **Blockchain Integration** — Budget, Transaction, dan Audit otomatis dicatat ke smart contract
2. **Auto Notification** — Transaksi baru → notif ke auditor; Verifikasi → notif ke operator; Laporan → notif ke admin
3. **Activity Logging** — Semua operasi CUD dicatat ke activity_logs via middleware
4. **Zod Validation** — Input divalidasi dengan schema ketat di setiap endpoint
5. **Role Authorization** — Setiap endpoint dilindungi sesuai access matrix
6. **Pagination** — Semua list endpoint mendukung `page`, `limit`, `search`
7. **Graceful Blockchain Fallback** — Jika blockchain tidak tersedia, data tetap disimpan ke database

---

## CARA TESTING

```bash
# Health check
curl http://localhost:5000/api/health

# Login sebagai operator
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@corruption-killer.id","password":"password123"}' | jq -r '.data.token')

# Buat transaksi
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budgetId":"<BUDGET_ID>","description":"Pembayaran vendor","amount":5000000,"category":"PROCUREMENT","recipientName":"PT XYZ","recipientAccount":"BCA-123456"}'

# Login sebagai auditor
AUDITOR_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auditor@corruption-killer.id","password":"password123"}' | jq -r '.data.token')

# Verifikasi transaksi
curl -X PUT http://localhost:5000/api/transactions/<TX_ID>/verify \
  -H "Authorization: Bearer $AUDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVED","notes":"Dokumen lengkap dan valid"}'
```
