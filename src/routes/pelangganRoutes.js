const express = require('express');
const router = express.Router();

const pelangganController = require('../controllers/pelangganController');

// GET semua pelanggan
router.get('/', pelangganController.getAllPelanggan);

// GET pelanggan berdasarkan ID
router.get('/:id', pelangganController.getPelangganById);

// POST pelanggan baru
router.post('/', pelangganController.createPelanggan);

// PUT memperbarui pelanggan
router.put('/:id', pelangganController.updatePelanggan);

// DELETE pelanggan
router.delete('/:id', pelangganController.deletePelanggan);

module.exports = router;