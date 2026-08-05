# Domain Otentikasi (Authentication & Security)

**Base Path:** `/api/v1/auth`

---

## 1. Login Pengguna Lab

**Method:** `POST`
**Endpoint:** `/api/v1/auth/login/user`
**Authentication:** Tidak diperlukan

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nip": "19950123456",
  "pin": "1234"
}
```

| Field | Type | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `nip` | string | Ya | NIP/NIM pengguna lab |
| `pin` | string | Ya | PIN 4 digit |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
      "name": "Andi Pratama",
      "nip": "19950123456",
      "role": "USER_LAB"
    },
    "must_change_pin": false
  }
}
```

**Catatan:** Backend mengeset **HttpOnly Cookie** berisi JWT token yang berlaku selama 30 hari (`Max-Age=2592000`, `Secure`, `SameSite=Strict`). Cookie ini digunakan untuk otentikasi seluruh endpoint selanjutnya.

### Handling Error

**400 Bad Request** — Validasi payload gagal (nip kosong, pin bukan 4 digit).
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "NIP dan PIN wajib diisi. PIN harus 4 digit."
}
```

**401 Unauthorized** — NIP tidak ditemukan atau PIN salah.
```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "NIP atau PIN yang Anda masukkan salah."
}
```

**423 Locked** — Akun dinonaktifkan oleh admin.
```json
{
  "status": "error",
  "code": "ACCOUNT_LOCKED",
  "message": "Akun Anda telah dinonaktifkan. Hubungi admin laboratorium."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat memproses login."
}
```

---

## 2. Login Admin

**Method:** `POST`
**Endpoint:** `/api/v1/auth/login/admin`
**Authentication:** Tidak diperlukan

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@lab.ac.id",
  "password": "securepassword123"
}
```

| Field | Type | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `email` | string | Ya | Email admin terdaftar |
| `password` | string | Ya | Password admin |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Login admin berhasil.",
  "data": {
    "user": {
      "id": "a1b2c3d4-e555-4f66-b888-987654321def",
      "name": "Dr. Budi Santoso",
      "email": "admin@lab.ac.id",
      "role": "ADMIN"
    }
  }
}
```

**Catatan:** Backend mengeset **HttpOnly Cookie** berisi JWT token yang berlaku selama 12 jam (`Max-Age=43200`). Admin memiliki akses ke seluruh endpoint prefix `/api/v1/admin/*`.

### Handling Error

**400 Bad Request** — Validasi payload gagal.
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Email dan password wajib diisi."
}
```

**401 Unauthorized** — Email tidak ditemukan atau password salah.
```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "Email atau password yang Anda masukkan salah."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat memproses login."
}
```

---

## 3. Cek Sesi Aktif

**Method:** `GET`
**Endpoint:** `/api/v1/auth/me`
**Authentication:** **REQUIRED** (Cookie JWT)

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

Tidak ada body atau query parameter.

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "f8e7d6c5-a888-4b12-b999-123456789abc",
    "name": "Andi Pratama",
    "nip": "19950123456",
    "role": "USER_LAB",
    "must_change_pin": false
  }
}
```

**Catatan:** Jika `role = ADMIN`, field `nip` diganti dengan `email`. Endpoint ini digunakan frontend untuk mengecek apakah pengguna sudah login dan menentukan redirect yang tepat (ke halaman ganti PIN, homepage user, atau dashboard admin).

### Handling Error

**401 Unauthorized** — Cookie tidak ada, kadaluarsa, atau token tidak valid.
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Sesi Anda telah berakhir. Silakan login kembali."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem."
}
```

---

## 4. Ganti PIN (Force Change PIN)

**Method:** `PUT`
**Endpoint:** `/api/v1/auth/change-pin`
**Authentication:** **REQUIRED** (Cookie JWT, Role `USER_LAB`)

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body:**
```json
{
  "old_pin": "1234",
  "new_pin": "5678",
  "confirm_pin": "5678"
}
```

| Field | Type | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `old_pin` | string | Ya | PIN saat ini |
| `new_pin` | string | Ya | PIN baru, 4 digit, tidak boleh sama dengan `old_pin` |
| `confirm_pin` | string | Ya | Konfirmasi PIN baru, harus sama dengan `new_pin` |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "PIN berhasil diubah. Anda sekarang dapat mengakses katalog bahan.",
  "data": {
    "must_change_pin": false
  }
}
```

**Catatan:** Backend akan:
1. Verifikasi `old_pin` cocok dengan hash PIN di database.
2. Hash `new_pin` dan simpan ke kolom `users.pin`.
3. Ubah `users.must_change_pin` menjadi `FALSE`.
4. Setelah berhasil, frontend boleh redirect ke homepage `/materials`.

### Handling Error

**400 Bad Request** — Validasi payload gagal.
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "PIN harus 4 digit angka. PIN baru tidak boleh sama dengan PIN lama. Konfirmasi PIN tidak cocok."
}
```

**401 Unauthorized** — Sesi habis atau bukan `USER_LAB`.
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Sesi Anda telah berakhir. Silakan login kembali."
}
```

**403 Forbidden** — Admin tidak bisa mengakses endpoint ini.
```json
{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "Endpoint ini hanya untuk pengguna lab."
}
```

**422 Unprocessable Entity** — `old_pin` salah.
```json
{
  "status": "error",
  "code": "INVALID_PIN",
  "message": "PIN lama yang Anda masukkan salah."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat mengganti PIN."
}
```

---

## 5. Logout

**Method:** `POST`
**Endpoint:** `/api/v1/auth/logout`
**Authentication:** **REQUIRED** (Cookie JWT)

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

Tidak ada body.

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Logout berhasil. Sesi Anda telah dihapus."
}
```

**Catatan:** Backend akan:
1. Menghapus cookie `token` dari client (set `Max-Age=0`).
2. (Opsional) Menambahkan token ke blacklist jika menggunakan mekanisme server-side invalidation.

### Handling Error

**401 Unauthorized** — Cookie tidak ada atau sudah kadaluarsa. Tetap mengembalikan 200 (idempoten).
```json
{
  "status": "success",
  "message": "Logout berhasil. Sesi Anda telah dihapus."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat logout."
}
```
