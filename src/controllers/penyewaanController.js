const penyewaanModel = require('../models/penyewaanModel');
const path = require('path');
const fs = require('fs');

const {
  uploadDir
} = require('../middlewares_helpers/uploadMiddleware');

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
      kebaya_id,
      tanggal_sewa,
      tanggal_kembali
    } = req.body;

    if (!Number.isSafeInteger(kebaya_id) || kebaya_id <= 0) {
      return fail(res, 400, 'ID kebaya tidak valid');
    }

    if (!validDate(tanggal_sewa) || !validDate(tanggal_kembali)) {
      return fail(
        res,
        400,
        'Format tanggal harus YYYY-MM-DD dan merupakan tanggal valid'
      );
    }

    if (tanggal_kembali < tanggal_sewa) {
      return fail(
        res,
        400,
        'Tanggal kembali tidak boleh sebelum tanggal sewa'
      );
    }

    const created = await penyewaanModel.createPenyewaan({
      user_id: req.user.id,
      kebaya_id,
      tanggal_sewa,
      tanggal_kembali
    });

    if (created.error === 'PELANGGAN_NOT_FOUND') {
      return fail(res, 404, 'Profil pelanggan tidak ditemukan');
    }

    if (created.error === 'KEBAYA_NOT_FOUND') {
      return fail(res, 404, 'Kebaya tidak ditemukan');
    }

    if (created.error === 'KEBAYA_NOT_RENTABLE') {
      return fail(res, 409, 'Kebaya tidak dalam kondisi baik');
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
      'Pesanan penyewaan berhasil dibuat',
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

// GET transaksi milik Customer yang sedang login
const getMyPenyewaan = async (req, res) => {
  try {
    const data = await penyewaanModel.findPenyewaanByUserId(
      req.user.id
    );

    return success(
      res,
      200,
      'Berhasil mengambil riwayat penyewaan',
      data
    );

  } catch (error) {
    console.error('[getMyPenyewaan]', error);

    return fail(res, 500, 'Gagal mengambil riwayat penyewaan');
  }
};

const uploadPaymentProof = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    if (!req.file) {
      return fail(res, 400, 'File bukti pembayaran wajib diunggah');
    }

    const existing = await penyewaanModel.findPenyewaanById(id);

    if (!existing || existing.user_id !== req.user.id) {
      fs.unlink(
        req.file.path,
        () => {}
      );

      return fail(res, 404, 'Penyewaan tidak ditemukan');
    }

    const updated = await penyewaanModel.uploadBuktiBayar(
      id,
      existing.pelanggan_id,
      req.file.filename
    );

    if (!updated) {
      fs.unlink(req.file.path, () => {});

      return fail(
        res,
        409,
        'Pesanan tidak dapat menerima bukti pembayaran pada status saat ini'
      );
    }

    // Hapus bukti lama setelah file pengganti berhasil disimpan
    if (
      existing.bukti_bayar &&
      existing.bukti_bayar !== req.file.filename
    ) {
      const oldPath = path.join(
        uploadDir,
        path.basename(existing.bukti_bayar)
      );

      fs.unlink(oldPath, () => {});
    }

    return success(
      res,
      200,
      'Bukti pembayaran berhasil diunggah',
      updated
    );

  } catch (error) {
    console.error('[uploadPaymentProof]', error);

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    return fail(res, 500, 'Gagal mengunggah bukti pembayaran');
  }
};

const verifyPayment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { keputusan, catatan } = req.body;

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    if (!['terima', 'tolak'].includes(keputusan)) {
      return fail(
        res,
        400,
        'Keputusan harus terima atau tolak'
      );
    }

    if (
      catatan !== undefined &&
      typeof catatan !== 'string'
    ) {
      return fail(res, 400, 'Catatan verifikasi tidak valid');
    }

    const existing = await penyewaanModel.findPenyewaanById(id);

    if (!existing) {
      return fail(res, 404, 'Penyewaan tidak ditemukan');
    }

    if (existing.status_pembayaran !== 'menunggu_verifikasi') {
      return fail(res, 409, 'Pembayaran belum siap diverifikasi');
    }

    if (!existing.bukti_bayar) {
      return fail(res, 409, 'Bukti pembayaran belum tersedia');
    }

    const updated = await penyewaanModel.verifyPayment(
      id,
      keputusan,
      catatan,
      req.user.id
    );

    if (!updated) {
      return fail(res, 409, 'Status pembayaran telah berubah');
    }

    return success(
      res,
      200,
      keputusan === 'terima'
        ? 'Pembayaran berhasil diverifikasi'
        : 'Pembayaran ditolak',
      updated
    );

  } catch (error) {
    console.error('[verifyPayment]', error);

    return fail(res, 500, 'Gagal memverifikasi pembayaran');
  }
};

