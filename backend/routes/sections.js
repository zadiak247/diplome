const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const sectionsController = require('../controllers/sectionsController');
const { validateSection, validateId } = require('../middleware/validators');

router.get('/public', sectionsController.getPublicSections);
router.get('/', auth, sectionsController.getAllSections);
router.get('/:id', auth, validateId, sectionsController.getSectionById);
router.post('/', auth, validateSection, sectionsController.createSection);
router.patch('/:id', auth, validateId, sectionsController.updateSection);
router.put('/:id/order', auth, validateId, sectionsController.updateSectionOrder);
router.delete('/:id', auth, validateId, sectionsController.deleteSection);

module.exports = router;