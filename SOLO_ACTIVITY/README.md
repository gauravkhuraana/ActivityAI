# Solo Activity — Employee Manager E2E Tests

## What Was Achieved

End-to-end test automation coverage for the **Employee Manager** full-stack application using **Playwright**. The activity covers writing a Skills definition for an AI agent and creating meaningful, context-aware test cases for every critical user journey.

---

## App Under Test

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Frontend | React 18, Material UI 5, Vite (port 5173) |
| Backend  | Node.js, Express, SQLite (port 4000)      |
| Auth     | localStorage-based session                |

**Routes tested:** `/login` · `/list` · `/form`

---

## How to Run Tests

> Make sure the **backend** (port 4000) and **frontend** (port 5173) are both running first.

```bash
# Install dependencies (first time only)
npm install

# Run all tests headless
npm test

# Run with a visible browser
npm run test:headed

# Open interactive Playwright UI
npm run test:ui

# Open the last HTML report
npm run test:report
```

---

## Test Suite Overview

### `auth.spec.js` — Authentication · 17 tests

| Area | What Is Tested |
|------|----------------|
| UI rendering | Form elements visible, password field masked |
| Successful login | All 3 valid users: `admin`, `user`, `test` |
| localStorage | `loggedIn` flag set, `username` stored |
| Failed login | Wrong credentials, wrong password, error message |
| Form validation | Empty username, empty password, both empty |
| Error clearing | Error disappears on successful retry |
| Route guards | Unauthenticated access to `/`, `/list`, `/form` redirects |
| Post-login | Employee List heading and nav links visible |

---

### `employee-crud.spec.js` — Create / Read / Update / Delete · 10 tests

Each test group seeds its own data via the API before the test and clears it after — full isolation, no shared state.

| Area | What Is Tested |
|------|----------------|
| Add Employee | Valid data creates row; empty name blocks submit; empty email blocks submit |
| View Employee | Dialog shows correct name, email, and position |
| Edit Employee | Updated position reflects in list; dialog pre-populated with existing values |
| Delete Employee | Confirmation dialog shown; confirmed delete removes row; cancelled delete keeps row |

---

### `employee-list.spec.js` — List & Real-Time Search · 7 tests

Seeds two employees before each test to exercise client-side filtering across all searchable fields.

| Area | What Is Tested |
|------|----------------|
| List rendering | Heading visible, both seeded rows present |
| UI elements | Add Employee button visible |
| Search by name | Correct row shown, non-matching row hidden |
| Search by email | Exact email filters to one row |
| Search by position | Position match filters correctly |
| No match | Zero rows shown for unmatched term |
| Clear search | All rows restored after clearing input |

---

### `navigation.spec.js` — Navigation & Session · 8 tests

| Area | What Is Tested |
|------|----------------|
| App bar | Title, nav links, and Logoff button visible after login |
| Link navigation | Add Employee → `/form`; Employee List → `/list` |
| Logoff | Clears localStorage and redirects to `/login` |
| Post-logoff guards | `/list` and `/form` both redirect to `/login` after logout |

---

## Total

| Spec File             | Tests |
|-----------------------|------:|
| auth.spec.js          | 17    |
| employee-crud.spec.js | 10    |
| employee-list.spec.js | 7     |
| navigation.spec.js    | 8     |
| **Total**             | **42**|

---

## Skill Definition

The AI agent skill that guided test generation is at:

```
agents/skills/playwright-testing/SKILL.md
```

It defines the app's selectors, API endpoints, auth patterns, reusable helpers, and common pitfalls — providing consistent, context-aware test authoring guidance.

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| **API seeding over UI setup** | Each test seeds and clears its own data via `POST /employees`. Prevents inter-test contamination. |
| **Scoped dialog selectors** | Delete confirmation button uses `dialog.getByRole(...)` to avoid matching the row-level Delete button. |
| **Full UI login always** | `localStorage` shortcuts are avoided so the auth flow itself is continuously validated. |
| **No theme / snackbar tests** | Deliberately excluded — timing-sensitive, adds flakiness, not business-critical. |
