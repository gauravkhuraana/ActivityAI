import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import assert from 'node:assert';

setDefaultTimeout(30000);

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4000';

let browser, context, page;

Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
});

After(async function () {
  if (browser) await browser.close();
});

// ─── GIVEN ──────────────────────────────────────────────────────────────────

Given('the application is running', async function () {
  const res = await fetch(`${API_URL}/employees`);
  assert.strictEqual(res.ok, true, 'Backend is not reachable');
});

Given('I am on the login page', async function () {
  await page.goto(`${BASE_URL}/login`);
});

Given('I am logged in as {string} with password {string}', async function (username, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/list');
});

Given('the employee list is empty', async function () {
  const res = await fetch(`${API_URL}/employees`);
  const employees = await res.json();
  for (const emp of employees) {
    await fetch(`${API_URL}/employees/${emp.id}`, { method: 'DELETE' });
  }
  await page.reload();
});

Given('an employee exists with name {string}, email {string}, position {string}', async function (name, email, position) {
  await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, position }),
  });
  await page.reload();
});

Given('the following employees exist:', async function (dataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
  }
  await page.reload();
});

Given('I am not logged in', async function () {
  await page.evaluate(() => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
  });
});

Given('I am on the {string} page', async function (path) {
  await page.goto(`${BASE_URL}${path}`);
});

// ─── WHEN ────────────────────────────────────────────────────────────────────

When('I enter username {string} and password {string}', async function (username, password) {
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
});

When('I click the Login button', async function () {
  await page.getByRole('button', { name: 'Login' }).click();
});

When('I click the Login button without entering credentials', async function () {
  await page.getByRole('button', { name: 'Login' }).click();
});

When('I click the Logoff button', async function () {
  await page.getByRole('button', { name: 'Logoff' }).click();
});

When('I click the {string} button', async function (buttonText) {
  await page.getByRole('button', { name: buttonText }).click();
});

When('I click the {string} button for {string}', async function (action, employeeName) {
  const row = page.locator('tr', { hasText: employeeName });
  await row.getByRole('button', { name: action }).click();
});

When('I fill in {string} with {string}', async function (label, value) {
  await page.getByLabel(label).fill(value);
});

When('I change {string} to {string}', async function (label, value) {
  const field = page.getByLabel(label);
  await field.clear();
  await field.fill(value);
});

When('I submit the employee form', async function () {
  await page.getByRole('button', { name: 'Add Employee' }).click();
});

When('I submit the update form', async function () {
  await page.getByRole('button', { name: 'Update Employee' }).click();
});

When('I confirm the deletion', async function () {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Delete' }).click();
});

When('I cancel the deletion', async function () {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
});

When('I type {string} in the search field', async function (text) {
  await page.getByLabel('Search employees').fill(text);
});

When('I clear the search field', async function () {
  await page.getByLabel('Search employees').clear();
});

When('I click {string} in the navigation bar', async function (linkText) {
  await page.getByRole('link', { name: linkText }).click();
});

When('I try to access {string}', async function (path) {
  await page.goto(`${BASE_URL}${path}`);
});

When('I navigate to the employee list page', async function () {
  await page.goto(`${BASE_URL}/list`);
});

// ─── THEN ────────────────────────────────────────────────────────────────────

Then('I should be redirected to the employee list page', async function () {
  await page.waitForURL('**/list');
  assert.match(page.url(), /\/list/);
});

Then('I should be redirected to the login page', async function () {
  await page.waitForURL('**/login', { timeout: 5000 });
  assert.match(page.url(), /\/login/);
});

Then('I should see {string} on the page', async function (text) {
  await page.getByText(text).waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see the error message {string}', async function (msg) {
  await page.getByText(msg).waitFor({ state: 'visible' });
});

Then('I should remain on the login page', async function () {
  assert.match(page.url(), /\/login/);
});

Then('my session should be cleared', async function () {
  const loggedIn = await page.evaluate(() => localStorage.getItem('loggedIn'));
  assert.strictEqual(loggedIn, null);
});

Then('I should see a success message {string}', async function (msg) {
  await page.getByText(msg).waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see {string} in the employee table', async function (text) {
  await page.getByText(text).waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should not see {string} in the employee table', async function (text) {
  await page.getByText(text).waitFor({ state: 'hidden', timeout: 5000 });
});

Then('I should see the employee details dialog', async function () {
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
});

Then('the dialog should show name {string}', async function (name) {
  await page.getByText(name).waitFor({ state: 'visible' });
});

Then('the dialog should show email {string}', async function (email) {
  await page.getByText(email).waitFor({ state: 'visible' });
});

Then('the dialog should show position {string}', async function (position) {
  await page.getByText(position).waitFor({ state: 'visible' });
});

Then('I should see {int} employees in the table', async function (count) {
  // Wait for the table rows to stabilise, then check count
  const rows = page.locator('tbody tr').filter({ hasNot: page.getByText('No employees found.') });
  await rows.first().waitFor({ state: 'visible', timeout: 5000 });
  const actual = await rows.count();
  assert.strictEqual(actual, count);
});

Then('I should see {string}', async function (text) {
  await page.getByText(text).waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should be on the {string} page', async function (path) {
  await page.waitForURL(`**${path}`, { timeout: 5000 });
  assert.match(page.url(), new RegExp(path));
});

Then('the {string} field should still be empty', async function (label) {
  const value = await page.getByLabel(label).inputValue();
  assert.strictEqual(value, '');
});
