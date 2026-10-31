const {
  dbRun,
  dbGet,
  dbAll
} = require('../middlewares_helpers/sqlite3_helpers');

// GET semua penyewaan
const findAllPenyewaan = async () => {
  const query = `
    SELECT
      p.*,
      pl.nama AS nama_pelanggan,
      pl.no_hp,
      k.kode_kebaya,
      k.nama_model,
      k.ukuran,
      k.warna

    FROM penyewaan p

    JOIN pelanggan pl
      ON p.pelanggan_id = pl.id

    JOIN kebaya k
      ON p.kebaya_id = k.id

    ORDER BY p.id DESC
  `;

  return await dbAll(query);
};

// GET detail penyewaan berdasarkan ID
const findPenyewaanById = async (id) => {
  const query = `
    SELECT
      p.*,
      pl.nama AS nama_pelanggan,
      pl.no_hp,
      k.kode_kebaya,
      k.nama_model,
      k.ukuran,
      k.warna

    FROM penyewaan p

    JOIN pelanggan pl
      ON p.pelanggan_id = pl.id

    JOIN kebaya k
      ON p.kebaya_id = k.id

    WHERE p.id = ?
  `;

  return await dbGet(query, [id]);
};

// POST transaksi penyewaan
const createPenyewaan = async (body) => {

  // Periksa pelanggan
  const pelanggan = await dbGet(
    'SELECT id FROM pelanggan WHERE id = ?',
    [body.pelanggan_id]
  );

  if (!pelanggan) {
    return {
      error: 'PELANGGAN_NOT_FOUND'
    };
  }

  // Periksa kebaya
  const kebaya = await dbGet(
    'SELECT * FROM kebaya WHERE id = ?',
    [body.kebaya_id]
  );

  if (!kebaya) {
    return {
      error: 'KEBAYA_NOT_FOUND'
    };
  }

  // Kebaya harus dalam kondisi baik
  if (kebaya.kondisi !== 'baik') {
    return {
      error: 'KEBAYA_NOT_RENTABLE'
    };
  }

  /*
   * INSERT bersyarat:
   * 1. Kebaya harus tersedia.
   * 2. Tidak boleh ada jadwal yang bertabrakan.
   * 3. Harga diambil langsung dari database.
   * 4. Durasi dan total harga dihitung oleh server.
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
      status
    )

    SELECT
      ?,
      ?,
      ?,
      ?,

      CAST(
        julianday(?) - julianday(?)
        AS INTEGER
      ) + 1,

      k.harga_sewa_per_hari,

      (
        CAST(
          julianday(?) - julianday(?)
          AS INTEGER
        ) + 1
      ) * k.harga_sewa_per_hari,

      'dipesan'

    FROM kebaya k

    WHERE k.id = ?
      AND k.kondisi = 'baik'

      AND NOT EXISTS (
        SELECT 1
        FROM penyewaan existing

        WHERE existing.kebaya_id = k.id

          AND existing.status IN (
            'dipesan',
            'disewa'
          )

          AND existing.tanggal_sewa <= ?
          AND existing.tanggal_kembali >= ?
      )
  `;

  const values = [
    body.pelanggan_id,
    body.kebaya_id,
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

  // Tidak ada data yang berhasil dimasukkan
  if (result.changes === 0) {
    return {
      error: 'KEBAYA_UNAVAILABLE'
    };
  }

  return await findPenyewaanById(result.lastID);
};

// PATCH status penyewaan
const updateStatusPenyewaan = async (
  id,
  statusBaru,
  statusLama
) => {
  const query = `
    UPDATE penyewaan

    SET
      status = ?,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?
      AND status = ?
  `;

  const result = await dbRun(
    query,
    [statusBaru, id, statusLama]
  );

  if (result.changes === 0) {
    return null;
  }

  return await findPenyewaanById(id);
};

module.exports = {
  findAllPenyewaan,
  findPenyewaanById,
  createPenyewaan,
  updateStatusPenyewaan
};