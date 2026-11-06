# Product API

REST API sederhana untuk mengelola data produk menggunakan **Node.js**, **Express.js**, dan **SQLite3**. Project ini dibuat untuk mempelajari konsep dasar REST API, pemisahan tanggung jawab antara routes, controllers, dan models, serta penggunaan database SQLite.

## Fitur

- Mengambil semua produk.
- Mengambil detail produk berdasarkan ID.
- Menambahkan satu produk.
- Menambahkan banyak produk sekaligus (*bulk insert*).
- Memperbarui data produk.
- Menghapus produk.
- Membuat tabel database secara otomatis saat server dijalankan.

## Teknologi

- [Node.js](https://nodejs.org/) — runtime JavaScript.
- [Express.js](https://expressjs.com/) — framework untuk membuat REST API.
- [SQLite3](https://www.npmjs.com/package/sqlite3) — database.
- [dotenv](https://www.npmjs.com/package/dotenv) — membaca konfigurasi dari file `.env`.
- [cors](https://www.npmjs.com/package/cors) — mengatur akses lintas origin.

## Struktur Project

```text
project/
├── server.js
├── database.sqlite
├── .env
├── package.json
├── sql_scripts/
│   └── init.sql
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   └── productController.js
    ├── models/
    │   └── productModel.js
    ├── routes/
    │   ├── productRoutes.js
    │   └── test.js
    └── middlewares_helpers/
        └── sqlite3_helpers.js
```

**Catatan:** `database.sqlite` akan dibuat secara otomatis jika belum tersedia, bergantung pada konfigurasi koneksi database. Sesuaikan struktur di atas jika lokasi file di project berbeda.

## Instalasi

### 1. Clone atau download project

Jika project sudah ada di komputer, buka terminal di folder project tersebut.

### 2. Install dependencies

```bash
npm install
```

Jika dependencies belum tercantum di `package.json`, install paket yang dibutuhkan:

```bash
npm install express sqlite3 cors dotenv
```

### 3. Konfigurasi environment

Buat file `.env` di root project:

```env
PORT=3000
```

### 4. Jalankan server

Jika `package.json` sudah memiliki script `start`:

```bash
npm start
```

Atau jalankan langsung:

```bash
node server.js
```

Jika berhasil, server akan berjalan di:

```text
http://localhost:3000
```

Database dan tabel akan diinisialisasi ketika server dijalankan, sesuai konfigurasi `database.js`.

## Database

Tabel `products` dibuat menggunakan file `sql_scripts/init.sql`.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INTEGER | Primary key, bertambah otomatis |
| `name` | TEXT | Nama produk, wajib diisi |
| `price` | REAL | Harga produk, wajib diisi |
| `stock` | INTEGER | Jumlah stok, default `0` |
| `category` | TEXT | Kategori produk |
| `description` | TEXT | Deskripsi produk |
| `is_available` | INTEGER | Status ketersediaan, default `1` |
| `created_at` | DATETIME | Waktu data dibuat |
| `updated_at` | DATETIME | Waktu data diperbarui |

Database tidak harus berisi data awal. Produk dapat ditambahkan melalui endpoint API.

## API Endpoints

Base URL:

```text
http://localhost:3000/api/products
```

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/products` | Mengambil semua produk |
| GET | `/api/products/:id` | Mengambil produk berdasarkan ID |
| POST | `/api/products` | Menambahkan satu produk |
| POST | `/api/products/bulk` | Menambahkan banyak produk sekaligus |
| PUT | `/api/products/:id` | Memperbarui produk |
| DELETE | `/api/products/:id` | Menghapus produk |

### 1. Mengambil semua produk

**Request**

```http
GET /api/products
```

### 2. Mengambil produk berdasarkan ID

**Request**

```http
GET /api/products/1
```

### 3. Menambahkan satu produk

**Request**

```http
POST /api/products
Content-Type: application/json
```

**Body**

```json
{
  "name": "Kopi Susu Gula Aren",
  "price": 22000,
  "stock": 50,
  "category": "Minuman",
  "description": "Kopi susu dengan gula aren asli",
  "is_available": 1
}
```

### 4. Menambahkan banyak produk sekaligus

Endpoint bulk insert memungkinkan beberapa produk ditambahkan dalam satu request.

**Request**

```http
POST /api/products/bulk
Content-Type: application/json
```

**Body**

```json
{
  "products": [
    {
      "name": "Kopi Susu Gula Aren",
      "price": 22000,
      "stock": 50,
      "category": "Minuman",
      "description": "Kopi susu dengan gula aren asli",
      "is_available": 1
    },
    {
      "name": "Croissant Butter",
      "price": 18000,
      "stock": 30,
      "category": "Makanan",
      "description": "Croissant mentega homemade",
      "is_available": 1
    },
    {
      "name": "Air Mineral 600ml",
      "price": 5000,
      "stock": 100,
      "category": "Minuman",
      "description": "Air mineral botol",
      "is_available": 1
    }
  ]
}
```

Properti `products` harus berupa array yang tidak kosong. Setiap produk harus memiliki `name` dan `price` yang valid.

Jika implementasi model menggunakan transaksi database, seluruh proses bulk insert akan di-*commit* ketika berhasil dan di-*rollback* ketika terjadi kegagalan.

### 5. Memperbarui produk

**Request**

```http
PUT /api/products/1
Content-Type: application/json
```

**Body**

```json
{
  "name": "Kopi Susu Gula Aren Large",
  "price": 25000,
  "stock": 40
}
```

### 6. Menghapus produk

**Request**

```http
DELETE /api/products/1
```

## Contoh Respons API

Format respons mengikuti implementasi controller yang digunakan.

**Respons berhasil**

```json
{
  "success": true,
  "message": "Produk berhasil dibuat",
  "data": {
    "id": 1,
    "name": "Kopi Susu Gula Aren",
    "price": 22000
  }
}
```

**Respons gagal**

```json
{
  "success": false,
  "message": "Validasi gagal",
  "error": "Nama produk wajib diisi"
}
```

Data di atas hanya contoh format; isi respons aktual bergantung pada endpoint dan implementasi controller.

## Alur Kerja Aplikasi

```text
Client
  |
  v
Routes
  |
  v
Controllers
  |
  v
Models
  |
  v
SQLite Helpers
  |
  v
SQLite Database
```

Penjelasan singkat:

- **Routes:** menentukan endpoint dan menghubungkannya ke controller.
- **Controllers:** menangani request, validasi input, dan response.
- **Models:** berisi operasi database untuk data produk.
- **SQLite Helpers:** menyediakan fungsi reusable seperti `dbRun`, `dbGet`, dan `dbAll`.
- **Database:** menyimpan data produk di SQLite.

## Catatan Pengembangan

- Gunakan parameter SQL (`?`) untuk menghindari penyusunan query dari input pengguna secara langsung.
- Validasi input sebelum menyimpan data ke database.
- Hindari mengunggah file `.env` atau database yang berisi data sensitif ke repository publik.
- Pastikan file `sql_scripts/init.sql` dibaca dari lokasi yang benar oleh `database.js`.

## Lisensi

Project ini dibuat untuk keperluan pembelajaran dan dapat dikembangkan lebih lanjut sesuai kebutuhan.