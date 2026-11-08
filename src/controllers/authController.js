const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authModel = require('../models/authModel');

const success = (res, code, message, data = null) => {
  return res.status(code).json({
    success: true,
    message,
    data
  });
};

const fail = (res, code, message) => {
  return res.status(code).json({
    success: false,
    message
  });
};

// Registrasi Customer
const register = async (req, res) => {
  try {
    const {
      nama,
      email,
      no_hp,
      alamat,
      password
    } = req.body;

    if (
      typeof nama !== 'string' ||
      nama.trim() === ''
    ) {
      return fail(res, 400, 'Nama wajib diisi');
    }

    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return fail(res, 400, 'Email tidak valid');
    }

    if (
      typeof no_hp !== 'string' ||
      no_hp.trim() === ''
    ) {
      return fail(res, 400, 'Nomor HP wajib diisi');
    }

    if (
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return fail(
        res,
        400,
        'Password minimal 8 karakter'
      );
    }

    if (
      alamat !== undefined &&
      alamat !== null &&
      typeof alamat !== 'string'
    ) {
      return fail(res, 400, 'Alamat tidak valid');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await authModel.findUserByEmail(
      normalizedEmail
    );

    if (existing) {
      return fail(res, 409, 'Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authModel.createCustomerAccount({
      nama: nama.trim(),
      email: normalizedEmail,
      no_hp: no_hp.trim(),
      alamat: alamat?.trim() || null,
      password_hash: passwordHash
    });

    return success(
      res,
      201,
      'Registrasi Customer berhasil',
      user
    );

  } catch (error) {
    console.error('[register]', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(res, 409, 'Email sudah terdaftar');
    }

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return fail(res, 400, 'Email dan password wajib diisi');
    }

    const user = await authModel.findUserByEmail(
      email.trim().toLowerCase()
    );

    if (!user) {
      return fail(res, 401, 'Email atau password salah');
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return fail(res, 401, 'Email atau password salah');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET belum diatur');
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    return success(res, 200, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('[login]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Memeriksa akun yang sedang login
const me = async (req, res) => {
  try {
    const user = await authModel.findUserById(req.user.id);

    if (!user) {
      return fail(res, 404, 'Akun tidak ditemukan');
    }

    return success(
      res,
      200,
      'Data akun berhasil diambil',
      user
    );

  } catch (error) {
    console.error('[me]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

module.exports = {
  register,
  login,
  me
};