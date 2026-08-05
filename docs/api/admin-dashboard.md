# Domain Admin — Dashboard & Peringatan (ISO 17025)

**Base Path:** `/api/v1/admin`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

---

## 1. Dashboard Alerts — Stok Tipis & Kadaluarsa

**Method:** `GET`
**Endpoint:** `/api/v1/admin/dashboard/alerts`
**Authentication:** **REQUIRED** (Cookie JWT, Role `ADMIN`)

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
    "summary": {
      "total_materials": 45,
      "total_active_items": 156,
      "total_users_lab": 43,
      "low_stock_count": 7,
      "near_expiry_count": 5,
      "expired_count": 2
    },
    "low_stock": [
      {
        "material_id": "a1b2c3d4-b999-4c21-b111-123456789abc",
        "material_name": "Natrium Hidroksida (NaOH)",
        "total_available_stock": 45.0,
        "min_stock_alert": 100.0,
        "unit": "g",
        "shortfall": 55.0
      }
    ],
    "near_expiry": [
      {
        "item_id": "inv-uuid-010",
        "qr_code": "CHEM-4456",
        "material_name": "Indikator Fenolftalein",
        "current_quantity": 200.0,
        "unit": "mL",
        "expiration_date": "2026-09-01",
        "days_until_expiry": 27,
        "location": "Lab Kimia Organik 1 - Lemari Reagen (Rak 3)"
      }
    ],
    "expired": [
      {
        "item_id": "inv-uuid-022",
        "qr_code": "CHEM-7812",
        "material_name": "Larutan Buffer pH 4",
        "current_quantity": 350.0,
        "unit": "mL",
        "expiration_date": "2026-06-20",
        "days_since_expiry": 46,
        "location": "Lab Kimia Organik 1 - Lemari Reagen (Rak 1)",
        "status": "EXPIRED"
      }
    ]
  }
}
```

### Logika Bisnis Backend

1. **Summary:** Backend melakukan query agregasi untuk menghitung total rows dari `materials`, `inventory_items` (filter status `ACTIVE`), dan `users` (filter role `USER_LAB`).
2. **Low Stock (`low_stock`):** Query `materials` dengan kondisi `total_available_stock <= min_stock_alert` dan `min_stock_alert > 0`. Ini memudahkan admin merencanakan pengadaan ulang (restock).
3. **Near Expiry (`near_expiry`):** Query `inventory_items` dengan kondisi `status = 'ACTIVE'` dan `expiration_date BETWEEN hari_ini AND hari_ini + 30 hari`. Standar ISO 17025: H-30 peringatan dini. Item yang masuk kategori ini **masih bisa digunakan**, tapi admin perlu perhatian khusus.
4. **Expired (`expired`):** Query `inventory_items` dengan kondisi `expiration_date < hari_ini` atau `status = 'EXPIRED'`. Item ini **tidak boleh digunakan** dalam aktivitas lab (akan diblokir oleh endpoint `/usage`).

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
