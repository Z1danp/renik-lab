-- 1. MASTER DATA GHS CLASSIFICATION (3NF)
CREATE TABLE ghs_classifications (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,       -- Contoh: 'FLAM_LIQ_2', 'TOX_ACUTE_1'
    category_name VARCHAR(100) NOT NULL,    -- Contoh: 'Flammable Liquids Cat. 2'
    pictogram_symbol VARCHAR(50),           -- Contoh: 'flame.png'
    signal_word VARCHAR(20) CHECK (signal_word IN ('DANGER', 'WARNING', 'NONE'))
);

-- 2. MASTER DATA BAHAN KIMIA (3NF + Denormalisasi Stok)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cas_number VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    chemical_formula VARCHAR(100),
    ghs_classification_id INT REFERENCES ghs_classifications(id),
    unit VARCHAR(20) NOT NULL,              -- 'mL', 'g', 'L', 'kg'
    min_stock_alert DECIMAL(12,2) DEFAULT 0.00,
    
    -- DENORMALISASI 1: Caching total stok untuk kecepatan query Dashboard 
    total_available_stock DECIMAL(12,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OSHA SAFETY COMPATIBILITY MATRIX (3NF)
CREATE TABLE osha_incompatibility_rules (
    id SERIAL PRIMARY KEY,
    class_a_id INT NOT NULL REFERENCES ghs_classifications(id) ON DELETE CASCADE,
    class_b_id INT NOT NULL REFERENCES ghs_classifications(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('CRITICAL', 'HIGH', 'WARNING')),
    hazard_description TEXT NOT NULL,       
    action_required TEXT,                  
    
    CONSTRAINT check_canonical_order CHECK (class_a_id < class_b_id),
    CONSTRAINT unique_rule_pair UNIQUE (class_a_id, class_b_id)
);

-- 4. MASTER DATA LOKASI PENYIMPANAN (3NF)
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(100) NOT NULL,        -- Contoh: "Lab Kimia Organik 1"
    cabinet_code VARCHAR(50) NOT NULL,      -- Contoh: "Lemari Asam A"
    shelf_number VARCHAR(50) NOT NULL,      -- Contoh: "Rak 2"
    description TEXT
);

-- 5. UNIT BOTOL / WADAH FISIK (Inventory Unit) (3NF)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(100) UNIQUE NOT NULL,   -- UUID / Unique String pada QR Code
    material_id UUID NOT NULL REFERENCES materials(id),
    location_id UUID REFERENCES storage_locations(id),
    batch_number VARCHAR(100),
    initial_quantity DECIMAL(12,2) NOT NULL,
    current_quantity DECIMAL(12,2) NOT NULL CHECK (current_quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'EMPTY', 'DISPOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMMUTABLE AUDIT TRAIL ISO 17025 (3NF + Denormalisasi Audit)
CREATE TABLE stock_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    
    -- [UPDATE TERBARU]: Relasi Foreign Key ke tabel users (Bisa NULL jika akun dihapus)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, 
    
    -- [UPDATE TERBARU]: Kategori kegiatan statis untuk UI/UX Scanner yang lebih cepat
    activity_category VARCHAR(50) NOT NULL CHECK (activity_category IN (
        'PRAKTIKUM', 
        'PERSIAPAN_REAGEN', 
        'PENELITIAN', 
        'PENGUJIAN_SAMPEL',
        'MAINTENANCE_ALAT',
        'LAINNYA'
    )),
    
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('USAGE', 'RESTOCK', 'ADJUSTMENT', 'DISPOSAL')),
    quantity_changed DECIMAL(12,2) NOT NULL, 
    quantity_before DECIMAL(12,2) NOT NULL,
    quantity_after DECIMAL(12,2) NOT NULL,
    
    -- Denormalisasi Snapshot (Dikunci secara permanen oleh Backend saat transaksi)
    material_name_snapshot VARCHAR(255) NOT NULL,
    user_name_snapshot VARCHAR(100) NOT NULL,
    
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TABEL USERS (Admin & Pengguna Lab)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    nip VARCHAR(50) UNIQUE,              -- Login Pengguna Lab
    email VARCHAR(255) UNIQUE,           -- Login Admin
    pin VARCHAR(255),                    -- Hash PIN 4-digit Pengguna Lab
    password VARCHAR(255),               -- Hash Password Admin
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER_LAB')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXING UNTUK OPTIMASI PERFORMA BACKEND
-- ==========================================

-- Indeks pencarian cepat untuk QR Code Scanner
CREATE INDEX idx_inventory_qr_code ON inventory_items(qr_code);

-- Indeks penarikan data Peringatan Kadaluarsa (ISO 17025 H-30)
CREATE INDEX idx_inventory_expiration ON inventory_items(expiration_date) WHERE status = 'ACTIVE';

-- Indeks Pengecekan Safety Engine pada Lokasi Penyimpanan
CREATE INDEX idx_inventory_location ON inventory_items(location_id);

-- Indeks Log Audit berdasarkan Item dan Tanggal
CREATE INDEX idx_audit_logs_item_timestamp ON stock_audit_logs(inventory_item_id, timestamp DESC);