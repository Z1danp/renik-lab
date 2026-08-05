# Domain Admin — Manajemen Inventori (Inventory Items CRUD + QR)

**Base Path:** `/api/v1/admin/inventory`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

> Semua endpoint dalam domain ini mensyaratkan role `ADMIN`. Middleware pengecekan role wajib diterapkan.

---

## 1. List Semua Item Inventori

**Method:** `GET`
**Endpoint:** `/api/v1/admin/inventory`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `search` | string | Tidak | — | Pencarian `qr_code`, `batch_number`, atau `material_name` |
| `material_id` | string (UUID) | Tidak | — | Filter berdasarkan material |
| `location_id` | string (UUID) | Tidak | — | Filter berdasarkan lokasi |
| `status` | string | Tidak | — | Filter: `ACTIVE`, `EXPIRED`, `EMPTY`, `DISPOSED` |
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `20` | Item per halaman (maks 100) |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 156,
    "total_pages": 8
  },
  "data": [
    {
      "id": "inv-uuid-001",
      "qr_code": "CHEM-9921",
      "batch_number": "BCH-2026-03",
      "material_name": "Asam Sulfat (H2SO4)",
      "material_id": "a1b2c3d4-b999-4c21-b111-123456789abc",
      "location": "Lab Kimia Organik 1 - Lemari Asam A (Rak 2)",
      "location_id": "loc-uuid-100",
      "current_quantity": 234.5,
      "initial_quantity": 1000.0,
      "unit": "mL",
      "expiration_date": "2026-10-15",
      "status": "ACTIVE",
      "created_at": "2025-11-20T09:00:00+07:00"
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

## 2. Tambah Item Inventori Baru (Botol)

**Method:** `POST`
**Endpoint:** `/api/v1/admin/inventory`

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body:**
```json
{
  "material_id": "a1b2c3d4-b999-4c21-b111-123456789abc",
  "location_id": "loc-uuid-100",
  "batch_number": "BCH-2026-04",
  "initial_quantity": 500.0,
  "unit": "mL",
  "expiration_date": "2027-06-15"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `material_id` | string (UUID) | Ya | ID material (bahan) |
| `location_id` | string (UUID) | Ya | ID lokasi penyimpanan |
| `batch_number` | string | Tidak | Nomor batch/lot |
| `initial_quantity` | number | Ya | Kuantitas awal (> 0) |
| `unit` | string | Tidak | Satuan (default mengikuti `materials.unit`) |
| `expiration_date` | string (date) | Ya | Tanggal kadaluarsa (`YYYY-MM-DD`) |

### Response Sukses (201 Created)

```json
{
  "status": "success",
  "message": "Botol baru berhasil didaftarkan dan QR Code telah dibuat.",
  "data": {
    "id": "inv-uuid-002",
    "qr_code": "7f3a9b1c-d4e2-4f8a-a6c5-8d2e1f9b4a3c",
    "batch_number": "BCH-2026-04",
    "material_name": "Asam Sulfat (H2SO4)",
    "location": "Lab Kimia Organik 1 - Lemari Asam A (Rak 2)",
    "initial_quantity": 500.0,
    "current_quantity": 500.0,
    "unit": "mL",
    "expiration_date": "2027-06-15",
    "status": "ACTIVE",
    "qr_code_url": "/api/v1/admin/inventory/qr/inv-uuid-002",
    "created_at": "2026-08-05T13:07:41+07:00"
  }
}
```

### Logika Bisnis Backend (Safety Engine + Auto QR)

Endpoint ini wajib menggunakan **Database Transaction** (`BEGIN ... COMMIT`):

1. **Validasi Input:** `material_id` dan `location_id` valid, `initial_quantity > 0`, `expiration_date > hari ini`.
2. **Safety Engine (OSHA Check):** Ambil semua GHS classification dari material yang akan disimpan. Ambil semua GHS classification dari material lain yang sudah ada di `location_id` yang sama (status `ACTIVE`). Cocokkan dengan `osha_incompatibility_rules` menggunakan query kanonikal (`LEAST`/`GREATEST`). Jika ditemukan konflik → **reject** dengan 409.
3. **Auto-Generate QR Code:** Buat `qr_code = gen_random_uuid()` (atau format kustom).
4. **Insert** ke `inventory_items` (`status = 'ACTIVE'`, `current_quantity = initial_quantity`).
5. **Update** `materials.total_available_stock` (tambah `initial_quantity`).
6. **Insert** audit log: `action_type = 'RESTOCK'`, `quantity_changed = +initial_quantity`, `quantity_before = 0`, `quantity_after = initial_quantity`.
7. **COMMIT.**

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Material, lokasi, kuantitas awal, dan tanggal kadaluarsa wajib diisi. Kuantitas harus lebih dari 0."
}
```

**404 Not Found** — `material_id` atau `location_id` tidak valid.
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Material atau lokasi penyimpanan tidak ditemukan."
}
```

**409 Conflict** — **Safety Engine Block.** Bahan tidak boleh disimpan di lokasi tersebut karena inkompatibel dengan bahan lain yang sudah ada.
```json
{
  "status": "error",
  "code": "OSHA_INCOMPATIBILITY_CONFLICT",
  "message": "Penyimpanan ditolak. Bahan ini tidak boleh disimpan di lokasi yang sama dengan Etanol 96% (Lemari Asam A, Rak 2). Risiko: CRITICAL — Reaksi eksotermik hebat; risiko ledakan jika bereaksi dengan pelarut organik mudah terbakar.",
  "data": {
    "conflict_with_material_name": "Etanol 96%",
    "conflict_with_ghs_code": "FLAM_LIQ_2",
    "risk_level": "CRITICAL",
    "hazard_description": "Reaksi eksotermik hebat; risiko ledakan jika bereaksi dengan pelarut organik mudah terbakar."
  }
}
```

**422 Unprocessable Entity**
```json
{
  "status": "error",
  "code": "INVALID_EXPIRATION",
  "message": "Tanggal kadaluarsa tidak boleh kurang dari hari ini."
}
```

---

## 3. Detail Item Inventori

**Method:** `GET`
**Endpoint:** `/api/v1/admin/inventory/{item_id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `item_id` | string (UUID) | ID inventory item |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "inv-uuid-001",
    "qr_code": "CHEM-9921",
    "batch_number": "BCH-2026-03",
    "initial_quantity": 1000.0,
    "current_quantity": 234.5,
    "unit": "mL",
    "expiration_date": "2026-10-15",
    "status": "ACTIVE",
    "material": {
      "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
      "name": "Asam Sulfat (H2SO4)",
      "chemical_formula": "H2SO4",
      "cas_number": "7664-93-9",
      "ghs_classifications": [
        { "code": "CORROSIVE_1", "pictogram_symbol": "corrosive.png" }
      ]
    },
    "location": {
      "id": "loc-uuid-100",
      "room_name": "Lab Kimia Organik 1",
      "cabinet_code": "Lemari Asam A",
      "shelf_number": "Rak 2"
    },
    "osha_conflicts_at_location": [
      {
        "material_name": "Etanol 96%",
        "ghs_code": "FLAM_LIQ_2",
        "risk_level": "CRITICAL",
        "hazard_description": "Reaksi eksotermik hebat; risiko ledakan jika bereaksi dengan pelarut organik mudah terbakar."
      }
    ],
    "audit_logs": [
      {
        "id": 92183,
        "action_type": "USAGE",
        "activity_category": "PRAKTIKUM",
        "quantity_changed": -15.5,
        "quantity_after": 234.5,
        "user_name_snapshot": "Andi Pratama",
        "timestamp": "2026-08-05T10:00:00+07:00"
      }
    ],
    "created_at": "2025-11-20T09:00:00+07:00"
  }
}
```

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Item inventori tidak ditemukan."
}
```

