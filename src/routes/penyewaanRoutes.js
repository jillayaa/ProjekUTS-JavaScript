const express = require("express");
const router = express.Router();

const penyewaanController = require("../controllers/penyewaanController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares_helpers/authMiddleware");

const {
  uploadPaymentProof,
} = require("../middlewares_helpers/uploadMiddleware");

// Middleware khusus menangani error upload
const handlePaymentUpload = (req, res, next) => {
  uploadPaymentProof.single("bukti")(req, res, (error) => {
    if (error) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,
        message: error.message || "Upload bukti pembayaran gagal",
      });
    }

    next();
  });
};

// Customer melihat transaksi miliknya
router.get(
  "/saya",
  authenticateToken,
  authorizeRoles("customer"),
  penyewaanController.getMyPenyewaan,
);

// Admin dan Owner melihat seluruh transaksi
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "owner"),
  penyewaanController.getAllPenyewaan,
);

// Mengambil gambar bukti pembayaran
router.get(
  "/:id/bukti-bayar/file",
  authenticateToken,
  authorizeRoles("customer", "admin", "owner"),
  penyewaanController.getPaymentProof,
);

// Detail transaksi untuk Admin dan Owner
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "owner"),
  penyewaanController.getPenyewaanById,
);

// Customer membuat pesanan
router.post(
  "/",
  authenticateToken,
  authorizeRoles("customer"),
  penyewaanController.createPenyewaan,
);

// Customer mengunggah bukti pembayaran
router.post(
  "/:id/bukti-bayar",
  authenticateToken,
  authorizeRoles("customer"),
  handlePaymentUpload,
  penyewaanController.uploadPaymentProof,
);

// Admin memverifikasi pembayaran
router.patch(
  "/:id/verifikasi-pembayaran",
  authenticateToken,
  authorizeRoles("admin"),
  penyewaanController.verifyPayment,
);

// Admin memulai penyewaan setelah pembayaran terverifikasi
router.patch(
  "/:id/mulai",
  authenticateToken,
  authorizeRoles("admin"),
  penyewaanController.startPenyewaan,
);

// Admin mencatat pengembalian dan denda
router.patch(
  "/:id/pengembalian",
  authenticateToken,
  authorizeRoles("admin"),
  penyewaanController.recordReturn,
);

module.exports = router;