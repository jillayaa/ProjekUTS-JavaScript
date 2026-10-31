require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  initializeDatabase
} = require('./src/config/database');

const testRoutes = require('./src/routes/test');

const kebayaRoutes = require('./src/routes/kebayaRoutes');
const pelangganRoutes = require('./src/routes/pelangganRoutes');
const penyewaanRoutes = require('./src/routes/penyewaanRoutes');

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
      kebaya: {
        'GET /api/kebaya': 'Mengambil semua kebaya',
        'GET /api/kebaya/:id': 'Mengambil detail kebaya',
        'POST /api/kebaya': 'Menambahkan kebaya',
        'PUT /api/kebaya/:id': 'Memperbarui kebaya',
        'DELETE /api/kebaya/:id': 'Menghapus kebaya'
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
        'GET /api/penyewaan/:id': 'Mengambil detail penyewaan',
        'POST /api/penyewaan': 'Membuat transaksi penyewaan',
        'PATCH /api/penyewaan/:id/status': 'Mengubah status penyewaan'
      }
    }
  });
});

// Routes
app.use('/api/test', testRoutes);

app.use('/api/kebaya', kebayaRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/penyewaan', penyewaanRoutes);

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