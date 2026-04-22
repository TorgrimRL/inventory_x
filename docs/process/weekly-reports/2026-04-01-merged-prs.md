# Pull requests merged to main last week

- Generated: 2026-04-01 06:03 UTC
- Period from: 2026-03-25
- Base branch: `main`
- Number of PRs: 6

# This week summary of merged PRs

- **Stock log functionality:** This week, the group added stock-log support with a dedicated API endpoint, connected stock-log data to inventory items, seeded the feature for testing, and exposed it in the UI through item-based popups and easier item access from the top bar. This shows full-stack development across backend, frontend, and test data preparation.

- **User testing and documentation:** The group added customer-testing material, updated the testing template to match the features that are actually implemented, removed references to unsupported functionality, and improved the wording and consistency of the testing flow. This shows practical work with documentation, realistic test planning, and clearer alignment between implemented requirements and evaluation.

- **User feedback and evaluation:** The group also added results from user testing. This shows that the project work is not limited to implementation, but also includes collecting and recording feedback from actual use of the system.

- **Debugging and maintenance:** The password-reset flow was updated to address server-side bad-request problems. This shows ongoing debugging and maintenance of an existing feature, which is an important part of software evolution and system reliability.

- **Dependency and release stability:** The group locked the Axios version to avoid accidental upgrades to a problematic release. This shows awareness of dependency management, release stability, and the need to control external changes that can affect the system.

- **Software engineering process:** A large part of this week’s work focused on testing support, documentation, bug fixing, and dependency control in addition to new functionality. This shows that the group is working with software engineering as a process that includes validation, maintenance, and feedback, not only feature coding.

- **Agile software engineering practice:** Taken together, this week’s merged work combines feature development, debugging, testing support, documentation updates, user feedback, and dependency management. This shows incremental agile progress where the team improves both the product itself and the process around it.

- **Perspective:** For a third-year informatics student team, this is a solid week of software engineering work because it includes both product functionality and the supporting practices needed to make the system more stable, testable, and usable.

## PR #265 - chore: lock axios version

- Merged: 2026-03-31 21:16 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/265

### Summary

- Locked the Axios version so the project does not accidentally upgrade to a problematic version.

## PR #263 - Adds results from user testing

- Merged: 2026-03-30 17:16 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/263

### Summary

- Added results from user testing.

## PR #258 - Docs/update testing record

- Merged: 2026-03-25 14:50 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/258

### Summary

- Updated the customer testing template to reflect the current scope of implemented features.
- Removed references to functionality that is not yet available.
- Adjusted owner tasks to match the actual test flow.
- Reworked employee task E3 so it now tests restricted actions instead of unsupported functionality.
- Improved wording and consistency in the template.

## PR #253 - Bug: Bad Requests on server side with password reset

- Merged: 2026-03-31 10:51 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/253

### Summary

_No filled-in summary found._

## PR #239 - docs(testing): add README and template for customer testing

- Merged: 2026-03-25 08:38 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/239

### Summary

_No filled-in summary found._

## PR #219 - Feature/#57-Stock-log

- Merged: 2026-03-29 15:56 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/219

### Summary

- Added new API endpoint: `api/inventory/{item_id}/stock-log`.
- Applied decorators into database queries for the inventory items table.
- Included request field to extract `user_name` in views related to `inventory_items`.
- Added stock log page popups when clicking on item names.
- Added new button in the top bar: Items.
- Applied stock log support to seed data.
