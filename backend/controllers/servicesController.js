const db = require('../config/db');

exports.getPublicServices = async (req, res) => {
    try {
        const limitParam = req.query.limit;
        let query = 'SELECT * FROM services WHERE is_active = TRUE ORDER BY display_order ASC';

        const limitNum = parseInt(limitParam, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
            query += ` LIMIT ${limitNum}`;
        }

        const [services] = await db.execute(query);
        res.json(services);
    } catch (error) {
        console.error('getPublicServices error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const [services] = await db.execute(`
                    SELECT s.*, 
                           uc.email AS created_by_email,
                           uu.email AS updated_by_email
                    FROM services s
                    LEFT JOIN users uc ON s.created_by = uc.id
                    LEFT JOIN users uu ON s.updated_by = uu.id
                    ORDER BY display_order
                `);
        res.json(services);
    } catch (error) {
        console.error('getAllServices error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Услуга не найдена' });
        res.json(rows[0]);
    } catch (error) {
        console.error('getServiceById error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.createService = async (req, res) => {
    try {
        const { name, description, price, image_url, is_active } = req.body;
        if (!name) return res.status(400).json({ error: 'Имя необходимо' });

        const [maxOrder] = await db.execute('SELECT MAX(display_order) as max_order FROM services');
        const display_order = (maxOrder[0].max_order || 0) + 1;

        const [result] = await db.execute(
            'INSERT INTO services (name, description, price, image_url, display_order, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description || '', price || null, image_url || '', display_order, is_active ?? true, req.userId]
        );
        res.status(201).json({ id: result.insertId, message: 'Услуга успешно создана' });
    } catch (error) {
        console.error('createService error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { name, description, price, image_url, is_active } = req.body;
        const fields = {};
        if (name !== undefined) fields.name = name;
        if (description !== undefined) fields.description = description;
        if (price !== undefined) fields.price = price;
        if (image_url !== undefined) fields.image_url = image_url;
        if (is_active !== undefined) fields.is_active = is_active ? 1 : 0;

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ error: 'Нет полей для обновления' });
        }

        fields.updated_by = req.userId;

        const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(fields), req.params.id];

        const [result] = await db.execute(`UPDATE services SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Услуга не найдена' });
        res.json({ message: 'Услуга обновлена' });
    } catch (error) {
        console.error('updateService error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.updateServiceOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { newOrder } = req.body;

        if (newOrder === undefined || !Number.isInteger(newOrder) || newOrder < 0) {
            return res.status(400).json({ error: 'Требуется корректное целое число' });
        }

        const [target] = await connection.execute(
            'SELECT * FROM services WHERE id = ?',
            [id]
        );
        if (target.length === 0) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        const oldOrder = target[0].display_order;

        await connection.beginTransaction();

        if (oldOrder < newOrder) {
            await connection.execute(
                `UPDATE services SET display_order = display_order - 1 WHERE display_order > ? AND display_order <= ?`,
                [oldOrder, newOrder]
            );
        } else if (oldOrder > newOrder) {
            await connection.execute(
                `UPDATE services SET display_order = display_order + 1 WHERE display_order >= ? AND display_order < ?`,
                [newOrder, oldOrder]
            );
        } else {
            await connection.commit();
            return res.json({ message: 'Порядок не обновлён' });
        }

        await connection.execute(
            'UPDATE services SET display_order = ?, updated_by = ? WHERE id = ?',
            [newOrder, req.userId, id]
        );

        await connection.commit();
        res.json({ message: 'Порядок успешно обновлён' });
    } catch (error) {
        await connection.rollback();
        console.error('updateServiceOrder error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } finally {
        connection.release();
    }
};

exports.deleteService = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'DELETE FROM services WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        await connection.execute(`
            UPDATE services s
            JOIN (
                SELECT id, ROW_NUMBER() OVER (ORDER BY display_order, id) AS new_order
                FROM services
            ) AS x ON s.id = x.id
            SET s.display_order = x.new_order
        `);

        await connection.commit();
        res.json({ message: 'Услуга удалена' });
    } catch (error) {
        await connection.rollback();
        console.error('deleteService error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } finally {
        connection.release();
    }
};