const express = require('express');
const router = express.Router();

const kebayaController = require('../controllers/kebayaController');

router.get('/', kebayaController.getAllKebaya);

router.get('/:id', kebayaController.getKebayaById);

router.post('/', kebayaController.createKebaya);

router.put('/:id', kebayaController.updateKebaya);

router.delete('/:id', kebayaController.deleteKebaya);

module.exports = router;