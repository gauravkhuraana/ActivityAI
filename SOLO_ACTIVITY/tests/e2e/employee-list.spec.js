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

// ─── TESTS ───────────────────────────────────────────────────────────────────

test.describe('Employee List', () => {

  test.beforeEach(async ({ request, page }) => {
    await clearEmployees(request);
    await seedEmployee(request, { name: 'Frank Lee', email: 'frank@example.com', position: 'Developer' });
    await seedEmployee(request, { name: 'Grace Kim', email: 'grace@company.org', position: 'Designer' });
    await loginAs(page);
  });

  test.afterEach(async ({ request }) => {
    await clearEmployees(request);
  });

  test('should display list heading and render all seeded employees', async ({ page }) => {
    await expect(page.getByText('Employee List')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });

  test('should show the Add Employee button on the list page', async ({ page }) => {
    await expect(page.getByRole('button', { name: '+ Add Employee' })).toBeVisible();
  });

  test('should filter results when searching by employee name', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Frank');

    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Frank Lee')).toBeVisible();
    await expect(page.getByText('Grace Kim')).not.toBeVisible();
  });

  test('should filter results when searching by email', async ({ page }) => {
    await page.getByLabel('Search employees').fill('grace@company.org');

    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Grace Kim')).toBeVisible();
  });

  test('should filter results when searching by position', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Developer');

    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Frank Lee')).toBeVisible();
  });

  test('should show zero rows when search term matches no employee', async ({ page }) => {
    await page.getByLabel('Search employees').fill('zzznomatch999');

    // App renders a 'No employees found.' row when the filter produces zero matches
    await expect(page.getByText('No employees found.')).toBeVisible();
  });

  test('should restore all rows after clearing the search field', async ({ page }) => {
    await page.getByLabel('Search employees').fill('Frank');
    await expect(page.locator('tbody tr')).toHaveCount(1);

    await page.getByLabel('Search employees').clear();
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });
});
