const kebayaModel = require('../models/kebayaModel');

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
  return Number.isInteger(Number(id)) &&
    Number(id) > 0;
};

// GET semua kebaya
const getAllKebaya = async (req, res) => {
  try {
    const data = await kebayaModel.findAllKebaya();

    return success(
      res,
      200,
      'Berhasil mengambil data kebaya',
      data
    );
  } catch (error) {
    console.error('[getAllKebaya]', error);

    return fail(
      res,
      500,
      'Terjadi kesalahan pada server'
    );
  }
};

// GET kebaya berdasarkan ID
const getKebayaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID kebaya tidak valid');
    }

    const data = await kebayaModel.findKebayaById(id);

    if (!data) {
      return fail(res, 404, 'Kebaya tidak ditemukan');
    }

    return success(
      res,
      200,
      'Berhasil mengambil detail kebaya',
      data
    );
  } catch (error) {
    console.error('[getKebayaById]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// POST kebaya baru
const createKebaya = async (req, res) => {
  try {
    const {
      kode_kebaya,
      nama_model,
      ukuran,
      warna,
      harga_sewa_per_hari,
      kondisi,
      keterangan
    } = req.body;

    // Validasi kolom wajib
    const requiredFields = [
      ['kode_kebaya', kode_kebaya],
      ['nama_model', nama_model],
      ['ukuran', ukuran],
      ['warna', warna]
    ];

    for (const [field, value] of requiredFields) {
      if (
        typeof value !== 'string' ||
        value.trim() === ''
      ) {
        return fail(
          res,
          400,
          'Validasi gagal',
          `${field} wajib diisi`
        );
      }
    }

    // Validasi harga
    if (
      !Number.isInteger(harga_sewa_per_hari) ||
      harga_sewa_per_hari < 0
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'harga_sewa_per_hari harus berupa bilangan bulat >= 0'
      );
    }

    // Validasi kondisi
    const kondisiValid = [
      'baik',
      'perawatan',
      'rusak'
    ];

    if (
      kondisi !== undefined &&
      !kondisiValid.includes(kondisi)
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'Kondisi harus baik, perawatan, atau rusak'
      );
    }

    const created = await kebayaModel.createKebaya({
      ...req.body,
      kode_kebaya: kode_kebaya.trim(),
      nama_model: nama_model.trim(),
      ukuran: ukuran.trim(),
      warna: warna.trim()
    });

    return success(
      res,
      201,
      'Kebaya berhasil ditambahkan',
      created
    );
  } catch (error) {
    console.error('[createKebaya]', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(
        res,
        409,
        'Kode kebaya sudah digunakan'
      );
    }

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// PUT update kebaya
const updateKebaya = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID kebaya tidak valid');
    }

    const existing = await kebayaModel.findKebayaById(id);

    if (!existing) {
      return fail(res, 404, 'Kebaya tidak ditemukan');
    }

    const body = req.body;

    const stringFields = [
      'kode_kebaya',
      'nama_model',
      'ukuran',
      'warna'
    ];

    for (const field of stringFields) {
      if (
        body[field] !== undefined &&
        (
          typeof body[field] !== 'string' ||
          body[field].trim() === ''
        )
      ) {
        return fail(
          res,
          400,
          'Validasi gagal',
          `${field} tidak boleh kosong`
        );
      }
    }

    if (
      body.harga_sewa_per_hari !== undefined &&
      (
        !Number.isInteger(body.harga_sewa_per_hari) ||
        body.harga_sewa_per_hari < 0
      )
    ) {
      return fail(
        res,
        400,
        'Harga sewa harus bilangan bulat >= 0'
      );
    }

    const kondisiValid = [
      'baik',
      'perawatan',
      'rusak'
    ];

    if (
      body.kondisi !== undefined &&
      !kondisiValid.includes(body.kondisi)
    ) {
      return fail(
        res,
        400,
        'Kondisi kebaya tidak valid'
      );
    }

    const updated = await kebayaModel.updateKebaya(
      id,
      body
    );

    return success(
      res,
      200,
      'Kebaya berhasil diperbarui',
      updated
    );
  } catch (error) {
    console.error('[updateKebaya]', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(res, 409, 'Kode kebaya sudah digunakan');
    }

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// DELETE kebaya
const deleteKebaya = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID kebaya tidak valid');
    }

    const deleted = await kebayaModel.deleteKebaya(id);

    if (!deleted) {
      return fail(res, 404, 'Kebaya tidak ditemukan');
    }

    return success(
      res,
      200,
      'Kebaya berhasil dihapus'
    );
  } catch (error) {
    console.error('[deleteKebaya]', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(
        res,
        409,
        'Kebaya tidak dapat dihapus karena sudah memiliki riwayat penyewaan'
      );
    }

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

module.exports = {
  getAllKebaya,
  getKebayaById,
  createKebaya,
  updateKebaya,
  deleteKebaya
};