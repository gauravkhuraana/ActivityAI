// @ts-check
import { test, expect } from '@playwright/test';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function loginAs(page, username = 'admin', password = 'password') {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/list');
}

async function seedEmployee(request, employee) {
  return await request.post('http://localhost:4000/employees', { data: employee });
}

async function clearEmployees(request) {
  const response = await request.get('http://localhost:4000/employees');
  const employees = await response.json();
  for (const emp of employees) {
    await request.delete(`http://localhost:4000/employees/${emp.id}`);
  }
}

// ─── ADD EMPLOYEE ─────────────────────────────────────────────────────────────

test.describe('Add Employee', () => {

  test.beforeEach(async ({ request, page }) => {
    await clearEmployees(request);
    await loginAs(page);
  });

  test.afterEach(async ({ request }) => {
    await clearEmployees(request);
  });

  test('should add a new employee and display them in the table', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByLabel('Name').fill('Alice Johnson');
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Position').fill('Engineer');
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('alice@example.com')).toBeVisible();
    await expect(page.getByText('Engineer')).toBeVisible();
  });

  test('should not submit the form when name field is empty', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByLabel('Email').fill('noname@example.com');
    await page.getByLabel('Position').fill('Designer');
    await page.getByRole('button', { name: 'Add Employee' }).click();

    // Form should not close — dialog remains visible
    await expect(dialog).toBeVisible();
    // The 'No employees found.' empty-state row confirms no employee was added
    await expect(page.getByText('No employees found.')).toBeVisible();
  });

  test('should not submit the form when email field is empty', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Employee' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByLabel('Name').fill('No Email Person');
    await page.getByLabel('Position').fill('Tester');
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(dialog).toBeVisible();
  });
});

// ─── VIEW EMPLOYEE ────────────────────────────────────────────────────────────

test.describe('View Employee', () => {

  test.beforeEach(async ({ request, page }) => {
    await clearEmployees(request);
    await seedEmployee(request, { name: 'Bob Smith', email: 'bob@example.com', position: 'Manager' });
    await loginAs(page);
  });

  test.afterEach(async ({ request }) => {
    await clearEmployees(request);
  });

  test('should open view dialog showing correct employee details', async ({ page }) => {
    await page.getByRole('button', { name: 'View' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Bob Smith')).toBeVisible();
    await expect(dialog.getByText('bob@example.com')).toBeVisible();
    await expect(dialog.getByText('Manager')).toBeVisible();
  });
});

// ─── EDIT EMPLOYEE ────────────────────────────────────────────────────────────

test.describe('Edit Employee', () => {

  test.beforeEach(async ({ request, page }) => {
    await clearEmployees(request);
    await seedEmployee(request, { name: 'Carol Davis', email: 'carol@example.com', position: 'Analyst' });
    await loginAs(page);
  });

  test.afterEach(async ({ request }) => {
    await clearEmployees(request);
  });

  test('should edit employee position and reflect change in the list', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByLabel('Position').fill('Senior Analyst');
    await page.getByRole('button', { name: 'Update Employee' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Senior Analyst')).toBeVisible();
  });

  test('should pre-populate the edit dialog with existing employee data', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await expect(page.getByLabel('Name')).toHaveValue('Carol Davis');
    await expect(page.getByLabel('Email')).toHaveValue('carol@example.com');
    await expect(page.getByLabel('Position')).toHaveValue('Analyst');
  });
});

// ─── DELETE EMPLOYEE ──────────────────────────────────────────────────────────

test.describe('Delete Employee', () => {

  test.beforeEach(async ({ request, page }) => {
    await clearEmployees(request);
    await seedEmployee(request, { name: 'Dan Brown', email: 'dan@example.com', position: 'Tester' });
    await loginAs(page);
  });

  test.afterEach(async ({ request }) => {
    await clearEmployees(request);
  });

  test('should show confirmation dialog before deleting', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should remove employee from list after confirming delete', async ({ page }) => {
    await expect(page.getByText('Dan Brown')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Dan Brown')).not.toBeVisible();
  });

  test('should keep employee in list when cancel is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Dan Brown')).toBeVisible();
  });
});
