# Pull requests merged to main since the previous TA meeting

- Report date: 2026-05-05
- Period: 2026-04-28 to 2026-05-05
- Base branch: `main`
- Number of PRs: 11

# This week summary of merged PRs

- **Image support for items:** This week, the group added support for uploading one image per item, including preview before saving, replacing an existing image, removing an image, validation of allowed file types and file size, user-facing success and error messages, and image display in item details. This shows full-stack work on a user-facing feature with validation and better item presentation.

- **Production and operational improvements:** The group updated the production setup so uploaded images can be served correctly and added database backup routines that run daily, back up remotely, and also create a backup before deployment. This shows attention to deployment reliability, data protection, and operational maintenance.

- **User interface refinement:** The group cleaned up the navigation bar by removing the forgot-password button, clarified stock-filter wording so filter behavior matches the labels, and adjusted key metrics so they align correctly with the stock filter. This shows iterative improvement based on clarity, correctness, and usability.

- **User testing and evaluation:** The group added a customer-testing summary report based on 10 user tests, including average SUS score, strengths, weaknesses, suggested improvements, implemented improvements, business fit, and conclusion. This shows structured work with user feedback and evaluation of the product from a usability perspective.

- **Documentation and retrospectives:** The group added retrospectives to the repository and updated the improvements summary with newly implemented stock-filter changes. This shows process reflection and documentation of how feedback is turned into concrete product changes.

- **Security and accessibility documentation:** The group added a ZAP baseline security report and accessibility test results. This shows that the team is also working on non-functional quality areas such as security and accessibility, not only feature development.

- **Agile software engineering practice:** Taken together, this week’s work combines new functionality, production fixes, backups, usability improvements, user-testing analysis, retrospectives, security documentation, and accessibility work. This shows incremental agile development where the team improves both the product and the engineering process around it.

- **Perspective:** For a third-year informatics student team, this is a strong week because it combines feature work, deployment reliability, feedback-based improvement, documentation, and quality assurance across several parts of the system.



## PR #290 - Feature/128 image

- Merged: 2026-04-29 10:54 UTC
- Author: Vargren11
- URL: https://github.com/TorgrimRL/inventory_x/pull/290

### Summary

- added support for uploading one image per item
- added image preview in the edit modal before saving
- added support for replacing the current image with a new one
- added support for removing an image
- added validation for allowed file types: jpg, jpeg, png, webp
- added validation for max file size: 5 MB
- added user-facing success and error messages for upload cases
- added image display in item details
- added helper text in the modal showing allowed formats and max file size

## PR #294 - fix: added necessary changes to make the serving of images work

- Merged: 2026-04-29 11:44 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/294

### Summary

- Updated Prod to be able to handle serving Images

## PR #292 - feat: added database backups with remote backups

- Merged: 2026-04-29 12:39 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/292

### Summary

- Deploy no longer resets the database with seed data
- New backup script added at prod that backups each day at 2:00 AM locally and also to a remote bucket.
- Also does backup before deploying new version

## PR #293 - refactor: Removed forget pass button from nav

- Merged: 2026-04-29 12:50 UTC
- Author: N-Choo
- URL: https://github.com/TorgrimRL/inventory_x/pull/293

### Summary

- Clean up topbar by remove forgot pass button

## PR #296 - Fix names to match the stock filter

- Merged: 2026-04-29 15:20 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/296

### Summary

Stock filter and low stock only did not match.
Changed name from "Stock filter (<)" to "Stock filter (<=)
Changed name from "Low stock only" to "activate stock filter"

## PR #297 - Summary usertesting

- Merged: 2026-04-29 17:24 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/297

### Summary

- Added customer testing summary report based on 10 user tests
- Includes the average SUS score
- Summarizes key strengths and weaknesses
- Suggested improvements
- Improvements implemented based on user testing
- Business fit
- Conclusion

## PR #298 - adjusted key metrics to fit with stock filter

- Merged: 2026-04-30 09:25 UTC
- Author: lottehenriksen
- URL: https://github.com/TorgrimRL/inventory_x/pull/298

### Summary

Adjusted key metrics so it fits with stock filter.
- The key metrics no longer change when the stock filter is not activated.
- "items with low stock" now filters on items with "low stock" label.

## PR #299 - docs: added retro to repo

- Merged: 2026-04-30 17:10 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/299

### Summary

- New directory containing retros

## PR #301 - docs: added zap baseline report

- Merged: 2026-05-01 16:58 UTC
- Author: Daniel-De-Dev
- URL: https://github.com/TorgrimRL/inventory_x/pull/301

### Summary

- Added generated rapport from running zap using
```sh
$ docker run --rm --network inventory_x_default \
        -v $(pwd)/docs/security/:/zap/wrk/:rw \
        -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
        -t http://inventory_x-frontend-1:5173 \
        -g gen.conf \
        -r zap-baseline-report.html
```

## PR #300 - update improvements summary with stock filter changes

- Merged: 2026-05-02 06:19 UTC
- Author: Ann-Hilde
- URL: https://github.com/TorgrimRL/inventory_x/pull/300

### Summary

- Updated the "Improvements Implemented Based on User Testing" section to include stock filter behavior changes from PR #298 and clarified existing wording.

## PR #302 - docs: added accessiblity-test results

- Merged: 2026-05-03 19:10 UTC
- Author: N-Choo
- URL: https://github.com/TorgrimRL/inventory_x/pull/302

### Summary

_No filled-in summary found._
