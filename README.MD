
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
````


### 2) Start the stack

```bash
docker compose up --build
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:8000](http://localhost:8000)

### 3) (Optional) Seed mock data

In a new terminal:

```bash
docker compose run --rm backend uv run python manage.py seed_db
```

---

## Useful commands

Stop containers:

```bash
docker compose down
```

Reset database (removes all data):

```bash
docker compose down -v
docker compose up --build
```

Run tests:

```bash
docker compose run --rm backend uv run pytest -v -x
docker compose run --rm frontend npm test
```

---

## Documentation

* Backend docs: `backend/README.md`
* Frontend docs: `frontend/README.md`

