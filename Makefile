.PHONY: up down reset seed logs fmt lint test check init logs-backend logs-frontend logs-db

BACKEND_RUN = docker compose run --rm backend
BACKEND_RUN_NODEPS = docker compose run --rm --no-deps backend
FRONTEND_RUN = docker compose run --rm --no-deps frontend

up:
	docker compose up --build

down:
	docker compose down

reset:
	docker compose down -v 
	docker compose up --build -d

seed:
	$(BACKEND_RUN) uv run python manage.py seed_inventory
	$(BACKEND_RUN) uv run python manage.py seed_users

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

fmt:
	$(BACKEND_RUN_NODEPS) uv run ruff format .
	$(FRONTEND_RUN) npx prettier --ignore-path /repo/.prettierignore --write /repo/README.md /repo/backend/README.md /repo/frontend/README.md
	$(FRONTEND_RUN) npm run format

lint:
	$(BACKEND_RUN_NODEPS) uv run ruff check . --fix
	$(FRONTEND_RUN) npx eslint . --fix

test:
	$(BACKEND_RUN) uv run pytest -v -x
	$(FRONTEND_RUN) npm test

type-check:
	$(BACKEND_RUN_NODEPS) uv run mypy . --exclude 'migrations/'

check:
	$(BACKEND_RUN_NODEPS) uv run ruff format --check .
	$(BACKEND_RUN_NODEPS) uv run ruff check .
	$(BACKEND_RUN_NODEPS) uv run mypy . --exclude 'migrations/'
	$(FRONTEND_RUN) npx prettier --ignore-path /repo/.prettierignore --check /repo/README.md /repo/backend/README.md /repo/frontend/README.md
	$(FRONTEND_RUN) npm run format:check
	$(FRONTEND_RUN) npx eslint .
	$(BACKEND_RUN) uv run pytest -v -x
	$(FRONTEND_RUN) npm test
	@echo "✅ All checks passed"

init:
	make reset
	make seed
