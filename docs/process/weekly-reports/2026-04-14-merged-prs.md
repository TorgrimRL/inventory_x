# Pull requests merget til main siste uke

- Generert: 2026-04-14 07:27 UTC
- Periode fra: 2026-04-07
- Base branch: `main`
- Antall PR-er: 11

# This week summary of merged PRs

- **Item categories and inventory organization:** This week, the group added inventory-scoped item categories across both backend and frontend. They implemented category APIs for the active inventory, validated that items can only use categories from the same inventory, extended item create and update flows with category support, added category assignment in the UI, added a category column in the item table, supported filtering by categories including uncategorized items, and added pagination for larger inventories. This shows full-stack feature development, validation of business rules, and improvements to how users organize and navigate inventory data.

- **Dashboard analytics and history:** The group added a more advanced dashboard with summaries and charts for inventory health and value, including low-stock summaries, total inventory value, category-based distributions, top-value items, lowest-stock items, and inventory value over time. They also added backend support for inventory history and improved chart readability. This shows work with data presentation, backend/frontend integration, and turning stored system data into useful decision support for users.

- **Notifications and backend behavior:** The group added backend support for low-stock notification emails and tested that notifications are only sent when they are enabled on the user side. This shows practical work with system events, user-specific settings, and reliable backend behavior tied to real product functionality.

- **Mobile usability and responsive design:** The group improved the product for smaller screens by fixing layout problems on the landing page, navbar, item page filters, and member-management page. They made sure key functionality remains usable on common mobile widths without overflow or hidden elements. This shows concrete attention to usability, accessibility, and adapting the interface to realistic user environments.

- **Landing page and product presentation:** The landing page was also redesigned and refactored. Together with the mobile fixes, this shows that the group is not only adding internal functionality, but also improving how the product is presented and experienced by users from the first page onward.

- **User testing and feedback collection:** A large part of this week’s merged work was adding and updating user-testing records, including multiple new test results and adjustments to the customer-testing record for new category functionality. This shows that the group is actively collecting external feedback, documenting results, and using testing as part of the development process rather than treating it as something separate from implementation.

- **Testing and quality assurance:** The dashboard work included both frontend and backend tests, and the reflection in the chart task also shows conscious engagement with testing as a development method. Along with the notification tests and the ongoing updates to user-testing records, this shows a stronger focus on verification, edge cases, and software quality.

- **Agile software engineering practice:** Taken together, this week’s work combines new functionality, UI improvement, backend logic, responsive design, user feedback, and testing. This shows incremental agile progress where the team improves both the product itself and the way it is evaluated and refined.

- **Perspective:** For a third-year informatics student team, this is a solid week of software engineering work because it combines full-stack feature development, data visualization, user testing, responsive design, backend automation, and testing in the same development period.

## PR #275 - docs(testing): add customer testing records for  Eskil and Stine

- Merged: 2026-04-13 11:18 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/275

### Oppsummering

_Ingen utfylt oppsummering funnet._

## PR #274 - 254 mobile friendly

- Merged: 2026-04-12 11:55 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/274

### Oppsummering

- Fixed mobile layout issues on the landing page so the "Inventory X" text is no longer cut off.
- Improved navbar responsiveness on small screens to prevent the inventory name and logo from breaking the layout.
- Adjusted navbar alignment for mobile devices.
- Fixed text overflow on the item page filters.
- Updated the item page layout for:
  - Category filter + clear button
  - Low stock threshold filter + reset button
- Improved the Manage Members page so it remains usable on small screens without hidden elements or overflow.
- Ensured core functionality remains available on screen widths between 320px and 768px.

## PR #272 - Feature/62 dashboard charts

- Merged: 2026-04-11 18:49 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/272

### Oppsummering

#62
Summary
This PR implements the dashboard chart user story for the active inventory, from initial feature work to tested product.
It adds dashboard summaries and visualizations for inventory health and value, including historical inventory value over time. The PR also includes supporting backend history logic, chart usability improvements, and automated test coverage.
Included in this PR is more visual look of the Dashboard such as:
- low stock summary
- total inventory value summary
- additional dashboard summary metrics
- inventory composition by category
- category value distribution
- top inventory value items
- lowest stock items
- inventory value over time chart
- backend support for inventory history
- improved chart readability with better y-axis formatting and hover values
- frontend and backend tests related to chart/history functionality
Verification
Ran successfully
make fmt
make check
make test
Result:
20/20 test suites passing
111/111 tests passing
Reflection on TDD
My experience with TDD in this task was positive overall. It helped uncover issues in the chart logic and history handling that were easy to miss otherwise, especially around edge cases and data behavior.
At the same time, I found that I personally prefer developing the feature first and then testing whether I implemented it correctly. That makes it easier for me to explore different approaches while the feature is still taking shape. Once the solution is clearer, adding tests feels more natural and gives good confidence that the implementation works as intended.
So while I see the value of TDD and had a positive experience with it here, I still prefer using tests more as validation and refinement after the feature direction has become clear.

## PR #271 - refactor: landing page redesigned

- Merged: 2026-04-11 20:48 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/271

### Oppsummering

- Landing Page has been refactored

## PR #270 - Create daniels_jama.md

- Merged: 2026-04-13 06:59 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/270

### Oppsummering

- Added results from user testing

## PR #269 - User testing results

- Merged: 2026-04-09 19:19 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/269

### Oppsummering

- Results from user testing

## PR #268 - Added two results from user testing

- Merged: 2026-04-10 12:51 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/268

### Oppsummering

- Added two user tests

## PR #267 - usertesting: Recorded by @Blackh-t

- Merged: 2026-04-11 18:35 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/267

### Oppsummering

_Ingen utfylt oppsummering funnet._

## PR #266 - Update customer_testing_record.md

- Merged: 2026-04-09 15:47 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/266

### Oppsummering

- Added a task for new categories feature
- Effect on work:
  - User Testing

## PR #264 - Feature/low stock notification mail #247

- Merged: 2026-04-09 16:29 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/264

### Oppsummering

Backend
- [New Decorator for notifiy low stock](https://github.com/TorgrimRL/inventory_x/commit/f01a6ed570aebb906229a9cb6a1d17137dba3359)
- [Apply notify low stock in items update, and adjust](https://github.com/TorgrimRL/inventory_x/commit/ae2d518068e9f7df900c790c355982b05a0b8ffb)
- [Tests: ensure mail notify only works when its enable on userside](https://github.com/TorgrimRL/inventory_x/commit/dec916ec9a3bb80e75992763bb2f0e3a708f9108)

## PR #259 - Feature/45 item categories/frontend and backend

- Merged: 2026-04-08 11:58 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/259

### Oppsummering

- Added inventory-scoped item categories in the backend.
- Added category APIs for the active inventory (list, create, delete).
- Added validation so items can only use categories from the same inventory.
- Extended item create/update flows to support `category_ids`.
- Added backend tests and contract updates for category flows and item/category validation.
- Added category filtering on `ItemPage` in the active inventory.
- Added category assignment/creation in add and edit item flows.
- Added a category column to the item table.
- Added support for filtering uncategorized items (`No category added`).
- Multi-category filtering now uses **AND** matching.
- Refined the filtered KPI heading layout (`Information based on filter`).
- Cleaned up and stabilized the related frontend tests.
- Added paging to item list when there is over 30 items in the inventory
