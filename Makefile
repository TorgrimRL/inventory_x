.PHONY: up down reset seed logs fmt lint test check init logs-backend logs-frontend logs-db debug-up debug-down swagger

BACKEND_RUN = docker compose run --rm backend
BACKEND_RUN_NODEPS = docker compose run --rm --no-deps backend
FRONTEND_RUN = docker compose run --rm --no-deps frontend

ARGS = $(filter-out test,$(MAKECMDGOALS))
FIRST = $(word 1,$(ARGS))
REST = $(wordlist 2,$(words $(ARGS)),$(ARGS))
NEED_API_PREFIX = $(and $(REST),$(filter-out -% %::% api/%,$(firstword $(REST))))
BACKEND_PATH = $(if $(NEED_API_PREFIX),api/$(REST),$(REST))
JEST_ARGS ?= --ci


ifneq ($(filter test,$(MAKECMDGOALS)),)
  $(eval $(filter-out test,$(MAKECMDGOALS)):;@:)
endif


define norm_one_frontend_arg
$(strip \
  $(if $(filter -% --%,$(1)),$(1),\
    $(if $(filter src/%,$(1)),$(1),\
      $(if $(filter test/%,$(1)),src/$(1),\
        $(if $(or $(findstring /,$(1)),$(findstring .,$(1))),\
          $(if $(or $(findstring .test.,$(1)),$(findstring .spec.,$(1))),src/test/$(1),src/$(1)),\
          $(1)\
        )\
      )\
    )\
  )\
)
endef


define norm_frontend_args
$(foreach a,$(1),$(call norm_one_frontend_arg,$(patsubst frontend/%,%,$(a))))
endef



up:
	docker compose up --build -d

down:
	docker compose down --remove-orphans

reset:
	docker compose down -v --remove-orphans
	docker compose up --build -d

seed:
	$(BACKEND_RUN) uv run python manage.py seed_users
	$(BACKEND_RUN) uv run python manage.py seed_inventory

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

tidy: fmt lint

fmt:
	$(BACKEND_RUN_NODEPS) uv run ruff format .
	$(FRONTEND_RUN) npx prettier --ignore-path /repo/.prettierignore --write /repo/README.md /repo/backend/README.md /repo/frontend/README.md
	$(FRONTEND_RUN) npm run format

lint:
	$(BACKEND_RUN_NODEPS) uv run ruff check . --fix
	$(FRONTEND_RUN) npx eslint . --fix

test:
ifeq ($(strip $(ARGS)),)
	$(BACKEND_RUN) uv run pytest -v -x
	$(FRONTEND_RUN) npm test -- $(JEST_ARGS)
else ifeq ($(FIRST),backend)
	$(BACKEND_RUN) uv run pytest -v -x $(BACKEND_PATH)
else ifeq ($(FIRST),frontend)
ifeq ($(strip $(REST)),)
	$(FRONTEND_RUN) npm test -- $(JEST_ARGS)
else
	$(FRONTEND_RUN) npm test -- $(JEST_ARGS) $(call norm_frontend_args,$(REST))
endif
else
	@echo "Usage:"
	@echo "  make test                    # backend + frontend"
	@echo "  make test backend [path..]   # backend only(can skip 'api/' prefix)"
	@echo "  make test frontend [args..]  # frontend only(can skip 'src/' prefix)"
	@exit 2
endif


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

debug-up:
	docker compose -f docker-compose.yml -f docker-compose.debug.yml up --build -d backend db
debug-down:
	docker compose -f docker-compose.yml -f docker-compose.debug.yml stop backend db

swagger:
	python3 -u backend/scripts/open_swagger.py http://localhost:8000/api/docs/ || true

init:
	$(MAKE) reset
	$(MAKE) seed
