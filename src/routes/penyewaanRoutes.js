const express = require('express');
const router = express.Router();

const penyewaanController = require('../controllers/penyewaanController');

// GET semua penyewaan
router.get('/', penyewaanController.getAllPenyewaan);

// GET detail penyewaan
router.get('/:id', penyewaanController.getPenyewaanById);

// POST transaksi penyewaan
router.post('/', penyewaanController.createPenyewaan);

// PATCH status penyewaan
router.patch('/:id/status', penyewaanController.updateStatusPenyewaan);

module.exports = router;