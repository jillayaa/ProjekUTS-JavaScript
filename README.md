# Sistem Informasi Penyewaan Kebaya

Aplikasi web untuk mengelola proses penyewaan kebaya, mulai dari
pengelolaan koleksi kebaya, data pelanggan, transaksi penyewaan,
pembayaran, pengembalian, hingga laporan. Proyek ini memisahkan
**backend (Server API)** dan **frontend (Web)** dalam satu repository.

## Daftar Isi

1.  [Gambaran Umum](#gambaran-umum)
2.  [Teknologi](#teknologi)
3.  [Struktur Proyek](#struktur-proyek)
4.  [Fitur Aplikasi](#fitur-aplikasi)
5.  [Role Pengguna](#role-pengguna)
6.  [Endpoint Server API](#endpoint-server-api)
7.  [Persyaratan](#persyaratan)
8.  [Instalasi dan Menjalankan
    Proyek](#instalasi-dan-menjalankan-proyek)
9.  [Konfigurasi Frontend dan
    Backend](#konfigurasi-frontend-dan-backend)
10. [Database dan File Upload](#database-dan-file-upload)

---

## Gambaran Umum

**SewaKebaya Management System** merupakan aplikasi untuk membantu
pengelolaan usaha penyewaan kebaya secara terkomputerisasi.

Aplikasi terdiri dari dua bagian:

- **Server API** menangani autentikasi, akses database, pengelolaan
  data, transaksi, pembayaran, pengembalian, dan laporan.
- **Web** menyediakan antarmuka bagi Owner, Admin, dan Customer sesuai
  hak akses masing-masing.

Frontend berkomunikasi dengan backend melalui endpoint REST API dengan
prefix `/api`.

## Teknologi

### Backend / Server API

- Node.js
- Express.js
- SQLite
- `cors`
- `dotenv`
- Middleware autentikasi dan upload file

### Frontend / Web

- React
- TypeScript
- Vite
- React Router DOM
- CSS

Versi pasti package mengikuti `package.json` pada direktori backend dan
`web`.

## Struktur Proyek

```text
ProjekUTS-JavaScript/
├── src/                         # Backend / Server API
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── kebayaController.js
│   │   ├── laporanController.js
│   │   ├── pelangganController.js
│   │   ├── penyewaanController.js
│   │   └── productController.js
│   ├── middlewares_helpers/
│   │   ├── authMiddleware.js
│   │   ├── sqlite3_helpers.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── authModel.js
│   │   ├── kebayaModel.js
│   │   ├── laporanModel.js
│   │   ├── pelangganModel.js
│   │   ├── penyewaanModel.js
│   │   └── productModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── kebayaRoutes.js
│   │   ├── laporanRoutes.js
│   │   ├── pelangganRoutes.js
│   │   ├── penyewaanRoutes.js
│   │   ├── productRoutes.js
│   │   └── test.js
│   ├── script/
│   │   └── createStaffUser.js
│   └── sql_scripts/
│       └── init.sql
│
├── uploads/                     # File unggahan, termasuk bukti pembayaran
├── web/
├── public/
│   └── images/
│       └── kebaya/
│           ├── KB-0725.jpg
│           ├── KB-001.jpg
│           └── default-kebaya.jpg
│   ├── src/
│   │   ├── assets/
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── components/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppLayout.css
│   │   │   ├── BackButton.tsx
│   │   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── KelolaKebayaPage.tsx
│   │   │   │   ├── PengembalianPage.tsx
│   │   │   │   └── VerifikasiPembayaranPage.tsx
│   │   │   ├── customer/
│   │   │   │   ├── PesananPage.tsx
│   │   │   │   └── StatusSewaPage.tsx
│   │   │   ├── owner/
│   │   │   │   ├── LaporanPendapatanPage.tsx
│   │   │   │   └── LaporanTransaksiPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── KatalogPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   ├── kebaya.ts
│   │   │   └── user.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── server.js                    # Entry point backend
├── package.json                 # Dependencies backend
├── package-lock.json
├── database.sqlite              # Database SQLite lokal (jika sudah dibuat)
├── .env                         # Konfigurasi lingkungan lokal
└── README.md
```

Struktur ini merangkum file dan folder yang terlihat selama pengerjaan.
File dapat bertambah atau berubah mengikuti pengembangan berikutnya.

## Fitur Aplikasi

### 1. Autentikasi dan Hak Akses

- Login pengguna.
- Registrasi Customer.
- Mengambil informasi pengguna yang sedang login.
- Mengarahkan pengguna ke dashboard berdasarkan role.
- Membatasi akses halaman menggunakan `ProtectedRoute`.

### 2. Pengelolaan Data Kebaya

- Menampilkan koleksi kebaya.
- Menambahkan, memperbarui, dan menghapus data kebaya.
- Menyimpan kode kebaya, nama model, ukuran, warna, harga sewa per
  hari, kondisi, dan keterangan.
- Menampilkan ringkasan jumlah kebaya, kondisi baik, dan kebaya yang
  perlu perawatan.

### 3. Data Pelanggan

- Mengambil dan mengelola data pelanggan melalui Server API.
- Menyediakan endpoint untuk menambah, melihat, memperbarui, dan
  menghapus data pelanggan.

### 4. Transaksi Penyewaan

- Membuat transaksi penyewaan.
- Mengambil daftar dan detail transaksi.
- Mengambil transaksi milik Customer yang sedang login.
- Memeriksa jadwal agar tidak terjadi benturan tanggal.
- Perhitungan harga dan durasi penyewaan dilakukan pada sisi server.

### 5. Pembayaran

- Customer mengunggah bukti pembayaran.
- Admin memeriksa dan memverifikasi pembayaran.
- File bukti pembayaran ditangani melalui middleware upload.

### 6. Pengembalian dan Denda

- Admin mencatat pengembalian kebaya.
- Mengisi tanggal pengembalian aktual.
- Memilih kondisi kebaya saat dikembalikan (baik atau rusak).
- Menambahkan catatan pengembalian.
- Server API memproses pengembalian dan mengembalikan informasi denda.

### 7. Laporan

- Laporan transaksi penyewaan.
- Laporan pendapatan usaha.
- Penyaringan laporan berdasarkan rentang tanggal melalui halaman
  laporan.

### 8. Navigasi dan Tampilan

- Dashboard berdasarkan role.
- Navigasi halaman menggunakan React Router.
- Komponen `BackButton` untuk membantu pengguna kembali ke halaman
  sebelumnya atau dashboard sesuai konfigurasi halaman.
- Layout dan navigasi untuk Owner, Admin, dan Customer.

## Role Pengguna

---

Role Akses utama

---

Owner Dashboard Owner, laporan transaksi,
laporan pendapatan, dan akses
pengelolaan yang diizinkan oleh
route

Admin Dashboard Admin, pengelolaan
kebaya, verifikasi pembayaran,
serta pengembalian dan denda

Customer Dashboard Customer, katalog kebaya,
pesanan, status penyewaan, dan
proses terkait penyewaan

---

Hak akses akhir mengikuti konfigurasi `allowedRoles` pada route frontend
dan middleware otorisasi backend.

## Endpoint Server API

Server berjalan secara default pada port `3000` atau port yang
ditentukan melalui environment.

### Root

Method Endpoint Keterangan

---

GET `/` Informasi API dan daftar endpoint

### Auth

Method Endpoint Keterangan

---

POST `/api/auth/register` Registrasi Customer
POST `/api/auth/login` Login Owner, Admin, dan Customer
GET `/api/auth/me` Mengambil informasi akun yang sedang login

### Kebaya

Method Endpoint Keterangan

---

GET `/api/kebaya` Mengambil seluruh data kebaya
GET `/api/kebaya/:id` Mengambil detail kebaya
POST `/api/kebaya` Menambahkan kebaya
PUT `/api/kebaya/:id` Memperbarui kebaya
DELETE `/api/kebaya/:id` Menghapus kebaya

### Pelanggan

Method Endpoint Keterangan

---

GET `/api/pelanggan` Mengambil seluruh pelanggan
GET `/api/pelanggan/:id` Mengambil detail pelanggan
POST `/api/pelanggan` Menambahkan pelanggan
PUT `/api/pelanggan/:id` Memperbarui pelanggan
DELETE `/api/pelanggan/:id` Menghapus pelanggan

### Penyewaan

---

Method Endpoint Keterangan

---

GET `/api/penyewaan` Mengambil seluruh data
penyewaan

GET `/api/penyewaan/saya` Mengambil penyewaan
milik Customer

GET `/api/penyewaan/:id` Mengambil detail
penyewaan

POST `/api/penyewaan` Membuat transaksi
penyewaan

POST `/api/penyewaan/:id/bukti-bayar` Mengunggah bukti
pembayaran

GET `/api/penyewaan/:id/bukti-bayar/file` Melihat file bukti
pembayaran

PATCH `/api/penyewaan/:id/verifikasi-pembayaran` Memverifikasi
pembayaran

PATCH `/api/penyewaan/:id/mulai` Memulai penyewaan

PATCH `/api/penyewaan/:id/pengembalian` Mencatat pengembalian
dan denda

---

### Laporan

Method Endpoint Keterangan

---

GET `/api/laporan/transaksi` Mengambil laporan transaksi
GET `/api/laporan/pendapatan` Mengambil laporan pendapatan

### Test

Method Endpoint Keterangan

---

GET `/api/test` Menguji koneksi database

Daftar endpoint mengikuti route yang didaftarkan pada `server.js`.
Detail parameter, format body, autentikasi, dan respons dapat diperiksa
pada file route dan controller masing-masing.

## Persyaratan

- Node.js dan npm.
- Git.
- Editor kode seperti Visual Studio Code.

## Instalasi dan Menjalankan Proyek

Backend dan frontend dijalankan secara terpisah.

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>
cd ProjekUTS-JavaScript
```

### 2. Instalasi Backend

Jalankan dari direktori utama proyek:

```bash
npm install
```

Pastikan file `.env` lokal tersedia dan berisi konfigurasi yang sesuai
dengan implementasi pada `src/config/database.js` serta `server.js`.

Jalankan backend:

```bash
node server.js
```

Jika berhasil, terminal menampilkan informasi bahwa Server API berjalan
pada `http://localhost:3000` dan database berhasil diinisialisasi.

### 3. Instalasi Frontend

Buka terminal baru, lalu masuk ke folder web:

```bash
cd web
npm install
```

Jalankan Vite:

```bash
npm run dev
```

Vite akan menampilkan alamat lokal frontend, umumnya:

```text
http://localhost:5173
```

Jika port tersebut sedang digunakan, Vite dapat memilih port lain.
Gunakan alamat yang ditampilkan pada terminal.

### 4. Urutan Menjalankan

1.  Jalankan backend dengan `node server.js`.
2.  Pastikan backend berhasil terhubung ke SQLite.
3.  Jalankan frontend dari folder `web` dengan `npm run dev`.
4.  Buka alamat frontend yang ditampilkan Vite pada browser.
5.  Login menggunakan akun yang tersedia pada database.

## Konfigurasi Frontend dan Backend

File `web/vite.config.ts` menggunakan proxy agar request dengan prefix
`/api` diteruskan ke backend:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

Dengan konfigurasi tersebut, frontend dapat mengakses endpoint
`/api/...` melalui server development Vite. Jika port backend berubah,
sesuaikan nilai `target` pada `vite.config.ts`.

## Database dan File Upload

- Database menggunakan SQLite.
- Inisialisasi database dijalankan melalui fungsi
  `initializeDatabase()` sebelum server mulai menerima request.
- File database lokal pada pengerjaan ini bernama `database.sqlite`.
- Folder `uploads/` digunakan untuk menyimpan file yang diunggah,
  termasuk bukti pembayaran.
