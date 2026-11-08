import { useEffect, useState } from "react";

import { getAllKebaya } from "../services/api";
import type { Kebaya } from "../types/kebaya";

import BackButton from "../components/BackButton";

export default function KatalogPage() {
  const [data, setData] = useState<Kebaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gambar berdasarkan kode kebaya
  const getKebayaImage = (kode: string) => {
    const images: Record<string, string> = {
      "KB-0725": "/images/kebaya/KB-0725.jpg",
      "KB-001": "/images/kebaya/KB-001.jpg",
    };

    return images[kode] || "/images/kebaya/default-kebaya.jpg";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        const result = await getAllKebaya();

        setData(result.filter((item) => item.kondisi === "baik"));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil katalog",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const formatRupiah = (harga: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(harga);

  return (
    <div className="catalog-page">
      {/* HEADER */}
      <header className="catalog-header">
        <h2>SewaKebaya</h2>
      </header>

      <main className="catalog-container">
        {/* TOMBOL KEMBALI */}
        <BackButton to="/customer" />

        {/* JUDUL */}
        <div className="catalog-heading">
          <h1>Katalog Kebaya</h1>
          <p>Pilih model kebaya sesuai kebutuhan acara kamu.</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="catalog-message">Memuat katalog kebaya...</div>
        )}

        {/* ERROR */}
        {error && <div className="alert error">{error}</div>}

        {/* DATA KOSONG */}
        {!loading && !error && data.length === 0 && (
          <div className="catalog-empty">
            <h3>Belum Ada Kebaya Tersedia</h3>
            <p>Belum ada kebaya yang tersedia dalam kondisi baik.</p>
          </div>
        )}

        {/* KATALOG */}
        {!loading && !error && data.length > 0 && (
          <div className="catalog-grid">
            {data.map((item) => (
              <article key={item.id} className="catalog-card">
                {/* FOTO KEBAYA */}
                <div className="catalog-image">
                  <span className="catalog-image-fallback">♧</span>

                  <img
                    src={getKebayaImage(item.kode_kebaya)}
                    alt={`Foto ${item.nama_model}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                {/* INFORMASI KEBAYA */}
                <div className="catalog-card-content">
                  <span className="catalog-code">{item.kode_kebaya}</span>

                  <h3>{item.nama_model}</h3>

                  <p className="catalog-details">
                    Ukuran {item.ukuran} · {item.warna}
                  </p>

                  <strong className="catalog-price">
                    {formatRupiah(item.harga_sewa_per_hari)}
                    <small> / hari</small>
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
