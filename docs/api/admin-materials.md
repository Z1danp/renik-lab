# Domain Admin — Manajemen Master Data Bahan (Materials CRUD)

**Base Path:** `/api/v1/admin/materials`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

> Semua endpoint dalam domain ini mensyaratkan role `ADMIN`. Middleware pengecekan role wajib diterapkan.

---

## 1. List Semua Bahan

**Method:** `GET`
**Endpoint:** `/api/v1/admin/materials`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `search` | string | Tidak | — | Pencarian `name`, `chemical_formula`, atau `cas_number` |
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `20` | Item per halaman (maks 100) |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3
  },
  "data": [
    {
      "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
      "name": "Asam Sulfat (H2SO4)",
      "chemical_formula": "H2SO4",
      "cas_number": "7664-93-9",
      "unit": "mL",
      "min_stock_alert": 100.0,
      "total_available_stock": 1234.5,
      "ghs_classifications": [
        {
          "id": 5,
          "code": "CORROSIVE_1",
          "category_name": "Corrosive to Metals",
          "pictogram_symbol": "corrosive.png"
        }
      ],
      "active_item_count": 3,
      "created_at": "2025-11-15T09:00:00+07:00",
      "updated_at": "2026-07-20T14:30:00+07:00"
    }
  ]
}
```

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

## 2. Tambah Bahan Baru

**Method:** `POST`
**Endpoint:** `/api/v1/admin/materials`

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body:**
```json
{
  "name": "Asam Klorida (HCl)",
  "chemical_formula": "HCl",
  "cas_number": "7647-01-0",
  "unit": "mL",
  "min_stock_alert": 200.0,
  "ghs_classification_ids": [5, 8]
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `name` | string | Ya | Nama bahan kimia (unik) |
| `chemical_formula` | string | Tidak | Rumus kimia |
| `cas_number` | string | Tidak | Nomor CAS (harus unik jika diisi) |
| `unit` | string | Ya | Satuan (`mL`, `g`, `L`, `kg`) |
| `min_stock_alert` | number | Tidak | Batas stok minimum (default `0.00`) |
| `ghs_classification_ids` | number[] | Tidak | Array ID dari `ghs_classifications` |

### Response Sukses (201 Created)

```json
{
  "status": "success",
  "message": "Bahan baru berhasil ditambahkan.",
  "data": {
    "id": "d3e4f5a6-c777-4d88-b333-567890abcdef",
    "name": "Asam Klorida (HCl)",
    "chemical_formula": "HCl",
    "cas_number": "7647-01-0",
    "unit": "mL",
    "min_stock_alert": 200.0,
    "total_available_stock": 0.0,
    "ghs_classifications": [
      {
        "id": 5,
        "code": "CORROSIVE_1",
        "pictogram_symbol": "corrosive.png"
      }
    ],
    "created_at": "2026-08-05T13:07:41+07:00"
  }
}
```

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Nama bahan dan satuan wajib diisi. Satuan harus salah satu dari: mL, g, L, kg."
}
```

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

**409 Conflict** — `cas_number` duplikat.
```json
{
  "status": "error",
  "code": "DUPLICATE_CAS",
  "message": "Bahan dengan nomor CAS 7647-01-0 sudah terdaftar di sistem."
}
```

**422 Unprocessable Entity** — Salah satu `ghs_classification_ids` tidak valid.
```json
{
  "status": "error",
  "code": "INVALID_GHS_ID",
  "message": "Klasifikasi GHS dengan ID 99 tidak ditemukan di database."
}
```

---

## 3. Detail Bahan

**Method:** `GET`
**Endpoint:** `/api/v1/admin/materials/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID material |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
    "name": "Asam Sulfat (H2SO4)",
    "chemical_formula": "H2SO4",
    "cas_number": "7664-93-9",
    "unit": "mL",
    "min_stock_alert": 100.0,
    "total_available_stock": 1234.5,
    "ghs_classifications": [
      {
        "id": 5,
        "code": "CORROSIVE_1",
        "category_name": "Corrosive to Metals",
        "pictogram_symbol": "corrosive.png",
        "signal_word": "DANGER"
      },
      {
        "id": 8,
        "code": "TOX_ACUTE_2",
        "category_name": "Acute Toxicity (Inhalation) Cat. 2",
        "pictogram_symbol": "skull_and_crossbones.png",
        "signal_word": "DANGER"
      }
    ],
    "inventory_items": [
      {
        "id": "inv-uuid-001",
        "qr_code": "CHEM-9921",
        "batch_number": "BCH-2026-03",
        "current_quantity": 234.5,
        "initial_quantity": 1000.0,
        "status": "ACTIVE",
        "expiration_date": "2026-10-15",
        "location": "Lab Kimia Organik 1 - Lemari Asam A (Rak 2)"
      }
    ],
    "created_at": "2025-11-15T09:00:00+07:00",
    "updated_at": "2026-07-20T14:30:00+07:00"
  }
}
```

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Bahan tidak ditemukan."
}
```

---

## 4. Edit Bahan

**Method:** `PUT`
**Endpoint:** `/api/v1/admin/materials/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID material |

**Body (semua field opsional, partial update):**
```json
{
  "name": "Asam Sulfat Pekat (H2SO4)",
  "chemical_formula": "H2SO4",
  "cas_number": "7664-93-9",
  "unit": "mL",
  "min_stock_alert": 150.0,
  "ghs_classification_ids": [5, 8, 12]
}
```

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Data bahan berhasil diperbarui.",
  "data": {
    "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
    "name": "Asam Sulfat Pekat (H2SO4)",
    "chemical_formula": "H2SO4",
    "cas_number": "7664-93-9",
    "unit": "mL",
    "min_stock_alert": 150.0,
    "total_available_stock": 1234.5,
    "ghs_classifications": [
      { "id": 5, "code": "CORROSIVE_1" },
      { "id": 8, "code": "TOX_ACUTE_2" },
      { "id": 12, "code": "OXIDIZER_1" }
    ],
    "updated_at": "2026-08-05T14:00:00+07:00"
  }
}
```

**Catatan Backend:** Jika `ghs_classification_ids` dikirim, backend melakukan **sync** tabel `material_ghs_classifications`: hapus semua relasi lama, insert relasi baru. Gunakan database transaction.

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Satuan harus salah satu dari: mL, g, L, kg."
}
```

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Bahan tidak ditemukan."
}
```

**409 Conflict** — `cas_number` sudah digunakan oleh bahan lain.
```json
{
  "status": "error",
  "code": "DUPLICATE_CAS",
  "message": "Nomor CAS 7664-93-9 sudah digunakan oleh bahan lain."
}
```

---

## 5. Hapus Bahan

**Method:** `DELETE`
**Endpoint:** `/api/v1/admin/materials/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID material |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Bahan Asam Klorida (HCl) berhasil dihapus."
}
```

**Catatan:** Backend melakukan **soft constraint**: hanya bisa dihapus jika tidak ada `inventory_items` dengan `status = 'ACTIVE'` yang terkait.

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Bahan tidak ditemukan."
}
```

**422 Unprocessable Entity** — Masih ada botol aktif yang mereferensi bahan ini.
```json
{
  "status": "error",
  "code": "HAS_ACTIVE_ITEMS",
  "message": "Bahan ini masih memiliki 3 botol aktif. Pindahkan atau dispose semua botol terlebih dahulu sebelum menghapus bahan."
}
```
