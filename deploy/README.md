Supert — her er en ferdig `deploy/README.md` du kan lime inn.

# Deployment (production)

Production deployment for Inventory X uses Docker images built in GitHub Actions and deployed to a VM with Docker
Compose.

## What is used in production

Production deployment uses:

- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deploy/docker-compose.prod.yml`
- `deploy/nginx.prod.conf`

Images are built and pushed to **GHCR** via GitHub Actions, and the VM deploy pulls tagged images and restarts the
stack.

---

## Production architecture (summary)

On the VM, `/opt/myapp` contains:

- `docker-compose.prod.yml`
- `nginx.prod.conf`
- `.env`

The production stack runs:

- `nginx` (public entrypoint / reverse proxy / TLS termination)
- `spa` (static frontend container)
- `web` (Django + gunicorn)
- `db` (PostgreSQL)

---

## Deploy flow

Deployment is triggered by GitHub Actions (`.github/workflows/deploy.yml`).

Typical flow:

1. Push changes to the branch the deploy workflow listens to (or run it manually with `workflow_dispatch`).
2. GitHub Actions builds and pushes production images to GHCR.
3. The deploy job connects to the VM over SSH.
4. The VM pulls the new images and restarts the production stack:
    - `docker compose -f docker-compose.prod.yml pull`
    - `docker compose -f docker-compose.prod.yml up -d --remove-orphans`

---

## VM `.env` (production)

The VM `.env` file contains production-specific values (separate from local development).

Example (do **not** commit real secrets):

```env
DEBUG=False
SECRET_KEY=<strong-unique-secret>

POSTGRES_USER=inventory
POSTGRES_PASSWORD=<strong-db-password>
POSTGRES_DB=inventory_db
DATABASE_URL=postgres://inventory:<strong-db-password>@db:5432/inventory_db

ALLOWED_HOSTS=inventoryx.td.org.uit.no
CORS_ALLOWED_ORIGINS=https://inventoryx.td.org.uit.no
CSRF_TRUSTED_ORIGINS=https://inventoryx.td.org.uit.no
SECURE_SSL_REDIRECT=True
````

> Note: local development uses `.env` values from `.env.example` (Docker Compose + local Postgres container), while
> production uses a separate `.env` in `/opt/myapp`.

---

## Production verification

After a deploy, verify the app is reachable and HTTPS works:

```bash
curl -I http://inventoryx.td.org.uit.no/
curl -I https://inventoryx.td.org.uit.no/
curl -I https://inventoryx.td.org.uit.no/api/docs/
curl -I https://inventoryx.td.org.uit.no/admin/
```

Expected results:

* `http://...` → **301** redirect to `https://...`
* `https://.../` → **200**
* `https://.../api/docs/` → **200**
* `https://.../admin/` → **302** to admin login (or **200** if already authenticated in a browser)

You can also check container status on the VM:

```bash
cd /opt/myapp
docker compose -f docker-compose.prod.yml ps
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

---

## Certificate renewal

Certificates are renewed with Certbot (webroot method), using the same mounted directories as production nginx.

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

You can test the **production images** locally (SPA + Gunicorn + Nginx + Postgres) using:

* `deploy/docker-compose.prod.test.yml`

This is useful for verifying the production container setup before deploying to the VM.

Example flow:

```bash
# 1) Build production images locally
docker build -f backend/Dockerfile.prod -t inventory-backend-prod ./backend
docker build -f frontend/Dockerfile.prod -t inventory-frontend-prod ./frontend

# 2) Clean up any previous prod-test run (recommended)
docker compose -f deploy/docker-compose.prod.test.yml down -v --remove-orphans

# 3) Start local prod-like stack
docker compose -f deploy/docker-compose.prod.test.yml up -d

# 4) Verify
docker compose -f deploy/docker-compose.prod.test.yml ps
curl -I http://localhost:8081/

# Retry API until backend is ready (max ~30s)
for i in {1..15}; do
  if curl -fsS http://localhost:8081/api/schema/ >/dev/null; then
    echo "API is up"
    break
  fi
  echo "Waiting for API... ($i/15)"
  sleep 2
done

# Optional: show final headers
curl -I http://localhost:8081/api/schema/

# 5) Inspect logs if needed
docker compose -f deploy/docker-compose.prod.test.yml logs --tail=100 nginx web spa db

# 6) Tear down when done
docker compose -f deploy/docker-compose.prod.test.yml down -v --remove-orphans
```

---

## Repo-managed vs VM-managed

### Repo-managed (version controlled)

These files should live in the repository and be reviewed in PRs:

* `.github/workflows/deploy.yml`
* `deploy/docker-compose.prod.yml`
* `deploy/nginx.prod.conf`
* `deploy/docker-compose.prod.test.yml`
* `backend/Dockerfile.prod`
* `frontend/Dockerfile.prod`

### VM-managed (not committed)

These live only on the VM (runtime state, secrets, certificates):

* `/opt/myapp/.env`
* `/opt/myapp/certbot/conf/*` (Let's Encrypt certs/private keys)
* `/opt/myapp/certbot/www/*` (ACME challenge webroot)
* cron jobs (`crontab -e`)
* Docker volumes (e.g. Postgres data)

---

## Troubleshooting

### `502 Bad Gateway` from `/api/...` right after startup

This can happen briefly while:

* PostgreSQL is starting
* Django migrations are running
* Gunicorn is not yet ready

Wait a few seconds and retry.

---

### Check nginx config syntax

```bash
cd /opt/myapp
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

### Inspect logs

```bash
cd /opt/myapp
docker compose -f docker-compose.prod.yml logs --tail=100 nginx web spa db
```

---

### `port 80 is already allocated` when running Certbot

If nginx is already using port 80, do **not** run Certbot with `-p 80:80`.

Use the **webroot** method (with mounted `/opt/myapp/certbot/www`) while nginx serves the challenge path.

---

## One-time VM bootstrap (summary)

When provisioning a fresh VM, the high-level steps are:

1. Install Docker + Docker Compose
2. Create `/opt/myapp`
3. Copy production files from `deploy/`:

    * `docker-compose.prod.yml`
    * `nginx.prod.conf`
4. Create `/opt/myapp/.env` with production values
5. Create certbot directories:

    * `/opt/myapp/certbot/www`
    * `/opt/myapp/certbot/conf`
6. Start the stack
7. Issue Let's Encrypt certificate (webroot)
8. Enable HTTPS redirect + TLS nginx config
9. Enable automatic certificate renewal (cron)

---

```

To små tips før du committer:
- Pass på at root `README.md` nå har en kort peker, f.eks.  
  `- Production deployment docs: deploy/README.md`
- Ikke legg inn faktisk cron-linje hvis du vil holde den generell (det er helt fint å bare beskrive den som over)

Hvis du vil, kan jeg også gi deg en **kort root README-erstatningstekst** for deployment-seksjonen (2–4 linjer).
```
