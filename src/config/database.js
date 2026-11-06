const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const initSQL = fs.readFileSync(
  path.join(__dirname, '../sql_scripts/init.sql'),
  'utf8'
);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal konek SQLite:', err.message);
    process.exit(1);
  }

  console.log('Terhubung ke SQLite:', dbPath);
});

// Memeriksa dan menambahkan kolom apabila belum tersedia
const ensureColumn = (table, column, definition) =>
  new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, [], (err, columns) => {
      if (err) return reject(err);

      const exists = columns.some(
        (item) => item.name === column
      );

      if (exists) return resolve();

      db.run(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        (alterError) => {
          if (alterError) reject(alterError);
          else resolve();
        }
      );
    });
  });

const initializeDatabase = () =>
  new Promise((resolve, reject) => {
    db.exec('PRAGMA foreign_keys = ON;', async (pragmaError) => {
      if (pragmaError) return reject(pragmaError);

      try {
        // Membuat tabel sesuai init.sql
        await new Promise((res, rej) => {
          db.exec(initSQL, (err) => {
            if (err) rej(err);
            else res();
          });
        });

        // Migrasi database lama
        await ensureColumn(
          'pelanggan',
          'user_id',
          'INTEGER REFERENCES users(id) ON DELETE SET NULL'
        );

        // Migrasi kolom pembayaran
        await ensureColumn(
          'penyewaan',
          'status_pembayaran',
          "TEXT NOT NULL DEFAULT 'belum_bayar'"
        );

        await ensureColumn(
          'penyewaan',
          'bukti_bayar',
          'TEXT'
        );

        await ensureColumn(
          'penyewaan',
          'catatan_verifikasi',
          'TEXT'
        );

        await ensureColumn(
          'penyewaan',
          'verified_by',
          'INTEGER'
        );

        await ensureColumn(
          'penyewaan',
          'verified_at',
          'DATETIME'
        );

        await ensureColumn(
          'penyewaan',
          'tanggal_pengembalian_aktual',
          'TEXT'
        );

        await ensureColumn(
          'penyewaan',
          'kondisi_pengembalian',
          'TEXT'
        );

        await ensureColumn(
          'penyewaan',
          'denda',
          'INTEGER NOT NULL DEFAULT 0'
        );

        await ensureColumn(
          'penyewaan',
          'catatan_pengembalian',
          'TEXT'
        );

        // Satu akun hanya memiliki satu profil pelanggan
        await new Promise((res, rej) => {
          db.run(
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_pelanggan_user_id
             ON pelanggan(user_id)
             WHERE user_id IS NOT NULL`,
            (err) => {
              if (err) rej(err);
              else res();
            }
          );
        });

        resolve();

      } catch (error) {
        reject(error);
      }
    });
  });

module.exports = {
  db,
  initializeDatabase
};