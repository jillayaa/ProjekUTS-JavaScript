import { useEffect, useState } from "react";

import { getLaporanTransaksi } from "../../services/api";

import type { Penyewaan } from "../../services/api";

import BackButton from "../../components/BackButton";

export default function LaporanTransaksiPage() {
  const [data, setData] = useState<Penyewaan[]>([]);

  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getLaporanTransaksi(dari, sampai);

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil laporan");
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
    }).format(value);

  return (
    <div className="feature-container">
      <BackButton to="/owner" />
      <h1>Laporan Transaksi</h1>

      <p>Owner dapat memantau seluruh transaksi penyewaan.</p>

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
          Tampilkan Laporan
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="feature-card">
        <h3>Data Transaksi</h3>

        {loading ? (
          <p>Memuat laporan...</p>
        ) : data.length === 0 ? (
          <p>Belum ada transaksi dalam periode ini.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Kebaya</th>
                  <th>Tanggal Sewa</th>
                  <th>Total</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.nama_pelanggan}</td>
                    <td>{item.nama_model}</td>
                    <td>{item.tanggal_sewa}</td>
                    <td>{formatRupiah(item.total_harga)}</td>
                    <td>{item.status_pembayaran}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
