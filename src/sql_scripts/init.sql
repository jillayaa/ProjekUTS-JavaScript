PRAGMA foreign_keys = ON;

-- Tabel Kebaya
CREATE TABLE IF NOT EXISTS kebaya (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_kebaya TEXT NOT NULL UNIQUE,
    nama_model TEXT NOT NULL,
    ukuran TEXT NOT NULL,
    warna TEXT NOT NULL,
    harga_sewa_per_hari INTEGER NOT NULL
        CHECK (harga_sewa_per_hari >= 0),
    kondisi TEXT NOT NULL DEFAULT 'baik'
        CHECK (kondisi IN ('baik', 'perawatan', 'rusak')),
    keterangan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pelanggan
CREATE TABLE IF NOT EXISTS pelanggan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    no_hp TEXT NOT NULL,
    alamat TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Penyewaan
CREATE TABLE IF NOT EXISTS penyewaan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pelanggan_id INTEGER NOT NULL,
    kebaya_id INTEGER NOT NULL,

    tanggal_sewa TEXT NOT NULL,
    tanggal_kembali TEXT NOT NULL,

    durasi_hari INTEGER NOT NULL CHECK (durasi_hari > 0),
    harga_sewa_per_hari INTEGER NOT NULL
        CHECK (harga_sewa_per_hari >= 0),
    total_harga INTEGER NOT NULL CHECK (total_harga >= 0),

    status TEXT NOT NULL DEFAULT 'dipesan'
        CHECK (
            status IN (
                'dipesan',
                'disewa',
                'dikembalikan',
                'dibatalkan'
            )
        ),

    catatan TEXT,

    status_pembayaran TEXT NOT NULL DEFAULT 'belum_bayar'
    CHECK (
        status_pembayaran IN (
            'belum_bayar',
            'menunggu_verifikasi',
            'terverifikasi',
            'ditolak'
        )
    ),

    bukti_bayar TEXT,

    catatan_verifikasi TEXT,

    verified_by INTEGER REFERENCES users(id),

    verified_at DATETIME,

    tanggal_pengembalian_aktual TEXT,

    kondisi_pengembalian TEXT
        CHECK (
            kondisi_pengembalian IS NULL OR
            kondisi_pengembalian IN ('baik', 'rusak')
        ),

    denda INTEGER NOT NULL DEFAULT 0
        CHECK (denda >= 0),

    catatan_pengembalian TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pelanggan_id)
        REFERENCES pelanggan(id) ON DELETE RESTRICT,

    FOREIGN KEY (kebaya_id)
        REFERENCES kebaya(id) ON DELETE RESTRICT,

    CHECK (tanggal_kembali >= tanggal_sewa)

);

-- Tabel Pelanggan
CREATE TABLE IF NOT EXISTS pelanggan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER UNIQUE,

    nama TEXT NOT NULL,

    no_hp TEXT NOT NULL,

    alamat TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('owner', 'admin', 'customer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk pengujian koneksi API
CREATE TABLE IF NOT EXISTS test_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk membantu pencarian transaksi
CREATE INDEX IF NOT EXISTS idx_penyewaan_kebaya
ON penyewaan(kebaya_id);

CREATE INDEX IF NOT EXISTS idx_penyewaan_pelanggan
ON penyewaan(pelanggan_id);