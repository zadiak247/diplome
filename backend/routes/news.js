const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const newsController = require('../controllers/newsController');
const { validateId } = require('../middleware/validators');

router.get('/public', newsController.getPublicNews);

router.get('/', auth, newsController.getAllNews);
router.get('/:id', auth, validateId, newsController.getNewsById);
router.post('/', auth, newsController.createNews);
router.patch('/:id', auth, validateId, newsController.updateNews);
router.delete('/:id', auth, validateId, newsController.deleteNews);

module.exports = router;