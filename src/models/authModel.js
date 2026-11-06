const {
  dbRun,
  dbGet
} = require('../middlewares_helpers/sqlite3_helpers');

// Mencari user berdasarkan email
const findUserByEmail = async (email) => {
  return await dbGet(
    `SELECT *
     FROM users
     WHERE email = ? COLLATE NOCASE`,
    [email]
  );
};

// Mencari user berdasarkan ID
const findUserById = async (id) => {
  return await dbGet(
    `SELECT id, nama, email, role, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );
};

// Membuat akun Customer dan profil Pelanggan
const createCustomerAccount = async (body) => {
  await dbRun('BEGIN TRANSACTION');

  try {
    const result = await dbRun(
      `INSERT INTO users (
        nama, email, password_hash, role
      ) VALUES (?, ?, ?, 'customer')`,
      [
        body.nama,
        body.email,
        body.password_hash
      ]
    );

    const userId = result.lastID;

    await dbRun(
      `INSERT INTO pelanggan (
        user_id, nama, no_hp, alamat
      ) VALUES (?, ?, ?, ?)`,
      [
        userId,
        body.nama,
        body.no_hp,
        body.alamat ?? null
      ]
    );

    await dbRun('COMMIT');

    return await findUserById(userId);

  } catch (error) {
    try {
      await dbRun('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback gagal:', rollbackError);
    }

    throw error;
  }
};

// Membuat akun Owner atau Admin
const createStaffAccount = async (body) => {
  const result = await dbRun(
    `INSERT INTO users (
      nama, email, password_hash, role
    ) VALUES (?, ?, ?, ?)`,
    [
      body.nama,
      body.email,
      body.password_hash,
      body.role
    ]
  );

  return await findUserById(result.lastID);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createCustomerAccount,
  createStaffAccount
};