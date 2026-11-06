const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/',        productController.getAllProducts);
router.get('/:id',     productController.getProductById);
router.post('/',       productController.createProduct);
router.put('/:id',     productController.updateProduct);
router.delete('/:id',  productController.deleteProduct);

// testpurpose
router.post('/bulk',   productController.bulkCreateProducts);

module.exports = router;