const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.resolve(
  __dirname,
  '../../uploads/payment-proofs'
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp'
    }[file.mimetype];

    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error('Bukti pembayaran harus berupa JPG, PNG, atau WEBP')
    );
  }

  cb(null, true);
};

const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024
  }
});

module.exports = {
  uploadPaymentProof,
  uploadDir
};