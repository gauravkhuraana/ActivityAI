# ActivityAI — Employee Manager Test Automation

A full-stack **Employee Manager** application with comprehensive test automation across two activity tracks: a solo Playwright suite and a multi-agent orchestrated testing framework.

> **Live test reports** (after CI runs): [GitHub Pages](https://gauravkhuraana.github.io/ActivityAI/)

---

## Application Under Test

A React + Node.js employee management system with login, CRUD operations, and real-time search.

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | React 18 + Material UI 5 + Vite | 5173 |
| Backend | Node.js + Express + SQLite | 4000 |
| Auth | localStorage session (`loggedIn`, `username`) | — |

**Valid credentials:** `admin/password` · `user/123456` · `test/test123`

**Protected routes:** `/list` · `/form` — redirect unauthenticated users to `/login`

### Start the App

```bash
# Backend
cd backend && npm install && node server.js

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

---

## Repo Structure

```
├── backend/              # Express + SQLite API server
├── frontend/             # React + MUI frontend (Vite)
├── SOLO_ACTIVITY/        # Solo: Playwright E2E tests
├── GROUP_ACTIVITY/       # Group: Orchestrated multi-agent test suite
└── .github/workflows/
    ├── playwright.yml         # CI for SOLO_ACTIVITY
    └── group-activity.yml     # CI for GROUP_ACTIVITY
```

---

## SOLO_ACTIVITY

> Individual activity — Playwright E2E testing with an AI agent and SKILL file.

**📁 [SOLO_ACTIVITY/README.md](SOLO_ACTIVITY/README.md)**

| Suite | File | Tests |
|-------|------|-------|
| Authentication | `auth.spec.js` | 20 |
| Employee CRUD | `employee-crud.spec.js` | 10 |
| Employee List & Search | `employee-list.spec.js` | 7 |
| Navigation | `navigation.spec.js` | 8 |
| **Total** | | **45** |

### Run Solo Tests

```bash
cd SOLO_ACTIVITY
npm install
npx playwright install chromium
npx playwright test
```

### AI Agent

| File | Purpose |
|------|---------|
| `agents/playwright-tester.agent.md` | VS Code agent for writing/fixing E2E tests |
| `agents/skills/playwright-testing/SKILL.md` | Domain knowledge: selectors, helpers, pitfalls |

---

## GROUP_ACTIVITY

> Group activity — Three coordinated AI testing agents covering E2E, API, and BDD layers.

**📁 [GROUP_ACTIVITY/README.md](GROUP_ACTIVITY/README.md)**

| Suite | Framework | Tests |
|-------|-----------|-------|
| Playwright E2E | `@playwright/test` | 34 |
| Backend API | Jest + Supertest | 27 |
| BDD Scenarios | Cucumber + Playwright | ~25 |
| **Total** | | **~86** |

### Run Group Tests

```bash
cd GROUP_ACTIVITY
npm install
npx playwright install chromium

npm run test:backend   # API tests only
npm run test:bdd       # BDD scenarios only
npm run test:e2e       # E2E tests only
npm test               # All three suites
```

### AI Agents

| Agent | Responsibility |
|-------|---------------|
| `test-orchestrator.agent.md` | Coordinates all three agents |
| `playwright-tester.agent.md` | E2E browser tests |
| `backend-tester.agent.md` | REST API tests |
| `bdd-tester.agent.md` | Gherkin features + step definitions |

Each agent loads a **SKILL.md** with selectors, endpoint tables, step catalogues, and known pitfalls.

---

## CI/CD — GitHub Actions

Both activities run automatically on every push to `main` and publish Playwright HTML reports to GitHub Pages.

| Workflow | Trigger path | Report |
|----------|-------------|--------|
| `playwright.yml` | `SOLO_ACTIVITY/**` | Published to GitHub Pages |
| `group-activity.yml` | `GROUP_ACTIVITY/**` | Published to GitHub Pages |

### Enable GitHub Pages (one-time setup)

1. Go to **Settings → Pages** in this repository
2. Set **Source** → **GitHub Actions**
3. Push any change to `main` — reports will be live at `https://gauravkhuraana.github.io/ActivityAI/`

---

## Key Technical Notes

- **Empty state:** MUI table always renders a row with "No employees found." — never assert `toHaveCount(0)`, use `getByText('No employees found.')` instead
- **Delete dialog:** Two "Delete" buttons exist simultaneously; always scope the confirm to `dialog.getByRole('button', { name: 'Delete' })`
- **Data isolation:** Every test clears the database via `DELETE /employees/:id` before running to prevent cross-test pollution
