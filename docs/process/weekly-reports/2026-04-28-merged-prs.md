# Pull requests merged to main since the previous TA meeting

- Report date: 2026-04-28
- Period: 2026-04-14 to 2026-04-28
- Base branch: `main`
- Number of PRs: 12

# Summary of merged PRs for the last two weeks

- **Custom inventory fields:** Over these two weeks, the group added support for custom inventory fields in the backend and connected this to the frontend so custom fields can be rendered on the item page, managed through a dedicated “Manage Fields” flow, and shown dynamically in the edit-item modal. This shows full-stack feature development and more flexible data modeling for different inventory needs.

- **Invitation and collaboration flow:** The group improved the employee invitation feature by adding email notifications as part of the invitation service. This makes the collaboration flow more complete and shows practical work with backend services, communication features, and real user onboarding.

- **Social login and authentication:** A large part of the work was adding Auth0-based social login with Google support, including backend start and callback endpoints, session creation and verification, logout handling, frontend sign-in and sign-up buttons, improved error handling, profile-picture support, and updated navbar behavior. This shows advanced work on authentication, third-party integration, session management, and frontend/backend coordination.

- **Infrastructure and deployment support:** The social-login work also introduced Redis for cache and session storage, together with updates to local and production compose setup, nginx configuration, and deployment documentation. This shows that the group is working not only on user-facing features, but also on infrastructure needed to support them reliably.

- **Item details and richer item data:** The group added a read-only item-details modal, made item rows clickable, and extended both backend and frontend support for item descriptions in create and edit flows. This improves usability and shows continued refinement of core inventory functionality.

- **Policy and UI consistency:** The group added a policy page, linked it from the footer, and later refactored the page to use the global color system. This is a smaller feature, but it shows attention to product completeness, consistency, and frontend maintainability.

- **User testing and process documentation:** Several PRs added user-testing records, while other documentation work added weekly TA reports, a report generator script, meeting notes, board snapshots, and a team contract. This shows that the group is documenting both product evaluation and team process, not only writing code.

- **Security and operational quality:** The group added an OWASP Top 10 risk assessment, identified priority security fixes, introduced Nginx rate limiting for selected routes, configured `429 Too Many Requests` behavior, and added k6 load testing plus evidence and documentation. This shows concrete work on security, operational robustness, and verification of defensive measures.

- **Testing and quality assurance:** The merged work included backend and frontend tests for social login, login/logout behavior, navbar changes, Redis-related setup, and rate-limit verification. Together with the user-testing records, this shows both automated testing and real-user evaluation.

- **Agile software engineering practice:** Taken together, these two weeks show a broad mix of feature development, authentication work, UI improvements, documentation, security analysis, infrastructure changes, and testing. This is good evidence of incremental agile development where the team improves both the product and the surrounding engineering process.

- **Perspective:** For a third-year informatics student team, this is a strong two-week period because the work spans advanced authentication, customizable data structures, user testing, security assessment, deployment-related infrastructure, and process documentation in addition to normal feature work.


## PR #281 - Add Knut Phoung user test record

- Merged: 2026-04-16 17:18 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/281

### Summary

_No filled-in summary found._

## PR #280 - Feature/209 custom inventory field/backend

- Merged: 2026-04-16 23:59 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/280

### Summary

- Inventories can now have new custom fields
- Seed has been updated

## PR #279 - Invitation user mail notification

- Merged: 2026-04-17 12:26 UTC
- Author: Kremant
- URL: https://github.com/TorgrimRL/inventory_x/pull/279

### Summary

- New mail temple :  invite_user_mail.txt
- Included send mail under invitation service.

## PR #282 - 203 task frontend add social login button and flow

- Merged: 2026-04-17 14:47 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/282

### Summary

