# Domain Admin — Manajemen Pengguna (Users CRUD)

**Base Path:** `/api/v1/admin/users`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

> Semua endpoint dalam domain ini mensyaratkan role `ADMIN`. Middleware pengecekan role wajib diterapkan.

---

## 1. List Semua Pengguna

**Method:** `GET`
**Endpoint:** `/api/v1/admin/users`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `search` | string | Tidak | — | Pencarian `name`, `nip`, atau `email` |
| `role` | string | Tidak | — | Filter: `ADMIN`, `USER_LAB` |
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `20` | Item per halaman (maks 100) |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 48,
    "total_pages": 3
  },
  "data": [
    {
      "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
      "name": "Andi Pratama",
      "nip": "19950123456",
      "role": "USER_LAB",
      "must_change_pin": false,
      "created_at": "2025-05-10T09:00:00+07:00"
    },
    {
      "id": "a1b2c3d4-e555-4f66-b888-987654321def",
      "name": "Dr. Budi Santoso",
      "email": "admin@lab.ac.id",
      "role": "ADMIN",
      "must_change_pin": false,
      "created_at": "2025-01-15T08:30:00+07:00"
    }
  ]
}
```

**Catatan:** Kolom `pin` dan `password` (hash) **tidak pernah** dikembalikan dalam response.

### Handling Error

**401 Unauthorized**
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Sesi Anda telah berakhir. Silakan login kembali."
}
```

**403 Forbidden** — Bukan role `ADMIN`.
```json
{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "Anda tidak memiliki akses ke resource ini."
}
```

---

## 2. Tambah Pengguna Baru

**Method:** `POST`
**Endpoint:** `/api/v1/admin/users`

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body untuk Pengguna Lab:**
```json
{
  "name": "Siti Rahmawati",
  "nip": "19960234567",
  "pin": "4321",
  "role": "USER_LAB"
}
```

**Body untuk Admin:**
```json
{
  "name": "Dr. Candra Wijaya",
  "email": "candra@lab.ac.id",
  "password": "securepass456",
  "role": "ADMIN"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `name` | string | Ya | Nama lengkap pengguna |
| `nip` | string | Wajib jika `USER_LAB` | NIP/NIM unik untuk login |
| `email` | string | Wajib jika `ADMIN` | Email unik untuk login |
| `pin` | string | Wajib jika `USER_LAB` | PIN 4 digit (plain, akan di-hash) |
| `password` | string | Wajib jika `ADMIN` | Password (plain, akan di-hash) |
| `role` | string | Ya | `ADMIN` atau `USER_LAB` |

### Response Sukses (201 Created)

```json
{
  "status": "success",
  "message": "Pengguna baru berhasil didaftarkan.",
  "data": {
    "id": "e1f2a3b4-c555-4d66-b777-135792468def",
    "name": "Siti Rahmawati",
    "nip": "19960234567",
    "role": "USER_LAB",
    "must_change_pin": true,
    "created_at": "2026-08-05T13:07:41+07:00"
  }
}
```

### Logika Bisnis Backend

1. **PIN Hashing:** Untuk `USER_LAB`, backend melakukan hash PIN menggunakan bcrypt sebelum menyimpan ke kolom `users.pin`.
2. **Password Hashing:** Untuk `ADMIN`, backend melakukan hash password menggunakan bcrypt.
3. **Force Change PIN:** Set `must_change_pin = TRUE` untuk pengguna baru `USER_LAB`. Pengguna wajib ganti PIN saat login pertama kali.
4. **Non-Repudiation (ISO 17025):** Admin tidak bisa mengetahui PIN pengguna lab karena PIN di-hash. Saat admin me-reset PIN, sistem menandai `must_change_pin = TRUE` sehingga pengguna langsung diarahkan mengganti PIN.

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Nama dan role wajib diisi. Untuk USER_LAB: NIP dan PIN 4 digit wajib. Untuk ADMIN: email dan password wajib."
}
```

**409 Conflict** — NIP atau email sudah terdaftar.
```json
{
  "status": "error",
  "code": "DUPLICATE_NIP",
  "message": "Pengguna dengan NIP 19960234567 sudah terdaftar."
}
```
```json
{
  "status": "error",
  "code": "DUPLICATE_EMAIL",
  "message": "Pengguna dengan email candra@lab.ac.id sudah terdaftar."
}
```

