const productModel = require('../models/productModel');

/* =========================================================
 *  Helper: standard response biar konsisten
 * ========================================================= */
const success = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const fail = (res, code, message, error = null) =>
  res.status(code).json({ success: false, message, error });

/* =========================================================
 *  GET /api/products — semua produk
 * ========================================================= */
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.findAllProducts();
    success(res, 200, 'Berhasil mengambil semua produk', products);
  } catch (error) {
    console.error('[getAllProducts]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  GET /api/products/:id — satu produk
 * ========================================================= */
const getProductById = async (req, res) => {
  try {
    const product = await productModel.findProductById(req.params.id);
    if (!product) return fail(res, 404, 'Produk tidak ditemukan');
    success(res, 200, 'Berhasil mengambil produk', product);
  } catch (error) {
    console.error('[getProductById]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  POST /api/products — buat produk baru
 * ========================================================= */
const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    // Validasi wajib
    if (!name || name.trim() === '') {
      return fail(res, 400, 'Validasi gagal', 'name wajib diisi');
    }
    if (price === undefined || price === null || isNaN(price) || price < 0) {
      return fail(res, 400, 'Validasi gagal', 'price wajib angka >= 0');
    }

    const created = await productModel.createProduct(req.body);
    success(res, 201, 'Produk berhasil dibuat', created);
  } catch (error) {
    console.error('[createProduct]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  PUT /api/products/:id — update produk
 * ========================================================= */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi kalau price dikirim
    if (
      req.body.price !== undefined &&
      (isNaN(req.body.price) || req.body.price < 0)
    ) {
      return fail(res, 400, 'Validasi gagal', 'price harus angka >= 0');
    }

    const updated = await productModel.updateProduct(id, req.body);
    if (!updated) return fail(res, 404, 'Produk tidak ditemukan');

    success(res, 200, 'Produk berhasil diupdate', updated);
  } catch (error) {
    console.error('[updateProduct]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  DELETE /api/products/:id — hapus produk
 * ========================================================= */
const deleteProduct = async (req, res) => {
  try {
    const deleted = await productModel.deleteProduct(req.params.id);
    if (!deleted) return fail(res, 404, 'Produk tidak ditemukan');

    success(res, 200, 'Produk berhasil dihapus');
  } catch (error) {
    console.error('[deleteProduct]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'products harus berupa array yang tidak kosong'
      );
    }

    for (const [index, product] of products.entries()) {
      if (
        !product ||
        typeof product.name !== 'string' ||
        product.name.trim() === ''
      ) {
        return fail(
          res,
          400,
          'Validasi gagal',
          `products[${index}].name wajib diisi`
        );
      }

      if (
        product.price === undefined ||
        product.price === null ||
        typeof product.price !== 'number' ||
        !Number.isFinite(product.price) ||
        product.price < 0
      ) {
        return fail(
          res,
          400,
          'Validasi gagal',
          `products[${index}].price harus berupa angka >= 0`
        );
      }
    }

    const created = await productModel.bulkCreateProducts(products);

    success(
      res,
      201,
      `${created.length} produk berhasil dibuat`,
      created
    );
  } catch (error) {
    console.error('[bulkCreateProducts]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts
};