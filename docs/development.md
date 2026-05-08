# Development Guide

This document contains the detailed technical instructions for developing, testing, and debugging the Inventory X platform.

---

## Useful Commands

We use a `Makefile` to simplify common development tasks.

**Run all checks (format, lint, tests):**
```bash
make check

```

**Auto-format everything:**

```bash
make fmt

```

### Testing

Run all tests:

```bash
make test

```

You can scope testing to the `backend` or `frontend`, and narrow it further by adding an optional path. You may omit the `api/` prefix for backend paths, the `src/` prefix for frontend paths, and the `test/` prefix for frontend test files.

*Examples:*

```bash
make test frontend inventories.test.tsx
make test frontend test/inventories.test.tsx
make test frontend ItemPage.test.tsx
make test backend inventory/tests/test_views.py

```

### Docker & Database Operations

**Stop containers:**

```bash
make down

```

**Reset database (removes all data):**

```bash
make reset

```

**Seed mock data:**

```bash
make seed

```

### Logging

**Follow all logs:**

```bash
make logs

```

**Follow logs for a single service:**

```bash
make logs-backend
make logs-frontend
make logs-db

```

---

## Prod-like Smoke Test

A prod-like smoke test is available to verify that the full stack starts correctly behind nginx.

Run locally with:

```bash
./scripts/prod_smoke.sh

```

For more details, see: `docs/prod_smoke.md`

---

## Debugging (VS Code + Docker)

### 1) Start backend & DB in debug mode (debugpy on `:5678`)

```bash
make debug-up

```

### 2) Debug Django runserver

Attach to `:5678`:
*VS Code → Run and Debug → Django runserver in Docker (attach :5678)*

### 3) Debug Pytest

Attach to `:5679`:
*VS Code → Run and Debug → Pytest in Docker (attach :5679)*

### 4) Stop Debug

```bash
make debug-down

```
