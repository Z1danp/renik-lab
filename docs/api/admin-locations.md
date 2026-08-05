# Domain Admin — Referensi: Lokasi & GHS Classification

**Base Path:** `/api/v1/admin`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

> Endpoint-endpoint ini menyediakan data referensi untuk dropdown form di UI admin (tambah/ edit inventory, tambah/ edit material).

---

## 1. List Semua GHS Classifications

**Method:** `GET`
**Endpoint:** `/api/v1/admin/ghs-classifications`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

Tidak ada query parameter.

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "code": "FLAM_LIQ_2",
      "category_name": "Flammable Liquids Cat. 2",
      "pictogram_symbol": "flame.png",
      "signal_word": "DANGER"
    },
    {
      "id": 2,
      "code": "FLAM_LIQ_3",
      "category_name": "Flammable Liquids Cat. 3",
      "pictogram_symbol": "flame.png",
      "signal_word": "WARNING"
    },
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
  ]
}
```

**Catatan:** Endpoint ini digunakan sebagai referensi dropdown:
- Form tambah/edit `materials` — memilih GHS classification untuk bahan.
- Form tambah inventory — menampilkan label GHS pada material yang dipilih.

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

## 2. List Semua Lokasi Penyimpanan

**Method:** `GET`
**Endpoint:** `/api/v1/admin/storage-locations`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `search` | string | Tidak | — | Pencarian `room_name`, `cabinet_code`, atau `shelf_number` |
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `20` | Item per halaman (maks 100) |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 12,
    "total_pages": 1
  },
  "data": [
    {
      "id": "loc-uuid-100",
      "room_name": "Lab Kimia Organik 1",
      "cabinet_code": "Lemari Asam A",
      "shelf_number": "Rak 2",
      "description": "Lemari khusus asam dan bahan korosif",
      "active_items_count": 5,
      "created_at": "2025-03-01T09:00:00+07:00"
    },
    {
      "id": "loc-uuid-101",
      "room_name": "Lab Kimia Organik 1",
      "cabinet_code": "Lemari Flammable",
      "shelf_number": "Rak 1",
      "description": null,
      "active_items_count": 3,
      "created_at": "2025-03-01T09:00:00+07:00"
    }
  ]
}
```

**Catatan:** `active_items_count` adalah jumlah `inventory_items` dengan `status = 'ACTIVE'` di lokasi tersebut. Berguna untuk menampilkan apakah lokasi masih bisa dihapus.

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

## 3. Tambah Lokasi Penyimpanan

**Method:** `POST`
**Endpoint:** `/api/v1/admin/storage-locations`

### Request

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body:**
```json
{
  "room_name": "Gudang Utama Kimia",
  "cabinet_code": "Lemari C",
  "shelf_number": "Rak 1",
  "description": "Penyimpanan bahan baku curah"
}
```

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `room_name` | string | Ya | Nama ruangan laboratorium |
| `cabinet_code` | string | Ya | Kode lemari / kabinet |
| `shelf_number` | string | Ya | Nomor rak |
| `description` | string | Tidak | Deskripsi tambahan lokasi |

### Response Sukses (201 Created)

```json
{
  "status": "success",
  "message": "Lokasi penyimpanan baru berhasil ditambahkan.",
  "data": {
    "id": "loc-uuid-103",
    "room_name": "Gudang Utama Kimia",
    "cabinet_code": "Lemari C",
    "shelf_number": "Rak 1",
    "description": "Penyimpanan bahan baku curah",
    "active_items_count": 0,
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
  "message": "Nama ruangan, kode lemari, dan nomor rak wajib diisi."
}
```

**409 Conflict** — Kombinasi ruangan, lemari, dan rak sudah ada (duplikat logis).
```json
{
  "status": "error",
  "code": "DUPLICATE_LOCATION",
  "message": "Lokasi Lab Kimia Organik 1 - Lemari Asam A (Rak 2) sudah terdaftar di sistem."
}
```

---

## 4. Edit Lokasi Penyimpanan

**Method:** `PUT`
**Endpoint:** `/api/v1/admin/storage-locations/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID lokasi |

**Body (semua field opsional, partial update):**
```json
{
  "room_name": "Gudang Utama Kimia",
  "cabinet_code": "Lemari C",
  "shelf_number": "Rak 2",
  "description": "Penyimpanan bahan baku curah - relokasi"
}
```

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Lokasi penyimpanan berhasil diperbarui.",
  "data": {
    "id": "loc-uuid-103",
    "room_name": "Gudang Utama Kimia",
    "cabinet_code": "Lemari C",
    "shelf_number": "Rak 2",
    "description": "Penyimpanan bahan baku curah - relokasi",
    "active_items_count": 0
  }
}
```

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Lokasi penyimpanan tidak ditemukan."
}
```

**409 Conflict** — Kombinasi baru duplikat dengan lokasi lain.
```json
{
  "status": "error",
  "code": "DUPLICATE_LOCATION",
  "message": "Lokasi Gudang Utama Kimia - Lemari C (Rak 2) sudah terdaftar di sistem."
}
```

---

## 5. Hapus Lokasi Penyimpanan

**Method:** `DELETE`
**Endpoint:** `/api/v1/admin/storage-locations/{id}`

### Request

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | string (UUID) | ID lokasi |

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "message": "Lokasi penyimpanan Lemari C (Rak 2) berhasil dihapus."
}
```

**Catatan:** Hanya bisa dihapus jika tidak ada `inventory_items` yang masih mereferensi lokasi ini.

### Handling Error

**404 Not Found**
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Lokasi penyimpanan tidak ditemukan."
}
```

**422 Unprocessable Entity** — Masih ada item inventori di lokasi.
```json
{
  "status": "error",
  "code": "HAS_ACTIVE_ITEMS",
  "message": "Lokasi ini masih memiliki 5 item inventori aktif. Pindahkan atau dispose semua item terlebih dahulu sebelum menghapus lokasi."
}
```
