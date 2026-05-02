const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const servicesController = require('../controllers/servicesController');
const { validateId } = require('../middleware/validators');

router.get('/public', servicesController.getPublicServices);

router.get('/', auth, servicesController.getAllServices);
router.get('/:id', auth, validateId, servicesController.getServiceById);
router.post('/', auth, servicesController.createService);
router.patch('/:id', auth, validateId, servicesController.updateService);
router.delete('/:id', auth, validateId, servicesController.deleteService);
router.put('/:id/order', auth, validateId, servicesController.updateServiceOrder);

module.exports = router;