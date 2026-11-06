const jwt = require('jsonwebtoken');

// Memeriksa token login
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi autentikasi belum tersedia'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: Number(decoded.sub),
      role: decoded.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa'
    });
  }
};

// Membatasi akses berdasarkan role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Kamu tidak memiliki izin untuk mengakses fitur ini'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};