# Prod-like smoke test

This project includes a prod-like smoke test that starts the full stack with Docker Compose and verifies that the
application is reachable through nginx.

It is intended to catch problems that unit tests, integration tests, linting, and formatting may miss when services are
tested in isolation.

## What it checks

The smoke test starts the stack defined in:

- `deploy/docker-compose.prod.test.yml`

Then it verifies that these endpoints behave as expected:

- `GET /healthz` -> `200`
- `GET /` -> `200`
- `GET /api/schema/` -> `200`
- `GET /api/docs/` -> `200`
- `GET /admin/` -> `301` or `302`

## Why this exists

This test is useful because it validates the application as a full prod-like stack instead of validating backend and
frontend separately.

Examples of issues it can catch:

- backend not becoming ready during real container startup
- migrations delaying or breaking application availability
- important routes no longer being reachable in the full stack
- regressions in schema/docs/admin availability behind nginx
- differences between isolated test execution and real container startup

## Run locally

```bash
chmod +x scripts/prod_smoke.sh
./scripts/prod_smoke.sh
````

To keep containers running for debugging after a failure:

```bash
TEARDOWN=0 ./scripts/prod_smoke.sh
```

## CI

The smoke test also runs in GitHub Actions:

* `.github/workflows/prod-smoke.yml`

This provides an extra check on pull requests and on `main`.

## Notes

The smoke test includes retries because the backend may not be ready immediately while migrations are still running.

This is expected in a prod-like startup flow.
