#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.prod.test.yml}"
PROJECT_NAME="${PROJECT_NAME:-inventoryx-smoke}"
BASE_URL="${BASE_URL:-http://localhost:8081}"
ARTIFACT_DIR="${ARTIFACT_DIR:-.smoke-artifacts}"
TEARDOWN="${TEARDOWN:-1}"
SEED_COMMAND="${SEED_COMMAND:-}"

# Readiness tuning.
# Keep defaults fairly safe for CI, but allow faster local failure when debugging.
HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-20}"
ROOT_ATTEMPTS="${ROOT_ATTEMPTS:-20}"
SCHEMA_ATTEMPTS="${SCHEMA_ATTEMPTS:-15}"
WAIT_SLEEP_SECONDS="${WAIT_SLEEP_SECONDS:-2}"

mkdir -p "${ARTIFACT_DIR}"

compose() {
  docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
}

dump_debug() {
  echo
  echo "==== docker compose ps ===="
  compose ps | tee "${ARTIFACT_DIR}/compose-ps.txt" || true

  echo
  echo "==== docker compose logs ===="
  compose logs --no-color | tee "${ARTIFACT_DIR}/compose-logs.txt" || true
}

cleanup() {
  if [[ "${TEARDOWN}" == "1" ]]; then
    echo
    echo "Tearing down smoke stack..."
    compose down -v --remove-orphans || true
  else
    echo
    echo "TEARDOWN=0, leaving stack running for debugging."
  fi
}

on_error() {
  local exit_code=$?
  echo
  echo "Smoke test failed with exit code ${exit_code}"
  dump_debug
  exit "${exit_code}"
}

trap on_error ERR
trap cleanup EXIT

http_code() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" "${url}"
}

wait_for_url() {
  local url="$1"
  local expected_regex="$2"
  local label="$3"
  local attempts="$4"
  local sleep_seconds="$5"

  echo "Waiting for ${label} at ${url} ..."
  for ((i=1; i<=attempts; i++)); do
    code="$(http_code "${url}" || true)"
    if [[ "${code}" =~ ${expected_regex} ]]; then
      echo "OK: ${label} responded with ${code}"
      return 0
    fi
    echo "Attempt ${i}/${attempts}: ${label} not ready yet (got ${code:-no-response})"
    sleep "${sleep_seconds}"
  done

  echo "Timed out waiting for ${label} at ${url}"
  return 1
}

assert_url() {
  local url="$1"
  local expected_regex="$2"
  local label="$3"

  code="$(http_code "${url}" || true)"
  if [[ ! "${code}" =~ ${expected_regex} ]]; then
    echo "FAIL: ${label} expected ${expected_regex}, got ${code:-no-response}"
    return 1
  fi

  echo "PASS: ${label} -> ${code}"
}

echo "Using compose file: ${COMPOSE_FILE}"
echo "Using base url: ${BASE_URL}"

echo
echo "Cleaning old stack..."
compose down -v --remove-orphans || true

echo
echo "Building and starting prod-like stack..."
compose up -d --build

echo
echo "Initial container state:"
compose ps | tee "${ARTIFACT_DIR}/compose-ps-start.txt"

if [[ -n "${SEED_COMMAND}" ]]; then
  echo
  echo "Running seed command inside web container..."
  compose exec -T web sh -lc "${SEED_COMMAND}"
fi

echo
echo "Readiness checks..."
wait_for_url "${BASE_URL}/healthz" '^200$' "nginx /healthz" "${HEALTH_ATTEMPTS}" "${WAIT_SLEEP_SECONDS}"
wait_for_url "${BASE_URL}/" '^200$' "spa /" "${ROOT_ATTEMPTS}" "${WAIT_SLEEP_SECONDS}"
wait_for_url "${BASE_URL}/api/schema/" '^200$' "django /api/schema/" "${SCHEMA_ATTEMPTS}" "${WAIT_SLEEP_SECONDS}"

echo
echo "Smoke assertions..."
assert_url "${BASE_URL}/" '^200$' "SPA root"
assert_url "${BASE_URL}/healthz" '^200$' "nginx health"
assert_url "${BASE_URL}/api/schema/" '^200$' "Django schema"
assert_url "${BASE_URL}/api/docs/" '^200$' "Django docs"
assert_url "${BASE_URL}/admin/" '^(301|302)$' "admin redirect/login"

echo
echo "Smoke test passed."
