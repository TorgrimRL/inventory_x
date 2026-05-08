# Backend Development Guide

> **Recommended:** For local development, use the Docker quickstart in the
> repository root (`../README.md`). This guide is primarily for running and
> developing the Django backend directly on your host machine.

---

## Architecture & Structure

The backend uses a **Domain-Driven Design (DDD)** approach combined with a
**Service Layer pattern**. This ensures business logic is highly testable,
robust, and decoupled from the HTTP routing.

### Directory Layout

The standard Django inner project folder is named `config/` (instead of
`backend/`) to house global settings, while domain logic lives inside the `api/`
directory.

```text
backend/
├── config/                 <-- Global Settings
├── api/                    <-- Domain Logic Container
│   ├── common/             <-- Shared utilities and base classes
│   ├── inventory/          <-- Inventory Domain
│   │   ├── contracts/      <-- Request/Response schemas (API Contracts)
│   │   ├── management/     <-- Custom Django management commands
│   │   ├── migrations/     <-- Database schema changes (Auto-generated)
│   │   ├── models.py       <-- Database schemas and ORM definitions
│   │   ├── serializers/    <-- Data validation and object serialization
│   │   ├── services/       <-- Business Logic
│   │   ├── tests/          <-- Unit and Integration tests
│   │   ├── urls.py         <-- Domain-specific routing
│   │   └── views/          <-- HTTP Interface
│   └── user/               <-- User & Authentication Domain
├── manage.py
└── pyproject.toml

```

### Design Principles

1. **Views (`views/`):** A "thin" HTTP interface. They extract request data,
   call the appropriate Service, and return an HTTP response.
2. **Service Layer (`services/`):** Contains all business logic. These are pure
   Python functions that handle the heavy lifting and database interactions.
3. **Contracts/Serializers (`contracts/` & `serializers/`):** Enforce strict
   input/output boundaries.

---

## Local Setup (Without Docker)

### Prerequisites

Ensure you have the following installed:

- `uv` (0.9.24+)
- Python 3.12+
- PostgreSQL 16
- Redis (for caching/sessions)

### 1. Environment Configuration

Copy the example environment file and configure it for your local machine:

```bash
cp ../.env.example .env

```

_Note: If running outside of Docker, ensure your `DATABASE_URL` and `REDIS_URL`
point to `localhost` or `127.0.0.1` instead of the Docker service names._

### 2. Installation

Sync your Python environment using `uv`:

```bash
uv sync --frozen

```

### 3. Database Setup & Seeding

Apply database migrations:

```bash
uv run python manage.py migrate

```

Seed the database with mock data and test users:

```bash
uv run python manage.py seed_users
uv run python manage.py seed_inventory

```

---

## Running the Server

Start the Django development server:

```bash
uv run python manage.py runserver

```

_(Note: Inside a Docker container, you must bind to all interfaces using
`uv run python manage.py runserver 0.0.0.0:8000`)_

### Admin Interface

The Django Admin panel is enabled for rapid data inspection:

- **URL:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **Default Superuser:** (Available after running `seed_users`)
- **Email:** `admin@example.com`
- **Password:** `adminpass123`

---

## Development Commands

All Python scripts and tools should be executed through `uv run`.

### Formatting & Linting (Ruff & Prettier)

**Auto-format Python code:**

```bash
uv run ruff format .

```

**Check Python formatting:**

```bash
uv run ruff format --check .

```

**Auto-fix Python linting errors:**

```bash
uv run ruff check --fix .

```

**Auto-format Markdown docs:**

```bash
npx prettier --write README.md

```

### Type Checking (Mypy)

Run strict type checking across the codebase:

```bash
uv run mypy . --exclude 'migrations/'

```

### Testing (Pytest)

Run all backend tests (stops on first failure):

```bash
uv run pytest -v -x

```

### Database Migrations

When you modify a model in `models.py`, generate a new migration file:

```bash
uv run python manage.py makemigrations

```

Then, apply the new migration to your database:

```bash
uv run python manage.py migrate

```

_Always remember to commit your newly generated migration files to version
control._
