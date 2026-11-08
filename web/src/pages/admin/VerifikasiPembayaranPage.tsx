import { useEffect, useState } from "react";

import {
  getAllPenyewaan,
  verifyPayment,
  startPenyewaan,
  getBuktiBayarBlob,
} from "../../services/api";

import type { Penyewaan } from "../../services/api";

import BackButton from "../../components/BackButton";

export default function VerifikasiPembayaranPage() {
  const [data, setData] = useState<Penyewaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const result = await getAllPenyewaan();
      setData(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat transaksi");
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

  const openProof = async (id: number) => {
    try {
      const blob = await getBuktiBayarBlob(id);

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuka bukti");
    }
  };

  const handleVerify = async (
    item: Penyewaan,
    decision: "terima" | "tolak",
  ) => {
    try {
      const note = window.prompt(
        decision === "terima"
          ? "Catatan verifikasi (boleh dikosongkan):"
          : "Alasan penolakan pembayaran:",
      );

      if (note === null) return;

      if (decision === "tolak" && !note.trim()) {
        alert("Alasan penolakan wajib diisi.");
        return;
      }

      setProcessingId(item.id);

      await verifyPayment(item.id, decision, note.trim());

      alert(
        decision === "terima"
          ? "Pembayaran berhasil diverifikasi."
          : "Pembayaran telah ditolak.",
      );

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verifikasi gagal");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStart = async (id: number) => {
    if (!window.confirm("Mulai proses penyewaan kebaya ini?")) return;

    try {
      setProcessingId(id);

      await startPenyewaan(id);

      alert("Status penyewaan berhasil diubah menjadi disewa.");

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memulai sewa");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p>Memuat transaksi...</p>;

  return (
    <div className="feature-container">
      <BackButton to="/admin" />
      <h1>Verifikasi Pembayaran</h1>

      <p>Periksa bukti pembayaran yang diunggah Customer.</p>

      {error && <div className="alert error">{error}</div>}

      {data.map((item) => (
        <div className="feature-card" key={item.id}>
          <div className="section-heading">
            <div>
              <h3>Transaksi #{item.id}</h3>
              <p>
                {item.nama_pelanggan} — {item.nama_model}
              </p>
            </div>

            <strong>{formatRupiah(item.total_harga)}</strong>
          </div>

          <p>
            Status pembayaran: <strong>{item.status_pembayaran}</strong>
          </p>

          {item.status_pembayaran === "menunggu_verifikasi" && (
            <div className="action-row">
              <button
                className="button-secondary"
                onClick={() => void openProof(item.id)}
              >
                Lihat Bukti Pembayaran
              </button>

              <button
                className="button-primary"
                disabled={processingId === item.id}
                onClick={() => void handleVerify(item, "terima")}
              >
                Terima
              </button>

              <button
                className="button-danger"
                disabled={processingId === item.id}
                onClick={() => void handleVerify(item, "tolak")}
              >
                Tolak
              </button>
            </div>
          )}

          {item.status_pembayaran === "terverifikasi" &&
            item.status === "dipesan" && (
              <button
                className="button-primary"
                disabled={processingId === item.id}
                onClick={() => void handleStart(item.id)}
              >
                Mulai Penyewaan
              </button>
            )}
        </div>
      ))}

      {data.length === 0 && (
        <div className="feature-card">Belum ada transaksi.</div>
      )}
    </div>
  );
}
