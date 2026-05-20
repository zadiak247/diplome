# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY frontend/package*.json ./
RUN --mount=type=cache,id=pilot-frontend-npm,target=/root/.npm,sharing=locked \
  npm install --ignore-scripts --no-audit --no-fund --prefer-offline

COPY frontend/ ./

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN ./node_modules/.bin/react-scripts build


FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=5000
ENV UPLOAD_DIR=/app/backend/uploads

WORKDIR /app/backend

COPY backend/package*.json ./
RUN --mount=type=cache,id=pilot-backend-npm,target=/root/.npm,sharing=locked \
  npm ci --omit=dev --no-audit --no-fund --prefer-offline

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ../frontend/build

RUN mkdir -p /app/backend/uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
