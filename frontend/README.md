# Frontend Development Guide

> **Recommended:** For local development, use the Docker quickstart in the repository root (`../README.md`). This guide is primarily for running and developing the React frontend directly on your host machine.

---

## Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/en/download) (LTS version recommended)
* `npm` (This is included automatically when you install Node.js)

You can verify your installation by running:
```bash
node -v
npm -v

```

---

## Local Setup (Without Docker)

1. **Install Dependencies:**
Ensure you are in the `frontend/` directory, then install all required packages. This will automatically install React, Vite, Jest, ESLint, Prettier, and all other necessary testing libraries defined in your `package.json`.
```bash
npm install

```


2. **Run the Development Server:**
Start the Vite development server:
```bash
npm run dev

```


Once running, open your browser and navigate to: [http://localhost:5173/](https://www.google.com/search?q=http://localhost:5173/)

---

## Development Commands

### Testing

We use Jest and React Testing Library for our frontend tests.

**Run the test suite:**

```bash
npm test

```

### Code Quality

Maintain code quality by running our formatters and linters before committing changes.

**Auto-format everything (Prettier):**

```bash
npx prettier --write .

```

**Check and auto-fix linting errors (ESLint):**

```bash
npx eslint . --fix

```
