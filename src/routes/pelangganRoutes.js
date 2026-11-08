const express = require('express');
const router = express.Router();

const pelangganController = require('../controllers/pelangganController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares_helpers/authMiddleware');

router.use(
  authenticateToken,
  authorizeRoles('owner', 'admin')
);

router.get('/', pelangganController.getAllPelanggan);
router.get('/:id', pelangganController.getPelangganById);
router.post('/', pelangganController.createPelanggan);
router.put('/:id', pelangganController.updatePelanggan);
router.delete('/:id', pelangganController.deletePelanggan);

module.exports = router;