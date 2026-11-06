const express = require('express');
const router = express.Router();

const kebayaController = require('../controllers/kebayaController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares_helpers/authMiddleware');

// Semua aktor yang sudah login dapat melihat katalog
router.get(
  '/',
  authenticateToken,
  authorizeRoles('owner', 'admin', 'customer'),
  kebayaController.getAllKebaya
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('owner', 'admin', 'customer'),
  kebayaController.getKebayaById
);

// Hanya Owner dan Admin yang mengelola kebaya
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  kebayaController.createKebaya
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  kebayaController.updateKebaya
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  kebayaController.deleteKebaya
);

module.exports = router;