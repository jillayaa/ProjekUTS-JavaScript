const { dbAll, dbGet } = require("../middlewares_helpers/sqlite3_helpers");

// Laporan seluruh transaksi dengan filter tanggal
const findLaporanTransaksi = async (dari, sampai) => {
  let query = `
    SELECT
      p.id,
      p.tanggal_sewa,
      p.tanggal_kembali,
      p.tanggal_pengembalian_aktual,
      p.durasi_hari,
      p.total_harga,
      p.denda,
      p.status,
      p.status_pembayaran,
      pl.nama AS nama_pelanggan,
      k.kode_kebaya,
      k.nama_model

    FROM penyewaan p

    JOIN pelanggan pl ON p.pelanggan_id = pl.id
    JOIN kebaya k ON p.kebaya_id = k.id

    WHERE 1 = 1
  `;

  const params = [];

  if (dari) {
    query += " AND DATE(p.created_at) >= DATE(?)";
    params.push(dari);
  }

  if (sampai) {
    query += " AND DATE(p.created_at) <= DATE(?)";
    params.push(sampai);
  }

  query += " ORDER BY p.created_at DESC";

  return dbAll(query, params);
};

// Laporan pendapatan
const findLaporanPendapatan = async (dari, sampai) => {
  let dateFilter = "";
  const params = [];

  if (dari) {
    dateFilter += " AND DATE(created_at) >= DATE(?)";
    params.push(dari);
  }

  if (sampai) {
    dateFilter += " AND DATE(created_at) <= DATE(?)";
    params.push(sampai);
  }

  const query = `
    SELECT
      COUNT(*) AS total_transaksi,

      SUM(
        CASE
          WHEN status_pembayaran = 'terverifikasi'
          THEN total_harga
          ELSE 0
        END
      ) AS total_pendapatan,

      SUM(
        CASE
          WHEN status_pembayaran = 'menunggu_verifikasi'
          THEN total_harga
          ELSE 0
        END
      ) AS total_menunggu_verifikasi,

      SUM(denda) AS total_denda_tercatat

    FROM penyewaan

    WHERE 1 = 1
      ${dateFilter}
  `;

  return dbGet(query, params);
};

module.exports = {
  findLaporanTransaksi,
  findLaporanPendapatan,
};
