# Pull requests merged to main since the previous TA meeting

- Report date: 2026-01-20
- Period: 2026-01-13 to 2026-01-20
- Base branch: `main`
- Number of PRs: 2

# This week summary of merged PRs

- **Frontend CI workflow:** This week, the group added an automated GitHub Actions workflow for frontend tests. The workflow installs frontend dependencies and runs the test suite automatically when frontend code or the workflow itself changes. This shows practical use of source control and test automation, and helps catch frontend problems before changes are merged.

- **Backend CI workflow:** The group also added an automated backend workflow that installs backend dependencies, checks formatting, runs linting, performs type checking, and runs backend tests. This shows a more complete quality-control process than only running tests manually, because code style, static errors, typing issues, and failing tests are checked in a consistent way.

- **Code quality and maintainability:** By adding Ruff formatting, Ruff linting, mypy type checking, and pytest to the backend workflow, the group created a stronger foundation for maintainable backend development. This helps keep the codebase more consistent and reduces the chance of small errors becoming larger problems later.

- **Documentation for development setup:** The group updated the frontend and backend README files with commands for installing dependencies, running the project, formatting, linting, and testing. This makes it easier for all group members to work in the same way and lowers the risk of misunderstandings when setting up or checking the project locally.

- **Team collaboration:** The workflows support collaboration because every group member gets the same automated checks when code is pushed or reviewed. This makes pull requests easier to evaluate and gives the team a shared standard for what code must pass before it is merged.

- **Agile software engineering practice:** This week’s work was mostly about improving the development process rather than adding user-facing features. That is still important software engineering work, because automated checks and clear documentation make future feature development safer, faster, and easier to manage.

- **Perspective:** For a third-year informatics student team, setting up both frontend and backend CI is a solid step toward a more professional workflow. It shows that the group is beginning to treat testing, formatting, linting, and documentation as normal parts of development, not as extra work done only at the end.

## PR #32 - add workflow for frontend

- Merged: 2026-01-14 13:51 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/32

### Summary

_No filled-in summary found._

## PR #33 - Workflow backend test

- Merged: 2026-01-18 11:32 UTC
- Author: TorgrimRL
- URL: https://github.com/TorgrimRL/inventory_x/pull/33

### Summary

_No filled-in summary found._
