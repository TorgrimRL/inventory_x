# Inventory X

A simple and robust inventory management system for businesses.

**[Watch the quick intro video](https://drive.proton.me/urls/1V9PWTF8HC#gjIBtKFVzvnI)**

---

## Live Production Version

Try out the latest version live: [https://inventoryx.td.org.uit.no/](https://inventoryx.td.org.uit.no/)

### Test Accounts

| Role                         | Username            | Password       |
| :--------------------------- | :------------------ | :------------- |
| **Owner** (All inventories)  | `admin@example.com` | `adminpass123` |
| **Employee** (2 inventories) | `alice@example.com` | `alicepass456` |
| **Owner** (Single inventory) | `bob@example.com`   | `bobpass789`   |

---

## Project Structure

This repository is a monorepo containing both the frontend and backend code.

- **Frontend**: React + TypeScript + Vite
- **Backend**: Django
- **Database**: PostgreSQL
- **Infrastructure**: Docker Compose

---

## Quickstart (Local Development)

REQUIREMENTS: DOCKER

To get the development stack running locally:

1. Set up your environment variables:

```bash
   cp .env.example .env

```

2. Start the stack:

```bash
make up

```

> [!TIP]
**First time setting up?** Run `make up`, wait about 5 seconds for the database to finish initializing, and then run `make seed` to populate it with test users and demo inventory items.

Once running, the applications are available at:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:8000](http://localhost:8000)

To resume the instance on subsequent runs without wiping data, simply use:

```bash
make up

```

---

## Documentation & Development

For detailed technical information, including testing, debugging, and operational commands, please see our dedicated documentation:

- **[Development Guide](./docs/development.md)**: Testing, debugging, and `make` commands.
- **[Backend Docs](./backend/README.md)**
- **[Frontend Docs](./frontend/README.md)**
- **[Deployment Docs](./deploy/README.md)**
