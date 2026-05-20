const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assertFile(relativePath) {
  assert.ok(fs.existsSync(path.join(root, relativePath)), `${relativePath} should exist`);
}

function assertIncludes(content, expected, label) {
  assert.ok(content.includes(expected), `${label} should include ${expected}`);
}

assertFile('Dockerfile');
assertFile('docker-compose.yml');
assertFile('.dockerignore');
assertFile('.env.example');
assertFile('docs/deployment/nginx-proxy-manager.md');

const dockerfile = read('Dockerfile');
assertIncludes(dockerfile, 'FROM node:20-alpine AS frontend-build', 'Dockerfile');
assertIncludes(dockerfile, 'PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true', 'Dockerfile');
assertIncludes(dockerfile, 'id=pilot-frontend-npm', 'Dockerfile');
assertIncludes(dockerfile, 'npm install --ignore-scripts --no-audit --no-fund --prefer-offline', 'Dockerfile');
assertIncludes(dockerfile, 'ARG REACT_APP_API_URL=/api', 'Dockerfile');
assertIncludes(dockerfile, './node_modules/.bin/react-scripts build', 'Dockerfile');
assertIncludes(dockerfile, 'FROM node:20-alpine AS runtime', 'Dockerfile');
assertIncludes(dockerfile, 'id=pilot-backend-npm', 'Dockerfile');
assertIncludes(dockerfile, 'npm ci --omit=dev --no-audit --no-fund --prefer-offline', 'Dockerfile');
assertIncludes(dockerfile, 'sharing=locked', 'Dockerfile');
assertIncludes(dockerfile, 'COPY --from=frontend-build /app/frontend/build ../frontend/build', 'Dockerfile');
assertIncludes(dockerfile, 'EXPOSE 5000', 'Dockerfile');
assertIncludes(dockerfile, 'HEALTHCHECK', 'Dockerfile');

const compose = read('docker-compose.yml');
assertIncludes(compose, 'pilot-avto-sto-app', 'docker-compose.yml');
assertIncludes(compose, 'pilot-avto-sto-mysql', 'docker-compose.yml');
assertIncludes(compose, '${APP_BIND_IP:-127.0.0.1}:${APP_PORT:-5000}:5000', 'docker-compose.yml');
assertIncludes(compose, 'DB_HOST: mysql', 'docker-compose.yml');
assertIncludes(compose, 'CORS_ORIGIN: ${CORS_ORIGIN:-https://pilot-avto-sto.ru}', 'docker-compose.yml');
assertIncludes(compose, 'BASE_URL: ${BASE_URL:-https://pilot-avto-sto.ru}', 'docker-compose.yml');
assertIncludes(compose, 'mysql-data:', 'docker-compose.yml');
assertIncludes(compose, 'app-uploads:', 'docker-compose.yml');

const envExample = read('.env.example');
assertIncludes(envExample, 'APP_BIND_IP=172.30.0.20', '.env.example');
assertIncludes(envExample, 'APP_PORT=5000', '.env.example');
assertIncludes(envExample, 'DOMAIN=pilot-avto-sto.ru', '.env.example');
assertIncludes(envExample, 'BASE_URL=https://pilot-avto-sto.ru', '.env.example');
assertIncludes(envExample, 'CORS_ORIGIN=https://pilot-avto-sto.ru', '.env.example');
assertIncludes(envExample, 'DB_HOST=mysql', '.env.example');
assertIncludes(envExample, 'JWT_SECRET=', '.env.example');

const frontendApi = read('frontend/src/services/api.js');
assertIncludes(frontendApi, "process.env.REACT_APP_API_URL || '/api'", 'frontend API client');

const server = read('backend/server.js');
assertIncludes(server, 'frameSrc', 'backend helmet CSP');
assertIncludes(server, 'https://yandex.ru', 'backend helmet CSP');
assertIncludes(server, 'https://*.yandex.ru', 'backend helmet CSP');

const npmGuide = read('docs/deployment/nginx-proxy-manager.md');
assertIncludes(npmGuide, 'pilot-avto-sto.ru', 'Nginx Proxy Manager guide');
assertIncludes(npmGuide, '172.30.0.20', 'Nginx Proxy Manager guide');
assertIncludes(npmGuide, '5000', 'Nginx Proxy Manager guide');
assertIncludes(npmGuide, 'Websockets Support: disabled', 'Nginx Proxy Manager guide');
assertIncludes(npmGuide, 'Block Common Exploits: enabled', 'Nginx Proxy Manager guide');

console.log('Deployment configuration checks passed');
