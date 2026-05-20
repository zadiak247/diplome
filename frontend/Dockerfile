FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g serve --legacy-peer-deps

COPY . .

ENV PORT=3000
ENV REACT_APP_API_URL=/api
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true

RUN ./node_modules/.bin/react-scripts build && ./node_modules/.bin/cra-append-sw --mode build --skip-cra-sw

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
