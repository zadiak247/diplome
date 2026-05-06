const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { upload, handleUpload } = require('../middleware/uploadMiddleware');
const uploadController  = require('../controllers/uploadController');

router.post('/', auth, handleUpload, uploadController.uploadImage);

module.exports = router;