---

## 4. Edit Item Inventori (Restock / Pindah / Dispose)

**Method:** `PUT`
**Endpoint:** `/api/v1/admin/inventory/{item_id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `item_id` | string (UUID) | ID inventory item |

**Body (semua field opsional, partial update):**
```json
{
  "location_id": "loc-uuid-200",
  "batch_number": "BCH-2026-03-REV",
  "current_quantity": 500.0,
  "expiration_date": "2027-06-15",
  "status": "ACTIVE"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `location_id` | string (UUID) | Tidak | ID lokasi baru (trigger Safety Engine jika berubah) |
| `batch_number` | string | Tidak | Nomor batch koreksi |
| `current_quantity` | number | Tidak | Kuantitas baru (≥ 0). Jika berubah → audit log |
| `expiration_date` | string (date) | Tidak | Tanggal kadaluarsa baru |
| `status` | string | Tidak | Status baru: `ACTIVE`, `EXPIRED`, `EMPTY`, `DISPOSED` |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Item inventori berhasil diperbarui.",
  "data": {
    "id": "inv-uuid-001",
    "qr_code": "CHEM-9921",
    "current_quantity": 500.0,
    "status": "ACTIVE",
    "location": "Gudang Utama Kimia - Lemari C (Rak 1)",
    "audit_log_id": 92190,
    "updated_at": "2026-08-05T14:00:00+07:00"
  }
}
```

### Logika Bisnis Backend (Database Transaction)

Gunakan **Database Transaction**. Aksi yang memicu audit log:

| Aksi | Trigger | `action_type` | `quantity_changed` |
|------|---------|---------------|-------------------|
| **Restock** | `current_quantity` bertambah | `RESTOCK` | `+selisih` |
| **Adjustment** | `current_quantity` berkurang (admin koreksi) | `ADJUSTMENT` | `-selisih` |
| **Disposal** | `status` berubah ke `DISPOSED` | `DISPOSAL` | `-current_quantity` |
| **Pindah Lokasi** | `location_id` berubah | Tidak ada log kuantitas, cukup update field |

Jika `location_id` berubah, **trigger Safety Engine** ulang untuk lokasi baru (cek OSHA incompatibility).

### Handling Error

**400 Bad Request**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Kuantitas tidak boleh negatif. Tanggal kadaluarsa tidak valid."
}
```

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Item inventori tidak ditemukan."
}
```

**409 Conflict** — Safety Engine Block di lokasi baru.
```json
{
  "status": "error",
  "code": "OSHA_INCOMPATIBILITY_CONFLICT",
  "message": "Pemindahan ditolak. Bahan ini tidak boleh disimpan di lokasi yang sama dengan Natrium Hidroksida (NaOH). Risiko: HIGH — Reaksi netralisasi eksotermik; risiko percikan dan panas berlebih.",
  "data": {
    "conflict_with_material_name": "Natrium Hidroksida (NaOH)",
    "risk_level": "HIGH"
  }
}
```

---

## 5. Hapus Item Inventori

**Method:** `DELETE`
**Endpoint:** `/api/v1/admin/inventory/{item_id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `item_id` | string (UUID) | ID inventory item |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Item inventori CHEM-9921 berhasil dihapus."
}
```

**Catatan:** Hanya bisa dihapus jika `status = 'EMPTY'` atau `'DISPOSED'`. Tidak bisa menghapus item dengan status `ACTIVE` atau `EXPIRED` yang masih memiliki stok.

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Item inventori tidak ditemukan."
}
```

