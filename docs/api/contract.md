Berdasarkan skema database, requirements, dan user-flow yang kamu berikan, struktur sistem ini sudah sangat solid, terutama dengan integrasi standar ISO 17025 (Audit & Kadaluarsa) dan OSHA (Safety Matrix).

Untuk merealisasikan *flow* tersebut menjadi aplikasi yang fungsional, kita bisa membagi Kontrak API (API Contract) ke dalam beberapa *domain* utama. Berikut adalah rancangan *endpoint* RESTful API yang dibutuhkan:

### 1. Domain Otentikasi (Authentication & Security)

Domain ini menangani login dan mekanisme *Force Change PIN* sesuai standar keamanan.

| Method | Endpoint | Deskripsi & Payload |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login/user` | **Login Pengguna Lab:** Menerima `nip` dan `pin`. Mengembalikan *HttpOnly Cookie* (valid 30 hari) dan status `must_change_pin`.|
| `POST` | `/api/v1/auth/login/admin` | **Login Admin:** Menerima `email` dan `password`. Mengembalikan token JWT untuk admin.|
| `PUT` | `/api/v1/auth/change-pin` | **Force Change PIN:** Menerima `new_pin` dan `confirm_pin`. Mengubah `must_change_pin` menjadi `FALSE` dan mengizinkan akses ke katalog.|
| `POST` | `/api/v1/auth/logout` | Menghapus sesi/cookie pengguna. |

### 2. Domain Portal Pengguna Lab (Catalog & Transaksi)

Ini adalah API yang akan sering diakses oleh petugas lab sehari-hari, dari pencarian hingga *scanning* QR.

| Method | Endpoint | Deskripsi & Payload |
| --- | --- | --- |
| `GET` | `/api/v1/materials` | **Katalog Homepage:** Menampilkan daftar bahan kimia, lokasi rak, dan *total available stock*. Mendukung *query params* untuk pencarian (`?search=nama_bahan`).|
| `GET` | `/api/v1/inventory/scan/{qr_code}` | **Detail Hasil Scan:** Mengambil data spesifik botol. Backend memvalidasi `expiration_date` dan `status`. Memberikan *response* berupa detail bahan, sisa stok, banner OSHA, dan status *Expired* (jika H-30 atau lewat).|
| `POST` | `/api/v1/inventory/{qr_code}/usage` | **Catat Pemakaian:** Menerima `quantity_used` dan `activity_category` (Praktikum, Penelitian, dll). Backend akan memotong `current_quantity` dan otomatis mencatat ke tabel `stock_audit_logs`.|

### 3. Domain Admin (Manajemen Master, Stok & Alert)

Endpoint khusus untuk admin (membutuhkan otorisasi *Role Admin*).

| Method | Endpoint | Deskripsi & Payload |
| --- | --- | --- |
| `GET` | `/api/v1/admin/dashboard/alerts` | **Peringatan Dashboard:** Mengembalikan dua *list*: item dengan stok di bawah `min_stock_alert` dan item yang masuk periode H-30 kadaluarsa.|
| `POST` | `/api/v1/admin/inventory` | **Tambah Item Fisik (Botol Baru):** Menerima ID material, lokasi, kuantitas awal, dan masa kadaluarsa. **Kritis:** Backend harus memicu *Safety Engine* di sini untuk mengecek `osha_incompatibility_rules` di lokasi/rak tersebut. Jika lolos, *generate* QR Code baru.|
| `GET` | `/api/v1/admin/inventory/qr/{item_id}` | Mengunduh/mencetak stiker QR Code untuk ditempel di botol.|
| `POST` | `/api/v1/admin/users` | **Daftar User Lab:** Menambahkan `nip`, `nama`, dan meng-generate PIN awal (default) untuk pengguna baru.|

### 4. Domain Audit Trail (ISO 17025)

Untuk memenuhi standar pelaporan yang *immutable* (tidak bisa diubah/dihapus).

| Method | Endpoint | Deskripsi & Payload |
| --- | --- | --- |
| `GET` | `/api/v1/admin/audit-logs` | Mengambil seluruh log pemakaian dengan *pagination* dan *filter* (berdasarkan tanggal, pengguna, atau kategori kegiatan).|
| `GET` | `/api/v1/admin/audit-logs/export` | Menghasilkan file berformat CSV/Excel dari riwayat transaksi (mendukung rentang tanggal tertentu).|

---

> **Catatan Implementasi Transaksi (Endpoint `/usage`):**
> Saat pengguna lab submit pemakaian bahan, pastikan backend menggunakan **Database Transaction (BEGIN ... COMMIT)**. Pemotongan `current_quantity` di tabel `inventory_items` dan penambahan *record* di `stock_audit_logs` (lengkap dengan *snapshot* nama dan *user*) harus terjadi secara atomik untuk mencegah data *corrupt* jika terjadi kegagalan jaringan.
> 
>