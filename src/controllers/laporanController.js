const laporanModel = require("../models/laporanModel");

const success = (res, code, message, data = null) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};

const fail = (res, code, message) => {
  return res.status(code).json({
    success: false,
    message,
  });
};

const validDate = (date) => {
  if (!date) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// Laporan transaksi
const getLaporanTransaksi = async (req, res) => {
  try {
    const { dari, sampai } = req.query;

    if (!validDate(dari) || !validDate(sampai)) {
      return fail(res, 400, "Format tanggal harus YYYY-MM-DD");
    }

    if (dari && sampai && dari > sampai) {
      return fail(res, 400, "Tanggal awal tidak boleh melebihi tanggal akhir");
    }

    const data = await laporanModel.findLaporanTransaksi(dari, sampai);

    return success(res, 200, "Laporan transaksi berhasil diambil", data);
  } catch (error) {
    console.error("[getLaporanTransaksi]", error);

    return fail(res, 500, "Gagal mengambil laporan transaksi");
  }
};

// Laporan pendapatan
const getLaporanPendapatan = async (req, res) => {
  try {
    const { dari, sampai } = req.query;

    if (!validDate(dari) || !validDate(sampai)) {
      return fail(res, 400, "Format tanggal harus YYYY-MM-DD");
    }

    if (dari && sampai && dari > sampai) {
      return fail(res, 400, "Tanggal awal tidak boleh melebihi tanggal akhir");
    }

    const data = await laporanModel.findLaporanPendapatan(dari, sampai);

    return success(res, 200, "Laporan pendapatan berhasil diambil", data);
  } catch (error) {
    console.error("[getLaporanPendapatan]", error);

    return fail(res, 500, "Gagal mengambil laporan pendapatan");
  }
};

module.exports = {
  getLaporanTransaksi,
  getLaporanPendapatan,
};
