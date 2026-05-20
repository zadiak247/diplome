const assert = require('assert');
const { buildCorsOrigin } = require('../config/cors');

const origin = buildCorsOrigin("http://localhost:3000, http://172.25.1.99:3000");

function assertOrigin(value, expected) {
    origin(value, (error, allowed) => {
        assert.ifError(error);
        assert.strictEqual(allowed, expected);
    });
}

assertOrigin("http://localhost:3000", true);
assertOrigin("http://172.25.1.99:3000", true);
assertOrigin("http://example.com", false);
assertOrigin(undefined, true);
