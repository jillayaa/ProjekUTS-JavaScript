require('dotenv').config();

const bcrypt = require('bcryptjs');
const readline = require('readline/promises');
const { stdin, stdout } = require('process');

const {
  initializeDatabase,
  db
} = require('../config/database');

const {
  dbGet,
  dbRun
} = require('../middlewares_helpers/sqlite3_helpers');

const createStaff = async () => {
  const role = process.argv[2];

  if (!['owner', 'admin'].includes(role)) {
    console.log(
      'Gunakan: node src/scripts/createStaffUser.js owner'
    );

    return;
  }

  const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });

  try {
    await initializeDatabase();

    console.log(`\nPEMBUATAN AKUN ${role.toUpperCase()}\n`);

    const nama = await rl.question('Nama: ');
    const email = await rl.question('Email: ');
    const password = await rl.question('Password: ');

    if (!nama.trim() || !email.trim() || password.length < 8) {
      throw new Error(
        'Nama dan email wajib diisi, password minimal 8 karakter.'
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await dbGet(
      'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
      [normalizedEmail]
    );

    if (existing) {
      throw new Error('Email sudah terdaftar.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await dbRun(
      `INSERT INTO users (
        nama,
        email,
        password_hash,
        role
      ) VALUES (?, ?, ?, ?)`,
      [
        nama.trim(),
        normalizedEmail,
        passwordHash,
        role
      ]
    );

    console.log(`\nAkun ${role} berhasil dibuat.`);
    console.log(`Email: ${normalizedEmail}`);

  } catch (error) {
    console.error('\nGagal membuat akun:', error.message);

  } finally {
    rl.close();

    db.close((error) => {
      if (error) {
        console.error('Gagal menutup database:', error.message);
      }
    });
  }
};

createStaff();