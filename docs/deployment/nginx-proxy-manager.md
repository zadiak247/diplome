# Nginx Proxy Manager deployment

Target domain: `pilot-avto-sto.ru`

ZeroTier IP for Nginx Proxy Manager upstream: `172.30.0.20`

Application port exposed by Docker Compose on the ZeroTier interface: `5000`

## Docker

1. Copy `.env.example` to `.env`.
2. Replace `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `JWT_SECRET` with strong values.
3. Start the stack:

```bash
DOCKER_BUILDKIT=1 docker compose up -d --build
```

4. Check status:

```bash
docker compose ps
docker compose logs -f app
```

## Nginx Proxy Manager proxy host

Create a new Proxy Host:

- Domain Names: `pilot-avto-sto.ru`
- Scheme: `http`
- Forward Hostname / IP: `172.30.0.20`
- Forward Port: `5000`
- Cache Assets: optional
- Block Common Exploits: enabled
- Websockets Support: disabled

SSL tab:

- Request a new SSL certificate for `pilot-avto-sto.ru`
- Force SSL: enabled
- HTTP/2 Support: enabled

The app serves the React build and API from the same origin. The frontend uses `/api`, so no separate API proxy host is needed.

`172.30.0.20` is intentionally the private ZeroTier address, not the public IP. The container port is bound to that address so Nginx Proxy Manager can proxy over ZeroTier without exposing the app directly on all host interfaces.
