import { useEffect, useState } from "react";

import { getLaporanPendapatan } from "../../services/api";

import type { LaporanPendapatan } from "../../services/api";

import BackButton from "../../components/BackButton";

export default function LaporanPendapatanPage() {
  const [data, setData] = useState<LaporanPendapatan | null>(null);

  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getLaporanPendapatan(dari, sampai);

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil laporan pendapatan",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="feature-container">
      <BackButton to="/owner" />
      <h1>Laporan Pendapatan</h1>

      <p>Ringkasan pendapatan usaha penyewaan kebaya.</p>

      <div className="feature-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Dari Tanggal</label>

            <input
              type="date"
              value={dari}
              onChange={(e) => setDari(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Sampai Tanggal</label>

            <input
              type="date"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
            />
          </div>
        </div>

        <button className="button-primary" onClick={() => void loadReport()}>
          Tampilkan Pendapatan
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p>Memuat laporan pendapatan...</p>
      ) : (
        data && (
          <div className="statistics report-statistics">
            <div className="stat-card">
              <span>Total Transaksi</span>
              <h2>{data.total_transaksi || 0}</h2>
              <p>Seluruh transaksi pada periode</p>
            </div>

            <div className="stat-card">
              <span>Pendapatan Terverifikasi</span>

              <h2>{formatRupiah(data.total_pendapatan)}</h2>

              <p>Pembayaran yang sudah disetujui</p>
            </div>

            <div className="stat-card">
              <span>Menunggu Verifikasi</span>

              <h2>{formatRupiah(data.total_menunggu_verifikasi)}</h2>

              <p>Belum masuk pendapatan terverifikasi</p>
            </div>

            <div className="stat-card">
              <span>Total Denda Tercatat</span>

              <h2>{formatRupiah(data.total_denda_tercatat)}</h2>

              <p>Dicatat terpisah dari pendapatan pembayaran</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
