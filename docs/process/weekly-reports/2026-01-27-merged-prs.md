# Pull requests merged to main since the previous TA meeting

- Report date: 2026-01-27
- Period: 2026-01-20 to 2026-01-27
- Base branch: `main`
- Number of PRs: 5

# This week summary of merged PRs

- **User account foundation:** This week, the group implemented a custom backend user model with UUID-based user IDs, email-based login, display names, active status, password hashing, and validation for required fields and email format. This shows important groundwork for authentication and user management in the system.

- **Login and session handling:** The group added backend login support with user verification, Django session management, and session cookies that expire when the browser closes. This shows practical work with secure access control and the basic authentication flow needed before protected inventory features can be used.

- **Backend testing and validation:** The user model and login work included automated tests for successful user creation, invalid input, email uniqueness, password hashing, direct-save edge cases, failed login, successful login, and session creation. This shows that the group is testing both normal behavior and error cases early in the project.

- **Code quality tooling:** The backend setup was strengthened by making Ruff stricter and adding type checking with Mypy to the development and CI process. This helps detect formatting problems, common Python errors, and type-related issues before they become harder to fix.

- **Debugging support:** The group added a reproducible VS Code and Docker debugging workflow for the backend, including debug commands, a debug Docker Compose setup, and support for running pytest under the debugger. This shows practical attention to debugging, developer productivity, and making backend problems easier to investigate.

- **Project cleanup and maintainability:** The group removed unnecessary project files and scripts that were no longer relevant. This is small but useful maintenance work because it reduces clutter and makes the project easier to understand.

- **Documentation for developers:** The README was updated with steps for formatting, linting, testing, and debugging. This supports collaboration because all group members can follow the same setup and development workflow.

- **Agile software engineering practice:** Taken together, this week’s work focused on building a stable technical foundation: authentication, testing, code quality, debugging, documentation, and cleanup. This is important early project work because it makes later feature development safer and easier to maintain.

- **Perspective:** For a third-year informatics student team, this is a strong early-stage software engineering week because the group worked not only on functionality, but also on testing, security, tooling, debugging, and maintainability from the beginning.


## PR #80 - chore: Removed flake file from project & scripts

- Merged: 2026-01-21 19:49 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/80

### Summary

- Removed files (they don't affect anything project related)

## PR #79 - Backend/ruff fmt changes

- Merged: 2026-01-22 18:07 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/79

### Summary

- Ruff will now be much stricter with python code. Checking types and other common errors/bugs

## PR #82 - Feature/34 create account/database model

- Merged: 2026-01-23 07:38 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/82

### Summary

* **User Model:** Implemented a robust `User` model inheriting from `AbstractBaseUser` with:
* UUID as the primary key.
* Email as the username field (case-insensitive uniqueness enforced).
* `display_name` and `is_active` fields.
---
* **User Manager:** Created a `UserManager` factory that:
* Centralizes validation logic using `full_clean()`.
* Prevents accidental creation of users with empty/unusable passwords.
* Ensures email normalization works consistently across factory and direct model saves.
---
* **Tests:** Added `api/user/tests/test_models.py` achieving high coverage for:
* Happy path creation.
* Validation enforcement (required fields, email format, uniqueness).
* Security checks (password hashing).
* Edge cases (direct save normalization).
---
* **Tooling & Config:**
* Updated `Makefile` to include `type-check` (Mypy) in the CI pipeline.
* Configured `pyproject.toml` to exclude migrations from Ruff and resolve LSP/Linter conflicts.
* Added initial migration file.

## PR #85 - Feature login: Backend

- Merged: 2026-01-25 02:44 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/85

### Summary

#69: Backend: Login endpoint + session/auth
> **User Story:** As a business owner, I can log in so that I can access InventoryX securely.
## Whats New
* **Authorization Logic:**  Implemented user verification
* **Session Management:** Enabled Django session to manage state between the client and server.
* **Session Persistence:**  Configured session cookies to expire when the browser is closed.
## Automated Tests
* **Unauthorized Access:** Verified that invalid credentials return a `401 Unauthorized` status and that no session is created.
* **Successful Login:** Verified that valid credentials return a `200 OK` status and that the `sessionid` is correctly included in the response header.

## PR #86 - Chore/debugger support

- Merged: 2026-01-25 20:33 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/86

### Summary

* Added VS Code + Docker debugging workflow:
  * `make debug-up` starts `backend` + `db` with `debugpy` listening on `:5678`
  * `make debug-down` stops the debug services
* Added `docker-compose.debug.yml` override for running Django with `debugpy` (`--wait-for-client`, `--noreload`)
* Added `backend/scripts/debug_pytest.py` to run pytest under `debugpy` (listens on `:5679`)
* Added `debugpy` to backend dev dependencies (uv/pyproject + lock updated)
* Updated README with reproducible steps for debugging in VS Code
