import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getAllKebaya, createPenyewaan } from "../../services/api";
import type { Kebaya } from "../../types/kebaya";

export default function PesananPage() {
  const navigate = useNavigate();

  const [kebayas, setKebayas] = useState<Kebaya[]>([]);
  const [kebayaId, setKebayaId] = useState("");
  const [tanggalSewa, setTanggalSewa] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllKebaya();

        setKebayas(data.filter((item) => item.kondisi === "baik"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil kebaya");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const selectedKebaya = kebayas.find((item) => String(item.id) === kebayaId);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const getDuration = () => {
    if (!tanggalSewa || !tanggalKembali) return 0;

    const start = new Date(`${tanggalSewa}T00:00:00`);
    const end = new Date(`${tanggalKembali}T00:00:00`);

    const diff = end.getTime() - start.getTime();

    return diff >= 0 ? Math.floor(diff / 86400000) + 1 : 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!kebayaId || !tanggalSewa || !tanggalKembali) {
        throw new Error("Lengkapi seluruh informasi pesanan");
      }

      if (tanggalSewa < new Date().toLocaleDateString("en-CA")) {
        throw new Error("Tanggal sewa tidak boleh di masa lalu");
      }

      if (tanggalKembali < tanggalSewa) {
        throw new Error("Tanggal kembali tidak boleh sebelum tanggal sewa");
      }

      await createPenyewaan({
        kebaya_id: Number(kebayaId),
        tanggal_sewa: tanggalSewa,
        tanggal_kembali: tanggalKembali,
      });

      alert("Pesanan berhasil dibuat. Silakan unggah bukti pembayaran.");

      navigate("/customer/status");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="feature-container">
      <h1>Buat Pesanan Penyewaan</h1>
      <p>Pilih kebaya dan tentukan tanggal penyewaan.</p>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p>Memuat katalog...</p>
      ) : (
        <form className="feature-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pilih Kebaya</label>

            <select
              value={kebayaId}
              onChange={(e) => setKebayaId(e.target.value)}
              required
            >
              <option value="">Pilih kebaya</option>

              {kebayas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode_kebaya} - {item.nama_model}
                  {" | "}
                  {item.ukuran} - {item.warna}
                  {" | "}
                  {formatRupiah(item.harga_sewa_per_hari)}/hari
                </option>
              ))}
            </select>
          </div>

          {selectedKebaya && (
            <div className="selected-info">
              <strong>{selectedKebaya.nama_model}</strong>

              <p>Ukuran: {selectedKebaya.ukuran}</p>
              <p>Warna: {selectedKebaya.warna}</p>
              <p>
                Harga per hari:{" "}
                {formatRupiah(selectedKebaya.harga_sewa_per_hari)}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Tanggal Sewa</label>

            <input
              type="date"
              value={tanggalSewa}
              min={new Date().toLocaleDateString("en-CA")}
              onChange={(e) => setTanggalSewa(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Pengembalian</label>

            <input
              type="date"
              value={tanggalKembali}
              min={tanggalSewa || new Date().toLocaleDateString("en-CA")}
              onChange={(e) => setTanggalKembali(e.target.value)}
              required
            />
          </div>

          {selectedKebaya && getDuration() > 0 && (
            <div className="selected-info">
              <p>Durasi: {getDuration()} hari</p>

              <strong>
                Estimasi total:{" "}
                {formatRupiah(
                  getDuration() * selectedKebaya.harga_sewa_per_hari,
                )}
              </strong>

              <small>Harga final ditentukan kembali oleh server.</small>
            </div>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={saving || kebayas.length === 0}
          >
            {saving ? "Memproses..." : "Buat Pesanan"}
          </button>
        </form>
      )}
    </div>
  );
}
