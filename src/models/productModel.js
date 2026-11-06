const { dbRun, dbGet, dbAll } = require('../middlewares_helpers/sqlite3_helpers');

/* =============== READ (all) =============== */
const findAllProducts = async () => {
  return await dbAll('SELECT * FROM products ORDER BY id DESC');
};

/* =============== READ (by id) =============== */
const findProductById = async (id) => {
  return await dbGet('SELECT * FROM products WHERE id = ?', [id]);
};

/* =============== CREATE =============== */
const createProduct = async (body) => {
  const query = `
    INSERT INTO products (name, price, stock, category, description, is_available)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    body.name,
    body.price,
    body.stock ?? 0,
    body.category ?? null,
    body.description ?? null,
    body.is_available !== undefined ? (body.is_available ? 1 : 0) : 1,
  ];

  const { lastID } = await dbRun(query, values);
  return await findProductById(lastID);
};

/* =============== UPDATE =============== */
const updateProduct = async (id, body) => {
  const existing = await findProductById(id);
  if (!existing) return null;

  const query = `
    UPDATE products
    SET name = ?, price = ?, stock = ?, category = ?, description = ?,
        is_available = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const values = [
    body.name ?? existing.name,
    body.price ?? existing.price,
    body.stock ?? existing.stock,
    body.category !== undefined ? body.category : existing.category,
    body.description !== undefined ? body.description : existing.description,
    body.is_available !== undefined
      ? (body.is_available ? 1 : 0)
      : existing.is_available,
    id,
  ];

  await dbRun(query, values);
  return await findProductById(id);
};

/* =============== DELETE =============== */
const deleteProduct = async (id) => {
  const { changes } = await dbRun('DELETE FROM products WHERE id = ?', [id]);
  return changes > 0;
};

const bulkCreateProducts = async (products) => {
  await dbRun('BEGIN TRANSACTION');

  try {
    const createdProducts = [];

    for (const product of products) {
      const result = await dbRun(
        `INSERT INTO products
          (name, price, stock, category, description, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.price,
          product.stock ?? 0,
          product.category ?? null,
          product.description ?? null,
          product.is_available ?? 1,
        ]
      );

      createdProducts.push({
        id: result.lastID,
        ...product,
      });
    }

    await dbRun('COMMIT');

    return createdProducts;
  } catch (error) {
    await dbRun('ROLLBACK');
    throw error;
  }
};

module.exports = {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts
};