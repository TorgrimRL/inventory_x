# Inventory X (Monorepo)

Monorepo containing:

- **Frontend**: React + TypeScript + Vite (+ Jest)
- **Backend**: Django (uv)
- **Database**: PostgreSQL
- **Dev environment**: Docker Compose

---

## Quickstart (Docker)

### 1) Create your environment file

```bash
cp .env.example .env
```

### 2) First-time setup (fresh DB + seed)

```bash
make init
```

make init resets the database volume (all data is deleted) and seeds mock data.

### 3) Start the stack (next times)

```bash
make up
```

This starts the development stack (Vite + Django + Postgres) via Docker Compose.

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## Useful commands

Run all checks (format, lint, tests):

```bash
make check
```

Auto-format everything:

```bash
make fmt
```

Testing

```bash
make test
```

`make test` runs all tests. You can scope it to `backend` or `frontend`, and narrow it further by adding an optional
path after that (you may omit the `api/` and `src/` prefixes).
Example:
`make test frontend src/math.test.tsx` # or: `make test frontend math.test.tsx`

Stop containers:

```bash
make down
```

Reset database (removes all data):

```bash
make reset
```

Seed mock data:

```bash
make seed
```

Follow logs:

```bash
make logs
```

Follow logs for a single service:

```bash
make logs-backend
```

```bash
make logs-frontend
```

```bash
make logs-db
```

## Debugging (VS Code + Docker)

### 1) Start backend + db i debug-modus (debugpy på :5678)

```bash
make debug-up
```

### 2) Debug Django runserver (attach :5678)

VS Code → Run and Debug → Django runserver in Docker (attach :5678)

### 3) Debug Pytest (attach :5679)

VS Code → Run and Debug → Pytest in Docker (attach :5679)
Stop debug

### Stop debug

```bash
make debug-down
```

## Deployment (production)

Production deployment uses:

- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deploy/docker-compose.prod.yml`
- `deploy/nginx.prod.conf`

Images are built and pushed to **GHCR** via GitHub Actions, and the VM deploy pulls tagged images and restarts the
stack.

### VM runtime (summary)

On the VM, `/opt/myapp` contains:

- `docker-compose.prod.yml`
- `nginx.prod.conf`
- `.env`

The production stack runs:

- `nginx` (public entrypoint)
- `spa` (static frontend container)
- `web` (Django + gunicorn)
- `db` (PostgreSQL)

### Optional: local smoke test of production images

You can also test the **production images** locally (SPA + Gunicorn + Nginx + Postgres) using:

- `deploy/docker-compose.prod.test.yml`

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

## Documentation

- Backend docs: `backend/README.md`
- Frontend docs: `frontend/README.md`

### Swagger documentation

```bash
make init # initialize server
make swagger # load the swagger
```

### Login credentials to test
username: admin@example.com
password: adminpass123

alice@example.com
alicepass456

bob@example.com
bobpass789
