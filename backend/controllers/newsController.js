const db = require('../config/db');

exports.getPublicNews = async (req, res) => {
    try {
        const limitParam = req.query.limit;
        let query = 'SELECT * FROM news WHERE is_published = TRUE ORDER BY created_at DESC';

        const limitNum = parseInt(limitParam, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
            query += ` LIMIT ${limitNum}`;
        }

        const [news] = await db.execute(query);
        res.json(news);
    } catch (error) {
        console.error('getPublicNews error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const [news] = await db.execute(`
            SELECT n.*, 
                   uc.email AS created_by_email,
                   uu.email AS updated_by_email
            FROM news n
            LEFT JOIN users uc ON n.created_by = uc.id
            LEFT JOIN users uu ON n.updated_by = uu.id
            ORDER BY n.created_at DESC
        `);
        res.json(news);
    } catch (error) {
        console.error('getAllNews error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Новость не найдена' });
        res.json(rows[0]);
    } catch (error) {
        console.error('getNewsById error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.createNews = async (req, res) => {
    try {
        const { title, content, image_url, is_published } = req.body;

        const [result] = await db.execute(
            'INSERT INTO news (title, content, image_url, is_published, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, content || '', image_url || '', is_published ?? true, req.userId]
        );
        res.status(201).json({ id: result.insertId, message: 'Новость успешно создана' });
    } catch (error) {
        console.error('createNews error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { title, content, image_url, is_published } = req.body;
        const fields = {};
        if (title !== undefined) fields.title = title;
        if (content !== undefined) fields.content = content;
        if (image_url !== undefined) fields.image_url = image_url;
        if (is_published !== undefined) fields.is_published = is_published ? 1 : 0;

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ error: 'Нет полей для обновления' });
        }

        fields.updated_by = req.userId;

        const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(fields), req.params.id];

        const [result] = await db.execute(`UPDATE news SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Новость не найдена' });
        res.json({ message: 'Новость обновлена' });
    } catch (error) {
        console.error('updateNews error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM news WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Новость не найдена' });
        res.json({ message: 'Новость удалена' });
    } catch (error) {
        console.error('deleteNews error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};