# OWASP Top 10 Risk Assessment – InventoryX

This document is a short, high-level OWASP Top 10 risk assessment for InventoryX. The goal is to keep the assessment practical: identify the main risks, record the current status, and check whether the project has tests or verification for the most important scenarios.

## Summary

| OWASP category | Status | Risk | Main assessment | Tests / verification |
|---|---|---:|---|---|
| A01 Broken Access Control | Not passed | High | Access control is critical because inventories, items, stock logs and memberships are tenant-scoped. The main risks are users accessing another inventory, employees performing owner-only actions, or stock logs not being scoped correctly. | Partly covered by membership, inventory, stock-log and role-related tests. Needs 2–3 clear negative access-control tests. |
| A02 Cryptographic Failures | Not passed | High | Passwords are hashed with Django, and reset tokens are random and short-lived. However, password reset email content including the token has been logged, reset tokens are stored raw in cache, and `SECRET_KEY` has an unsafe fallback. | Password reset tests exist. Add tests proving reset tokens are not logged, tokens expire/delete after use, and reset passwords use the same validators as signup. |
| A03 Injection | Passed | Low | No raw SQL, dynamic SQL, `eval`, `exec`, shell execution, or unsafe subprocess usage was found. The backend mainly uses Django ORM and serializers. | Functional API tests exist. Add one small hardening test for invalid query input, for example `?year=abc` returning `400` instead of `500`. |
| A04 Insecure Design | Partly passed | Medium | The inventory/member design is mostly reasonable, but the invite flow grants membership immediately instead of using a pending invite + accept flow. | Some membership tests exist. Add tests for invite acceptance behavior if the invite design is changed. |
| A05 Security Misconfiguration | Not passed | High | Production hardening needs work: `SecurityMiddleware` is missing, `DEBUG` defaults to true, HTTPS redirect defaults to false, BasicAuthentication is enabled globally, and API docs are publicly routed. | Add settings/config tests for production mode: SecurityMiddleware present, DEBUG false, no wildcard hosts, no BasicAuthentication, and docs intentionally restricted or explicitly allowed. |
| A06 Vulnerable and Outdated Components | Not passed | High | Frontend dependency audit found vulnerable packages, including high-severity findings for production dependencies such as `axios`. Backend dependency checks were blocked by the Python/pyenv mismatch. | `npm audit` has been run. Add dependency audit to CI and fix the backend Python environment so package health checks can run reliably. |
| A07 Identification and Authentication Failures | Partly passed | Medium | Login, signup and password reset are protected by Nginx rate limiting. Remaining concerns include Auth0 account linking by email and password-reset validator consistency. | Rate limiting is verified with k6 and production curl checks. Login, reset and Auth0 tests exist. Add tests for Auth0 provider identity handling. |
| A08 Software and Data Integrity Failures | Partly passed | Medium | Lockfiles exist, but vulnerable build/dev dependencies and dependency maintenance still create supply-chain risk. | `package-lock.json` exists and audit can be run. Add CI checks for install, audit and build. |
| A09 Security Logging and Monitoring Failures | Not passed | Medium | The main issue is sensitive logging: password reset email content/token is logged. Security-relevant events are logged, but logging should avoid secrets and be more intentional. | Add a regression test confirming reset tokens and reset URLs are never written to logs. |
| A10 Server-Side Request Forgery | Partly passed | Low / Medium | No general user-controlled backend URL fetch was found. Backend outbound requests are mainly Auth0 calls using configured domains. Axios advisories should still be handled. | Add a small review/test confirming users cannot control backend outbound URLs. |

## Highest-priority fixes

1. Fix access-control gaps around inventory scoping, stock logs and owner/employee permissions.
2. Remove password reset token logging and consider hashing reset tokens before storing them in cache.
3. Harden production settings: add `SecurityMiddleware`, make `DEBUG=False` the safe default, review HTTPS redirect, remove global BasicAuthentication unless required, and decide whether API docs should be public.
4. Update vulnerable frontend dependencies and make backend dependency checks reproducible.
5. Improve Auth0 account linking so accounts are not trusted only by matching email.

## Key test scenarios to keep

The project should have a few clear security regression tests rather than a large documentation structure:

- **Access control:** a user cannot access another inventory, and an employee cannot perform owner-only actions.
- **Password reset:** reset tokens are not logged, expire or are deleted after use, and new passwords follow the same policy as signup.
- **Rate limiting:** login, signup, password reset and general API requests return `429 Too Many Requests` when the Nginx limits are exceeded.

## Next steps

The next step is to convert the remaining risks into concrete backlog tasks. Each task should describe the risk, the affected area, the expected fix, and the regression test or verification needed before the task can be closed.

Suggested backlog tasks:

- Fix tenant-scoping and owner/employee access-control gaps.
- Remove password reset token logging and strengthen reset-token storage.
- Harden production security settings.
- Update vulnerable dependencies and add dependency checks to CI.
- Review Auth0 account linking and provider identity handling.

## Conclusion

InventoryX has a solid base: Django ORM, serializers, session authentication, explicit memberships, Auth0 state validation and Nginx rate limiting. The main remaining risks are access control, password reset handling, production configuration and dependency maintenance.

Overall assessment: **not cleared yet**. The risks are concrete and can be reduced with targeted fixes and a small set of focused regression tests.