**422 Unprocessable Entity** — Item masih aktif/stok belum 0.
```json
{
  "status": "error",
  "code": "CANNOT_DELETE_ACTIVE",
  "message": "Tidak dapat menghapus item dengan status ACTIVE. Lakukan disposal terlebih dahulu."
}
```

---

## 6. Cetak / Unduh Stiker QR Code

**Method:** `GET`
**Endpoint:** `/api/v1/admin/inventory/qr/{item_id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `item_id` | string (UUID) | ID inventory item |

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `format` | string | Tidak | `png` | Format output: `png`, `svg`, `pdf` |

### Response Sukses (200 OK)

**Content-Type:** `image/png` (atau sesuai format)

Response berupa file gambar QR Code yang siap dicetak sebagai stiker. Gambar QR Code berisi nilai `qr_code` dari item inventori yang bisa di-scan oleh kamera pengguna lab.

**Catatan Backend:**
- Generate QR Code dari string `qr_code` menggunakan library QR generator.
- Label tambahan (nama bahan, batch, kadaluarsa) opsional ditampilkan di bawah QR pada gambar.

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Item inventori tidak ditemukan."
}
```

**400 Bad Request** — Format tidak didukung.
```json
{
  "status": "error",
  "code": "INVALID_FORMAT",
  "message": "Format output tidak didukung. Gunakan: png, svg, atau pdf."
}
```
