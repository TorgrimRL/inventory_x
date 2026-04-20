# Pull requests merged to main last week

- Generated: 2026-03-25 07:57 UTC
- Period from: 2026-03-17
- Base branch: `main`
- Number of PRs: 10

# This week summary of merged PRs

- **Stock adjustment and validation:** This week, the group improved the stock-adjustment flow by requiring the user to actively choose increase or decrease, restricting stock input to numeric values only, preventing negative stock, and disabling save/update actions when the input is incomplete or invalid. This shows careful work on validation, error prevention, and safe handling of business rules in the UI.

- **Low-stock functionality:** The group added low-stock threshold support to items, made thresholds editable when creating and updating items, exposed the data from the backend, and built a dashboard warnings list that highlights items at or below threshold and lets users open the stock-adjust modal directly from the warning. This shows the ability to develop one coherent feature across backend, frontend, and user workflow.

- **User experience and theme support:** The group introduced full light/dark mode support with persistent theme choice, added a theme toggle in both desktop and mobile navigation, prevented visual flashing on refresh, and refactored inventory-related pages to use more consistent layouts, responsive grids, and theme-based styling. This shows concrete work on usability, accessibility, and maintainable UI design rather than only adding functionality.

- **Testing and quality assurance:** The week’s work included updated and expanded tests for theme persistence, navigation, item creation and editing, low-stock warnings, sorting, validation rules, and dashboard behavior. In addition, the group added CI-related checks such as migration validation and a production-like smoke test workflow. This shows a stronger focus on automated quality control and catching problems before merge or release.

- **Maintenance and code quality:** Several changes this week were not just new features, but improvements to how the system behaves and is maintained, such as disabling save when nothing valid has changed, cleaning up layouts, moving more UI behavior into a shared theme system, and adding contributing guidance for consistent frontend work. This shows software evolution and attention to long-term code quality.

- **Agile software engineering practice:** Taken together, this week’s merged work shows incremental development in small pieces that improve the same product from several angles at once: business rules, dashboard behavior, backend/frontend integration, UI consistency, and CI/testing. That is good evidence of structured team collaboration and practical agile development.

- **Perspective:** For a third-year informatics student team, this is a solid amount of software engineering work in one week, especially because it combines feature development, validation, UI improvement, testing, and CI rather than focusing on only one part of the system.

## PR #252 - 251 task ensure no preselected increase/decrease option for adjust stock modal

- Merged: 2026-03-23 20:24 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/252

### Summary

- Restricted stock amount input to digits only by changing the field to text input with numeric filtering.
- Removed default selection for increase/decrease when opening the adjust stock modal in `/dashboard`.
- Added a warning message prompting the user to choose increase or decrease before updating stock.
- Added validation to prevent stock from going below 0 when decreasing stock.
- Disabled the `Update stock` button and showed an error message when a decrease action would make stock negative.

## PR #250 - 237 task refactor inventories page layout for better UX and dark mode support

- Merged: 2026-03-23 14:03 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/250

### Summary

- Refactored `/inventories` and `/inventories/new` to improve layout consistency, responsiveness, and dark mode support.
- Fixed a dark mode issue in the low-stock warnings card.
- Removed the logout button from the dashboard, since this is now handled in the navbar, and updated tests.

### Inventories page (`/inventories`)

- Replaced hardcoded colors with theme-based values such as `background.default`, `theme.palette`, and `alpha`, including inventory cards, borders, backgrounds, and hover states.
  - The grey card border color is still defined inline.
- Replaced the custom two-column layout with a simpler `Container`-based layout.
- Refactored the inventory list from a vertical stack to a responsive grid:
  - A single inventory is centered.
  - Multiple inventories are shown in two columns.
- Removed the illustration and "little brand mark".
- Improved CTA button layout for responsiveness.

### Register inventory page (`/inventories/new`)

- Replaced hardcoded background with theme-based values.
- Simplified the layout using a responsive grid and `Container`.
- Removed custom button styling in favor of theme defaults.
- Updated to an SVG illustration and adjusted its opacity in dark mode.
- Updated alignment and visual balance between the form and illustration.

### Low-stock warning card

- Updated item name text color to use the theme value `text.primary`, so item names are visible in dark mode.

## PR #236 - SAVE button is disabled if no changes have been made

- Merged: 2026-03-17 19:40 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/236

### Summary

- Disabled the `SAVE` button when no changes have been made.
- `SAVE` is now only enabled when at least one valid change has been made.
- Prevents saving when:
  - No fields have been changed.
  - Stock change is incomplete because no direction has been selected.
  - Stock or price would become negative.

## PR #234 - 233 task ensure numeric-only stock input and no preselected increase/decrease option

