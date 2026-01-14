# Backend

## Commands

**Installation**

```bash
uv sync --frozen
```

### MIGRATION

**Add Migration**

> A Database schema presents as a object, crete a new table is done by
> initialize a new class, and sets its field by sets the class attributes in
> 'api/inventory/models.py'. Then run the command below to generate a completed
> migrate file and sync to the database.

```bash
uv run python manage.py makemigrations
```

**Apply Migration**

```bash
uv run python manage.py migrate
```

**Seed Mock Data**

```bash
uv run python manage.py seed_db
```

NOTE: `seed_db` is just the name of the `.py` file in
`api/<domain>/management/commands/`

**Running the Server**

```bash
uv run python manage.py runserver
```

Note for docker this has to be run instead:
`uv run python manage.py runserver 0.0.0.0:8000`

**Running General Commands in uv**

```bash
uv run {command}
```

---

## Architecture & Structure

Domain-Driven structure with a Service Layer pattern to ensure testability and
robustness.

### Directory Layout

The standard Django "inner project folder" (usually named `backend/`) has been
renamed to `config/` to avoid the repetitive `backend/backend/` structure.

```text
backend/
├── config/             <-- Global Settings, Env, & Main Router
├── api/                <-- Domain Logic Container
│   ├── inventory/      <-- Inventory Domain (App)
│   │   ├── migrations/     <-- Database schema changes (Do not edit manually)
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_db.py  <-- Script: Populates DB with mock data
│   │   ├── apps.py     <-- App Configuration (api.inventory)
│   │   ├── urls.py     <-- Domain-specific Routes
│   │   ├── services.py <-- Business Logic (Pure Python)
│   │   └── views.py    <-- HTTP Interface (Calls Services)
│   └── users/          <-- (Future) Users Domain
├── manage.py
└── ...
```

### Design Patterns

1. **Service Layer** (`services.py`): Contains all business logic. Pure Python
   functions. Independent of HTTP.
1. **Views** (`views.py`): "Thin" interface. Handles HTTP requests/responses and
   calls the Service Layer.
1. **Scalability:** Both views.py and services.py can be converted into
   directories (packages) when complexity grows.

This approach has the benefits of:

1. better testing experience (service and responses can be tested separately)
1. in the case of frontend changes (where response might change) the service
   remains the same

---

## Versions & Environment

**Core**

- `uv 0.9.24`
- `Python 3.12.12`
- `PostgreSQL 16`

**Formatters & Linters**

- `ruff` (Python)
- `prettier` (Markdown/Web)
- `typos` (Spell checking)
- `shfmt` (Shell/Bash)

**Environment Variables**

- `DATABASE_URL`: `postgres://<USERNAME>:pass@db_container:5432/inventory_db`
- `DEBUG`: `True`
- `SECRET_KEY`: `<any-random-string>`
