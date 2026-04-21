# Pull requests merged to main since the previous TA meeting

- Report date: 2026-02-10
- Period: 2026-02-03 to 2026-02-10
- Base branch: `main`
- Number of PRs: 11

# This week summary of merged PRs

- **Account registration:** This week, the group added backend support for creating user accounts through a signup endpoint that accepts email, password, and an optional username. Even though one earlier version was reverted and replaced, the final result shows progress on the account registration flow and the ability to correct implementation problems during development.

- **Inventory registration and ownership:** The group added backend support for registering inventories and automatically creating an owner membership for the user who creates the inventory. This is important because it connects inventories to users and establishes the role-based structure needed for later permission handling.

- **Register inventory frontend:** The group implemented the register-inventory page and navigation flow, including moving from the inventory overview to the “register new inventory” page. They also introduced Material UI and adjusted the frontend setup so the form and tests compile correctly. This shows progress on connecting backend features to usable frontend workflows.

- **Item creation:** The group added functionality for creating items in the database and a frontend interface where users can add item name, stock, and price. This is one of the core inventory features and shows full-stack development from stored data to user interaction.

- **Stock adjustment and negative-stock handling:** The group added backend validation to prevent negative stock and frontend support for increasing or decreasing item stock through an adjust-stock modal. The frontend shows backend error messages, prevents invalid UI updates, and gives success feedback when stock is updated. This shows practical handling of business rules, validation, and error states across backend and frontend.

- **Testing and reliability:** Several changes included tests for stock behavior, frontend stock adjustment, and failure cases such as preventing negative stock. The group also added a test for atomic rollback if membership creation fails during inventory registration, which shows attention to data consistency and reliable backend behavior.

- **Developer workflow and API documentation:** The group improved local development by adjusting Docker cleanup commands and improving Swagger UI settings, including support for “Try it out” and persisted authorization. This makes the API easier to test and reduces friction during development.

- **Agile software engineering practice:** Taken together, this week’s work shows incremental development of core product functionality: signup, inventory ownership, item creation, stock adjustment, validation, testing, and developer tooling. It also shows that the group handled reverts and fixes as part of the normal development process.

- **Perspective:** For a third-year informatics student team, this is a strong week because the group implemented several core system features while also working with validation, testing, ownership logic, frontend/backend integration, and development tooling.

## PR #102 - Feature/34 create account/backend

- Merged: 2026-02-03 10:05 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/102

### Summary

- An endpoint has been defined `/api/signup` that takes an email, password and username (optional) and creates that user

## PR #111 - Revert "Feature/34 create account/backend"

- Merged: 2026-02-03 10:39 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/111

### Summary

_No filled-in summary found._

## PR #112 - user story 48 (negative number) - backend

- Merged: 2026-02-03 12:29 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/112

### Summary

- Added functionality for not allowing negative stock, and a test in both test files.

## PR #114 - Revert "lagde ny branch og la til filer til frontend"

- Merged: 2026-02-03 12:44 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/114

### Summary

_No filled-in summary found._

## PR #101 - 75 backend create business owner membership

- Merged: 2026-02-04 03:06 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/101

### Summary

* Added endpoint/service for registering inventories and creating OWNER memberships for the requesting user.

## PR #103 - 76 frontend register business form feedback

- Merged: 2026-02-04 08:35 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/103

### Summary

* Added Material UI (MUI) to the frontend and updated the app theme/setup.
* Implemented the **Register Inventory** page and navigation flow (`/inventories` → “Register new” → `/inventories/new`).
* Improved login flow by verifying an existing session and redirecting to the dashboard when already authenticated.
* Updated/normalized formatting and imports; adjusted Jest setup to work with the updated frontend code.
* Fixed TypeScript issues in the register inventory form (typed input events) so frontend tests compile and run.

## PR #116 - test(inventory): ensure atomic rollback when membership creation fails during inventory registration

- Merged: 2026-02-04 08:46 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/116

### Summary

_No filled-in summary found._

## PR #115 - Feature/34 create account/backend v2

- Merged: 2026-02-04 14:24 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/115

### Summary

- An endpoint has been defined /api/signup that takes an email, password and username (optional) and creates that user

## PR #95 - Features/39 add item2

- Merged: 2026-02-04 17:44 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/95

### Summary

Added backed functionality to add items in the database, as specified in the user story.
Added frontend functionality to have a user interface to add items in the database, including name, stock and price.

## PR #117 - feat(backend): enhance Swagger UI settings, improve Docker Makefile c…

- Merged: 2026-02-04 18:02 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/117

### Summary

* Added `--remove-orphans` to `docker compose down` (and `reset`) to avoid leftover/orphan containers during local dev.
* Updated `make init` to use `$(MAKE)` for more reliable recursive make calls.
* Enabled Swagger UI “Try it out” and “persist authorization” via `SPECTACULAR_SETTINGS`.

## PR #119 - 46-48 frontend

- Merged: 2026-02-09 17:27 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/119

### Summary

Frontend
- Added AdjustStockModal for increasing or decreasing item stock
- Displays current stock and allows user to choose direction and amount
- Calls backend adjust-stock endpoint and updates UI on success
- Shows clear error messages from backend (e.g. “Stock cannot be negative”)
- Prevents UI updates when backend rejects an invalid adjustment
- Added success feedback when stock is updated
Tests
- Added unit tests for AdjustStockModal covering:
- Successful stock increase and decrease
- Backend rejection when stock would become negative
- Frontend validation for invalid amounts
- Correct handling of different backend error response shapes
- Cancel behaviour
