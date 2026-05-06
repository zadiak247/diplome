const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { body, param, validationResult } = require('express-validator');

const validateCreateUser = [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не короче 6 символов'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateId = [
    param('id').isInt().withMessage('ID должен быть целым числом'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.get('/users', auth, adminController.getUsers);
router.post('/users', auth, validateCreateUser, adminController.createUser);
router.delete('/users/:id', auth, validateId, adminController.deleteUser);

module.exports = router;