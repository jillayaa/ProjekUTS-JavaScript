import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { getAllKebaya } from '../services/api';

import type { Kebaya } from '../types/kebaya';

export default function KatalogPage() {

  const [data, setData] = useState<Kebaya[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {

    const load = async () => {

      try {

        setError('');

        const result = await getAllKebaya();

        setData(result.filter(
          item => item.kondisi === 'baik'
        ));

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil katalog'
        );

      } finally {
        setLoading(false);
      }
    };

    void load();

  }, []);

  const formatRupiah = (harga: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(harga);

  return (
    <div className="catalog-page">

      <header className="catalog-header">
        <h2>SewaKebaya</h2>

        <Link to="/customer">
          Kembali ke Dashboard
        </Link>
      </header>

      <main className="catalog-container">

        <h1>Katalog Kebaya</h1>

        <p>
          Pilih model kebaya sesuai kebutuhan acara kamu.
        </p>

        {loading && <p>Memuat katalog...</p>}

        {error && <div className="alert error">{error}</div>}

        {!loading && !error && data.length === 0 && (
          <p>Belum ada kebaya yang tersedia dalam kondisi baik.</p>
        )}

        <div className="catalog-grid">

          {data.map((item) => (

            <article
              key={item.id}
              className="catalog-card"
            >

              <div className="catalog-placeholder">
                ♧
              </div>

              <div className="catalog-card-content">

                <span>{item.kode_kebaya}</span>

                <h3>{item.nama_model}</h3>

                <p>
                  Ukuran {item.ukuran} · {item.warna}
                </p>

                <strong>
                  {formatRupiah(item.harga_sewa_per_hari)}
                  <small> / hari</small>
                </strong>

              </div>

            </article>

          ))}

        </div>

      </main>

    </div>
  );
}