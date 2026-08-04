# MVP 1 3 Wireframe & User Flow

```mermaid
flowchart TD
    subgraph UserSection ["Alur Pengguna Lab"]
        U1["Pengguna Lab"] --> U2["Login NIP/NIM + PIN"]
        U2 --> U3["Homepage: Katalog & Stok Bahan"]
        U2 -- "Scan QR Botol via HP/Web" --> U4["Halaman Detail & Form Pemakaian Bahan"]

        U4 --> U4A["Info Detail & Lokasi Rak"]
        U4 --> U4B["Warning Inkompatibilitas OSHA"]
        U4 --> U4C["Form Catat Pemakaian (mL / gram)"]
    end

    subgraph AdminSection ["Alur Admin Lab"]
        A1["Admin Lab"] --> A2["Login Admin"]
        A2 --> A3["Dashboard Admin"]

        A3 --> A3A["Manajemen Stok & Cetak QR Code"]
        A3 --> A3B["Audit Log Pemakaian Reagen"]
        A3 --> A3C["Manajemen User (Tambah NIP & PIN)"]
    end
```

## Wireframe 1: Portal Pengguna Lab (Auth & Ketersediaan Bahan)

### 1. Layar Login:

- Form Sederhana: Field NIP/NIM dan PIN (4 Digit)
- Saat berhasil login: Backend menset HttpOnly Cookie (berlaku 30 hari)

Auth: Pakai JWT

### 2. Homepage Pengguna (Catalog & Search):

- Bar Pencarian: Cari nama reagen/bahan kimia
- Daftar / kartu bahan: menampilkan Nama Bahan, Lokasi, dan sisa stok saat ini
- Scanner untuk scan QR Code

## Wireframe 2: Halaman Scan QR & Form Pemakaian

### 1. Trigger

pengguna mengarahkan kamera HP/Web scanner ke stiker QR code botol (URL contoh: `https://app.com/lab/chemicals/CHEM-9921](https://app.com/lab/chemicals/CHEM-9921`)

### 2. Detail & Halaman Catat (Protected Route):

- **UX**: Jika cookie 30 hari masih aktif, halaman detail bahan langsung terbuka. Jika belum login, sistem mengarahkan ke Layar Login dulu, lalu otomatis redirect ke halaman bahan tersebut setelah PIN dimasukkan.
- **Informasi di Layar**:
  - Detail Bahan (Nama, Rumus Kimia, Masa Kadaluarsa, Sisa Stok).
  - **Banner Warning OSHA**: Penanda visual jika bahan tergolong reaktif/inkompatibel dengan kelompok bahan tertentu
  - **Form Input Pemakaian**: Input angka (misal `24.4`) dan pilihan satuan (`mL`/`gram`), tombol Submit Catat

## Wireframe 3: Dashboard & Management Admin

1. Layar login admin: Email & Password
2. **Dashboard Overview**
   - Ringkasan stok, stok tipis, dan mendekati kadaluarsa
3. Fitur Management:
   - Stok & QR Code: CRUD bahan kimia, upload data, dan tombol cetak stiker QR Code
   - Audit Log: Tabel riwayat transaksi (Siapa, Kapan, Bahan Apa, Berapa Banyak).
   - Manajemen User: Form daftarkan Pengguna Lab baru (Input Nama, NIP/NIM, dan PIN 4-digit)
