# Domain Portal Pengguna Lab (Catalog & Transaksi)

**Base Path:** `/api/v1`

Endpoint-endpoint ini adalah API yang sering diakses oleh petugas lab sehari-hari: pencarian, _scanning_ QR, dan pencatatan pemakaian.

---

## 1. Katalog Homepage (Daftar Bahan)

**Method:** `GET`
**Endpoint:** `/api/v1/materials`
**Authentication:** **REQUIRED** (Cookie JWT, Role `USER_LAB`)

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `search` | string | Tidak | — | Pencarian berdasarkan `name` atau `chemical_formula` (ILIKE) |
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `10` | Jumlah item per halaman (maks 50) |

**Contoh:**
```
GET /api/v1/materials?search=asam&page=1&limit=10
```

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 124,
    "total_pages": 13
  },
  "data": [
    {
      "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
      "name": "Asam Sulfat (H2SO4)",
      "chemical_formula": "H2SO4",
      "total_available_stock": 1234.5,
      "unit": "mL",
      "locations": [
        "Lab Kimia Organik 1 - Lemari Asam A (Rak 2)",
        "Gudang Utama Kimia - Lemari C (Rak 1)"
      ],
      "ghs_pictograms": [
        "corrosive.png",
        "skull_and_crossbones.png"
      ]
    },
    {
      "id": "f8e7d6c5-a888-3b12-b222-987654321def",
      "name": "Etanol 96%",
      "chemical_formula": "C2H5OH",
      "total_available_stock": 2500.0,
      "unit": "mL",
      "locations": [
        "Lab Kimia Organik 1 - Lemari Flammable (Rak 1)"
      ],
      "ghs_pictograms": [
        "flame.png",
        "exclamation_mark.png"
      ]
    }
  ]
}
```

### Logika Bisnis Backend

1. **Fast Querying (Denormalisasi):** Nilai `total_available_stock` diambil langsung dari kolom `materials.total_available_stock`. Backend **tidak** melakukan `SUM(current_quantity)` dari `inventory_items` setiap request.
2. **Grouping Lokasi:** Array `locations` dihasilkan dari `LEFT JOIN` ke `inventory_items` dan `storage_locations` (filter `status = 'ACTIVE'`), lalu string diformat menggunakan `STRING_AGG()` atau `ARRAY_AGG()`.
3. **GHS Pictograms Minimalis:** Response hanya mengirimkan array `pictogram_symbol` dari `ghs_classifications` melalui `material_ghs_classifications`. Frontend cukup menampilkan ikon/badge bahaya, bukan deskripsi OSHA lengkap.

### Handling Error

**401 Unauthorized**
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Sesi Anda telah berakhir. Silakan login kembali."
}
```

**403 Forbidden** — Akun `must_change_pin = TRUE`.
```json
{
  "status": "error",
  "code": "FORCE_CHANGE_PIN",
  "message": "Anda diwajibkan mengganti PIN sebelum mengakses katalog bahan."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat memuat katalog bahan."
}
```

---

## 2. Detail Hasil Scan QR

**Method:** `GET`
**Endpoint:** `/api/v1/inventory/scan/{qr_code}`
**Authentication:** **REQUIRED** (Cookie JWT, Role `USER_LAB`)

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `qr_code` | string | Kode unik QR pada stiker botol (contoh: `CHEM-9921`) |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": {
    "item_info": {
      "qr_code": "CHEM-9921",
      "batch_number": "BCH-2026-03",
      "current_quantity": 24.4,
      "initial_quantity": 1000.0,
      "unit": "mL",
      "status": "ACTIVE",
      "expiration_date": "2026-10-15",
      "is_expired": false,
      "is_near_expiry": false
    },
    "material_info": {
      "id": "a1b2c3d4-b999-4c21-b111-123456789abc",
      "name": "Asam Sulfat (H2SO4)",
      "chemical_formula": "H2SO4",
      "cas_number": "7664-93-9",
      "ghs_classifications": [
        {
          "code": "CORROSIVE_1",
          "category_name": "Corrosive to Metals",
          "pictogram_symbol": "corrosive.png",
          "signal_word": "DANGER"
        },
        {
          "code": "TOX_ACUTE_2",
          "category_name": "Acute Toxicity (Inhalation) Cat. 2",
          "pictogram_symbol": "skull_and_crossbones.png",
          "signal_word": "DANGER"
        }
      ]
    },
    "location_info": {
      "room_name": "Lab Kimia Organik 1",
      "cabinet_code": "Lemari Asam A",
      "shelf_number": "Rak 2"
    },
    "safety_alerts": {
      "osha_warnings": [
        {
          "triggered_by_ghs_code": "CORROSIVE_1",
          "incompatible_with_ghs_code": "FLAM_LIQ_2",
          "risk_level": "CRITICAL",
          "hazard_description": "Reaksi eksotermik hebat; risiko ledakan jika bereaksi dengan pelarut organik mudah terbakar."
        }
      ]
    }
  }
}
```

### Logika Bisnis Backend

1. **Validasi Kadaluarsa & Status:**
   - `is_expired = true` jika `expiration_date < hari ini` atau `status = 'EXPIRED'`.
   - `is_near_expiry = true` jika `expiration_date` dalam rentang H-30 dari hari ini dan `status = 'ACTIVE'`.
   - Jika `status = 'EMPTY'` atau `'DISPOSED'`, item dianggap tidak tersedia.
2. **OSHA Safety Alerts:** Backend mengecek `osha_incompatibility_rules` untuk setiap pasangan GHS classification material ini dengan GHS material lain yang berada di **lokasi yang sama** (`location_id` yang identical). Array `osha_warnings` menunjukkan konflik yang terdeteksi di rak/lemari tersebut.
3. **Conditional UI (Frontend):** Jika `is_expired = true`, frontend wajib menonaktifkan tombol Submit pemakaian dan menampilkan Banner Merah "Bahan Kadaluarsa".

### Handling Error

**401 Unauthorized**
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Sesi Anda telah berakhir. Silakan login kembali."
}
```

