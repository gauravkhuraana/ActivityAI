# Playwright E2E Testing Skill — Employee Manager App

## Skill Overview

This skill provides domain-specific knowledge for writing end-to-end Playwright tests against the **Employee Manager** full-stack application (React + MUI frontend, Node.js/Express/SQLite backend).

---

## Application Under Test

### Tech Stack
- **Frontend:** React 18, Material UI 5, Axios, React Router v6, Vite dev server (port 5173)
- **Backend:** Node.js, Express, SQLite (port 4000)
- **Proxy:** Vite proxies `/api/*` → `http://localhost:4000` (strips `/api` prefix)

### Routes
| Route      | Component       | Auth Required | Description                        |
|------------|-----------------|---------------|------------------------------------|
| `/login`   | Login           | No            | Login page with username/password  |
| `/list`    | EmployeeList    | Yes           | Employee table with CRUD actions   |
| `/form`    | EmployeeForm    | Yes           | Standalone add-employee page       |
| `/`        | Redirect        | Yes           | Redirects to `/list`               |

### API Endpoints (Backend: `http://localhost:4000`)
| Method | Endpoint          | Body                                    | Response                          |
|--------|-------------------|-----------------------------------------|-----------------------------------|
| POST   | `/login`          | `{ username, password }`                | `{ success: true, user: {...} }`  |
| GET    | `/employees`      | —                                       | `[{ id, name, email, position }]` |
| POST   | `/employees`      | `{ name, email, position }`             | `{ id, name, email, position }`   |
| PUT    | `/employees/:id`  | `{ name, email, position }`             | `{ id, name, email, position }`   |
| DELETE | `/employees/:id`  | —                                       | `{ success: true }`               |

### Valid Login Credentials
| Username | Password   |
|----------|------------|
| admin    | password   |
| user     | 123456     |
| test     | test123    |

---

## Selector Strategy

Use these selectors for reliable, non-flaky tests:

### Login Page
- Username field: `getByLabel('Username')`
- Password field: `getByLabel('Password')`
- Login button: `getByRole('button', { name: 'Login' })`
- Error message: `getByText('Invalid username or password')`

### Menu Bar (AppBar)
- App title: `getByText('Employee Manager')`
- Add Employee nav: `getByRole('link', { name: 'Add Employee' })`
- Employee List nav: `getByRole('link', { name: 'Employee List' })`
- Logoff button: `getByRole('button', { name: 'Logoff' })`
- Theme toggle: IconButton with Brightness4/Brightness7 icon

### Employee List Page
- Page heading: `getByText('Employee List')`
- Add Employee button: `getByRole('button', { name: '+ Add Employee' })`
- Search field: `getByLabel('Search employees')`
- Table rows: `locator('tbody tr')`
- View button: `getByRole('button', { name: 'View' })`
- Edit button: `getByRole('button', { name: 'Edit' })`
- Delete button: `getByRole('button', { name: 'Delete' })`

### Employee Form (Add/Edit Dialog)
- Name field: `getByLabel('Name')`
- Email field: `getByLabel('Email')`
- Position field: `getByLabel('Position')`
- Submit button (Add): `getByRole('button', { name: 'Add Employee' })`
- Submit button (Edit): `getByRole('button', { name: 'Update Employee' })`

### Delete Confirmation Dialog
- Confirm delete: `getByRole('button', { name: 'Delete' })` inside dialog
- Cancel: `getByRole('button', { name: 'Cancel' })`

---

## Test Patterns

### Authentication Helper
```javascript
async function loginAs(page, username = 'admin', password = 'password') {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/list');
}
```

### API Seeding (for test isolation)
```javascript
async function seedEmployee(request, employee) {
  return await request.post('http://localhost:4000/employees', {
    data: employee,
  });
}

async function clearEmployees(request) {
  const response = await request.get('http://localhost:4000/employees');
  const employees = await response.json();
  for (const emp of employees) {
    await request.delete(`http://localhost:4000/employees/${emp.id}`);
  }
}
```

### Recommended Test Structure
```
tests/
  e2e/
    auth.spec.js          — Login/logout flows
    employee-crud.spec.js — Add, edit, delete employees
    employee-list.spec.js — View list, search, filter
    navigation.spec.js    — Route guards, menu navigation
    theme.spec.js         — Dark/light mode toggle
```

---

## Key Testing Considerations

1. **Auth Guard:** Unauthenticated users are redirected to `/login`. Tests for protected pages must log in first.
2. **localStorage:** Login state is stored in `localStorage` (`loggedIn: 'true'`). Can be set directly for faster test setup.
3. **Vite Proxy:** Frontend runs on port 5173 and proxies `/api/*` to backend on port 4000. Tests should navigate to `http://localhost:5173`.
4. **Material UI Dialogs:** Add, Edit, View, Delete actions use MUI `<Dialog>` components — wait for dialog visibility before interacting.
5. **Snackbar Notifications:** Success messages appear as MUI Snackbar/Alert with auto-hide (3 seconds).
6. **Search is client-side:** Filters `name`, `email`, `position` fields against the search query in real-time.
7. **Test Isolation:** Use API calls to seed/clear employee data before each test to avoid inter-test dependencies.

---

## Common Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| Test clicks button before dialog is visible | Use `await expect(dialog).toBeVisible()` before interacting |
| Search test flaky due to stale data | Seed known employees via API before each test |
| Login redirect not completing | Use `await page.waitForURL('**/list')` after clicking Login |
| Dark mode test fails on theme check | Assert on body background color change |
| Delete confirmation not found | Scope the Delete button selector inside the dialog element |
