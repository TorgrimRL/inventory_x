/**
 * k6 Combined Load and Rate-Limit Test — Inventory X
 *
 * Covers two concerns in one run:
 *   1. Lightweight normal load check — response times and server-error rate
 *   2. Rate-limit verification       — spike floods that must trigger HTTP 429
 *
 * Prerequisites:
 *   - k6 installed: https://k6.io/docs/get-started/installation/
 *   - local prod-like stack running, or access to the deployed production URL
 *
 * Run locally:
 *   BASE_URL=http://localhost:8081 k6 run tests/rate_limit/k6_load_test.js
 *
 * Run against production:
 *   BASE_URL=https://inventoryx.td.org.uit.no k6 run tests/rate_limit/k6_load_test.js
 *
 * Run on k6 Cloud:
 *   BASE_URL=https://inventoryx.td.org.uit.no k6 cloud run tests/rate_limit/k6_load_test.js
 *
 * Note on per-IP rate limiting:
 *   For the most predictable rate-limit verification, run this test locally
 *   against the prod-like stack or production endpoint, because all requests
 *   then originate from the same client IP. Cloud execution can still be used
 *   for report generation, but distributed cloud execution may affect per-IP
 *   rate-limit behavior.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8081";
const TEST_EMAIL = __ENV.TEST_EMAIL || "k6loadtest@example.com";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "LoadTest123!";

// Treat 2xx, 3xx, and 4xx as expected HTTP responses.
// This prevents expected auth/validation responses such as 401, 403, 409,
// and 429 from being counted as request failures by k6.
// Server errors are still tracked separately through normal_load_server_errors.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

const loginRateLimited = new Counter("login_rate_limited");
const signupRateLimited = new Counter("signup_rate_limited");
const pwresetRateLimited = new Counter("pwreset_rate_limited");
const apiRateLimited = new Counter("api_rate_limited");

const normalLoadServerErrors = new Counter("normal_load_server_errors");

const authDuration = new Trend("auth_duration_ms", true);
const apiDuration = new Trend("api_duration_ms", true);

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const options = {
  scenarios: {
    normal_load: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "20s", target: 0 },
      ],
      exec: "normalUser",
    },

    login_spike: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 12,
      exec: "loginFlood",
      startTime: "2m30s",
    },

    signup_spike: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 10,
      exec: "signupFlood",
      startTime: "2m45s",
    },

    pwreset_spike: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 10,
      exec: "pwresetFlood",
      startTime: "3m00s",
    },

    api_spike: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 50,
      exec: "apiFlood",
      startTime: "3m15s",
    },
  },

  thresholds: {
    // Lightweight normal-load check
    "http_req_duration{scenario:normal_load}": ["p(95)<2000"],
    normal_load_server_errors: ["count==0"],

    // Each configured rate-limit zone must trigger at least one 429
    login_rate_limited: ["count>=1"],
    signup_rate_limited: ["count>=1"],
    pwreset_rate_limited: ["count>=1"],
    api_rate_limited: ["count>=1"],
  },
};

// ---------------------------------------------------------------------------
// Setup — create and log in a test user once
// ---------------------------------------------------------------------------

export function setup() {
  const headers = { "Content-Type": "application/json" };

  // Create test user. 400/409 is fine if the user already exists.
  http.post(
    `${BASE_URL}/api/user/signup/`,
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
    { headers },
  );

  const loginRes = http.post(
    `${BASE_URL}/api/user/login/`,
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
    { headers },
  );

  const sessionId = loginRes.cookies.sessionid?.[0]?.value ?? null;
  const csrfToken = loginRes.cookies.csrftoken?.[0]?.value ?? null;

  if (!sessionId) {
    console.warn(
      "setup(): no session cookie. Authenticated endpoints may return 401/403 during normal_load.",
    );
  }

  return { sessionId, csrfToken };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function recordNormalLoadServerError(res) {
  if (res.status >= 500) {
    normalLoadServerErrors.add(1);
  }
}

// ---------------------------------------------------------------------------
// Normal user scenario
// ---------------------------------------------------------------------------

export function normalUser(data) {
  const authHeaders =
    data.sessionId && data.csrfToken
      ? {
          "Content-Type": "application/json",
          Cookie: `sessionid=${data.sessionId}; csrftoken=${data.csrfToken}`,
          "X-CSRFToken": data.csrfToken,
        }
      : { "Content-Type": "application/json" };

  let res = http.get(`${BASE_URL}/healthz`);
  recordNormalLoadServerError(res);
  check(res, { "healthz: 200": (r) => r.status === 200 });
  sleep(0.3);

  res = http.get(`${BASE_URL}/api/user/verify/`, { headers: authHeaders });
  recordNormalLoadServerError(res);
  check(res, { "verify: no 5xx": (r) => r.status < 500 });
  authDuration.add(res.timings.duration);
  sleep(0.5);

  if (res.status === 200) {
    res = http.get(`${BASE_URL}/api/inventory/inventories/`, {
      headers: authHeaders,
    });
    recordNormalLoadServerError(res);
    check(res, { "inventories: no 5xx": (r) => r.status < 500 });
    apiDuration.add(res.timings.duration);
    sleep(0.5);

    res = http.get(`${BASE_URL}/api/inventory/active/`, {
      headers: authHeaders,
    });
    recordNormalLoadServerError(res);
    check(res, { "active inventory: no 5xx": (r) => r.status < 500 });
    apiDuration.add(res.timings.duration);
    sleep(1);
  }
}

// ---------------------------------------------------------------------------
// Spike / flood functions
// ---------------------------------------------------------------------------

const JSON_HEADERS = { "Content-Type": "application/json" };

export function loginFlood() {
  const res = http.post(
    `${BASE_URL}/api/user/login/`,
    JSON.stringify({
      email: "probe@example.com",
      password: "probe",
    }),
    { headers: JSON_HEADERS },
  );

  if (res.status === 429) {
    loginRateLimited.add(1);
  }

  check(res, { "login flood: no 5xx": (r) => r.status < 500 });
}

export function signupFlood() {
  const res = http.post(
    `${BASE_URL}/api/user/signup/`,
    JSON.stringify({
      email: "probe@example.com",
      password: "probe123!",
    }),
    { headers: JSON_HEADERS },
  );

  if (res.status === 429) {
    signupRateLimited.add(1);
  }

  check(res, { "signup flood: no 5xx": (r) => r.status < 500 });
}

export function pwresetFlood() {
  const res = http.post(
    `${BASE_URL}/api/user/password_reset?email=probe@example.com`,
    null,
    { headers: JSON_HEADERS },
  );

  if (res.status === 429) {
    pwresetRateLimited.add(1);
  }

  check(res, { "pwreset flood: no 5xx": (r) => r.status < 500 });
}

export function apiFlood() {
  const res = http.get(`${BASE_URL}/api/user/verify/`);

  if (res.status === 429) {
    apiRateLimited.add(1);
  }

  check(res, { "api flood: no 5xx": (r) => r.status < 500 });
}
