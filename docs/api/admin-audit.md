# Domain Admin — Audit Trail (ISO 17025)

**Base Path:** `/api/v1/admin/audit-logs`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

> **Prinsip Immutable (ISO 17025):** Data di tabel `stock_audit_logs` **tidak dapat diubah atau dihapus** melalui API. Endpoint hanya menyediakan akses baca (GET). Ini memastikan integritas jejak audit untuk kepentingan pelaporan dan akreditasi laboratorium.

---

## 1. Lihat Log Audit

**Method:** `GET`
**Endpoint:** `/api/v1/admin/audit-logs`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `page` | integer | Tidak | `1` | Nomor halaman |
| `limit` | integer | Tidak | `20` | Item per halaman (maks 100) |
| `user_name` | string | Tidak | — | Filter nama pengguna (`user_name_snapshot`, ILIKE) |
| `material_name` | string | Tidak | — | Filter nama bahan (`material_name_snapshot`, ILIKE) |
| `activity_category` | string | Tidak | — | Filter kategori: `PRAKTIKUM`, `PERSIAPAN_REAGEN`, `PENELITIAN`, `PENGUJIAN_SAMPEL`, `MAINTENANCE_ALAT`, `LAINNYA` |
| `action_type` | string | Tidak | — | Filter tipe aksi: `USAGE`, `RESTOCK`, `ADJUSTMENT`, `DISPOSAL` |
| `date_from` | string (date) | Tidak | — | Filter tanggal awal (`YYYY-MM-DD`) |
| `date_to` | string (date) | Tidak | — | Filter tanggal akhir (`YYYY-MM-DD`) |

**Contoh:**
```
GET /api/v1/admin/audit-logs?action_type=USAGE&activity_category=PRAKTIKUM&date_from=2026-07-01&date_to=2026-08-05&page=1&limit=20
```

### Response Sukses (200 OK)

```json
{
  "status": "success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 342,
    "total_pages": 18
  },
  "data": [
    {
      "id": 92184,
      "inventory_item_id": "inv-uuid-001",
      "qr_code": "CHEM-9921",
      "action_type": "USAGE",
      "activity_category": "PRAKTIKUM",
      "quantity_changed": -15.5,
      "quantity_before": 250.0,
      "quantity_after": 234.5,
      "unit": "mL",
      "material_name_snapshot": "Asam Sulfat (H2SO4)",
      "user_name_snapshot": "Andi Pratama",
      "notes": "Praktikum Kimia Organik 1 Kelas A",
      "timestamp": "2026-08-05T10:30:00+07:00"
    },
    {
      "id": 92183,
      "inventory_item_id": "inv-uuid-005",
      "qr_code": "CHEM-3341",
      "action_type": "RESTOCK",
      "activity_category": "PERSIAPAN_REAGEN",
      "quantity_changed": 500.0,
      "quantity_before": 0,
      "quantity_after": 500.0,
      "unit": "mL",
      "material_name_snapshot": "Etanol 96%",
      "user_name_snapshot": "Dr. Budi Santoso",
      "notes": null,
      "timestamp": "2026-08-04T14:00:00+07:00"
    }
  ]
}
```

**Catatan:** Tabel `stock_audit_logs` menggunakan **denormalisasi snapshot** (`material_name_snapshot`, `user_name_snapshot`) untuk mempertahankan data historis meskipun material atau user asli sudah dihapus/diubah. Response dikembalikan dengan join ringan untuk mendapatkan `qr_code`.

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

**400 Bad Request** — Filter kategori atau action_type tidak valid.
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Nilai filter activity_category tidak valid. Gunakan: PRAKTIKUM, PERSIAPAN_REAGEN, PENELITIAN, PENGUJIAN_SAMPEL, MAINTENANCE_ALAT, LAINNYA."
}
```

---

## 2. Ekspor Log Audit (CSV / Excel)

**Method:** `GET`
**Endpoint:** `/api/v1/admin/audit-logs/export`

### Request

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `date_from` | string (date) | Tidak | — | Filter tanggal awal (`YYYY-MM-DD`) |
| `date_to` | string (date) | Tidak | — | Filter tanggal akhir (`YYYY-MM-DD`) |
| `format` | string | Tidak | `csv` | Format file: `csv` atau `xlsx` (Excel) |
| `activity_category` | string | Tidak | — | Filter kategori kegiatan |
| `action_type` | string | Tidak | — | Filter tipe aksi |
| `user_name` | string | Tidak | — | Filter nama pengguna |

### Response Sukses (200 OK)

**Content-Type:** `text/csv` (jika format `csv`) atau `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (jika format `xlsx`)

**Headers Response:**
```
Content-Disposition: attachment; filename="audit-logs-2026-08-05.csv"
```

Response berupa file yang langsung di-download oleh browser.

**Format CSV (contoh isi):**
```csv
ID,QR Code,Nama Bahan,Tipe Aksi,Kategori,Perubahan,Jumlah Sebelum,Jumlah Setelah,Satuan,Pengguna,Catatan,Timestamp
92184,CHEM-9921,Asam Sulfat (H2SO4),USAGE,PRAKTIKUM,-15.5,250.0,234.5,mL,Andi Pratama,Praktikum Kimia Organik 1 Kelas A,2026-08-05T10:30:00+07:00
92183,CHEM-3341,Etanol 96%,RESTOCK,PERSIAPAN_REAGEN,500.0,0,500.0,mL,Dr. Budi Santoso,,2026-08-04T14:00:00+07:00
```

### Logika Bisnis Backend

1. **Filter:** Parameter filter yang sama dengan endpoint list audit log diterapkan untuk membatasi data yang diekspor.
2. **File Name:** Format nama file: `audit-logs-{tanggal_hari_ini}.{format}`.
3. **Encoding CSV:** UTF-8 with BOM untuk kompatibilitas Microsoft Excel.
4. **Excel:** Jika format `xlsx`, gunakan library seperti `exceljs` atau `xlsx` untuk menghasilkan file Excel dengan kolom yang sudah terformat rapi (header bold, freeze pane, auto-width).

### Handling Error

**400 Bad Request** — Format tidak didukung.
```json
{
  "status": "error",
  "code": "INVALID_FORMAT",
  "message": "Format ekspor tidak didukung. Gunakan: csv atau xlsx."
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
