function buildCorsOrigin(value) {
    const origins = (value || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    return (origin, callback) => {
        callback(null, !origin || origins.includes(origin));
    };
}

module.exports = { buildCorsOrigin };