---

## 3. Detail Pengguna

**Method:** `GET`
**Endpoint:** `/api/v1/admin/users/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID pengguna |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
    "name": "Andi Pratama",
    "nip": "19950123456",
    "role": "USER_LAB",
    "must_change_pin": false,
    "total_usage_count": 124,
    "last_activity": "2026-08-04T15:30:00+07:00",
    "created_at": "2025-05-10T09:00:00+07:00"
  }
}
```

**Catatan:** `total_usage_count` dan `last_activity` diambil dari agregasi tabel `stock_audit_logs` (`action_type = 'USAGE'`).

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Pengguna tidak ditemukan."
}
```

---

## 4. Edit Pengguna

**Method:** `PUT`
**Endpoint:** `/api/v1/admin/users/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID pengguna |

**Body (semua field opsional, partial update):**
```json
{
  "name": "Andi Pratama, S.Si.",
  "nip": "19950123456",
  "pin": "9999",
  "role": "USER_LAB"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `name` | string | Tidak | Nama lengkap baru |
| `nip` | string | Tidak | NIP/NIM baru (harus unik) |
| `email` | string | Tidak | Email baru untuk `ADMIN` |
| `pin` | string | Tidak | PIN baru 4 digit untuk `USER_LAB` (jika diisi → reset PIN) |
| `password` | string | Tidak | Password baru untuk `ADMIN` |
| `role` | string | Tidak | Role baru |

### Response Sukses (200 OK)

**Tanpa reset PIN:**
```json
{
  "status": "success",
  "message": "Data pengguna berhasil diperbarui.",
  "data": {
    "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
    "name": "Andi Pratama, S.Si.",
    "nip": "19950123456",
    "role": "USER_LAB",
    "must_change_pin": false
  }
}
```

**Dengan reset PIN (field `pin` diisi):**
```json
{
  "status": "success",
  "message": "PIN pengguna berhasil di-reset. Pengguna akan diwajibkan mengganti PIN saat login berikutnya.",
  "data": {
    "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
    "name": "Andi Pratama, S.Si.",
    "nip": "19950123456",
    "role": "USER_LAB",
    "must_change_pin": true
  }
}
```

### Logika Bisnis Backend

1. **Admin tidak bisa edit diri sendiri** melalui endpoint ini.
2. **Jika `pin` diisi:** Hash PIN baru, simpan, dan **set `must_change_pin = TRUE`**. Ini adalah mekanisme "reset PIN oleh admin" — pengguna akan dipaksa ganti PIN saat login berikutnya (non-repudiation ISO 17025).
3. **Jika `nip` atau `email` berubah:** Cek duplikasi dengan pengguna lain.

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "PIN harus 4 digit angka. Password minimal 8 karakter."
}
```

**403 Forbidden** — Mencoba edit diri sendiri.
```json
{
  "status": "error",
  "code": "CANNOT_EDIT_SELF",
  "message": "Anda tidak dapat mengedit akun Anda sendiri melalui endpoint ini."
}
```

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Pengguna tidak ditemukan."
}
```

**409 Conflict** — NIP/email duplikat.
```json
{
  "status": "error",
  "code": "DUPLICATE_NIP",
  "message": "NIP 19950123456 sudah digunakan oleh pengguna lain."
}
```

---

## 5. Hapus Pengguna

**Method:** `DELETE`
**Endpoint:** `/api/v1/admin/users/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID pengguna |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Pengguna Siti Rahmawati berhasil dihapus."
}
```

### Logika Bisnis Backend

1. **Tidak bisa hapus diri sendiri.**
2. **Soft constraint:** Jika pengguna memiliki record di `stock_audit_logs`, baris log tetap dipertahankan (`ON DELETE SET NULL` pada foreign key `user_id`). Penghapusan pengguna tidak menghapus jejak audit (immutable log ISO 17025).

### Handling Error

**403 Forbidden** — Mencoba hapus diri sendiri.
```json
{
  "status": "error",
  "code": "CANNOT_DELETE_SELF",
  "message": "Anda tidak dapat menghapus akun Anda sendiri."
}
```

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Pengguna tidak ditemukan."
}
```
