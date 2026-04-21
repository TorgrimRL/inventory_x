# Pull requests merged to main last week

- Generated: 2026-03-10 10:09 UTC
- Period from: 2026-03-03
- Base branch: `main`
- Number of PRs: 8

# This week summary of merged PRs

- This week, the group merged work on item editing, password recovery, employee invitation, landing page improvements, and code modularization.
- The item editing PRs show that the group can implement a feature across backend and frontend, with validation, permissions, and tests.
- The password recovery PR shows understanding of more advanced software engineering concerns such as security, token handling, timeout logic, and automated testing.
- The landing page and browser tab changes show attention to usability and user experience.
- The invite employee form shows requirement-based feature development with role restrictions.
- The modularization PR shows refactoring for easier maintenance.
- Together, these PRs demonstrate software life cycle work, agile team collaboration, testing practice, source code management, and problem solving.

## PR #210 - 78 frontend edit item UI

- Merged: 2026-03-07 20:08 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/210

### Summary

- Implemented item edit functionality (name and price) according to User Story #40.
- Added Edit Item modal with pre-filled values for name and price.
- Enforced validation rules:
  - Name is required.
  - Price must be a number and ≥ 0.
  - Stock is not edited as part of item detail updates, since it is handled separately.
- Added success and error feedback messages ("Item updated", validation errors, "Item not found").
- Updated item list dynamically after successful edits without requiring page refresh.
- Implemented role-based restrictions according to User Story #52:
  - Owners can edit all editable fields: name, price, and stock.
  - Employees can only edit stock.
  - Sensitive fields, such as name and price, are visible but rendered as read-only for employees.
- Fixed issue where newly created items returned "Item not found" when editing before refresh by using backend-generated ID instead of client-generated ID.

## PR #206 - 178 as a visitor I can see what tab is connected to the inventory

- Merged: 2026-03-03 12:14 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/206

### Summary

- Updated `<title>` in `index.html` to "Inventory X".
- Replaced the default Vite favicon with a custom Inventory X favicon.

## PR #185 - 140 landing page

- Merged: 2026-03-03 12:41 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/185

### Summary

Implemented a public landing page (`/`) with:

- Heading: "INVENTORY X".
- Short value statement and some example text.
- Primary navigation buttons:
  - "Get started" -> `/registration`
  - "Log in" -> `/login`
  - "Create account" -> `/registration`

Additional changes:

- Added `theme.ts` with `LightTheme` and `DarkTheme`.
- Structured the landing page to support theme switching.
- Ensured the landing page is accessible without authentication.
- Added tests for:
  - Heading visibility.
  - Primary action buttons.
  - Navigation behavior through `useNavigate`.

## PR #184 - chore: modularized the inventory directory for easier work

- Merged: 2026-03-05 15:57 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/184

### Summary

- Updated the project file structure.

## PR #183 - 49 filter

- Merged: 2026-03-03 12:57 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/183

### Summary

_No filled-in summary found._

## PR #180 - Feature/pass recovery

- Merged: 2026-03-06 22:46 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/180

### Summary

#38

Closes task or user story #38:

> As a business owner, I can reset my password so that I can regain access if I forget it.

## New APIs

- `password_forgot/`
- `password_reset?token=@`

## New features

- Forgot-password and reset-password pages.
- Global password validation setting.
- One-time code is single-use, with a timeout of 5 minutes.
- Mail template.
- Temporary storage of one-time code in Django cache.
- Mail template includes one-time-use token in reset password link.

## Tests

- Password reset success.
- Weak password.
- Send mail and silently return on unknown email.
- Missing email in parameter.
- Cache timeout.
- Caches token.

## Changed

- Organized settings with labels.
- Upgraded top bar with fully dynamic feature.

## PR #179 - Feature/124 invite employee form/frontend

- Merged: 2026-03-03 22:29 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/179

### Summary

- Created a new Invite Employee form component.
- Added a button that appears on the dashboard only for owners, called "+ Invite employee".

## PR #159 - 40 edit items details

- Merged: 2026-03-03 11:48 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/159

### Summary

- Added `PATCH /api/inventory/<item_id>` endpoint to update item details, specifically name and price.
- Restricted update access to authenticated inventory owners only.
- Validates that `name` is required and non-empty, and that `price` must be a number and ≥ 0.
- Ensures `stock` is not modified when editing item details.
- Added and updated test coverage for successful update, blank name, negative or non-numeric price, item not found, unauthenticated access, and non-owner access.
