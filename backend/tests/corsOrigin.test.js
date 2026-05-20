const assert = require('assert');
const { buildCorsOrigin } = require('../config/cors');

const origin = buildCorsOrigin('http://localhost:3000, http://172.25.1.99:3000');

assert.strictEqual(origin('http://localhost:3000'), true);
assert.strictEqual(origin('http://172.25.1.99:3000'), true);
assert.strictEqual(origin('http://example.com'), false);
assert.strictEqual(origin(undefined), true);

