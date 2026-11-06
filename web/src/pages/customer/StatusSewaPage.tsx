import { useEffect, useState } from "react";

import { getMyPenyewaan, uploadBuktiBayar } from "../../services/api";

import type { Penyewaan } from "../../services/api";

export default function StatusSewaPage() {
  const [data, setData] = useState<Penyewaan[]>([]);

  const [files, setFiles] = useState<Record<number, File>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setError("");

      const result = await getMyPenyewaan();

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const handleUpload = async (id: number) => {
    try {
      const file = files[id];

      if (!file) {
        throw new Error("Silakan pilih bukti pembayaran");
      }

      setUploadingId(id);
      setError("");

      await uploadBuktiBayar(id, file);

      alert("Bukti pembayaran berhasil diunggah");

      setFiles((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingId(null);
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      dipesan: "Dipesan",
      disewa: "Sedang Disewa",
      dikembalikan: "Dikembalikan",
      dibatalkan: "Dibatalkan",
      belum_bayar: "Belum Bayar",
      menunggu_verifikasi: "Menunggu Verifikasi",
      terverifikasi: "Terverifikasi",
      ditolak: "Pembayaran Ditolak",
    };

    return labels[status] || status;
  };

  if (loading) {
    return <p>Memuat riwayat penyewaan...</p>;
  }

  return (
    <div className="feature-container">
      <h1>Status Penyewaan Saya</h1>

      <p>Pantau transaksi dan status pembayaran kebaya kamu.</p>

      {error && <div className="alert error">{error}</div>}

      {data.length === 0 && (
        <div className="feature-card">Belum ada pesanan penyewaan.</div>
      )}

      {data.map((item) => (
        <div className="feature-card rental-card" key={item.id}>
          <div className="section-heading">
            <div>
              <h3>{item.nama_model}</h3>
              <p>{item.kode_kebaya}</p>
            </div>

            <strong>{formatRupiah(item.total_harga)}</strong>
          </div>

          <div className="rental-details">
            <p>Ukuran: {item.ukuran}</p>
            <p>Warna: {item.warna}</p>
            <p>Tanggal sewa: {item.tanggal_sewa}</p>
            <p>Tanggal kembali: {item.tanggal_kembali}</p>
            <p>Status: {statusLabel(item.status)}</p>
            <p>Pembayaran: {statusLabel(item.status_pembayaran)}</p>
          </div>

          {item.catatan_verifikasi && (
            <div className="alert error">
              Catatan Admin: {item.catatan_verifikasi}
            </div>
          )}

          {(item.status_pembayaran === "belum_bayar" ||
            item.status_pembayaran === "ditolak") &&
            item.status === "dipesan" && (
              <div className="upload-area">
                <label>Unggah Bukti Pembayaran</label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setFiles((previous) => ({
                        ...previous,
                        [item.id]: file,
                      }));
                    }
                  }}
                />

                <button
                  className="button-primary"
                  disabled={uploadingId === item.id}
                  onClick={() => void handleUpload(item.id)}
                >
                  {uploadingId === item.id
                    ? "Mengunggah..."
                    : "Kirim Bukti Pembayaran"}
                </button>

                <small>Format JPG, PNG, atau WEBP maksimal 3 MB.</small>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
