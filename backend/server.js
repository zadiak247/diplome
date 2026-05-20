const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config();

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            frameSrc: ["'self'", "https://yandex.ru", "https://*.yandex.ru"],
            childSrc: ["'self'", "https://yandex.ru", "https://*.yandex.ru"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много запросов, попробуйте позже' }
});

const staticCacheConfig = (res, filePath) => {
    if (filePath.match(/\/static\/(css|js)\/main\.[a-f0-9]+\.(css|js)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
};

app.use(express.static(
    path.join(__dirname, '..', 'frontend', 'build'),
    { setHeaders: staticCacheConfig }
));

const uploadsCacheConfig = (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
};

app.use('/uploads', express.static(
    path.join(__dirname, 'uploads'),
    { setHeaders: uploadsCacheConfig }
));

app.use('/api', globalLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Слишком много попыток входа, попробуйте позже' }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/login', loginLimiter);
app.set('trust proxy', 1);
app.use('/api/sections', require('./routes/sections'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/news', require('./routes/news'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/services', require('./routes/services'));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Не найдено' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const db = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await db.execute('SELECT 1');
        console.log('Подключение к базе данных успешно');
        
        await initDatabase();
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error.message);
    }
}

async function initDatabase() {
    try {
        const sqlPath = path.join(__dirname, 'database', 'initDB.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const queries = sql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            await db.execute(query);
        }
        
        console.log('База данных инициализирована');
    } catch (error) {
        console.error('Ошибка при проверке таблиц:', error);
    }
}

testConnection();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Сервер запущен`);
});

process.on('SIGTERM', () => {
    console.log('Получен сигнал SIGTERM. Завершение работы...');
    server.close(() => {
        db.end().then(() => process.exit(0));
    });
});

process.on('SIGINT', () => {
    console.log('Получен сигнал SIGINT. Завершение работы...');
    server.close(() => {
        db.end().then(() => process.exit(0));
    });
});

process.on('uncaughtException', (err) => {
  console.error('Необработанное исключение:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанный отказ Promise:', promise, 'причина:', reason);
  process.exit(1);
});
