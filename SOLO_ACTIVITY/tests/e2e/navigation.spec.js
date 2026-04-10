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

// ─── TESTS ───────────────────────────────────────────────────────────────────

test.describe('Navigation & Session Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  // ─── APP BAR ────────────────────────────────────────────────────────────────

  test('should display the Employee Manager title in the app bar', async ({ page }) => {
    await expect(page.getByText('Employee Manager')).toBeVisible();
  });

  test('should show Add Employee and Employee List navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Add Employee' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Employee List' })).toBeVisible();
  });

  test('should show the Logoff button when authenticated', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Logoff' })).toBeVisible();
  });

  // ─── NAVIGATION LINKS ────────────────────────────────────────────────────────

  test('Add Employee link should navigate to /form', async ({ page }) => {
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/\/form/);
  });

  test('Employee List link should navigate back to /list from /form', async ({ page }) => {
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/\/form/);

    await page.getByRole('link', { name: 'Employee List' }).click();
    await expect(page).toHaveURL(/\/list/);
  });

  // ─── LOGOFF ──────────────────────────────────────────────────────────────────

  test('Logoff should clear localStorage and redirect to login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Logoff' }).click();

    const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
    expect(loggedIn).toBeNull();

    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /list after logoff should redirect to login', async ({ page }) => {
    await page.getByRole('button', { name: 'Logoff' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /form after logoff should redirect to login', async ({ page }) => {
    await page.getByRole('button', { name: 'Logoff' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/form');
    await expect(page).toHaveURL(/\/login/);
  });
});
