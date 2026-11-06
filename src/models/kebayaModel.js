const {
  dbRun,
  dbGet,
  dbAll
} = require('../middlewares_helpers/sqlite3_helpers');

// Mengambil semua kebaya
const findAllKebaya = async () => {
  return await dbAll(
    'SELECT * FROM kebaya ORDER BY id DESC'
  );
};

// Mengambil kebaya berdasarkan ID
const findKebayaById = async (id) => {
  return await dbGet(
    'SELECT * FROM kebaya WHERE id = ?',
    [id]
  );
};

// Menambahkan kebaya
const createKebaya = async (body) => {
  const query = `
    INSERT INTO kebaya (
      kode_kebaya,
      nama_model,
      ukuran,
      warna,
      harga_sewa_per_hari,
      kondisi,
      keterangan
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    body.kode_kebaya,
    body.nama_model,
    body.ukuran,
    body.warna,
    body.harga_sewa_per_hari,
    body.kondisi ?? 'baik',
    body.keterangan ?? null
  ];

  const { lastID } = await dbRun(query, values);

  return await findKebayaById(lastID);
};

// Memperbarui kebaya
const updateKebaya = async (id, body) => {
  const existing = await findKebayaById(id);

  if (!existing) return null;

  const query = `
    UPDATE kebaya
    SET
      kode_kebaya = ?,
      nama_model = ?,
      ukuran = ?,
      warna = ?,
      harga_sewa_per_hari = ?,
      kondisi = ?,
      keterangan = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    body.kode_kebaya ?? existing.kode_kebaya,
    body.nama_model ?? existing.nama_model,
    body.ukuran ?? existing.ukuran,
    body.warna ?? existing.warna,
    body.harga_sewa_per_hari ?? existing.harga_sewa_per_hari,
    body.kondisi ?? existing.kondisi,
    body.keterangan !== undefined
      ? body.keterangan
      : existing.keterangan,
    id
  ];

  await dbRun(query, values);

  return await findKebayaById(id);
};

// Menghapus kebaya
const deleteKebaya = async (id) => {
  const { changes } = await dbRun(
    'DELETE FROM kebaya WHERE id = ?',
    [id]
  );

  return changes > 0;
};

module.exports = {
  findAllKebaya,
  findKebayaById,
  createKebaya,
  updateKebaya,
  deleteKebaya
};