- added Auth0-based social login support in the backend, with Google as the first provider
- added Auth0 start and callback endpoints
- added session creation and verify-session support for social login users
- added Auth0-aware logout flow, including redirect URL handling
- improved Auth0 callback error handling for invalid, cancelled, and failed login flows
- added frontend Google sign-in and sign-up buttons while keeping email/password login
- updated login flow to show a clear error message when social login fails
- added avatar-based user menu in the navbar and exposed optional profile picture from the backend
- updated logout handling in the frontend to support Auth0 logout redirects
- added Redis for cache and session storage using `django-redis`
- updated local and production compose setup, nginx config, and deploy documentation for Redis and static serving
- added and updated backend/frontend tests covering Auth0 flow, login/logout behavior, navbar changes, and Redis/deploy setup

## PR #284 - docs: add weekly TA reports and generator

- Merged: 2026-04-20 11:26 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/284

### Summary

- Added `docs/process/weekly-reports/README.md` explaining how the weekly TA reports were used.
- Added `scripts/reporting/generate_weekly_pr_report.py` to generate a weekly merged PR report for the last 7 days.
- Added `make report` command in the root `Makefile`.
- Reports are written to `docs/process/weekly-reports/`.

## PR #283 - Feature/209 custom inventory field/frontend

- Merged: 2026-04-20 19:55 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/283

### Summary

- Custom fields now render in the item page
- Added a "Manage Fields" button to add/remove fields
- Edit item modal also dynamically displays all custom fields that exist for the inventory

## PR #287 - 43 as a business owner i can open an item page to see full details so that i can review information without scanning the full list

- Merged: 2026-04-22 16:23 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/287

### Summary

-	Made item rows in the inventory list clickable
-	Added a read-only modal to display item details
-	The modal shows saved information clearly, including description
-	Added support for description in frontend (`Add item` and `Edit`modal)
-	Updated backend to handle description (included in item creation and updates)
-	Ensured item details are fetched and displayed correctly
-	Added basic handling for missing description
-	Seeded some inventory items with descriptions

## PR #286 - Policy page

- Merged: 2026-04-24 08:08 UTC
- Author: Kremant
- URL: https://github.com/TorgrimRL/inventory_x/pull/286

### Summary

- New router for  '/policy'
- New link in footer for policy page

## PR #288 - docs: add meeting notes, board snapshots, and team contract

- Merged: 2026-04-24 10:35 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/288

### Summary

- Added process meeting notes organized by sprint under `docs/process/meeting-notes/`.
- Added sprint-level README files for Sprint 0 through Sprint 5.
- Added a top-level meeting notes README with sprint periods and links.
- Added rewritten English meeting notes for start-up meetings, sprint planning, standups, coordination meetings, and sprint review/planning meetings.
- Added board snapshot images under `docs/process/board-snapshots/`.
- Linked board snapshots from meeting notes where matching screenshots were available.
- Added `docs/process/team-contract.md` documenting team expectations, communication, workload, decision-making, blockers, and team routines.

## PR #289 - docs(security): add OWASP Top 10 risk assessment

- Merged: 2026-04-25 09:43 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/289

### Summary

- Added a short OWASP Top 10 risk assessment for InventoryX.
- Summarized all OWASP A01–A10 categories with status, risk level, main assessment, and verification notes.
- Added highest-priority fixes and suggested next backlog tasks.
- Documented the key security regression scenarios to focus on going forward.

## PR #285 - Load test rate limit

- Merged: 2026-04-25 09:47 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/285

### Summary

- Added Nginx rate limiting for selected routes:
  - `POST /api/user/login/`
  - `POST /api/user/signup/`
  - `/api/user/password_reset`
  - general `/api/` traffic
- Added the same rate-limit setup to the local production-like Nginx config.
- Configured Nginx to return `429 Too Many Requests` when limits are exceeded.
- Added a k6 test for lightweight load checking and rate-limit verification.
- Added documentation for the rate-limit setup, test approach, thresholds, and evidence.
- Added screenshots as permanent evidence:
  - Grafana k6 result from local prod-like stack
  - curl verification against the production domain

## PR #291 - refactor:policy_page: Font color to use the global colors.

- Merged: 2026-04-25 13:33 UTC
- Author: Kremant
- URL: https://github.com/TorgrimRL/inventory_x/pull/291

### Summary

_No filled-in summary found._
