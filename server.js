require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  initializeDatabase
} = require('./src/config/database');

const testRoutes = require('./src/routes/test');
const authRoutes = require('./src/routes/authRoutes');
const kebayaRoutes = require('./src/routes/kebayaRoutes');
const pelangganRoutes = require('./src/routes/pelangganRoutes');
const penyewaanRoutes = require('./src/routes/penyewaanRoutes');
const laporanRoutes = require('./src/routes/laporanRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistem Informasi Penyewaan Kebaya API',

    endpoints: {

      auth: {
        'POST /api/auth/register': 'Registrasi Customer',
        'POST /api/auth/login': 'Login Owner, Admin, dan Customer',
        'GET /api/auth/me': 'Mengambil informasi akun login'
      },

      kebaya: {
        'GET /api/kebaya': 'Mengambil semua data kebaya',
        'GET /api/kebaya/:id': 'Mengambil detail kebaya',
        'POST /api/kebaya': 'Menambahkan kebaya',
        'PUT /api/kebaya/:id': 'Memperbarui data kebaya',
        'DELETE /api/kebaya/:id': 'Menghapus data kebaya'
      },

      pelanggan: {
        'GET /api/pelanggan': 'Mengambil semua pelanggan',
        'GET /api/pelanggan/:id': 'Mengambil detail pelanggan',
        'POST /api/pelanggan': 'Menambahkan pelanggan',
        'PUT /api/pelanggan/:id': 'Memperbarui pelanggan',
        'DELETE /api/pelanggan/:id': 'Menghapus pelanggan'
      },

      penyewaan: {
        'GET /api/penyewaan': 'Mengambil semua penyewaan',
        'GET /api/penyewaan/saya': 'Mengambil penyewaan milik Customer',
        'GET /api/penyewaan/:id': 'Mengambil detail penyewaan',
        'POST /api/penyewaan': 'Membuat transaksi penyewaan',

        'POST /api/penyewaan/:id/bukti-bayar': 'Mengunggah bukti pembayaran',
        'GET /api/penyewaan/:id/bukti-bayar/file': 'Melihat bukti pembayaran',

        'PATCH /api/penyewaan/:id/verifikasi-pembayaran': 'Memverifikasi pembayaran',
        'PATCH /api/penyewaan/:id/mulai': 'Memulai penyewaan',
        'PATCH /api/penyewaan/:id/pengembalian': 'Mencatat pengembalian dan denda'
      },

      laporan: {
        'GET /api/laporan/transaksi': 'Melihat laporan transaksi',
        'GET /api/laporan/pendapatan': 'Melihat laporan pendapatan'
      },

      test: {
        'GET /api/test': 'Menguji koneksi database'
      }
    }
  });
});

// Routes
app.use('/api/test', testRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/kebaya', kebayaRoutes);

app.use('/api/pelanggan', pelangganRoutes);

app.use('/api/penyewaan', penyewaanRoutes);

app.use('/api/laporan', laporanRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Start server
(async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log('====================================');
      console.log('SISTEM INFORMASI PENYEWAAN KEBAYA');
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log('Database berhasil diinisialisasi');
      console.log('====================================');
    });

  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    process.exit(1);
  }
})();