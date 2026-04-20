# Pull requests merged to main last week

- Generated: 2026-03-17 08:08 UTC
- Period from: 2026-03-10
- Base branch: `main`
- Number of PRs: 8

# This week summary of merged PRs

- **Member management:** This week, the group implemented a complete member-management flow for the active inventory, including a dedicated members page, owner-only access, employee removal, and protection against invalid actions such as removing owners or removing your own access.

- **Item deletion:** The group added item deletion as a full-stack feature by extending backend support for delete operations and connecting it to the frontend item-edit flow through a delete button.

- **Navigation and usability:** The navigation bar was improved so logged-in users can access items more directly, always see which inventory they are currently working in, and still get a clear fallback message when no inventory is selected.

- **Testing and quality assurance:** The work was supported by both frontend and backend tests, covering member management, navigation behavior, permissions, unauthenticated access, invalid removal attempts, and other edge cases.

- **Maintenance and reliability:** The group also improved existing flows by adjusting redirect handling, simplifying parts of password recovery, and updating item identifiers to UUIDs, which strengthens reliability and makes testing and maintenance easier.

- **Agile software engineering practice:** Taken together, this week’s work shows incremental development through small merged changes that improve functionality, security, usability, and code quality across the same system.

- **Perspective:** For a third-year informatics student team, this is a solid level of practical software engineering work and shows that the group is working in a structured and increasingly professional way.

## PR #224 - 195 frontend add remove employee action

- Merged: 2026-03-13 21:28 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/224

### Summary

- Added a new "Manage members" button on the dashboard for the active inventory.
- Added an "Inventory Members" page that shows all members of the active inventory.
- Restricted access so only owners can see and use member management.
- Added support for removing employees from the active inventory.
- Display "Access cannot be removed" for members with role `OWNER`.
- Added frontend tests for member management and remove access flow.

## PR #222 - 61 kpi

- Merged: 2026-03-12 07:24 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/222

### Summary

_No filled-in summary found._

## PR #221 - Feature/144 delete item/frontend

- Merged: 2026-03-15 08:18 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/221

### Summary

- New Delete button added to the edit item modal.

## PR #220 - 207 as a user I can see the current inventory and access items from the navigation bar so that I always know where I am working and can navigate faster

- Merged: 2026-03-11 10:03 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/220

### Summary

Updated the navigation bar to improve navigation and visibility of the current working inventory.

### Navigation updates

Added a navigation link labeled **Items** that routes to `/add_item`.

The link is visible for **logged-in users** and appears in both:

- Desktop navigation.
- Mobile menu.

### Active inventory display

The navigation bar now shows the **currently active inventory name** using existing frontend data from `getActiveInventory`.

Behavior:

- If an active inventory exists, the inventory name is displayed.
- If no active inventory is selected, a fallback message "No inventory selected" is shown.

### Component improvements

- Refactored the logout button to focus only on logout logic.
- Navbar now handles session state.
- Migrated navbar UI to Material UI components.

### Tests added

Added frontend tests to verify:

- Navigation items appear for logged-in users.
- **Items** link is visible in the navbar.
- Active inventory name is displayed.
- Fallback state when no inventory is selected.
- Mobile menu opens correctly.
- Logout button behavior.

## PR #218 - Refactor: Removed Async from password recovery

- Merged: 2026-03-10 11:52 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/218

### Summary

_No filled-in summary found._

## PR #217 - 194 add employee access removal

- Merged: 2026-03-11 13:41 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/217

### Summary

- Added backend support for removing an employee membership from the active inventory.
- Restricted the removal flow so only owners of the active inventory can perform the action.
- Limited MVP behavior to employee memberships only; owner memberships cannot be removed through this flow.
- Prevented owners from removing their own access.
- Kept compatibility with the existing 409 stale active-inventory flow for users who lose access to an inventory that was active in their session.
- Updated backend tests and API contract/Swagger documentation for:
  - Successful employee removal.
  - Unauthenticated access.
  - Permission checks for employees.
  - Invalid role removal attempts.
  - Self-removal prevention.
  - Stale active inventory behavior after removal.
- Added endpoint support to list all members belonging to the currently active inventory.
- The member list returns all memberships, both owners and employees, for the selected active inventory.

## PR #216 - Fix: Forced Redirect on Error

- Merged: 2026-03-10 10:45 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/216

### Summary

- Moved the redirect out from the final state in the HTTP request to the server.

## PR #215 - Feature/144 delete item/backend

- Merged: 2026-03-13 10:17 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/215

### Summary

- Expanded the item endpoint with a new `DELETE` request type.
- Updated seed data to include specific hard-coded UUIDs for better manual testing.
- Changed the Items model to use UUIDs instead of the previous incrementing IDs.
- Renamed `updated_item` to the more generic `item_detail`, since it now also handles deletion.
