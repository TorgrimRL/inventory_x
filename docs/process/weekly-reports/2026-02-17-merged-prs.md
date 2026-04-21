# Pull requests merged to main since the previous TA meeting

- Report date: 2026-02-17
- Period: 2026-02-10 to 2026-02-17
- Base branch: `main`
- Number of PRs: 9


# This week summary of merged PRs

- **Logout and session handling:** This week, the group implemented logout as a full-stack feature, including a backend logout endpoint, Swagger documentation, frontend session clearing, redirect to the login page, and tests for both successful and failed logout behavior. This shows practical work with authentication, session management, and secure user flow handling.

- **Registration frontend:** The group added a registration form with client-side validation for email and matching passwords, connected it to the signup API, handled API errors, and added tests for validation and API flows. This shows progress on turning backend account creation into a usable frontend feature.

- **User inventories:** The group added a backend endpoint for listing the inventories available to the logged-in user, including the user’s role for each inventory. They also implemented the frontend inventory overview page that fetches and displays this data, with loading, empty, unauthorized, and error states. This shows full-stack development and careful handling of different user states.

- **Routing and frontend structure:** The group centralized frontend routes into one structured object and added linting enforcement to avoid hardcoded paths. This improves maintainability because navigation paths are managed consistently instead of being duplicated across the codebase.

- **Admin and database management:** The group enabled the Django admin panel with a superuser setup so the database can be inspected and modified more easily during development. This supports debugging, manual testing, and development workflow.

- **Pull request review process:** The group added and refined a round-robin reviewer workflow for pull requests, including handling updated branches after merge conflicts and avoiding unnecessary reviewer reassignment. This shows attention to team collaboration, code review, and a more structured development process.

- **Testing and quality assurance:** Several changes included tests for logout behavior, registration validation, API flows, and inventory listing. This shows continued use of automated testing to verify both backend and frontend behavior.

- **Agile software engineering practice:** Taken together, this week’s work combines user-facing features, backend endpoints, frontend pages, routing cleanup, admin tooling, testing, and team workflow automation. This shows incremental agile progress both in the product and in the way the group collaborates.

- **Perspective:** For a third-year informatics student team, this is a solid week because the group worked not only on visible features, but also on authentication, role-based inventory access, testing, routing maintainability, database tooling, and code review process.

## PR #149 - Introduce round-robin PR reviewer workflow

- Merged: 2026-02-11 11:17 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/149

### Summary

- Added a GitHub Actions workflow to assign PR reviewers in a round-robin fashion.
- Skips draft PRs and avoids reassignment of existing reviewers.
- Tracks reviewer rotation state using an issue.

## PR #100 - Feature/logout/#37 FullStack

- Merged: 2026-02-11 11:18 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/100

### Summary

### Backend
- Provide a logout endpoint on `api/user/logout/`
- Included test to ensure the response is corrected handled in the case of success and failure logout attempt.
- Added api des to swagger
### Frontend
Tests:
- Session clear on logout
- Redirect to login form.
Feature:
- Session validation:
    - false -> login form.
    - true -> render the contents.
- Clear session in local storage.

## PR #118 - feat(frontend): implement registration form and tests

- Merged: 2026-02-11 14:07 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/118

### Summary

- Implement `Registration` component with client-side validation (email, password match).
- Integrate signup API with error handling and success redirect.
- Added unit tests covering validation and API flows.

## PR #156 - add syncronize to assigne when merge conflicts are resolved

- Merged: 2026-02-11 17:15 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/156

### Summary

* Added `synchronize` trigger so the round-robin reviewer assignment runs when a PR branch is updated after fixing merge conflicts.

## PR #151 - 110 task backend : Add endpoint to list user inventories

- Merged: 2026-02-11 18:16 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/151

### Summary

- Added a new endpoint to retrieve user inventories along with associated roles.
- Included unit tests.

## PR #154 - 109 task frontend implement inventories overview page inventories

- Merged: 2026-02-13 10:37 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/154

### Summary

* Wired up `/inventories` to fetch and display the logged-in user’s inventories (name + orgNumber).
* Added UI states for loading, empty list, and unauthorized/error responses.
* Added `listInventories()` + `Inventory` types in `inventoryService` to keep API logic out of the page.

## PR #155 - [Refactor] Centralized Routing & Linting Enforcement 

- Merged: 2026-02-14 10:33 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/155

### Summary

- Linting Enforcement to ensure no one hardcode the PATH, exists in frontend.
- Collect all URLs into one structured object.

## PR #157 - chore(ci): refine round-robin reviewer workflow for better PR handling

- Merged: 2026-02-14 10:37 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/157

### Summary

- Added safeguards to avoid reassignment on synchronize events.
- Improved logic to handle existing reviews and labels.
- Enhanced safety checks and localization of messages.

## PR #152 - Feature/django admin panel

- Merged: 2026-02-14 14:21 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/152

### Summary

- `http://localhost:8000/admin/` is now available
- Allows to login with a super user:
email: `admin@example.com`
pass: `adminpass123`
to see and modify database in a easy and simple manner
