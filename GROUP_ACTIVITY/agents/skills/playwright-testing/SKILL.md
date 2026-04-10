# Playwright Testing Skill

Domain knowledge for writing E2E tests against the Employee Manager application.

## Application Context

| Item | Value |
|------|-------|
| Frontend URL | `http://localhost:5173` |
| Backend URL | `http://localhost:4000` |
| Proxy | Vite proxies `/api/*` → strips prefix → port 4000 |
| Auth mechanism | `localStorage.loggedIn = 'true'` + `localStorage.username` |
| Valid credentials | `admin/password`, `user/123456`, `test/test123` |
| Protected routes | `/list`, `/form` — redirect to `/login` when unauthenticated |

## Reusable Helpers

```js
const API = 'http://localhost:4000';

/** Log in via the UI and wait for the list page. */
async function loginAs(page, username = 'admin', password = 'password') {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/list');
}

/** Seed one employee record via API. */
async function seed(request, data) {
  const res = await request.post(`${API}/employees`, { data });
  return res.json();
}

/** Delete all employees via API. */
async function clearAll(request) {
  const res = await request.get(`${API}/employees`);
  const employees = await res.json();
  for (const emp of employees) {
    await request.delete(`${API}/employees/${emp.id}`);
  }
}
```

## Selector Reference

| UI Element | Selector |
|-----------|---------|
| Login heading | `page.getByRole('heading', { name: 'Login' })` |
| Username field | `page.getByLabel('Username')` |
| Password field | `page.getByLabel('Password')` |
| Login button | `page.getByRole('button', { name: 'Login' })` |
| App bar / banner | `page.getByRole('banner')` |
| Add Employee button | `page.getByRole('button', { name: '+ Add Employee' })` |
| Name field (form) | `page.getByLabel('Name')` |
| Email field | `page.getByLabel('Email')` |
| Position field | `page.getByLabel('Position')` |
| Save/Add button | `page.getByRole('button', { name: 'Add Employee' })` |
| Update button | `page.getByRole('button', { name: 'Update Employee' })` |
| Row View button | `row.getByRole('button', { name: 'View' })` |
| Row Edit button | `row.getByRole('button', { name: 'Edit' })` |
| Row Delete button | `row.getByRole('button', { name: 'Delete' })` |
| MUI Dialog | `page.getByRole('dialog')` |
| Dialog Delete (confirm) | `dialog.getByRole('button', { name: 'Delete' })` |
| Dialog Cancel | `dialog.getByRole('button', { name: 'Cancel' })` |
| Search field | `page.getByLabel('Search employees')` |
| Nav link | `page.getByRole('link', { name: 'Add Employee' })` |
| Logoff button | `page.getByRole('button', { name: 'Logoff' })` |

## Common Patterns

### Scoping row-level buttons
When multiple buttons share a name (e.g., two Delete rows), scope to the row first:
```js
const row = page.locator('tr', { hasText: 'John Doe' });
await row.getByRole('button', { name: 'Delete' }).click();
```

### Delete confirmation dialog
Always scope the confirm button to the dialog to avoid ambiguity:
```js
await page.getByRole('button', { name: 'Delete' }).click(); // row button
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
await dialog.getByRole('button', { name: 'Delete' }).click(); // dialog confirm
```

### Waiting for snackbar messages
```js
await expect(page.getByText('Employee added successfully!')).toBeVisible();
```

## Known Pitfalls

| Pitfall | Solution |
|---------|---------|
| `tbody tr` count is never 0 — MUI renders a "No employees found." row | Assert `getByText('No employees found.')` instead of `toHaveCount(0)` |
| Delete row button and dialog confirm button share the name "Delete" | Scope the dialog button to `dialog.getByRole('button', { name: 'Delete' })` |
| Stale data between tests | Always call `clearAll(request)` in `beforeEach` |
| `getByLabel('Name')` matches both Name and Position fields | Use exact match (default) — labels are distinct enough |
| Search filter is real-time | No need to press Enter; fill is sufficient |

## Test Structure Pattern

```js
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page, request }) => {
    await clearAll(request);
    await loginAs(page);
  });

  test('descriptive test name', async ({ page, request }) => {
    // Arrange
    await seed(request, { name: 'Alice', email: 'alice@test.com', position: 'Dev' });
    await page.reload();
    // Act
    await page.getByRole('button', { name: 'View' }).click();
    // Assert
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```
