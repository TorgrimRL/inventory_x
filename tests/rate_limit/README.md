# k6 rate-limit test

This folder contains the k6 test used for the documented rate-limiting check.

See the full documentation here:

```text
docs/testing/rate-limiting/README.md
```

Run locally against the prod-like stack:

```bash
BASE_URL=http://localhost:8081 k6 run tests/rate_limit/k6_load_test.js
```

Optional: run against production:

```bash
BASE_URL=https://inventoryx.td.org.uit.no k6 run tests/rate_limit/k6_load_test.js
```
