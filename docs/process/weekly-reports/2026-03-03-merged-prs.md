# Pull requests merged to main since the previous TA meeting

- Report date: 2026-03-03
- Period: 2026-02-24 to 2026-03-03
- Base branch: `main`
- Number of PRs: 5

# This week summary of merged PRs

- **Active inventory scoping:** This week, the group updated item listing, item creation, and stock adjustment so they use the active inventory stored in the user session instead of trusting an inventory ID from the client. This improves correctness and security because users can only view, create, and update items inside the inventory they currently have active access to.

- **Cross-inventory protection:** The backend now blocks attempts to adjust stock for items outside the active inventory and handles stale or invalid active inventory sessions with clear error behavior. This shows practical work with access control, session state, and preventing users from affecting data that belongs to another inventory.

- **Frontend active inventory flow:** The item-related frontend routes were updated to require a valid active inventory, and users are redirected back to inventory selection when the active inventory is missing or invalid. This improves the user flow by making sure the user always chooses which inventory they are working in before using dashboard or item functionality.

- **Item page API consistency:** The item page was updated to use the shared API client. This improves maintainability because API communication is handled in a more consistent way across the frontend instead of being implemented differently in separate places.

- **Search functionality:** The group merged work related to item search. Even though the summary is limited, this indicates progress on helping users find inventory items more efficiently, which is important as the amount of inventory data grows.

- **Production deployment:** The group added production Dockerfiles, production Docker Compose configuration, nginx reverse proxy setup, Gunicorn support, deployment documentation, and a GitHub Actions workflow for building and deploying the application. This shows work beyond local development and moves the project closer to being usable in a real hosted environment.

- **HTTPS and deployment security:** The production setup was extended with HTTPS/TLS configuration, HTTP-to-HTTPS redirects, proxy settings, CORS/CSRF configuration, certificate handling, and certificate renewal documentation. This shows awareness of security and operational requirements for running a web application in production.

- **Testing and verification:** The active-inventory backend work included tests for inventory scoping, stale sessions, invalid active inventory state, and cross-inventory stock adjustment. The deployment work also included a production-like smoke test setup. This shows that the group is testing both application behavior and deployment behavior.

- **Agile software engineering practice:** Taken together, this week’s work combines security, session handling, frontend route protection, backend data scoping, search, deployment, HTTPS configuration, and testing. This shows incremental progress from a local development project toward a more complete and deployable software product.

- **Perspective:** For a third-year informatics student team, this is a strong week because the group worked on both application functionality and production readiness, including access control, deployment automation, HTTPS, and realistic testing of the hosted system.

## PR #170 - 168 task scope inventory items to active inventory in session backend

- Merged: 2026-02-24 18:38 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/170

### Summary

* Scoped **item list + create** (`GET/POST /api/inventory/`) to the **active inventory stored in session** (no `inventory_id` accepted from client).
* Scoped **adjust stock** (`POST /api/inventory/{item_id}/adjust-stock/`) to the **active inventory** and blocks cross-inventory access by filtering on `inventory_id`.
* Added/updated OpenAPI response contracts to include **409 No active inventory selected** for item endpoints.
* Updated tests to ensure:
  * items are returned only for the active inventory
  * create writes into the active inventory
  * stale/invalid active inventory in session returns **409** and clears the session key
  * adjust-stock cannot update items outside the active inventory (returns **404**)
* Updated seed data to create inventory-specific catalogs (Ola + Jessica) and print per-inventory counts.

## PR #165 - 44 search

- Merged: 2026-02-25 17:09 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/165

### Summary

Closes what tasks or user story #44
## What changed

## PR #173 - Host app

- Merged: 2026-02-28 17:06 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/173

### Summary

* Added production Dockerfiles for backend (`backend/Dockerfile.prod`) and frontend (`frontend/Dockerfile.prod`)
* Added production nginx config for SPA + Django reverse proxy (`deploy/nginx.prod.conf`)
* Added production Docker Compose config for VM deployment (`deploy/docker-compose.prod.yml`)
* Added local **prod-like smoke test** compose setup (`deploy/docker-compose.prod.test.yml`)
* Added GitHub Actions workflow for build/push to GHCR and deploy to VM over SSH (`.github/workflows/deploy.yml`)
* Added `gunicorn` to backend dependencies for production runtime
* Updated root README with deployment overview and local prod-like smoke test flow
* Configured deploy to use SSH on port `2222` (workaround for TD network restrictions on port 22 from GitHub-hosted runners)

## PR #176 - 175 task configure httpstls for production deployment on inventoryxtdorguitno

- Merged: 2026-02-28 17:08 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/176

### Summary

- Added TLS/HTTPS-ready backend configuration in Django (`ALLOWED_HOSTS`, proxy headers, env-driven CORS/CSRF origins, SSL redirect toggle)
- Updated production nginx config for HTTPS with:
  - HTTP → HTTPS redirect
  - Let's Encrypt ACME challenge path
  - HTTPS reverse proxy for `/`, `/api/`, and `/admin/`
- Updated production compose setup to expose port `443` and mount certbot directories
- Added/updated deployment documentation (moved production/deploy guidance into `deploy/README.md`)
- Verified local prod-like smoke test flow (`deploy/docker-compose.prod.test.yml`) and documented startup delay/retry for backend
- Configured certificate renewal on VM (certbot renew dry-run verified + cron-based renew/reload setup)

## PR #177 - 169 task use active inventory context for items UI frontend

- Merged: 2026-02-28 17:20 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/177

### Summary

- Added/extended tests for `RequireActiveInventory` redirect when active inventory is stale/invalid (`409`)
- Added test for inventories page warning when navigated with `state.needChoice`
- Added test for selecting inventory -> `setActiveInventory(id)` -> navigate to dashboard
- Ensured item-related routes are guarded with `RequireActiveInventory`:
  - `/dashboard`
  - `/add_item` (ItemPage)
- Minor inventories page UX tweaks:
  - "Back to dashboard" -> "To dashboard"
  - Disable dashboard button when no active inventory is selected
- Switched `ItemPage` API calls to shared `ApiClient` for consistency
