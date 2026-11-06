const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const {
  authenticateToken
} = require('../middlewares_helpers/authMiddleware');

// Registrasi Customer
router.post('/register', authController.register);

// Login ketiga aktor
router.post('/login', authController.login);

// Memeriksa user yang sedang login
router.get('/me', authenticateToken, authController.me);

module.exports = router;