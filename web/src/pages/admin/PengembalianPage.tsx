import { useEffect, useState } from "react";

import { getAllPenyewaan, returnPenyewaan } from "../../services/api";

import type { Penyewaan } from "../../services/api";

import BackButton from "../../components/BackButton";

function todayLocal() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function PengembalianPage() {
  const [data, setData] = useState<Penyewaan[]>([]);

  const [dates, setDates] = useState<Record<number, string>>({});
  const [conditions, setConditions] = useState<
    Record<number, "baik" | "rusak">
  >({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const result = await getAllPenyewaan();
      setData(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil data");
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

  const handleReturn = async (item: Penyewaan) => {
    try {
      const actualDate = dates[item.id] || todayLocal();

      if (actualDate < item.tanggal_sewa) {
        alert("Tanggal pengembalian tidak valid.");
        return;
      }

      if (!window.confirm(`Catat pengembalian transaksi #${item.id}?`)) {
        return;
      }

      setProcessingId(item.id);

      const result = await returnPenyewaan(item.id, {
        tanggal_pengembalian_aktual: actualDate,
        kondisi_pengembalian: conditions[item.id] || "baik",
        catatan_pengembalian: notes[item.id] || "",
      });

      alert(
        `Pengembalian berhasil dicatat.\nDenda: ${formatRupiah(result.denda)}`,
      );

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal mencatat pengembalian",
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p>Memuat data pengembalian...</p>;

  const activeRentals = data.filter((item) => item.status === "disewa");

  return (
    <div className="feature-container">
      <BackButton to="/admin" />
      <h1>Pengembalian Kebaya</h1>

      <p>Catat tanggal pengembalian dan kondisi fisik kebaya.</p>

      {activeRentals.length === 0 && (
        <div className="feature-card">Tidak ada kebaya yang sedang disewa.</div>
      )}

      {activeRentals.map((item) => (
        <div className="feature-card" key={item.id}>
          <h3>Transaksi #{item.id}</h3>

          <div className="rental-details">
            <p>Customer: {item.nama_pelanggan}</p>
            <p>Kebaya: {item.nama_model}</p>
            <p>Kode: {item.kode_kebaya}</p>
            <p>Jadwal kembali: {item.tanggal_kembali}</p>
          </div>

          <div className="form-group">
            <label>Tanggal Pengembalian Aktual</label>

            <input
              type="date"
              min={item.tanggal_sewa}
              value={dates[item.id] || todayLocal()}
              onChange={(e) => {
                setDates((previous) => ({
                  ...previous,
                  [item.id]: e.target.value,
                }));
              }}
            />
          </div>

          <div className="form-group">
            <label>Kondisi Kebaya</label>

            <select
              value={conditions[item.id] || "baik"}
              onChange={(e) => {
                setConditions((previous) => ({
                  ...previous,
                  [item.id]: e.target.value as "baik" | "rusak",
                }));
              }}
            >
              <option value="baik">Baik</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>

          <div className="form-group">
            <label>Catatan Pengembalian</label>

            <textarea
              rows={3}
              value={notes[item.id] || ""}
              placeholder="Catatan kondisi kebaya..."
              onChange={(e) => {
                setNotes((previous) => ({
                  ...previous,
                  [item.id]: e.target.value,
                }));
              }}
            />
          </div>

          <button
            className="button-primary"
            disabled={processingId === item.id}
            onClick={() => void handleReturn(item)}
          >
            {processingId === item.id
              ? "Memproses..."
              : "Konfirmasi Pengembalian"}
          </button>
        </div>
      ))}
    </div>
  );
}
