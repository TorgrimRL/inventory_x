Her er en ryddig `deploy/README.md` du kan lime inn som full erstatning:

````md
# Deployment (production)

Production deployment for Inventory X uses Docker images built in GitHub Actions and deployed to a VM with Docker Compose.

## What is used in production

Production deployment uses:

- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deploy/docker-compose.prod.yml`
- `deploy/nginx.prod.conf`

Images are built and pushed to **GHCR** via GitHub Actions, and the VM deploy pulls tagged images and restarts the stack.

---

## Production architecture (summary)

On the VM, `/opt/myapp` contains:

- `docker-compose.prod.yml`
- `nginx.prod.conf`
- `.env`
- `certbot/`

The production stack runs:

- `nginx` (public entrypoint / reverse proxy / TLS termination)
- `spa` (static frontend container)
- `web` (Django + gunicorn)
- `db` (PostgreSQL)
- `redis` (cache + session store)

Django uses Redis for:

- cache backend
- session storage via `cached_db`

That means sessions are stored in the database with Redis used as the fast cache layer.

---

## Deploy flow

Deployment is triggered by GitHub Actions (`.github/workflows/deploy.yml`).

Typical flow:

1. Push changes to the branch the deploy workflow listens to, or run it manually with `workflow_dispatch`.
2. GitHub Actions builds and pushes production images to GHCR.
3. The deploy job connects to the VM over SSH.
4. The VM pulls the new images and restarts the production stack:
   - `docker compose -f docker-compose.prod.yml pull`
   - `docker compose -f docker-compose.prod.yml up -d --remove-orphans`

---

## VM `.env` (production)

The VM `.env` file contains production-specific values and is separate from local development.

Example (do **not** commit real secrets):

```env
DEBUG=False
SECRET_KEY=<strong-unique-secret>

POSTGRES_USER=inventory
POSTGRES_PASSWORD=<strong-db-password>
POSTGRES_DB=inventory_db
DATABASE_URL=postgres://inventory:<strong-db-password>@db:5432/inventory_db

REDIS_URL=redis://redis:6379/1

ALLOWED_HOSTS=inventoryx.td.org.uit.no
CORS_ALLOWED_ORIGINS=https://inventoryx.td.org.uit.no
CSRF_TRUSTED_ORIGINS=https://inventoryx.td.org.uit.no

HOST_ENDPOINT=https://inventoryx.td.org.uit.no
BACKEND_PUBLIC_URL=https://inventoryx.td.org.uit.no

SECURE_SSL_REDIRECT=True
````

Notes:

* `REDIS_URL` must point to the Docker service name: `redis://redis:6379/1`
* `HOST_ENDPOINT` should include `https://`
* production secrets must live only on the VM, not in the repository

---

## Production verification

After a deploy, verify the app is reachable and HTTPS works:

```bash
curl -I http://inventoryx.td.org.uit.no/
curl -I https://inventoryx.td.org.uit.no/
curl -I https://inventoryx.td.org.uit.no/api/docs/
curl -I https://inventoryx.td.org.uit.no/admin/
curl -I https://inventoryx.td.org.uit.no/healthz
```

Expected results:

* `http://...` → **301** redirect to `https://...`
* `https://.../` → **200**
* `https://.../api/docs/` → **200**
* `https://.../admin/` → **302** to admin login, or **200** if already authenticated in a browser
* `https://.../healthz` → **200**

You can also check container status on the VM:

```bash
cd /opt/myapp
docker compose -f docker-compose.prod.yml ps
```

For backend logs:

```bash
docker compose -f docker-compose.prod.yml logs -f web
```

For Redis logs:

```bash
docker compose -f docker-compose.prod.yml logs -f redis
```

---

## Redis verification

You can verify Redis from inside the backend container:

```bash
docker compose -f docker-compose.prod.yml exec web printenv REDIS_URL
docker compose -f docker-compose.prod.yml exec web uv run python manage.py shell
```

Then in the Django shell:

```python
from django.core.cache import cache
cache.set("ping", "pong", 60)
cache.get("ping")
```

Expected result:

```python
'pong'
```

You can also verify Redis directly:

