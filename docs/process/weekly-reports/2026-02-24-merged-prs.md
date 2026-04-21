# Pull requests merged to main since the previous TA meeting

- Report date: 2026-02-24
- Period: 2026-02-17 to 2026-02-24
- Base branch: `main`
- Number of PRs: 5

# This week summary of merged PRs

- **Employee invitation backend:** This week, the group added backend support for inviting existing users to an inventory as employees. This introduced an endpoint for creating employee memberships and shows progress on multi-user collaboration inside the inventory system.

- **Protected routes and authentication guards:** The group separated public and protected frontend routes so pages such as login can be visited by anyone, while authenticated parts of the system require a valid session. This shows practical work with access control and secure navigation in the frontend.

- **Active inventory context:** The group added backend support for selecting and storing the active inventory in the user session, including endpoints for getting and setting the active inventory. They also added guards and tests for cases such as unauthenticated access, no selected inventory, invalid payloads, and cross-user access denial. This creates an important foundation for inventory-specific features.

- **Active inventory selection in the UI:** The frontend was updated so users can see and select an active inventory from the inventories page. Dashboard and add-item routes now require an active inventory and redirect users back to the inventory selection flow if none is selected. This improves the user workflow and reduces confusion about which inventory the user is working in.

- **Dynamic navigation:** The navbar was improved with dynamic buttons that can be shown or hidden depending on the current application state. This supports a more flexible interface as the system gains more pages and role-dependent actions.

- **Testing and API contracts:** The active-inventory backend work included serializers, OpenAPI contracts, and full test coverage for the new flow. This shows attention to documented API behavior, edge cases, and predictable backend responses.

- **Agile software engineering practice:** Taken together, this week’s work connects authentication, user roles, inventory context, protected navigation, and frontend routing. These are important building blocks for later features because they make sure users operate inside the correct inventory and only access the parts of the system they are allowed to use.

- **Perspective:** For a third-year informatics student team, this is a strong week because the group implemented important system architecture around authentication, session state, active context, and multi-user access rather than only adding isolated UI features.


## PR #158 - Feature/51 invite employees/backend

- Merged: 2026-02-17 10:55 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/158

### Summary

- New endpoint added `/api/inventory/inventories/{inventory_id}/invite/`
- Making a request to the endpoint with the right data will allow for adding existing users to inventories (create a memembership for that user as employee for that inventory)

## PR #164 - feat: Applied Auth Guard into protected routes

- Merged: 2026-02-17 12:08 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/164

### Summary

Seperates routes into:
- Public routes: Login, home ... all routes that can be visit by anyone.
- Protected routes: Only authenticated user are allow to visit.

## PR #163 - 107 task support active inventory context

- Merged: 2026-02-17 12:23 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/163

### Summary

:**
* Added **active inventory context** support via `GET/POST /api/inventory/active/`, storing the selected inventory ID in the user’s **session**.
* Introduced serializers and OpenAPI contracts for the new endpoints (`GET_ACTIVE_INVENTORY_RESPONSES`, `SET_ACTIVE_INVENTORY_RESPONSES`).
* Added `api/inventory/context.py` with helpers for reading the active inventory from session and a reusable **409 guard** (`require_active_membership`) for future endpoints.
* Added full test coverage for the active inventory flow (`test_active_inventory.py`) including unauthenticated access, empty state (204), happy path, invalid payload, and cross-user access denial.

## PR #167 - feat: Navbar with dyn buttons

- Merged: 2026-02-20 10:24 UTC
- Author: blackh-t
- URL: https://github.com/TorgrimRL/inventory_x/pull/167

### Summary

- Dynamic buttons rendering.
- Flexible in Add/remove buttons

## PR #166 - 106 task add active inventory selection flow in UI

- Merged: 2026-02-20 10:55 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/166

### Summary

* Added **RequireActiveInventory** guard and wrapped **Dashboard** and **Add Item** routes so they redirect to Inventories when no active inventory is selected (after login).
* Added UI flow on **Inventories** page to **see + select active inventory** (highlights active, click row to set active, then navigates to Dashboard).
* Added frontend service support for:
  * `GET /api/inventory/active/` (returns active inventory or 204)
  * `POST /api/inventory/active/` (sets active inventory)
* Dashboard now displays the currently active inventory (when present).
* LogoutButton updated to use `apiClient` and avoid navigation during render.
