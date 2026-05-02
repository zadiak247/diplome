const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

exports.validateRegister = [
    body('email')
        .isEmail().withMessage('Требуется корректный email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Пароль должен содержать не менее 6 символов'),
    handleValidationErrors
];

exports.validateLogin = [
    body('email').isEmail().withMessage('Требуется корректный email'),
    body('password').notEmpty().withMessage('Требуется пароль'),
    handleValidationErrors
];

exports.validateSection = [
    body('type')
        .optional()
        .isIn(['hero', 'content', 'news_block','reviews_block','services_block' ])
        .withMessage('Invalid section type'),
    body('title').optional().trim().notEmpty().withMessage('Заголовок не может быть пустым'),
    handleValidationErrors
];

exports.validateId = [
    param('id').isInt().withMessage('ID должен быть целым числом'),
    handleValidationErrors
];