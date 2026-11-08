
const express = require('express');
const router = express.Router();

const { dbAll } = require('../middlewares_helpers/sqlite3_helpers');

router.get('/', async (req, res) => {
  try {
    const rows = await dbAll(
      'SELECT id, created_at FROM test_logs ORDER BY id DESC'
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Gagal mengambil data test:', err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
