const {
  dbRun,
  dbGet,
  dbAll
} = require('../middlewares_helpers/sqlite3_helpers');

// Data penyewaan dilengkapi informasi Customer dan Kebaya
const rentalSelect = `
  SELECT
    p.*,
    pl.nama AS nama_pelanggan,
    pl.no_hp,
    pl.user_id,
    k.kode_kebaya,
    k.nama_model,
    k.ukuran,
    k.warna,
    k.harga_sewa_per_hari AS harga_kebaya_saat_ini
  FROM penyewaan p
  JOIN pelanggan pl ON p.pelanggan_id = pl.id
  JOIN kebaya k ON p.kebaya_id = k.id
`;

// GET seluruh penyewaan
const findAllPenyewaan = async () => {
  return dbAll(`${rentalSelect} ORDER BY p.id DESC`);
};

// GET detail berdasarkan ID
const findPenyewaanById = async (id) => {
  return dbGet(
    `${rentalSelect} WHERE p.id = ?`,
    [id]
  );
};

// Mencari profil pelanggan dari user login
const findPelangganByUserId = async (userId) => {
  return dbGet(
    'SELECT id FROM pelanggan WHERE user_id = ?',
    [userId]
  );
};

// GET riwayat Customer sendiri
const findPenyewaanByUserId = async (userId) => {
  return dbAll(
    `${rentalSelect}
     WHERE pl.user_id = ?
     ORDER BY p.id DESC`,
    [userId]
  );
};

// Membuat penyewaan
const createPenyewaan = async (body) => {
  const pelanggan = await findPelangganByUserId(
    body.user_id
  );

  if (!pelanggan) {
    return { error: 'PELANGGAN_NOT_FOUND' };
  }

  const kebaya = await dbGet(
    'SELECT * FROM kebaya WHERE id = ?',
    [body.kebaya_id]
  );

  if (!kebaya) {
    return { error: 'KEBAYA_NOT_FOUND' };
  }

  if (kebaya.kondisi !== 'baik') {
    return { error: 'KEBAYA_NOT_RENTABLE' };
  }

  /*
    Query INSERT ... SELECT dipakai agar pengecekan
    benturan jadwal dan penyimpanan transaksi terjadi
    dalam satu statement database.
  */
  const query = `
    INSERT INTO penyewaan (
      pelanggan_id,
      kebaya_id,
      tanggal_sewa,
      tanggal_kembali,
      durasi_hari,
      harga_sewa_per_hari,
      total_harga,
      status,
      status_pembayaran
    )
    SELECT
      ?,
      k.id,
      ?,
      ?,
      CAST(
        julianday(?) - julianday(?) AS INTEGER
      ) + 1,
      k.harga_sewa_per_hari,
      (
        CAST(
          julianday(?) - julianday(?) AS INTEGER
        ) + 1
      ) * k.harga_sewa_per_hari,
      'dipesan',
      'belum_bayar'
    FROM kebaya k
    WHERE k.id = ?
      AND k.kondisi = 'baik'
      AND NOT EXISTS (
        SELECT 1
        FROM penyewaan old
        WHERE old.kebaya_id = k.id
          AND old.status IN ('dipesan', 'disewa')
          AND old.tanggal_sewa <= ?
          AND old.tanggal_kembali >= ?
      )
  `;

  const values = [
    pelanggan.id,
    body.tanggal_sewa,
    body.tanggal_kembali,
    body.tanggal_kembali,
    body.tanggal_sewa,
    body.tanggal_kembali,
    body.tanggal_sewa,
    body.kebaya_id,
    body.tanggal_kembali,
    body.tanggal_sewa
  ];

  const result = await dbRun(query, values);

  if (result.changes === 0) {
    return { error: 'KEBAYA_UNAVAILABLE' };
  }

  return findPenyewaanById(result.lastID);
};

// Upload bukti pembayaran milik Customer
const uploadBuktiBayar = async (
  id,
  pelangganId,
  filename
) => {
  const result = await dbRun(
    `UPDATE penyewaan
     SET
       bukti_bayar = ?,
       status_pembayaran = 'menunggu_verifikasi',
       catatan_verifikasi = NULL,
       verified_by = NULL,
       verified_at = NULL,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND pelanggan_id = ?
       AND status_pembayaran IN ('belum_bayar', 'ditolak')
       AND status = 'dipesan'`,
    [filename, id, pelangganId]
  );

  if (result.changes === 0) return null;

  return findPenyewaanById(id);
};

// Verifikasi pembayaran oleh Admin
const verifyPayment = async (
  id,
  decision,
  note,
  adminId
) => {
  const statusPembayaran =
    decision === 'terima' ? 'terverifikasi' : 'ditolak';

  const result = await dbRun(
    `UPDATE penyewaan
     SET
       status_pembayaran = ?,
       catatan_verifikasi = ?,
       verified_by = ?,
       verified_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND status = 'dipesan'
       AND status_pembayaran = 'menunggu_verifikasi'`,
    [statusPembayaran, note || null, adminId, id]
  );

  if (result.changes === 0) return null;

  return findPenyewaanById(id);
};

// Admin memulai masa penyewaan
const startPenyewaan = async (id) => {
  const result = await dbRun(
    `UPDATE penyewaan
     SET
       status = 'disewa',
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND status = 'dipesan'
       AND status_pembayaran = 'terverifikasi'`,
    [id]
  );

  if (result.changes === 0) return null;

  return findPenyewaanById(id);
};

// Mencatat pengembalian
const recordReturn = async (
  id,
  actualDate,
  condition,
  fine,
  note
) => {
  const result = await dbRun(
    `UPDATE penyewaan
     SET
       status = 'dikembalikan',
       tanggal_pengembalian_aktual = ?,
       kondisi_pengembalian = ?,
       denda = ?,
       catatan_pengembalian = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND status = 'disewa'`,
    [actualDate, condition, fine, note || null, id]
  );

  if (result.changes === 0) return null;

  return findPenyewaanById(id);
};

module.exports = {
  findAllPenyewaan,
  findPenyewaanById,
  findPelangganByUserId,
  findPenyewaanByUserId,
  createPenyewaan,
  uploadBuktiBayar,
  verifyPayment,
  startPenyewaan,
  recordReturn
};