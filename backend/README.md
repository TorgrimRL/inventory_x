# Backend

## Commands

**Installation**

```bash
uv sync --frozen
```

**Running the Server**

```bash
uv run python manage.py runserver
```

**Running General Commands**

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

```
backend/
├── config/             <-- Global Settings, Env, & Main Router
├── api/                <-- Domain Logic Container
│   ├── __init__.py
│   ├── inventory/      <-- Inventory Domain (App)
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

**Formatters & Linters**

- `ruff` (Python)
- `prettier` (Markdown/Web)
- `nixfmt` (Nix)
- `typos` (Spell checking)
