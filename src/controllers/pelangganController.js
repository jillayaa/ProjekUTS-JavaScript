const pelangganModel = require('../models/pelangganModel');

// Response sukses
const success = (res, code, message, data = null) => {
  return res.status(code).json({
    success: true,
    message,
    data
  });
};

// Response gagal
const fail = (res, code, message, error = null) => {
  return res.status(code).json({
    success: false,
    message,
    error
  });
};

// Validasi ID
const validId = (id) => {
  return Number.isSafeInteger(Number(id)) &&
    Number(id) > 0;
};

// GET semua pelanggan
const getAllPelanggan = async (req, res) => {
  try {
    const data = await pelangganModel.findAllPelanggan();

    return success(
      res,
      200,
      'Berhasil mengambil data pelanggan',
      data
    );
  } catch (error) {
    console.error('[getAllPelanggan]', error);

    return fail(
      res,
      500,
      'Terjadi kesalahan pada server'
    );
  }
};

// GET pelanggan berdasarkan ID
const getPelangganById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID pelanggan tidak valid');
    }

    const data = await pelangganModel.findPelangganById(id);

    if (!data) {
      return fail(res, 404, 'Pelanggan tidak ditemukan');
    }

    return success(
      res,
      200,
      'Berhasil mengambil detail pelanggan',
      data
    );
  } catch (error) {
    console.error('[getPelangganById]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// POST pelanggan baru
const createPelanggan = async (req, res) => {
  try {
    const { nama, no_hp, alamat } = req.body;

    // Validasi nama
    if (
      typeof nama !== 'string' ||
      nama.trim() === ''
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'Nama pelanggan wajib diisi'
      );
    }

    // Validasi nomor HP
    if (
      typeof no_hp !== 'string' ||
      no_hp.trim() === ''
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'Nomor HP wajib diisi'
      );
    }

    // Validasi alamat
    if (
      alamat !== undefined &&
      alamat !== null &&
      typeof alamat !== 'string'
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'Alamat harus berupa teks'
      );
    }

    const created = await pelangganModel.createPelanggan({
      nama: nama.trim(),
      no_hp: no_hp.trim(),
      alamat: alamat?.trim() || null
    });

    return success(
      res,
      201,
      'Pelanggan berhasil ditambahkan',
      created
    );
  } catch (error) {
    console.error('[createPelanggan]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// PUT memperbarui pelanggan
const updatePelanggan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID pelanggan tidak valid');
    }

    const existing = await pelangganModel.findPelangganById(id);

    if (!existing) {
      return fail(res, 404, 'Pelanggan tidak ditemukan');
    }

    const body = req.body;

    if (Object.keys(body).length === 0) {
      return fail(
        res,
        400,
        'Tidak ada data yang dikirim untuk diperbarui'
      );
    }

    if (
      body.nama !== undefined &&
      (
        typeof body.nama !== 'string' ||
        body.nama.trim() === ''
      )
    ) {
      return fail(
        res,
        400,
        'Nama pelanggan tidak boleh kosong'
      );
    }

    if (
      body.no_hp !== undefined &&
      (
        typeof body.no_hp !== 'string' ||
        body.no_hp.trim() === ''
      )
    ) {
      return fail(
        res,
        400,
        'Nomor HP tidak boleh kosong'
      );
    }

    if (
      body.alamat !== undefined &&
      body.alamat !== null &&
      typeof body.alamat !== 'string'
    ) {
      return fail(
        res,
        400,
        'Alamat harus berupa teks'
      );
    }

    const updated = await pelangganModel.updatePelanggan(
      id,
      {
        ...body,
        nama: body.nama?.trim(),
        no_hp: body.no_hp?.trim(),
        alamat:
          body.alamat === null
            ? null
            : body.alamat?.trim()
      }
    );

    return success(
      res,
      200,
      'Pelanggan berhasil diperbarui',
      updated
    );
  } catch (error) {
    console.error('[updatePelanggan]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// DELETE pelanggan
const deletePelanggan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID pelanggan tidak valid');
    }

    const deleted = await pelangganModel.deletePelanggan(id);

    if (!deleted) {
      return fail(res, 404, 'Pelanggan tidak ditemukan');
    }

    return success(
      res,
      200,
      'Pelanggan berhasil dihapus'
    );
  } catch (error) {
    console.error('[deletePelanggan]', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(
        res,
        409,
        'Pelanggan tidak dapat dihapus karena memiliki riwayat penyewaan'
      );
    }

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

module.exports = {
  getAllPelanggan,
  getPelangganById,
  createPelanggan,
  updatePelanggan,
  deletePelanggan
};