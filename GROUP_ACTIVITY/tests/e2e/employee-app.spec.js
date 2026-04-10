// @ts-check
import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000';

/** Log in via the UI and wait for the list page. */
async function loginAs(page, username = 'admin', password = 'password') {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/list');
}

/** Seed one employee via the API; returns the created record. */
async function seed(request, data) {
  const res = await request.post(`${API}/employees`, { data });
  return res.json();
}

/** Delete every employee via the API. */
async function clearAll(request) {
  const res = await request.get(`${API}/employees`);
  const employees = await res.json();
  for (const emp of employees) {
    await request.delete(`${API}/employees/${emp.id}`);
  }
}

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => page.goto('/login'));

  test('login page shows heading, username, password and button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('admin/password logs in and redirects to /list', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  test('user/123456 logs in successfully', async ({ page }) => {
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('123456');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  test('test/test123 logs in successfully', async ({ page }) => {
    await page.getByLabel('Username').fill('test');
    await page.getByLabel('Password').fill('test123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  test('invalid credentials show error message and stay on /login', async ({ page }) => {
    await page.getByLabel('Username').fill('nobody');
    await page.getByLabel('Password').fill('nope');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('correct username with wrong password shows error', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  test('successful login sets loggedIn=true in localStorage', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/list');
    const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
    expect(loggedIn).toBe('true');
  });

  test('successful login stores username in localStorage', async ({ page }) => {
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('123456');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/list');
    const username = await page.evaluate(() => localStorage.getItem('username'));
    expect(username).toBe('user');
  });

  test('logoff clears loggedIn from localStorage', async ({ page }) => {
    await loginAs(page);
    await page.getByRole('button', { name: 'Logoff' }).click();
    const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
    expect(loggedIn).toBeNull();
  });

  test('logoff redirects to /login', async ({ page }) => {
    await loginAs(page);
    await page.getByRole('button', { name: 'Logoff' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('empty credentials keep user on login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── ROUTE GUARDS ─────────────────────────────────────────────────────────────

test.describe('Route Guards', () => {
  test('unauthenticated visit to /list redirects to /login', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visit to /form redirects to /login', async ({ page }) => {
    await page.goto('/form');
    await expect(page).toHaveURL(/\/login/);
  });

  test('after logoff /list is no longer accessible', async ({ page }) => {
    await loginAs(page);
    await page.getByRole('button', { name: 'Logoff' }).click();
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
  });

  test('after logoff /form is no longer accessible', async ({ page }) => {
    await loginAs(page);
    await page.getByRole('button', { name: 'Logoff' }).click();
    await page.goto('/form');
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => loginAs(page));

  test('app bar shows Employee Manager title', async ({ page }) => {
    await expect(page.getByRole('banner')).toContainText('Employee Manager');
  });

  test('"Add Employee" link navigates to /form', async ({ page }) => {
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/\/form/);
  });

  test('"Employee List" link navigates to /list', async ({ page }) => {
    await page.goto('/form');
    await page.getByRole('link', { name: 'Employee List' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  test('Logoff button is visible in the app bar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Logoff' })).toBeVisible();
  });
});

// ─── EMPLOYEE CRUD ────────────────────────────────────────────────────────────

test.describe('Employee CRUD', () => {
  test.beforeEach(async ({ page, request }) => {
    await clearAll(request);
    await loginAs(page);
  });

  test('empty list shows "No employees found."', async ({ page }) => {
    await expect(page.getByText('No employees found.')).toBeVisible();
  });

  test('adding an employee shows it in the table', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();
    await page.getByLabel('Name').fill('Jane Doe');
    await page.getByLabel('Email').fill('jane@example.com');
    await page.getByLabel('Position').fill('Engineer');
    await page.getByRole('button', { name: 'Add Employee' }).click();
    await expect(page.getByText('Employee added successfully!')).toBeVisible();
    await expect(page.getByText('Jane Doe')).toBeVisible({ timeout: 5000 });
  });

  test('add form with empty name does not submit successfully', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();
    await page.getByLabel('Email').fill('nope@test.com');
    await page.getByLabel('Position').fill('Dev');
    await page.getByRole('button', { name: 'Add Employee' }).click();
    await expect(page.getByText('Employee added successfully!')).not.toBeVisible();
  });

  test('View button opens details dialog with correct data', async ({ page, request }) => {
    await seed(request, { name: 'View Me', email: 'view@test.com', position: 'PM' });
    await page.reload();
    await page.getByRole('button', { name: 'View' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('View Me')).toBeVisible();
    await expect(dialog.getByText('view@test.com')).toBeVisible();
    await expect(dialog.getByText('PM')).toBeVisible();
  });

  test('Edit button updates employee name in the table', async ({ page, request }) => {
    await seed(request, { name: 'Edit Me', email: 'edit@test.com', position: 'Tester' });
    await page.reload();
    await page.getByRole('button', { name: 'Edit' }).click();
    const field = page.getByLabel('Name');
    await field.clear();
    await field.fill('Updated Name');
    await page.getByRole('button', { name: 'Update Employee' }).click();
    await expect(page.getByText('Employee updated successfully!')).toBeVisible();
    await expect(page.getByText('Updated Name')).toBeVisible({ timeout: 5000 });
  });

  test('Delete removes employee from the table', async ({ page, request }) => {
    await seed(request, { name: 'Delete Me', email: 'del@test.com', position: 'Temp' });
    await page.reload();
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Employee deleted successfully!')).toBeVisible();
    await expect(page.getByText('Delete Me')).not.toBeVisible({ timeout: 5000 });
  });

  test('Cancel in delete dialog keeps employee in table', async ({ page, request }) => {
    await seed(request, { name: 'Keep Me', email: 'keep@test.com', position: 'Perm' });
    await page.reload();
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Keep Me')).toBeVisible();
  });

  test('adding two employees shows both in the table', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();
    await page.getByLabel('Name').fill('Alice');
    await page.getByLabel('Email').fill('alice@test.com');
    await page.getByLabel('Position').fill('Dev');
    await page.getByRole('button', { name: 'Add Employee' }).click();
    await expect(page.getByText('Employee added successfully!')).toBeVisible();

    await page.getByRole('button', { name: '+ Add Employee' }).click();
    await page.getByLabel('Name').fill('Bob');
    await page.getByLabel('Email').fill('bob@test.com');
    await page.getByLabel('Position').fill('QA');
    await page.getByRole('button', { name: 'Add Employee' }).click();
    await expect(page.getByText('Employee added successfully!')).toBeVisible();

    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
  });
});

// ─── EMPLOYEE LIST & SEARCH ───────────────────────────────────────────────────

test.describe('Employee List & Search', () => {
  test.beforeEach(async ({ page, request }) => {
    await clearAll(request);
    await seed(request, { name: 'Frank Lee', email: 'frank@example.com', position: 'Manager' });
    await seed(request, { name: 'Grace Kim', email: 'grace@company.org', position: 'Designer' });
    await seed(request, { name: 'Henry Wells', email: 'henry@corp.net', position: 'Manager' });
    await loginAs(page);
  });

  test('all three seeded employees are visible', async ({ page }) => {
    await expect(page.getByText('Frank Lee')).toBeVisible();
    await expect(page.getByText('Grace Kim')).toBeVisible();
    await expect(page.getByText('Henry Wells')).toBeVisible();
  });

  test('search by name filters results', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Frank');
    await expect(page.getByText('Frank Lee')).toBeVisible();
    await expect(page.getByText('Grace Kim')).not.toBeVisible();
  });

  test('search by email filters results', async ({ page }) => {
    await page.getByLabel('Search employees').fill('grace@company.org');
    await expect(page.getByText('Grace Kim')).toBeVisible();
    await expect(page.getByText('Frank Lee')).not.toBeVisible();
  });

  test('search by position filters results', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Designer');
    await expect(page.getByText('Grace Kim')).toBeVisible();
    await expect(page.getByText('Frank Lee')).not.toBeVisible();
  });

  test('search with no matches shows "No employees found."', async ({ page }) => {
    await page.getByLabel('Search employees').fill('zzzNONEzzz');
    await expect(page.getByText('No employees found.')).toBeVisible();
  });

  test('clearing search restores all employees', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Frank');
    await expect(page.getByText('Grace Kim')).not.toBeVisible();
    await page.getByLabel('Search employees').clear();
    await expect(page.getByText('Frank Lee')).toBeVisible();
    await expect(page.getByText('Grace Kim')).toBeVisible();
    await expect(page.getByText('Henry Wells')).toBeVisible();
  });
});
