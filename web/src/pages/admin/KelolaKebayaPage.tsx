import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { getAllKebaya, createKebaya } from "../../services/api";

import type { Kebaya, KebayaForm, KondisiKebaya } from "../../types/kebaya";

import "../../App.css";

// Form kosong awal
const initialForm: KebayaForm = {
  kode_kebaya: "",
  nama_model: "",
  ukuran: "",
  warna: "",
  harga_sewa_per_hari: 0,
  kondisi: "baik",
  keterangan: "",
};

function KelolaKebayaPage() {

  const navigate = useNavigate();

  const [kebayas, setKebayas] = useState<Kebaya[]>([]);

  const [form, setForm] = useState<KebayaForm>(initialForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  // Mengambil data kebaya dari API
  const loadKebaya = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllKebaya();

      setKebayas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data kebaya",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // GET dijalankan ketika halaman pertama dibuka
  useEffect(() => {
    void loadKebaya();
  }, [loadKebaya]);

  // Mengatur perubahan input form
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "harga_sewa_per_hari" ? Number(value) : value,
    }));
  };

  // Mengirim data ke API
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setNotice("");

      if (
        !Number.isInteger(form.harga_sewa_per_hari) ||
        form.harga_sewa_per_hari < 0
      ) {
        setError("Harga sewa harus berupa angka bulat >= 0");
        return;
      }

      const payload: KebayaForm = {
        ...form,
        kode_kebaya: form.kode_kebaya.trim(),
        nama_model: form.nama_model.trim(),
        ukuran: form.ukuran.trim(),
        warna: form.warna.trim(),
        keterangan: form.keterangan?.trim() || null,
      };

      await createKebaya(payload);

      setForm(initialForm);

      setNotice("Kebaya berhasil ditambahkan");

      // Mengambil ulang data dari database melalui GET
      await loadKebaya();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan kebaya");
    } finally {
      setSaving(false);
    }
  };

  // Format harga rupiah
  const formatRupiah = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(harga);
  };

  // Tampilan kondisi kebaya
  const kondisiLabel: Record<KondisiKebaya, string> = {
    baik: "Baik",
    perawatan: "Perawatan",
    rusak: "Rusak",
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">SK</div>

          <div>
            <h2>SewaKebaya</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="sidebar-footer">
          Sistem Informasi Penyewaan Kebaya
          <small>Project PBAD 2026/2027</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate(-1)}
            >
              ← Kembali
            </button>

            <h1>Data Kebaya</h1>
            <p>Kelola koleksi kebaya yang tersedia untuk disewakan.</p>
          </div>
        </header>

        {/* NOTIFICATION */}
        {error && <div className="alert error">{error}</div>}

        {notice && <div className="alert success">{notice}</div>}

        {/* STATISTICS */}
        <section className="statistics">
          <div className="stat-card">
            <span>Total Kebaya</span>
            <h2>{kebayas.length}</h2>
            <p>Jumlah koleksi terdaftar</p>
          </div>

          <div className="stat-card">
            <span>Kondisi Baik</span>
            <h2>{kebayas.filter((item) => item.kondisi === "baik").length}</h2>
            <p>Kebaya dalam kondisi baik</p>
          </div>

          <div className="stat-card">
            <span>Perlu Perawatan</span>
            <h2>
              {kebayas.filter((item) => item.kondisi === "perawatan").length}
            </h2>
            <p>Kebaya yang perlu diperiksa</p>
          </div>
        </section>

        {/* FORM TAMBAH KEBAYA */}
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Tambah Kebaya</h2>
              <p>Masukkan informasi koleksi kebaya baru.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Kode Kebaya</label>

                <input
                  type="text"
                  name="kode_kebaya"
                  placeholder="Contoh: KB-001"
                  value={form.kode_kebaya}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nama Model</label>

                <input
                  type="text"
                  name="nama_model"
                  placeholder="Contoh: Kebaya Modern Pink"
                  value={form.nama_model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ukuran</label>

                <select
                  name="ukuran"
                  value={form.ukuran}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih ukuran</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Warna</label>

                <input
                  type="text"
                  name="warna"
                  placeholder="Contoh: Pink"
                  value={form.warna}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Harga Sewa Per Hari (Rp)</label>

                <input
                  type="number"
                  name="harga_sewa_per_hari"
                  min="0"
                  step="1"
                  placeholder="150000"
                  value={form.harga_sewa_per_hari}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kondisi Kebaya</label>

                <select
                  name="kondisi"
                  value={form.kondisi}
                  onChange={handleChange}
                >
                  <option value="baik">Baik</option>
                  <option value="perawatan">Perawatan</option>
                  <option value="rusak">Rusak</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Keterangan</label>

                <textarea
                  name="keterangan"
                  rows={3}
                  placeholder="Keterangan tambahan..."
                  value={form.keterangan ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setForm(initialForm)}
              >
                Reset
              </button>

              <button
                type="submit"
                className="button-primary"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "+ Simpan Kebaya"}
              </button>
            </div>
          </form>
        </section>

        {/* TABLE DATA KEBAYA */}
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Daftar Koleksi Kebaya</h2>
              <p>Data yang diambil langsung dari database melalui API.</p>
            </div>

            <button
              className="button-secondary"
              onClick={() => void loadKebaya()}
              disabled={loading}
            >
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Sedang mengambil data...</div>
          ) : kebayas.length === 0 ? (
            <div className="empty-state">
              Belum ada data kebaya. Silakan tambahkan kebaya baru.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Model</th>
                    <th>Ukuran</th>
                    <th>Warna</th>
                    <th>Harga / Hari</th>
                    <th>Kondisi</th>
                  </tr>
                </thead>

                <tbody>
                  {kebayas.map((item) => (
                    <tr key={item.id}>
                      <td className="code">{item.kode_kebaya}</td>

                      <td>{item.nama_model}</td>

                      <td>{item.ukuran}</td>

                      <td>{item.warna}</td>

                      <td>{formatRupiah(item.harga_sewa_per_hari)}</td>

                      <td>
                        <span className={`status status-${item.kondisi}`}>
                          {kondisiLabel[item.kondisi]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default KelolaKebayaPage;
