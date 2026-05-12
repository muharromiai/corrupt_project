# STEP 4 — AUTHENTICATION SYSTEM
# Sistem Keuangan Negara Anti Korupsi Berbasis Blockchain

---

## TUJUAN

Membangun sistem autentikasi lengkap meliputi:
- Register user baru dengan validasi
- Login dengan JWT token
- Role-based access control (5 role)
- Proteksi route di backend dan frontend
- Session management dengan cookie

---

## FILE YANG DIBUAT/DIUPDATE

### Backend (4 file baru)
| File | Fungsi |
|------|--------|
| `src/modules/auth/auth.validation.ts` | Schema validasi register & login (Zod) |
| `src/modules/auth/auth.service.ts` | Business logic: register, login, profile, password |
| `src/modules/auth/auth.controller.ts` | HTTP handler untuk auth endpoints |
| `src/modules/auth/auth.routes.ts` | Route definitions (updated) |

### Frontend (10 file baru)
| File | Fungsi |
|------|--------|
| `src/app/login/page.tsx` | Halaman login dengan demo accounts |
| `src/app/register/page.tsx` | Halaman registrasi dengan role selector |
| `src/hooks/use-auth.ts` | Custom hook untuk auth state management |
| `src/components/layout/auth-guard.tsx` | Komponen proteksi route |
| `src/components/layout/sidebar.tsx` | Sidebar navigasi role-based |
| `src/components/layout/navbar.tsx` | Navbar dengan notifikasi & search |
| `src/components/layout/dashboard-layout.tsx` | Layout wrapper dashboard |
| `src/components/layout/index.ts` | Barrel exports |
| `src/app/*/dashboard/page.tsx` | Dashboard placeholder per role (5 file) |

---

## API ENDPOINTS

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | No | Registrasi user baru |
| POST | `/api/auth/login` | No | Login, return JWT token |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update nama/email |
| PUT | `/api/auth/change-password` | Yes | Ganti password |

---

## FLOW AUTENTIKASI

```
1. User submit form login
2. Frontend POST /api/auth/login {email, password}
3. Backend validasi via Zod schema
4. Backend cari user di DB via Prisma
5. Backend compare password via bcrypt
6. Backend generate JWT token (id, email, role)
7. Frontend simpan token di cookie (js-cookie)
8. Frontend redirect ke dashboard sesuai role
9. Setiap request: Axios interceptor tambahkan Bearer token
10. Backend middleware verifikasi token & cek role permission
```

---

## ROLE-BASED ROUTING

| Role | Dashboard Redirect | Sidebar Menu |
|------|-------------------|--------------|
| ADMIN | `/admin/users` | Users, Activity Logs |
| GOVERNMENT | `/government/dashboard` | Dashboard, Anggaran, Proyek, Transaksi |
| OPERATOR | `/operator/dashboard` | Dashboard, Transaksi, Buat Transaksi |
| AUDITOR | `/auditor/dashboard` | Dashboard, Verifikasi, Audit Trail, Explorer |
| PUBLIC | `/public/dashboard` | Dashboard, Anggaran, Proyek, Statistik, Lapor |

---

## VALIDASI

### Register
- Nama: min 3 karakter, max 100 karakter
- Email: format valid, unik di database
- Password: min 8 karakter, harus ada huruf besar dan angka
- Role: opsional, default PUBLIC

### Login
- Email: format valid
- Password: tidak boleh kosong

---

## KEAMANAN

1. **Password hashing**: bcrypt dengan salt round 10
2. **JWT Token**: Signed dengan secret key, expire 7 hari
3. **Rate limiting**: 100 request per 15 menit per IP
4. **CORS**: Hanya mengizinkan frontend URL
5. **Helmet**: HTTP security headers
6. **Input validation**: Zod schema di setiap endpoint
7. **Error message**: Tidak mengekspos detail internal (email/password salah → pesan generik)

---

## CARA TESTING

```bash
# 1. Register user baru
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Password123","role":"PUBLIC"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@corruption-killer.id","password":"password123"}'

# 3. Get profile (ganti TOKEN dengan token dari login)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# 4. Test akses tanpa token → harus 401
curl http://localhost:5000/api/auth/profile

# 5. Frontend: buka http://localhost:3000/login
#    Gunakan tombol demo account untuk quick fill
```
