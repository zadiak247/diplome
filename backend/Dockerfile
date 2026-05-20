FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./

ENV REACT_APP_API_URL=/api
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true

RUN ./node_modules/.bin/react-scripts build && ./node_modules/.bin/cra-append-sw --mode build --skip-cra-sw

FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY --from=frontend-build /frontend/build ./frontend/build

ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_BUILD_DIR=/app/frontend/build

EXPOSE 5000

CMD ["npm", "start"]
