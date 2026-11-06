const express = require("express");
const router = express.Router();

const laporanController = require("../controllers/laporanController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares_helpers/authMiddleware");

// Seluruh laporan khusus Owner
router.use(authenticateToken, authorizeRoles("owner"));

router.get("/transaksi", laporanController.getLaporanTransaksi);

router.get("/pendapatan", laporanController.getLaporanPendapatan);

module.exports = router;
