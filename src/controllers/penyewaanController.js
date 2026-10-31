const penyewaanModel = require('../models/penyewaanModel');

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

// Validasi format tanggal YYYY-MM-DD
const validDate = (date) => {
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// GET semua penyewaan
const getAllPenyewaan = async (req, res) => {
  try {
    const data = await penyewaanModel.findAllPenyewaan();

    return success(
      res,
      200,
      'Berhasil mengambil data penyewaan',
      data
    );
  } catch (error) {
    console.error('[getAllPenyewaan]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// GET penyewaan berdasarkan ID
const getPenyewaanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    const data = await penyewaanModel.findPenyewaanById(id);

    if (!data) {
      return fail(res, 404, 'Penyewaan tidak ditemukan');
    }

    return success(
      res,
      200,
      'Berhasil mengambil detail penyewaan',
      data
    );
  } catch (error) {
    console.error('[getPenyewaanById]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// POST membuat penyewaan baru
const createPenyewaan = async (req, res) => {
  try {
    const {
      pelanggan_id,
      kebaya_id,
      tanggal_sewa,
      tanggal_kembali
    } = req.body;

    // Validasi ID pelanggan
    if (
      !Number.isSafeInteger(pelanggan_id) ||
      pelanggan_id <= 0
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'pelanggan_id harus berupa bilangan bulat positif'
      );
    }

    // Validasi ID kebaya
    if (
      !Number.isSafeInteger(kebaya_id) ||
      kebaya_id <= 0
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'kebaya_id harus berupa bilangan bulat positif'
      );
    }

    // Validasi tanggal sewa
    if (!validDate(tanggal_sewa)) {
      return fail(
        res,
        400,
        'Tanggal sewa harus menggunakan format YYYY-MM-DD dan merupakan tanggal yang valid'
      );
    }

    // Validasi tanggal kembali
    if (!validDate(tanggal_kembali)) {
      return fail(
        res,
        400,
        'Tanggal kembali harus menggunakan format YYYY-MM-DD dan merupakan tanggal yang valid'
      );
    }

    // Tanggal kembali tidak boleh sebelum tanggal sewa
    if (tanggal_kembali < tanggal_sewa) {
      return fail(
        res,
        400,
        'Tanggal kembali tidak boleh lebih awal dari tanggal sewa'
      );
    }

    const created = await penyewaanModel.createPenyewaan({
      pelanggan_id,
      kebaya_id,
      tanggal_sewa,
      tanggal_kembali
    });

    // Penanganan hasil model
    if (created.error === 'PELANGGAN_NOT_FOUND') {
      return fail(
        res,
        404,
        'Pelanggan tidak ditemukan'
      );
    }

    if (created.error === 'KEBAYA_NOT_FOUND') {
      return fail(
        res,
        404,
        'Kebaya tidak ditemukan'
      );
    }

    if (created.error === 'KEBAYA_NOT_RENTABLE') {
      return fail(
        res,
        409,
        'Kebaya sedang dalam perawatan atau rusak'
      );
    }

    if (created.error === 'KEBAYA_UNAVAILABLE') {
      return fail(
        res,
        409,
        'Kebaya tidak tersedia pada tanggal yang dipilih'
      );
    }

    return success(
      res,
      201,
      'Penyewaan berhasil dibuat',
      created
    );
  } catch (error) {
    console.error('[createPenyewaan]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

// PATCH memperbarui status penyewaan
const updateStatusPenyewaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    const statusValid = [
      'dipesan',
      'disewa',
      'dikembalikan',
      'dibatalkan'
    ];

    if (!statusValid.includes(status)) {
      return fail(
        res,
        400,
        'Status harus dipesan, disewa, dikembalikan, atau dibatalkan'
      );
    }

    const existing = await penyewaanModel.findPenyewaanById(id);

    if (!existing) {
      return fail(res, 404, 'Penyewaan tidak ditemukan');
    }

    // Aturan perubahan status
    const alurStatus = {
      dipesan: ['disewa', 'dibatalkan'],
      disewa: ['dikembalikan'],
      dikembalikan: [],
      dibatalkan: []
    };

    if (!alurStatus[existing.status].includes(status)) {
      return fail(
        res,
        409,
        `Status tidak dapat diubah dari ${existing.status} menjadi ${status}`
      );
    }

    const updated = await penyewaanModel.updateStatusPenyewaan(
      id,
      status,
      existing.status
    );

    if (!updated) {
      return fail(
        res,
        409,
        'Status penyewaan telah berubah. Silakan periksa kembali data.'
      );
    }

    return success(
      res,
      200,
      'Status penyewaan berhasil diperbarui',
      updated
    );
  } catch (error) {
    console.error('[updateStatusPenyewaan]', error);

    return fail(res, 500, 'Terjadi kesalahan pada server');
  }
};

module.exports = {
  getAllPenyewaan,
  getPenyewaanById,
  createPenyewaan,
  updateStatusPenyewaan
};