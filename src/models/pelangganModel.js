const {
  dbRun,
  dbGet,
  dbAll
} = require('../middlewares_helpers/sqlite3_helpers');

// GET semua pelanggan
const findAllPelanggan = async () => {
  return await dbAll(
    'SELECT * FROM pelanggan ORDER BY id DESC'
  );
};

// GET pelanggan berdasarkan ID
const findPelangganById = async (id) => {
  return await dbGet(
    'SELECT * FROM pelanggan WHERE id = ?',
    [id]
  );
};

// POST menambahkan pelanggan
const createPelanggan = async (body) => {
  const query = `
    INSERT INTO pelanggan (
      nama,
      no_hp,
      alamat
    )
    VALUES (?, ?, ?)
  `;

  const values = [
    body.nama,
    body.no_hp,
    body.alamat ?? null
  ];

  const { lastID } = await dbRun(query, values);

  return await findPelangganById(lastID);
};

// PUT memperbarui pelanggan
const updatePelanggan = async (id, body) => {
  const existing = await findPelangganById(id);

  if (!existing) return null;

  const query = `
    UPDATE pelanggan
    SET
      nama = ?,
      no_hp = ?,
      alamat = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    body.nama ?? existing.nama,
    body.no_hp ?? existing.no_hp,
    body.alamat !== undefined
      ? body.alamat
      : existing.alamat,
    id
  ];

  await dbRun(query, values);

  return await findPelangganById(id);
};

// DELETE pelanggan
const deletePelanggan = async (id) => {
  const { changes } = await dbRun(
    'DELETE FROM pelanggan WHERE id = ?',
    [id]
  );

  return changes > 0;
};

module.exports = {
  findAllPelanggan,
  findPelangganById,
  createPelanggan,
  updatePelanggan,
  deletePelanggan
};