const db = require('../config/db');

const ALLOWED_TYPES = ['hero','content', 'news_block', 'reviews_block', 'services_block'];

exports.getPublicSections = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || null;

        let query = 'SELECT * FROM sections WHERE is_active = TRUE ORDER BY display_order ASC';
        const params = [];

        if (limit && limit > 0) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        const [sections] = await db.execute(query, params);
        res.json(sections);
    } catch (error) {
        console.error('getPublicSections error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getAllSections = async (req, res) => {
    try {
        const [sections] = await db.execute(`
            SELECT s.*, 
                   uc.email AS created_by_email,
                   uu.email AS updated_by_email
            FROM sections s
            LEFT JOIN users uc ON s.created_by = uc.id
            LEFT JOIN users uu ON s.updated_by = uu.id
            ORDER BY display_order
        `);
        res.json(sections);
    } catch (error) {
        console.error('getAllSections error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getSectionById = async (req, res) => {
    try {
        const [sections] = await db.execute(
            'SELECT * FROM sections WHERE id = ?',
            [req.params.id]
        );

        if (sections.length === 0) {
            return res.status(404).json({ error: 'Секция не найлена' });
        }

        res.json(sections[0]);
    } catch (error) {
        console.error('getSectionById error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.createSection = async (req, res) => {
    try {
        const { type, title, content, image_url, is_active } = req.body;
        
        if (!type || !ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                error: `Некорректный тип секции. Допустимые: ${ALLOWED_TYPES.join(', ')}`
            });
        }

        const [maxOrder] = await db.execute(
            'SELECT MAX(display_order) as max_order FROM sections'
        );
        const display_order = (maxOrder[0].max_order || 0) + 1;

        const [result] = await db.execute(
            `INSERT INTO sections (type, title, content, image_url, display_order, is_active, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, title, content, image_url, display_order, is_active ?? true, req.userId]
        );
        
        res.status(201).json({
            id: result.insertId,
            message: 'Секция успешно создана'
        });
    } catch (error) {
        console.error('createSection error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.updateSection = async (req, res) => {
    try {
        const { type, title, content, image_url, is_active } = req.body;

        if (type && !ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                error: `Некорректный тип секции. Допустимые: ${ALLOWED_TYPES.join(', ')}`
            });
        }

        const fields = {};
        if (type !== undefined) fields.type = type;
        if (title !== undefined) fields.title = title;
        if (content !== undefined) fields.content = content;
        if (image_url !== undefined) fields.image_url = image_url;
        if (is_active !== undefined) fields.is_active = is_active ? 1 : 0;

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ error: 'Нет полей для обновления' });
        }

        fields.updated_by = req.userId;

        const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(fields), req.params.id];

        const [result] = await db.execute(`UPDATE sections SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Секция не найдена' });
        res.json({ message: 'Секция успешно обновлёна' });
    } catch (error) {
        console.error('updateSection error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.updateSectionOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { newOrder } = req.body;

        if (newOrder === undefined || !Number.isInteger(newOrder) || newOrder < 0) {
            return res.status(400).json({ error: 'Требуется корректное целое число' });
        }

        const [target] = await connection.execute(
            'SELECT * FROM sections WHERE id = ?',
            [id]
        );
        if (target.length === 0) {
            return res.status(404).json({ error: 'Секция не найдена' });
        }

        const oldOrder = target[0].display_order;

        await connection.beginTransaction();

        if (oldOrder < newOrder) {
            await connection.execute(
                `UPDATE sections
                 SET display_order = display_order - 1
                 WHERE display_order > ? AND display_order <= ?`,
                [oldOrder, newOrder]
            );
        } else if (oldOrder > newOrder) {
            await connection.execute(
                `UPDATE sections
                 SET display_order = display_order + 1
                 WHERE display_order >= ? AND display_order < ?`,
                [newOrder, oldOrder]
            );
        } else {
            await connection.commit();   
            return res.json({ message: 'Порядок не изменён' });
        }

        await connection.execute(
            'UPDATE sections SET display_order = ?, updated_by = ? WHERE id = ?',
            [newOrder, req.userId, id]
        );


        res.json({ message: 'Порядок успешно обновлён' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        console.error(error);
    } finally {
        connection.release();
    }
};

exports.deleteSection = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.execute(
            'DELETE FROM sections WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Секция не найдена' });
        }

        await connection.execute(`
            UPDATE sections s
            JOIN (
                SELECT id, ROW_NUMBER() OVER (ORDER BY display_order, id) AS new_order
                FROM sections
            ) AS x ON s.id = x.id
            SET s.display_order = x.new_order
        `);

        await connection.commit();

        res.json({ message: 'Секция успешно удалёна' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        console.error(error);
    } finally {
        connection.release();
    }
};