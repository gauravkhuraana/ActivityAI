// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // ─── UI RENDERING ───────────────────────────────────────────────

  test('should display login form with all required elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('password field should mask input', async ({ page }) => {
    const passwordField = page.getByLabel('Password');
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  // ─── SUCCESSFUL LOGIN ──────────────────────────────────────────

  test('should login successfully with valid credentials (admin)', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page).toHaveURL(/\/list/);
  });

  test('should login successfully with valid credentials (user)', async ({ page }) => {
    await page.getByLabel('Username').fill('user');
    await page.getByLabel('Password').fill('123456');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page).toHaveURL(/\/list/);
  });

  test('should login successfully with valid credentials (test)', async ({ page }) => {
    await page.getByLabel('Username').fill('test');
    await page.getByLabel('Password').fill('test123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page).toHaveURL(/\/list/);
  });

  test('should set loggedIn flag in localStorage after successful login', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');

    const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
    expect(loggedIn).toBe('true');
  });

  test('should store username in localStorage after successful login', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');

    const storedUsername = await page.evaluate(() => localStorage.getItem('username'));
    expect(storedUsername).toBe('admin');
  });

  // ─── FAILED LOGIN ──────────────────────────────────────────────

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Username').fill('wronguser');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  test('should show error for valid username but wrong password', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  test('should stay on login page after failed login', async ({ page }) => {
    await page.getByLabel('Username').fill('invalid');
    await page.getByLabel('Password').fill('invalid');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should not set localStorage on failed login', async ({ page }) => {
    await page.getByLabel('Username').fill('invalid');
    await page.getByLabel('Password').fill('invalid');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();

    const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
    expect(loggedIn).toBeNull();
  });

  // ─── FORM VALIDATION (HTML5 required) ──────────────────────────

  test('should not submit with empty username and password', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    // HTML5 required validation keeps us on login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should not submit with empty password', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should not submit with empty username', async ({ page }) => {
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  // ─── ERROR CLEARING ────────────────────────────────────────────

  test('should clear previous error when attempting a new login', async ({ page }) => {
    // Trigger an error first
    await page.getByLabel('Username').fill('wrong');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();

    // Now login with correct credentials — error should clear
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page).toHaveURL(/\/list/);
  });

  // ─── NAVIGATION / ROUTE GUARD ──────────────────────────────────

  test('should redirect unauthenticated user to /login when accessing /list', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user to /login when accessing /form', async ({ page }) => {
    await page.goto('/form');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user to /login when accessing /', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  // ─── POST-LOGIN NAVIGATION ────────────────────────────────────

  test('should show Employee List page content after login', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page.getByText('Employee List')).toBeVisible();
  });

  test('should show navigation links after login', async ({ page }) => {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/list');
    await expect(page.getByRole('link', { name: 'Add Employee' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Employee List' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logoff' })).toBeVisible();
  });
});