const startPenyewaan = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    const updated = await penyewaanModel.startPenyewaan(id);

    if (!updated) {
      return fail(
        res,
        409,
        'Penyewaan belum dibayar atau belum dapat dimulai'
      );
    }

    return success(
      res,
      200,
      'Penyewaan berhasil dimulai',
      updated
    );

  } catch (error) {
    console.error('[startPenyewaan]', error);

    return fail(res, 500, 'Gagal memulai penyewaan');
  }
};

const recordReturn = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      tanggal_pengembalian_aktual,
      kondisi_pengembalian,
      catatan_pengembalian
    } = req.body;

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    if (!validDate(tanggal_pengembalian_aktual)) {
      return fail(
        res,
        400,
        'Tanggal pengembalian harus valid dengan format YYYY-MM-DD'
      );
    }

    if (!['baik', 'rusak'].includes(kondisi_pengembalian)) {
      return fail(
        res,
        400,
        'Kondisi pengembalian harus baik atau rusak'
      );
    }

    const existing = await penyewaanModel.findPenyewaanById(id);

    if (!existing) {
      return fail(res, 404, 'Penyewaan tidak ditemukan');
    }

    if (existing.status !== 'disewa') {
      return fail(
        res,
        409,
        'Hanya kebaya yang sedang disewa yang dapat dikembalikan'
      );
    }

    if (
      tanggal_pengembalian_aktual < existing.tanggal_sewa
    ) {
      return fail(
        res,
        400,
        'Tanggal pengembalian tidak boleh sebelum tanggal sewa'
      );
    }

    const oneDay = 24 * 60 * 60 * 1000;

    const scheduled = new Date(
      `${existing.tanggal_kembali}T00:00:00.000Z`
    );

    const actual = new Date(
      `${tanggal_pengembalian_aktual}T00:00:00.000Z`
    );

    const lateDays = Math.max(
      0,
      Math.floor((actual - scheduled) / oneDay)
    );

    const finePerDay = Number(
      process.env.DENDA_PER_HARI || 25000
    );

    if (!Number.isSafeInteger(finePerDay) || finePerDay < 0) {
      return fail(res, 500, 'Konfigurasi denda tidak valid');
    }

    const denda = lateDays * finePerDay;

    const updated = await penyewaanModel.recordReturn(
      id,
      tanggal_pengembalian_aktual,
      kondisi_pengembalian,
      denda,
      catatan_pengembalian
    );

    if (!updated) {
      return fail(res, 409, 'Pengembalian sudah diproses');
    }

    return success(
      res,
      200,
      'Pengembalian kebaya berhasil dicatat',
      {
        ...updated,
        hari_terlambat: lateDays,
        denda_per_hari: finePerDay
      }
    );

  } catch (error) {
    console.error('[recordReturn]', error);

    return fail(res, 500, 'Gagal mencatat pengembalian');
  }
};

const getPaymentProof = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validId(id)) {
      return fail(res, 400, 'ID penyewaan tidak valid');
    }

    const data = await penyewaanModel.findPenyewaanById(id);

    if (!data || !data.bukti_bayar) {
      return fail(res, 404, 'Bukti pembayaran tidak ditemukan');
    }

    if (
      req.user.role === 'customer' &&
      data.user_id !== req.user.id
    ) {
      return fail(res, 403, 'Tidak memiliki akses');
    }

    const filePath = path.join(
      uploadDir,
      path.basename(data.bukti_bayar)
    );

    if (!fs.existsSync(filePath)) {
      return fail(res, 404, 'File bukti pembayaran tidak ditemukan');
    }

    return res.sendFile(filePath);

  } catch (error) {
    console.error('[getPaymentProof]', error);

    return fail(res, 500, 'Gagal mengambil bukti pembayaran');
  }
};

module.exports = {
  getAllPenyewaan,
  getPenyewaanById,
  getMyPenyewaan,
  createPenyewaan,
  uploadPaymentProof,
  verifyPayment,
  startPenyewaan,
  recordReturn,
  getPaymentProof
};