**403 Forbidden** — Akun `must_change_pin = TRUE`.
```json
{
  "status": "error",
  "code": "FORCE_CHANGE_PIN",
  "message": "Anda diwajibkan mengganti PIN sebelum melakukan transaksi."
}
```

**404 Not Found** — `qr_code` tidak ditemukan di tabel `inventory_items`.
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "QR Code botol tidak terdaftar di sistem."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat memuat detail bahan."
}
```

---

## 3. Catat Pemakaian Bahan

**Method:** `POST`
**Endpoint:** `/api/v1/inventory/{qr_code}/usage`
**Authentication:** **REQUIRED** (Cookie JWT, Role `USER_LAB`, `must_change_pin = FALSE`)

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `qr_code` | string | Kode unik QR pada stiker botol |

**Body:**
```json
{
  "quantity_used": 15.5,
  "activity_category": "PRAKTIKUM",
  "notes": "Praktikum Kimia Organik 1 Kelas A"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `quantity_used` | number | Ya | Jumlah bahan yang dipakai (> 0) |
| `activity_category` | string | Ya | Kategori kegiatan (enum) |
| `notes` | string | Tidak | Catatan tambahan opsional |

**Enum `activity_category` (sesuai `stock_audit_logs.activity_category`):**
- `PRAKTIKUM`
- `PERSIAPAN_REAGEN`
- `PENELITIAN`
- `PENGUJIAN_SAMPEL`
- `MAINTENANCE_ALAT`
- `LAINNYA`

### Response Sukses (201 Created)

```json
{
  "status": "success",
  "message": "Pemakaian bahan berhasil dicatat.",
  "data": {
    "audit_log_id": "92184",
    "material_name": "Asam Sulfat (H2SO4)",
    "qr_code": "CHEM-9921",
    "quantity_used": 15.5,
    "quantity_remaining": 234.5,
    "unit": "mL",
    "activity_category": "PRAKTIKUM",
    "timestamp": "2026-08-05T13:07:41+07:00"
  }
}
```

### Logika Bisnis Backend (Database Transaction)

Endpoint ini wajib menggunakan **Database Transaction** (`BEGIN ... COMMIT`):

1. **Lock row** pada `inventory_items` untuk mencegah race condition (gunakan `SELECT ... FOR UPDATE`).
2. **Validasi stok:** `current_quantity >= quantity_used`.
3. **Validasi kadaluarsa:** `expiration_date >= hari ini` dan `status = 'ACTIVE'`.
4. **Validasi status:** Bukan `EMPTY` atau `DISPOSED`.
5. **Kalkulasi:** `new_quantity = current_quantity - quantity_used`.
6. **Update** `inventory_items.current_quantity` (jika `new_quantity = 0`, set `status = 'EMPTY'`).
7. **Update** `materials.total_available_stock` (denormalisasi, kurangi `quantity_used`).
8. **Insert** ke `stock_audit_logs` dengan `action_type = 'USAGE'`, `quantity_changed = -quantity_used`, `quantity_before`, `quantity_after`, `material_name_snapshot`, `user_name_snapshot`.
9. **COMMIT** — semua operasi harus atomik.

### Handling Error

**400 Bad Request** — Validasi payload gagal.
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Kategori kegiatan tidak valid atau kuantitas kurang dari 0."
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

**403 Forbidden** — Akun `must_change_pin = TRUE`.
```json
{
  "status": "error",
  "code": "FORCE_CHANGE_PIN",
  "message": "Anda diwajibkan mengganti PIN sebelum melakukan transaksi."
}
```

**404 Not Found** — `qr_code` tidak ditemukan.
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "QR Code botol tidak terdaftar di sistem."
}
```

**422 Unprocessable Entity** — Stok tidak mencukupi.
```json
{
  "status": "error",
  "code": "INSUFFICIENT_STOCK",
  "message": "Stok tidak mencukupi. Sisa stok di botol ini hanya 10.0 mL."
}
```

**422 Unprocessable Entity** — Bahan kadaluarsa (ISO 17025 Block).
```json
{
  "status": "error",
  "code": "ITEM_EXPIRED",
  "message": "Pemakaian ditolak. Bahan ini sudah melewati masa kadaluarsa."
}
```

**422 Unprocessable Entity** — Status item `EMPTY` atau `DISPOSED`.
```json
{
  "status": "error",
  "code": "ITEM_UNAVAILABLE",
  "message": "Botol ini sudah tercatat kosong atau telah dibuang."
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan sistem saat memproses pemakaian."
}
```