- Merged: 2026-03-17 18:32 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/234

### Summary

- Restricted stock amount input to digits only by changing the field to text input with numeric filtering.
- Kept 0 as a valid stock value, meaning no stock change.
- Removed default selection for increase/decrease when opening the edit modal.
- Disabled the Save button when stock amount is greater than 0 but no stock action has been selected.
- Added a warning message prompting the user to choose increase or decrease before updating stock.
- Added validation to prevent stock from going below 0 when decreasing stock.
- Disabled Save and showed an error message when a decrease action would make stock negative.

## PR #232 - 193 task frontend add low-stock warnings list UI

- Merged: 2026-03-18 07:13 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/232

### Summary

- Added a new `LowStockWarningsCard` component for the dashboard.
- Added an in-app low-stock warnings list for the active inventory.
- The list only shows items with a `low_stock_threshold` set where `stock <= low_stock_threshold`.
- Sorted warnings by urgency first:
  - Lowest stock first.
  - Then by item name.
- Added a user-friendly empty state: `No low-stock warnings.`
- Made each warning row clickable to open the existing stock-adjust modal.
- Reused `AdjustStockModal` so users can act directly from the dashboard.
- Updated the dashboard layout to include the low-stock warnings section.
- Added frontend tests for:
  - Showing low-stock items.
  - Hiding items above the threshold.
  - Showing the empty state.

## PR #231 - 204 light mode/dark mode

- Merged: 2026-03-19 10:09 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/231

### Summary

- Implemented light and dark theme support using Material UI theming.

### Theme system

Added global theme support using MUI `ThemeProvider`.

- `LightTheme` and `DarkTheme` in `theme.ts` are used.
- The app now chooses theme based on user preference.
- Theme state is stored in React and persisted in `localStorage`.

### Theme toggle

Added a theme toggle in the navigation bar.

Users can toggle between light and dark mode, and the UI updates immediately.

Available in:

- Desktop navigation as a switch component.
- Mobile navigation menu.

### Prevent flash on refresh

Added a script in `index.html` that applies the saved background color before React loads.

This prevents a brief light-mode flash when dark mode is active.

### UI consistency

To ensure components follow the theme:

- Moved shared gradients and design tokens to `theme.ts`.
- Updated several pages to use Material UI components and theme values.

Updated components include:

- Navbar.
- Landing page.
- Login form.
- Registration form.
- Password reset.
- Forgot password.

### Tests

Tests related to this user story:

New test file: `themePersistence.test.tsx`

- Default theme is light.
- Saved theme is restored from `localStorage`.
- Toggling theme updates `localStorage`.

Updated tests: `navbar.test.tsx`

- Theme toggle interaction.
- Mobile menu theme switching.
- Switch reflects current theme state.

Tests updated due to UI migration to Material UI:

- `landingPage.test.tsx`.
- `login.test.tsx`.
- `registration.test.tsx`.

### Documentation

- Added `CONTRIBUTING.md` with UI guidelines for working with Material UI and themes.

## PR #230 - 190 task frontend add low-stock threshold input and warning UI

- Merged: 2026-03-18 07:00 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/230

### Summary

- Added optional low-stock threshold input to the add item dialog.
- Added optional low-stock threshold input to the edit item dialog.
- Added validation for threshold values: `>= 0`, whole number only.
- Updated the item table to show:
  - Low-stock status.
  - Low-stock threshold.
- Added sorting by:
  - Low-stock threshold.
  - Low-stock status.
- Added a low-stock warning chip for items where `stock <= low_stock_threshold`.
- Updated frontend state handling for nullable thresholds.
- Renamed KPI prop from `lowStockThreshold` to `lowStockFilterThreshold` for clearer meaning.
- Renamed navbar label from `Storage` to `Inventories`.
- Adjusted inventories/register page layout so illustration sizing and page spacing are more consistent.
- Updated unit tests for item creation, editing, status display, sorting, navbar text, and KPI prop rename.

## PR #229 - 191 task backend add low-stock threshold support on items

- Merged: 2026-03-17 12:04 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/229

### Summary

- Added support for optional `low_stock_threshold` on inventory items.
- Added validation so `low_stock_threshold` must be a whole number `>= 0`.
- Updated create, update, and list flows to include `low_stock_threshold`.
- Updated backend tests and API contracts for the new field.
- Exposed enough item data for the frontend to determine when a low-stock warning should be shown.

## PR #228 - Add CI migration check for backend changes

- Merged: 2026-03-20 15:28 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/228

### Summary

_No filled-in summary found._

## PR #226 - Add prod-like smoke test and CI workflow

- Merged: 2026-03-18 14:32 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/226

### Summary

_No filled-in summary found._
