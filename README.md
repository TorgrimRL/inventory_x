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

Run tests:

```bash
make test
```

Stop containers:

```bash
make down
```

Reset database (removes all data)::

```bash
make reset
```

Seed mock data:

```bash
make seed
```

Follow logs:

```bash
make seed
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

## Documentation

- Backend docs: `backend/README.md`
- Frontend docs: `frontend/README.md`

### Swagger documentation

```bash
make init # initialize server
make swagger # load the swagger
```