```bash
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

Expected result:

```bash
PONG
```

---

## TLS / HTTPS (Let's Encrypt)

TLS is terminated in the `nginx` container.

### Certificate paths on VM

* Certificate storage: `/opt/myapp/certbot/conf`
* ACME webroot (HTTP-01 challenge): `/opt/myapp/certbot/www`

These are mounted into the `nginx` container via `docker-compose.prod.yml`.

### Nginx responsibilities

`deploy/nginx.prod.conf` handles:

* `/.well-known/acme-challenge/` for Let's Encrypt HTTP-01 validation
* HTTP → HTTPS redirect
* HTTPS reverse proxy to:

  * `spa` for `/`
  * `web` for `/api/` and `/admin/`
* direct serving of Django static files from `/static/`

---

## Certificate renewal

Certificates are renewed with Certbot using the webroot method and the same mounted directories as production nginx.

### Test renewal (dry run)

Run this on the VM:

```bash
docker run --rm \
  -v /opt/myapp/certbot/www:/var/www/certbot \
  -v /opt/myapp/certbot/conf:/etc/letsencrypt \
  certbot/certbot renew \
  --webroot -w /var/www/certbot \
  --dry-run
```

### Cron job (recommended)

Use a cron job on the VM to renew certificates automatically and reload nginx after renewal.

Check current cron entries:

```bash
crontab -l
```

Edit cron entries:

```bash
crontab -e
```

A typical setup runs Certbot regularly and then reloads nginx so renewed certificates are picked up.

---

## Optional: local smoke test of production images

You can test the production-style stack locally using:

* `deploy/docker-compose.prod.test.yml`
* `deploy/nginx.prod.test.conf`
* `deploy/.env.prod.test`

This stack includes:

* `db`
* `redis`
* `web`
* `spa`
* `nginx`

Example flow:

```bash
# 1) Build production images locally
docker build -f backend/Dockerfile.prod -t inventory-backend-prod ./backend
docker build -f frontend/Dockerfile.prod -t inventory-frontend-prod ./frontend

# 2) Clean up any previous prod-test run
docker compose -f deploy/docker-compose.prod.test.yml down -v --remove-orphans

# 3) Start local prod-like stack
docker compose -f deploy/docker-compose.prod.test.yml up -d

# 4) Verify services
docker compose -f deploy/docker-compose.prod.test.yml ps
curl -I http://localhost:8081/
curl -I http://localhost:8081/api/schema/
curl -I http://localhost:8081/healthz

# 5) Optional: inspect logs
docker compose -f deploy/docker-compose.prod.test.yml logs --tail=100 nginx web spa db redis

# 6) Tear down when done
docker compose -f deploy/docker-compose.prod.test.yml down -v --remove-orphans
```

### Smoke test env notes

`deploy/.env.prod.test` is only for local prod-like smoke testing.

It should:

* use dummy secrets
* use local test credentials only
* never contain real production passwords, API secrets, or SMTP credentials

---

## Repo-managed vs VM-managed

### Repo-managed (version controlled)

These files live in the repository and should be reviewed in PRs:

* `backend/Dockerfile.prod`
* `frontend/Dockerfile.prod`
* `deploy/docker-compose.prod.yml`
* `deploy/docker-compose.prod.test.yml`
* `deploy/nginx.prod.conf`
* `deploy/nginx.prod.test.conf`
* `deploy/README.md`

### VM-managed (not committed)

These live only on the server:

* `/opt/myapp/.env`
* `/opt/myapp/certbot/conf`
* `/opt/myapp/certbot/www`
* pulled Docker images
* Docker volumes (`postgres_data`, `redis_data`, `static_volume`)

Do not commit VM-specific secrets or certificate material into the repository.

---

## Quick production checklist

Before deploy:

* production images build successfully
* `deploy/docker-compose.prod.yml` is updated
* `deploy/nginx.prod.conf` matches current routing needs
* Redis is included in the stack
* `.env` on the VM contains `REDIS_URL=redis://redis:6379/1`

After deploy:

* `docker compose -f docker-compose.prod.yml ps` shows all services healthy or running
* `https://inventoryx.td.org.uit.no/` loads
* `/api/docs/` works
* admin works
* Redis responds with `PONG`
* Django cache round-trip works

