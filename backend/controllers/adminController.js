const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        res.status(201).json({ message: 'Пользователь успешно создан' });
    } catch (error) {
        console.error('createUser error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (parseInt(userId) === req.userId) {
            return res.status(400).json({ error: 'Нельзя удалить самого себя' });
        }

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ message: 'Пользователь удалён' });
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};