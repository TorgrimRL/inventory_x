# Pull requests merged to main since the previous TA meeting

- Report date: 2026-02-03
- Period: 2026-01-27 to 2026-02-03
- Base branch: `main`
- Number of PRs: 7

# This week summary of merged PRs

- **API documentation:** This week, the group added Swagger/OpenAPI support for the backend and a `make swagger` command to open the API documentation. This makes the backend easier to understand, test, and use from the frontend, and gives the team a clearer shared contract for available endpoints.

- **Login flow across backend and frontend:** The group expanded the authentication work by adding logout and user validation endpoints, connecting the frontend login flow to the backend session system, adding React Router navigation, and creating placeholder pages for dashboard and registration. This shows progress from isolated backend login logic toward an actual user flow in the application.

- **Frontend authentication handling:** The group added frontend logic for checking active sessions, passing credentials to the server, handling session cookies, redirecting users, and showing errors on invalid login. This shows practical work with client-server communication and user-facing error handling.

- **API contract testing:** The group improved how backend API responses are tested by standardizing contract checks and making validation errors more specific. For example, login validation now checks expected status codes and specific missing-field errors instead of accepting generic error responses. This shows stronger attention to correctness and predictable API behavior.

- **Stock adjustment backend:** The group added the first backend support for increasing and decreasing item stock. This is an important business feature because it connects the inventory system to real actions such as sales, deliveries, and corrections.

- **Testing workflow improvements:** The group improved test commands so backend and frontend tests can be run more flexibly through `make test`, including support for paths and arguments. This makes it easier for developers to run targeted tests during development instead of always running everything manually.

- **Project structure and documentation:** The frontend file structure was reorganized by category, and a documentation folder was started for system descriptions. This shows early work on keeping the project organized as it grows.

- **Agile software engineering practice:** Taken together, this week’s work shows incremental progress on authentication, routing, API documentation, contract testing, stock functionality, and developer workflow. These are important foundations for building later features in a controlled and testable way.

- **Perspective:** For a third-year informatics student team, this is a solid early project week because the group worked on both user-facing functionality and the technical structure needed to support future development.



## PR #88 - 87 task add swagger UI openapi 3 for django rest framework using drf spectacular

- Merged: 2026-01-27 00:03 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/88

### Summary

* Added `make swagger` target to open Swagger UI (`/api/docs/`)
* Minor cleanup in `open_swagger.py` (comments/exit)

## PR #89 - User Story As a business owner, I can log in so that I can access InventoryX securely.

- Merged: 2026-01-28 10:53 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/89

### Summary

### Backend
* Added new endpoints for **logout** and **user validation**.
* Base structure for endpoint docs.
### Frontend
* **Refactor:** Restructured file system by category.
* **Routing:** Integrated React Router to enable navigation between forms and pages.
* **Pages:** Added placeholder pages for **Dashboard** and **Registration**.
* **Auth Service:** Implemented `checkSession` service to validate credentials with the server.
* **Login Flow:** Established protocol for passing credentials and managing session cookies between client and server.
* **Testing:** Added unit tests for the Login component to ensure correct redirection and error handling.
### Documentation
* Created `docs/` folder for system descriptions.

## PR #96 - IMPORTANT fix(front.login): Block React to handle invalid input

- Merged: 2026-01-28 14:10 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/96

### Summary

_No filled-in summary found._

## PR #97 - refactor(backend): enforce API contracts and standardize testing

- Merged: 2026-01-28 21:30 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/97

### Summary

- Better format and structure for doing API tests

## PR #98 - refactor(test): improve assert_contract with status and error collection

- Merged: 2026-01-30 09:34 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/98

### Summary

- Update `assert_contract` signature to require `expected_status`, preventing false positives where an error response matches a generic error schema.
- Implement error collection pattern in `assert_contract`
- Define specific `LoginValidationErrorSerializer` in `contracts.py` to strictly document expected 400 Bad Request fields (email/password) for Swagger/OpenAPI.
- Refactor `test_login.py` to verify specific validation error keys exist (e.g., missing email triggers "email" error) rather than just checking for a generic 400.
- Update `test_verify.py` to utilize the new strict `assert_contract` signature.

## PR #99 - Chore/make test args

- Merged: 2026-02-01 21:46 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/99

### Summary

* Extended `make test` to support `make test backend [path..]` and `make test frontend [args..]`
* Added Jest defaults via `JEST_ARGS` (default `--ci`)
* Added frontend path normalization so test paths can be provided without `src/` (and strips optional `frontend/` prefix)
* Added a usage message for invalid `make test` invocations

## PR #92 - Backend task: 46 as a business owner i can increase or decrease an items stock so that inventory matches sales deliveries and corrections

- Merged: 2026-02-02 15:49 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/92

### Summary

- Have implemented Task: Backend: Stock adjustment endpoint (basic)
[#71](https://github.com/TorgrimRL/inventory_x/issues/71)
